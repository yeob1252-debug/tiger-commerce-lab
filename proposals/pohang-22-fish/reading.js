/* r107: WHYBE scroll-position/active-link pattern; Tiger RAF batching and motion preference. */
(() => {
  'use strict';
  const reasons=[...document.querySelectorAll('[data-reason]')];
  const links=[...document.querySelectorAll('[data-reason-link]')];
  const reading=document.querySelector('.reason-reading');
  const header=document.querySelector('header');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const clamp=n=>Math.max(0,Math.min(1,n));
  let raf=0;
  function draw(){
    raf=0;
    const head=header.getBoundingClientRect().height;
    const guide=document.querySelector('.reason-guide');
    const mobile=matchMedia('(max-width:650px)').matches;
    const line=Math.max(innerHeight*.4,head+(mobile?guide.offsetHeight:0)+80);
    let active=reasons[0];
    reasons.forEach(reason=>{if(reason.getBoundingClientRect().top<=line)active=reason;});
    reasons.forEach(reason=>{reason.dataset.current=String(reason===active);});
    links.forEach(link=>{if(link.dataset.reasonLink===active.dataset.reason)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    const start=reasons[0].getBoundingClientRect().top;
    const end=reasons.at(-1).getBoundingClientRect().top;
    reading.style.setProperty('--reason-read',String(clamp((line-start)/Math.max(1,end-start))));
    document.documentElement.style.setProperty('--page-read',String(clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight))));
  }
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(draw);};
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);addEventListener('pageshow',schedule);addEventListener('load',schedule);
  reduce.addEventListener('change',schedule);
  document.fonts?.ready.then(schedule);
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-reading');observer.unobserve(entry.target);}});},{threshold:.25});
  document.querySelectorAll('.case-metric,.career-line,.plan-price,.work-row,.operator-proof>div,.asset-ledger li,.asset-compound').forEach(el=>observer.observe(el));
  schedule();
})();
