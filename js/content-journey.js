/* Viewport arrivals. Essential text stays readable; no timers or trapped scrolling. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const objects = [...document.querySelectorAll('[data-arrive]')];
  const platforms = document.querySelector('[data-platform-stage]');
  const reach = document.querySelector('.reach-network');
  const audience = [...document.querySelectorAll('[data-reach-node]')];
  let scheduled = false;
  const clamp = value => Math.max(0, Math.min(1, value));
  function draw() {
    scheduled = false;
    objects.forEach(item => {
      const box = item.getBoundingClientRect();
      const channel = item.classList.contains('platform-destination');
      // Channel labels stay still and readable. Only the visual arrives, in reading order.
      // Mobile rows use their own viewport position, with no timeouts or scroll trapping.
      const stagger = channel && innerWidth > 600 ? [...item.parentElement.children].indexOf(item) * 140 : 0;
      const distance = channel ? Math.min(220, innerHeight * .28) : Math.min(300, innerHeight * .42);
      const progress = reduce.matches ? 1 : clamp((innerHeight * (channel ? .90 : .96) - box.top - stagger) / distance);
      item.style.setProperty('--arrive', progress.toFixed(4));
      item.dataset.arrived = String(progress >= .99);
    });
    if (platforms) {
      const box = platforms.getBoundingClientRect();
      const progress = reduce.matches ? 1 : clamp((innerHeight * .86 - box.top) / Math.min(440, innerHeight * .65));
      platforms.style.setProperty('--posting-progress', progress.toFixed(4));
    }
    if (reach) {
      // Measure the stationary network, never a transformed child. Short screens
      // finish the story before its outcomes leave the viewport, in either direction.
      const box = reach.getBoundingClientRect();
      const progress = reduce.matches ? 1 : clamp((innerHeight * .93 - box.top) / Math.min(box.height + 45, innerHeight * .58));
      reach.closest('[data-reach-story]').style.setProperty('--reach-progress', progress.toFixed(4));
      audience.forEach((node, index) => {
        const arrival = reduce.matches ? 1 : clamp((progress - index * .095) / .45);
        node.style.setProperty('--reach-arrive', arrival.toFixed(4));
      });
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
