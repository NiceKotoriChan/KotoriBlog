(function () {
  var root = document.documentElement;

  function esc(value) {
    return window.Markdown.escapeHtml(value);
  }

  function get(url) {
    return fetch(url, { cache: 'no-store' }).then(function (response) {
      if (!response.ok) throw new Error(response.status + ' ' + url);
      return response.text();
    });
  }

  function fail(target, message) {
    target.innerHTML =
      '<p class="err">$ fetch: ' + esc(message) + '</p>' +
      '<p class="hint">双击打开本地 html 时，浏览器不允许读取 md 文件。用 <code>python3 -m http.server</code> 起个本地服务，或者直接看部署后的站点。</p>';
  }

  function bindTheme() {
    var button = document.querySelector('[data-theme-toggle]');
    if (!button) return;
    button.addEventListener('click', function () {
      var next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      try {
        localStorage.setItem('theme', next);
      } catch (err) {}
    });
  }

  function bindCopy() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-copy]');
      if (!button) return;
      var code = button.closest('.code').querySelector('code');
      if (!code) return;
      var done = function () {
        button.textContent = 'copied';
        button.classList.add('done');
        setTimeout(function () {
          button.textContent = 'copy';
          button.classList.remove('done');
        }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code.textContent).then(done, function () {});
        return;
      }
      var area = document.createElement('textarea');
      area.value = code.textContent;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
        done();
      } catch (err) {}
      document.body.removeChild(area);
    });
  }

  function renderList() {
    var target = document.getElementById('list');
    if (!target) return;

    get('posts/index.txt').then(function (text) {
      var files = text.split('\n').map(function (line) {
        return line.trim();
      }).filter(function (line) {
        return line && line.charAt(0) !== '#' && /\.md$/i.test(line);
      });

      var rows = files.map(function (file) {
        return '<li><a class="file" href="post.html?p=' + encodeURIComponent(file) + '">' +
          '<span class="fmark">-</span><span class="fname">' + esc(file) + '</span></a></li>';
      }).join('');

      target.innerHTML =
        '<p class="cmd"><span class="sig">$</span> ls posts/ <span class="dim">— ' + files.length + ' files</span></p>' +
        (files.length ? '<ul class="filelist">' + rows + '</ul>' : '<p class="empty">// posts/index.txt 是空的</p>');
    }).catch(function (err) {
      fail(target, err.message);
    });
  }

  function renderPost() {
    var target = document.getElementById('post');
    if (!target) return;

    var file = new URLSearchParams(location.search).get('p');
    if (!file || !/^[\w\u4e00-\u9fa5.-]+\.md$/i.test(file)) {
      fail(target, 'bad file name');
      return;
    }

    get('posts/' + file).then(function (markdown) {
      var name = file.replace(/\.md$/i, '');
      document.title = name + ' — ' + document.body.dataset.site;

      target.innerHTML =
        '<header class="post-head">' +
        '<p class="post-path"><a href="index.html">~</a><span class="dim">/</span>posts<span class="dim">/</span><span>' +
        esc(file) + '</span></p>' +
        '<h1>' + esc(name) + '</h1>' +
        '</header>' +
        '<div class="prose">' + window.Markdown.render(markdown) + '</div>' +
        '<p class="more"><a href="index.html">← ls posts/</a></p>';
    }).catch(function (err) {
      fail(target, err.message);
    });
  }

  bindTheme();
  bindCopy();

  if (document.body.dataset.page === 'index') renderList();
  if (document.body.dataset.page === 'post') renderPost();
})();
