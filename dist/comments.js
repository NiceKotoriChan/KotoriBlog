(function () {
  var config = window.GISCUS || {};
  var section = document.getElementById("comments");
  if (!section) return;

  function ready() {
    return config.repo && config.repoId && config.categoryId;
  }

  function inject(term) {
    if (!ready()) return;

    var script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", config.repo);
    script.setAttribute("data-repo-id", config.repoId);
    script.setAttribute("data-category", config.category || "Comments");
    script.setAttribute("data-category-id", config.categoryId);
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", term);
    script.setAttribute("data-strict", "1");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "light");
    script.setAttribute("data-lang", "zh-CN");
    script.setAttribute("data-loading", "lazy");

    section.hidden = false;
    section.appendChild(script);
  }

  window.addEventListener("message", function (event) {
    if (event.origin !== "https://giscus.app") return;
    if (event.data && event.data.giscus && event.data.giscus.discussion)
      section.dataset.loaded = "1";
  });

  var post = document.body.dataset.post;
  if (post) inject(post);
})();
