/* Scroll-responsive evidence without a pinned section or a reading delay. */
(() => {
  'use strict';
  const root = document.querySelector('[data-flow-market]');
  if (!root) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const chart = root.querySelector('.market-chart');
  const buttons = [...root.querySelectorAll('[data-market-year]')];
  const bars = [...root.querySelectorAll('[data-market-bar]')];
  const amount = root.querySelector('[data-market-annual-value]');
  let current = 2, frame = 0, animation = 0, visible = false, manualY = null;
  const fixed = value => value.toLocaleString('ko-KR', {minimumFractionDigits:1,maximumFractionDigits:1});
  function select(index, immediate = false) {
    if (index === current && !immediate) return;
    current = index;
    const button = buttons[index], value = Number(button.dataset.amount), year = button.dataset.marketYear;
    root.dataset.marketActive = year;
    root.querySelector('[data-market-selected-year]').textContent = year + '년';
    root.querySelector('[data-market-exact]').textContent = value.toLocaleString('ko-KR') + '억원 · 연간 거래액';
    root.querySelector('[data-market-annual-accessible]').textContent = `${year}년 온라인 음·식료품 연간 거래액 ${value.toLocaleString('ko-KR')}억원`;
    buttons.forEach((b,i) => b.setAttribute('aria-pressed',String(i===index)));
    bars.forEach((b,i) => b.classList.toggle('is-current',i===index));
    cancelAnimationFrame(animation);
    if (motion.matches || immediate) { amount.textContent = fixed(value/10000); return; }
    const from = Number(amount.textContent.replaceAll(',','')), started = performance.now();
    function tick(now) { const t = Math.min(1,(now-started)/450); amount.textContent = fixed(from+(value/10000-from)*(1-(1-t)**3)); if(t<1)animation=requestAnimationFrame(tick); }
    animation=requestAnimationFrame(tick);
  }
  function render() {
    frame=0;
    if (!visible || motion.matches || (manualY!==null && Math.abs(scrollY-manualY)<90)) return;
    manualY=null;
    const r=chart.getBoundingClientRect();
    const progress=Math.max(0,Math.min(1,(innerHeight*.88-r.top)/(innerHeight*.64)));
    select(Math.min(2,Math.floor(progress*3)));
  }
  function request(){if(!frame)frame=requestAnimationFrame(render);}
  buttons.forEach((button,index)=>button.addEventListener('click',()=>{manualY=scrollY;select(index);}));
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)request();},{rootMargin:'50px'});
  observer.observe(chart);
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('resize',request);
  motion.addEventListener('change',()=>{if(motion.matches)select(2,true);else request();});
  // Pause actual case footage when the visitor resumes the tiger hero video.
  window.addEventListener('tiger:video-claim',()=>document.querySelectorAll('.flow-case-film video').forEach(video=>video.pause()));
})();
