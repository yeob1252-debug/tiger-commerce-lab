/* R11: viewport arrivals. Text is never hidden or tied to a trapped scroll timeline. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const objects = [...document.querySelectorAll('[data-arrive]')];
  const platforms = document.querySelector('[data-platform-stage]');
  let scheduled = false;
  const clamp = value => Math.max(0, Math.min(1, value));
  function draw() {
    scheduled = false;
    objects.forEach((item, index) => {
      const box = item.getBoundingClientRect();
      // Local geometry keeps mobile, reverse, reload and fast scroll deterministic.
      const stagger = innerWidth > 600 && item.classList.contains('platform-destination') ? [...item.parentElement.children].indexOf(item) * 70 : 0;
      const progress = reduce.matches ? 1 : clamp((innerHeight * .96 - box.top - stagger) / Math.min(300, innerHeight * .42));
      item.style.setProperty('--arrive', progress.toFixed(4));
      item.dataset.arrived = String(progress >= .99);
    });
    if (platforms) {
      const box = platforms.getBoundingClientRect();
      const progress = reduce.matches ? 1 : clamp((innerHeight * .86 - box.top) / Math.min(440, innerHeight * .65));
      platforms.style.setProperty('--posting-progress', progress.toFixed(4));
    }
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(draw);
  }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  addEventListener('pageshow', schedule);
  reduce.addEventListener('change', schedule);
  draw();
})();
