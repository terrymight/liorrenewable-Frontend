(function () {
  "use strict";

  var hero = document.querySelector(".hero");
  if (!hero) return;

  var slides = hero.querySelectorAll("[data-hero-slide]");
  var dots = hero.querySelectorAll("[data-hero-dot]");
  var captionEl = hero.querySelector("[data-hero-caption]");

  if (slides.length < 2) return;

  var captions = [];
  slides.forEach(function (slide) {
    captions.push(slide.getAttribute("alt") || "");
  });

  var current = 0;
  var intervalMs = 6000;
  var timer = null;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(index) {
    slides[current].classList.remove("is-active");
    dots[current] && dots[current].classList.remove("is-active");

    current = (index + slides.length) % slides.length;

    slides[current].classList.add("is-active");
    dots[current] && dots[current].classList.add("is-active");
    if (captionEl) captionEl.textContent = captions[current];
  }

  function next() {
    show(current + 1);
  }

  function start() {
    if (reduceMotion) return;
    stop();
    timer = window.setInterval(next, intervalMs);
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.dataset.heroDot));
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);

  start();
})();
