(function () {
  var config = window.GISCUS || {};
  var section = document.getElementById('comments');
  if (!section) return;

  function theme() {
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  }

  function ready() {
    return config.repo && config.repoId && config.categoryId;
  }

  function inject(file) {
    if (!ready()) return;

    var script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', config.repo);
    script.setAttribute('data-repo-id', config.repoId);
    script.setAttribute('data-category', config.category || 'Comments');
    script.setAttribute('data-category-id', config.categoryId);
    script.setAttribute('data-mapping', 'specific');
    script.setAttribute('data-term', 'posts/' + file);
    script.setAttribute('data-strict', '1');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', theme());
    script.setAttribute('data-lang', 'zh-CN');
    script.setAttribute('data-loading', 'lazy');

    section.hidden = false;
    section.appendChild(script);
  }

  function syncTheme() {
    var frame = section.querySelector('iframe.giscus-frame');
    if (!frame || !frame.contentWindow) return;
    frame.contentWindow.postMessage({ giscus: { setConfig: { theme: theme() } } }, 'https://giscus.app');
  }

  window.addEventListener('message', function (event) {
    if (event.origin !== 'https://giscus.app') return;
    if (event.data && event.data.giscus && event.data.giscus.discussion) section.dataset.loaded = '1';
  });

  new MutationObserver(syncTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  document.addEventListener('post:ready', function (event) {
    inject(event.detail.file);
  });
})();
