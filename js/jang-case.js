(() => {
  'use strict';
  const section = document.getElementById('jang-case');
  if (!section || !('IntersectionObserver' in window)) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const targets = [...section.querySelectorAll('[data-jang-reveal]')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold:0, rootMargin:'0px 0px -35px 0px' });
  const showAll = () => {
    if (!reduced.matches) return;
    targets.forEach(target => target.classList.add('is-revealed'));
    observer.disconnect();
  };
  section.classList.add('jang-case-motion');
  targets.forEach(target => observer.observe(target));
  reduced.addEventListener('change', showAll);
  showAll();
})();
