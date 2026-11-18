/* Count where the visitor is looking, not at entry to the long proof section. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const items = [...document.querySelectorAll('[data-case-count]')];
  const running = new Map();
  const format = (el, value) => el.dataset.countLocale
    ? Math.round(value).toLocaleString(el.dataset.countLocale) : value.toFixed(1);
  function finish(el) {
    if (running.has(el)) cancelAnimationFrame(running.get(el));
    running.delete(el);
    el.textContent = format(el, Number(el.dataset.caseCount));
    el.dataset.caseCounted = 'true';
  }
  function count(el) {
    if (el.dataset.caseCounted || running.has(el)) return;
    if (reduce.matches) { finish(el); return; }
    const target = Number(el.dataset.caseCount), start = performance.now();
    const frame = now => {
      const progress = Math.min(1, (now - start) / 1700);
      el.textContent = format(el, target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) running.set(el, requestAnimationFrame(frame));
      else finish(el);
    };
    running.set(el, requestAnimationFrame(frame));
  }
  if (!('IntersectionObserver' in window)) return;
  const counter = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { count(entry.target); counter.unobserve(entry.target); }
  }), {threshold: 1, rootMargin: '0px 0px -65px 0px'});
  items.forEach(el => counter.observe(el));
  const reveals = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-present'); reveals.unobserve(entry.target); }
  }), {threshold: .18});
  document.querySelectorAll('[data-case-reveal]').forEach(el => reveals.observe(el));
  reduce.addEventListener('change', () => { if(reduce.matches) items.forEach(finish); });
})();
