(function () {
  "use strict";

  document.querySelectorAll("[data-gallery]").forEach(initGallery);

  function initGallery(root) {
    var tabs = root.querySelectorAll("[data-gallery-tab]");
    var panels = root.querySelectorAll("[data-gallery-panel]");

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.dataset.galleryTab;

        tabs.forEach(function (t) {
          t.classList.toggle("active", t === tab);
        });
        panels.forEach(function (panel) {
          panel.classList.toggle("is-active", panel.dataset.galleryPanel === target);
        });
      });
    });

    // Lightbox, scoped to this gallery instance.
    var overlay = root.querySelector("[data-lightbox]");
    if (!overlay) return;

    var imgEl = overlay.querySelector("[data-lightbox-img]");
    var captionEl = overlay.querySelector("[data-lightbox-caption]");
    var closeBtn = overlay.querySelector("[data-lightbox-close]");
    var prevBtn = overlay.querySelector("[data-lightbox-prev]");
    var nextBtn = overlay.querySelector("[data-lightbox-next]");

    var activeItems = [];
    var activeIndex = 0;

    function currentPanelItems() {
      var activePanel = root.querySelector(".gallery-panel.is-active") || root;
      return Array.prototype.slice.call(activePanel.querySelectorAll("[data-gallery-item]"));
    }

    function open(item) {
      activeItems = currentPanelItems();
      activeIndex = activeItems.indexOf(item);
      render();
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function render() {
      var item = activeItems[activeIndex];
      if (!item) return;
      imgEl.src = item.dataset.full || item.querySelector("img").src;
      imgEl.alt = item.dataset.caption || "";
      captionEl.textContent = item.dataset.caption || "";
    }

    function close() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    function step(delta) {
      if (!activeItems.length) return;
      activeIndex = (activeIndex + delta + activeItems.length) % activeItems.length;
      render();
    }

    root.querySelectorAll("[data-gallery-item]").forEach(function (item) {
      item.addEventListener("click", function () {
        open(item);
      });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () {
      step(-1);
    });
    nextBtn.addEventListener("click", function () {
      step(1);
    });

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) close();
    });

    document.addEventListener("keydown", function (event) {
      if (!overlay.classList.contains("is-open")) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    });
  }
})();
