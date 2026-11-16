(function () {
  function esc(value) {
    return String(value).replace(/[&<>]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch];
    });
  }

  function renderList() {
    var target = document.getElementById('list');
    if (!target) return;

    fetch('atom.xml', { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error(response.status + ' atom.xml');
        return response.text();
      })
      .then(function (text) {
        var doc = new DOMParser().parseFromString(text, 'application/xml');
        var entries = doc.querySelectorAll('entry');
        var html = '';
        var year = '';
        var index = 0;

        for (var i = 0; i < entries.length; i++) {
          var link = entries[i].querySelector('link').getAttribute('href');
          var file = link.split('/').pop().replace(/\.html$/, '');
          var match = file.match(/^(\d{2})(\d{2})(\d{2})-(.+)$/);
          if (!match) continue;

          var entryYear = '20' + match[1];
          var day = match[2] + '-' + match[3];
          var title = match[4];

          if (entryYear !== year) {
            if (year) html += '</ul>\n';
            html += '<h2 class="year">' + esc(entryYear) + '</h2>\n<ul class="posts">\n';
            year = entryYear;
          }

          html +=
            '<li style="--i:' + index + '"><a class="post-row" href="blogs/' + esc(file) + '.html">' +
            '<time>' + day + '</time><span class="post-title">' + esc(title) + '</span></a></li>\n';
          index++;
        }

        if (year) html += '</ul>\n';
        target.innerHTML = html || '<p class="empty">posts/ 里还没有 md</p>';
      })
      .catch(function () {
        target.innerHTML = '<p class="empty">列表加载失败</p>';
      });
  }

  if (document.body.dataset.page === 'index') renderList();
})();
