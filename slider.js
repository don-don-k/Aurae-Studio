/* Bilder-Slider im Hero-Bereich der Startseite.
   Bilder und Zeiten stehen in data.js (HERO_SLIDES / HERO_SLIDER).
   Bedienung: automatischer Wechsel, Wischen (Handy), Ziehen (Maus), Pfeile, Punkte, Pfeiltasten. */
(function () {
  const root = document.getElementById("heroSlider");
  if (!root) return;

  const slides = typeof HERO_SLIDES !== "undefined" ? HERO_SLIDES : [];
  if (!slides.length) { root.remove(); return; }

  const n = slides.length;
  const track = root.querySelector(".slider__track");
  const dotsBox = root.querySelector(".slider__dots");
  const prevBtn = root.querySelector(".slider__btn--prev");
  const nextBtn = root.querySelector(".slider__btn--next");

  /* ---------- Aufbau ---------- */
  track.innerHTML = slides.map((s, i) => `
    <figure class="slider__slide" role="group" aria-roledescription="Folie" aria-label="${i + 1} von ${n}">
      <img src="${s.img}" alt="${s.alt || ""}" draggable="false" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} />
      ${s.label ? `<figcaption class="slider__cap">${s.label}</figcaption>` : ""}
    </figure>`).join("");

  dotsBox.innerHTML = slides.map((_, i) =>
    `<button type="button" class="slider__dot" data-i="${i}" aria-label="Bild ${i + 1} anzeigen"></button>`).join("");
  const dots = [...dotsBox.children];

  if (n < 2) { prevBtn.remove(); nextBtn.remove(); dotsBox.remove(); }

  /* ---------- Position ---------- */
  let index = 0;
  const width = () => track.clientWidth;

  function updateDots() {
    dots.forEach((d, i) => d.setAttribute("aria-current", i === index ? "true" : "false"));
  }

  function goTo(i, smooth = true) {
    index = ((i % n) + n) % n;
    track.scrollTo({ left: index * width(), behavior: smooth ? "smooth" : "auto" });
    updateDots();
  }

  track.addEventListener("scroll", () => {
    const i = Math.round(track.scrollLeft / (width() || 1));
    if (i !== index && i >= 0 && i < n) { index = i; updateDots(); }
  }, { passive: true });

  window.addEventListener("resize", () => goTo(index, false));
  updateDots();

  /* ---------- Automatischer Wechsel ---------- */
  const cfg = typeof HERO_SLIDER !== "undefined" ? HERO_SLIDER : { autoplay: true, intervalMs: 4500 };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canAutoplay = cfg.autoplay && !reduceMotion && n > 1;
  let timer = null;
  let visible = true;

  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => {
    stop();
    if (canAutoplay && visible && !document.hidden) timer = setInterval(() => goTo(index + 1), cfg.intervalMs);
  };

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", start);
  root.addEventListener("touchstart", stop, { passive: true });
  root.addEventListener("touchend", start, { passive: true });
  document.addEventListener("visibilitychange", start);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { threshold: 0.2 }).observe(root);
  }

  /* ---------- Bedienung ---------- */
  prevBtn.addEventListener("click", () => { goTo(index - 1); start(); });
  nextBtn.addEventListener("click", () => { goTo(index + 1); start(); });
  dotsBox.addEventListener("click", (e) => {
    const b = e.target.closest(".slider__dot");
    if (b) { goTo(Number(b.dataset.i)); start(); }
  });
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1); }
  });

  /* Maus-Ziehen (am Handy übernimmt das Wischen der Browser selbst) */
  let dragging = false, startX = 0, startLeft = 0;
  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    dragging = true; startX = e.clientX; startLeft = track.scrollLeft;
    track.classList.add("is-dragging");
    stop();
  });
  window.addEventListener("pointermove", (e) => {
    if (dragging) track.scrollLeft = startLeft - (e.clientX - startX);
  });
  window.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove("is-dragging");
    const dx = e.clientX - startX;
    const base = Math.round(startLeft / (width() || 1));
    const threshold = width() * 0.15;
    const target = Math.min(n - 1, Math.max(0, base + (dx < -threshold ? 1 : dx > threshold ? -1 : 0)));
    goTo(target);
    start();
  });

  start();
})();
