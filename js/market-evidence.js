(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pinMedia = matchMedia('(min-width:1000px) and (min-height:760px)');
  const root = document.querySelector('[data-market-story]');
  const clamp = v => Math.min(1, Math.max(0, v));
  const number = (v, digits) => v.toLocaleString('ko-KR', {minimumFractionDigits:digits,maximumFractionDigits:digits});
  const running = new Map();
  function animate(node, target, digits, duration = 900) {
    cancelAnimationFrame(running.get(node));
    if (motion.matches) { node.textContent = number(target, digits); running.delete(node); return; }
    const from = Number(node.textContent.replaceAll(',', '')) || 0;
    const start = performance.now();
    const tick = now => {
      const t = clamp((now - start) / duration);
      node.textContent = number(from + (target - from) * (1 - (1-t)**3), digits);
      if (t < 1) running.set(node, requestAnimationFrame(tick));
      else { node.textContent = number(target, digits); running.delete(node); }
    };
    running.set(node, requestAnimationFrame(tick));
  }
  const counters = [...document.querySelectorAll('[data-market-count]')];
  function countIn(node) {
    if (node.dataset.counted) return;
    node.dataset.counted = 'true';
    const card = node.closest('[data-market-card]');
    card?.classList.add('is-counted');
    if (!motion.matches) node.textContent = number(0, Number(node.dataset.digits || 0));
    animate(node, Number(node.dataset.marketCount), Number(node.dataset.digits || 0));
  }
  let countObserver;
  if ('IntersectionObserver' in window && !motion.matches) {
    countObserver = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      countIn(e.target); countObserver.unobserve(e.target);
    }), {threshold:.65});
    counters.forEach(node => {node.closest('[data-market-card]')?.classList.add('market-count-ready');countObserver.observe(node);});
  } else counters.forEach(countIn);
  if (root) {
    const track = root.querySelector('.market-scroll-track');
    const stage = root.querySelector('.market-stage');
    const chart = root.querySelector('.market-chart');
    const amount = root.querySelector('[data-market-annual-value]');
    const yearText = root.querySelector('[data-market-selected-year]');
    const exact = root.querySelector('[data-market-exact]');
    const accessible = root.querySelector('[data-market-annual-accessible]');
    const buttons = [...root.querySelectorAll('[data-market-year]')];
    const bars = [...root.querySelectorAll('[data-market-bar]')];
    const years = buttons.map(b => ({year:b.dataset.marketYear, amount:Number(b.dataset.amount)}));
    if ('IntersectionObserver' in window && !motion.matches) {
      chart.classList.add('market-chart-reveal');
      const reveal = new IntersectionObserver(entries => {
        if (!entries.some(e => e.isIntersecting)) return;
        chart.classList.add('is-revealed'); reveal.disconnect();
      },{threshold:.3});
      reveal.observe(chart);
    }
    let current = 2, inView = false, frame = 0, manual = false, manualY = 0;
    const canPin = () => pinMedia.matches && !motion.matches;
    function select(index, immediate = false) {
      index = Math.max(0,Math.min(years.length-1,index));
      if (index === current && !immediate) return;
      current = index;
      const item = years[index];
      root.dataset.marketActive = item.year;
      yearText.textContent = item.year + '년';
      exact.textContent = item.amount.toLocaleString('ko-KR') + '억원 · 연간 거래액';
      accessible.textContent = item.year + '년 온라인 음·식료품 연간 거래액 ' + item.amount.toLocaleString('ko-KR') + '억원';
      buttons.forEach((b,i) => b.setAttribute('aria-pressed', String(i===index)));
      bars.forEach((b,i) => b.classList.toggle('is-current',i===index));
      if (immediate) {cancelAnimationFrame(running.get(amount));amount.textContent=number(item.amount/10000,1);running.delete(amount);}
      else animate(amount,item.amount/10000,1,650);
    }
    function render() {
      frame = 0;
      if (!canPin() || !inView) return;
      if (manual && Math.abs(scrollY-manualY)<56) return;
      manual = false;
      const box = track.getBoundingClientRect();
      const distance = Math.max(1,track.offsetHeight-stage.offsetHeight);
      const progress = clamp((95-box.top)/distance);
      select(Math.min(2,Math.floor(progress*3)));
    }
    function request() {if (!frame && inView && canPin()) frame=requestAnimationFrame(render);}
    function setup() {
      root.classList.toggle('market-scroll-enabled',canPin());
      if (motion.matches) chart.classList.add('is-revealed');
      manual=false;
      if (canPin()) { inView=true; render(); }
      else select(2,true);
    }
    buttons.forEach((b,i) => b.addEventListener('click',() => {manual=true;manualY=scrollY;select(i);}));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {inView=entries[0].isIntersecting;if(inView)request();},{rootMargin:'100px'}).observe(track);
    } else inView=true;
    window.addEventListener('scroll',request,{passive:true});
    pinMedia.addEventListener('change',setup);
    motion.addEventListener('change',setup);
    window.addEventListener('pageshow',setup);
    setup();
  }
  motion.addEventListener('change',() => {
    if (!motion.matches) return;
    countObserver?.disconnect();
    counters.forEach(node => {cancelAnimationFrame(running.get(node));node.textContent=number(Number(node.dataset.marketCount),Number(node.dataset.digits||0));node.closest('[data-market-card]')?.classList.add('is-counted');});
  });
})();
