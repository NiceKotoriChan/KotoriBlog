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

  function fail(target, message, hint) {
    target.innerHTML =
      '<p class="err">读取失败：' + esc(message) + '</p>' +
      '<p class="hint">' + (hint || '双击打开本地 html 时，浏览器不允许读取本地文件。用 <code>python3 -m http.server</code> 起个本地服务，或者直接看部署后的站点。') + '</p>';
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

  function renderPost() {
    var target = document.getElementById('post');
    if (!target) return;

    var file = new URLSearchParams(location.search).get('p');
    if (!file || !/^[\w\u4e00-\u9fa5.-]+\.md$/i.test(file)) {
      fail(target, 'bad file name');
      return;
    }

    get('posts/' + file).then(function (markdown) {
      var title = file.replace(/\.md$/i, '').replace(/^\d{6}-/, '');
      document.title = title + ' — ' + document.body.dataset.site;

      target.innerHTML =
        '<header class="post-head">' +
        '<h1>' + esc(title) + '</h1>' +
        '</header>' +
        '<div class="prose">' + window.Markdown.render(markdown) + '</div>' +
        '<p class="more"><a href="index.html">← 返回</a></p>';

      document.dispatchEvent(new CustomEvent('post:ready', { detail: { file: file } }));
    }).catch(function (err) {
      fail(target, err.message);
    });
  }

  bindTheme();
  bindCopy();

  if (document.body.dataset.page === 'post') renderPost();
})();
