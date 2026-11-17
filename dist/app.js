(function () {
  function esc(value) {
    return String(value).replace(/[&<>]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch];
    });
  }

  function parseCsv(text) {
    var rows = [];
    var row = [];
    var field = '';
    var quoted = false;

    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);

      if (quoted) {
        if (ch === '"') {
          if (text.charAt(i + 1) === '"') {
            field += '"';
            i++;
          } else {
            quoted = false;
          }
        } else {
          field += ch;
        }
        continue;
      }

      if (ch === '"') quoted = true;
      else if (ch === ',') {
        row.push(field);
        field = '';
      } else if (ch === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else if (ch !== '\r') field += ch;
    }

    if (field !== '' || row.length) {
      row.push(field);
      rows.push(row);
    }

    return rows;
  }

  function renderList() {
    var target = document.getElementById('list');
    if (!target) return;

    fetch('metadata.csv', { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error(response.status + ' metadata.csv');
        return response.text();
      })
      .then(function (text) {
        var rows = parseCsv(text);
        if (rows.length < 2) {
          target.innerHTML = '<p class="empty">posts/ 里还没有 md</p>';
          return;
        }

        var head = rows[0].map(function (name) { return name.trim(); });
        var col = {};
        for (var i = 0; i < head.length; i++) col[head[i]] = i;
        if (col.slug === undefined) col = { slug: 0, title: 1, date: 2, words: 3, minutes: 4 };

        var html = '<div class="archive">';
        var year = '';
        var index = 0;

        for (var r = 1; r < rows.length; r++) {
          var row = rows[r];
          var slug = row[col.slug] || '';
          if (!slug) continue;

          var match = slug.match(/^(\d{2})(\d{2})(\d{2})-(.+)$/);
          var date = (row[col.date] || '').trim();
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            date = match ? '20' + match[1] + '-' + match[2] + '-' + match[3] : '1970-01-01';
          }

          var entryYear = date.slice(0, 4);
          var day = date.slice(5);
          var title = (row[col.title] || '').trim() || (match ? match[4] : slug);

          if (entryYear !== year) {
            if (year) html += '</ul>\n';
            html += '<span class="year">' + esc(entryYear) + '</span>\n<ul class="posts">\n';
            year = entryYear;
          }

          html +=
            '<li class="post-item" style="--i:' + index + '"><a class="post-row" href="' + esc(slug) + '.html">' +
            '<time>' + esc(day) + '</time><span class="post-title">' + esc(title) + '</span></a></li>\n';
          index++;
        }

        if (year) html += '</ul>\n</div>';
        target.innerHTML = year ? html : '<p class="empty">posts/ 里还没有 md</p>';
      })
      .catch(function () {
        target.innerHTML = '<p class="empty">列表加载失败</p>';
      });
  }

  if (document.body.dataset.page === 'index') renderList();
})();
