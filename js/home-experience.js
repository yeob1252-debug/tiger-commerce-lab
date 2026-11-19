/* R6 scene choreography. No intake, price, account or analytics mutations. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = x => Math.max(0, Math.min(1, x));
  const owner = document.querySelector('[data-owner-story]');
  const service = document.querySelector('[data-service-story]');
  const proof = document.querySelector('#proof');
  const phone = document.querySelector('#story');
  const video = document.querySelector('#joganeOriginal');
  const play = document.querySelector('[data-jogane-toggle]');
  const sound = document.querySelector('[data-jogane-sound]');
  let scheduled = false, pausedByUser = false, claimed = false;
  const scenes = [];
  document.body.classList.add('motion-enhanced');

  function register(root, trackSelector, stageSelector, panelSelectors, buttonSelector, count, key) {
    if (!root) return;
    const record = {
      root, track:root.querySelector(trackSelector), stage:root.querySelector(stageSelector),
      panels:[...root.querySelectorAll(panelSelectors)], buttons:[...root.querySelectorAll(buttonSelector)],
      count, key, active:-1
    };
    function activate(index) {
      if (record.active === index && !reduce.matches) return;
      record.active = index;
      root.dataset[key === 'owner' ? 'activeOwner' : 'activeWork'] = String(index);
      root.style.setProperty(`--${key}-index`, index);
      record.panels.forEach(panel => {
        const n = Number(panel.dataset.ownerScene ?? panel.dataset.workCopy ?? panel.dataset.workVisual);
        panel.classList.toggle('is-active', n === index);
        panel.inert = !reduce.matches && n !== index;
        panel.setAttribute('aria-hidden', String(!reduce.matches && n !== index));
      });
      record.buttons.forEach((button,i) => button.setAttribute('aria-pressed', String(i === index)));
      const number = root.querySelector('.owner-page b');
      if (number) number.textContent = String(index + 1).padStart(2,'0');
    }
    record.activate = activate;
    record.buttons.forEach((button,index) => button.addEventListener('click', () => {
      activate(index);
      if (reduce.matches) return;
      const top = parseFloat(getComputedStyle(record.stage).top) || 0;
      const budget = Math.max(1, record.track.offsetHeight - record.stage.offsetHeight);
      const destination = record.track.getBoundingClientRect().top + scrollY - top + budget * ((index + .24) / count);
      window.scrollTo({top:destination, behavior:'smooth'});
    }));
    activate(0);
    scenes.push(record);
  }
  register(owner,'.owner-track','.owner-stage','[data-owner-scene]','[data-owner-select]',3,'owner');
  register(service,'.service-track','.service-stage','[data-work-copy],[data-work-visual]','[data-work-select]',3,'work');

  function videoVisibility() {
    if (!video) return 0;
    const r = video.getBoundingClientRect();
    const visible = Math.max(0, Math.min(r.bottom,innerHeight - (innerWidth <= 809 ? 78 : 0)) - Math.max(r.top,70));
    return visible / Math.max(1,Math.min(r.height,innerHeight - 150));
  }
  function buttons() {
    if (!video) return;
    play.textContent = video.paused ? '재생' : '일시 정지';
    play.setAttribute('aria-label',video.paused ? '조가네 영상 재생' : '조가네 영상 일시 정지');
    sound.textContent = video.muted ? '소리 켜기' : '소리 끄기';
    sound.setAttribute('aria-label',video.muted ? '조가네 영상 소리 켜기' : '조가네 영상 소리 끄기');
    sound.setAttribute('aria-pressed',String(!video.muted));
  }
  async function startVideo(explicit=false) {
    if (!video || (!explicit && (reduce.matches || pausedByUser || document.hidden)) || !video.paused) return;
    if (explicit) pausedByUser = false;
    if (!claimed) {
      claimed = true;
      dispatchEvent(new CustomEvent('tiger:video-claim',{detail:{video}}));
    }
    try { await video.play(); }
    catch (_) { claimed = false; buttons(); }
  }
  if (video) {
    video.muted = true; video.defaultMuted = true;
    play.addEventListener('click', () => {
      if (video.paused) startVideo(true);
      else { pausedByUser = true; video.pause(); claimed = false; }
    });
    sound.addEventListener('click', () => { video.muted = !video.muted; buttons(); if(video.paused)startVideo(true); });
    ['play','pause','volumechange','loadeddata'].forEach(event => video.addEventListener(event,buttons));
    video.addEventListener('error',()=>{ proof.dataset.videoError='true'; play.textContent='원본 링크에서 보기'; play.disabled=true; });
    addEventListener('tiger:video-claim',event=>{
      if(event.detail?.video !== video) { claimed=false; video.pause(); }
    });
    new IntersectionObserver(schedule,{threshold:[0,.2,.45,.7,1]}).observe(video);
    document.addEventListener('visibilitychange',()=>{if(document.hidden){video.pause();claimed=false;}else schedule();});
    buttons();
  }

  function draw() {
    scheduled = false;
    scenes.forEach(record => {
      if (reduce.matches) { record.activate(0); return; }
      const r = record.track.getBoundingClientRect();
      const top = parseFloat(getComputedStyle(record.stage).top) || 0;
      const budget = Math.max(1, record.track.offsetHeight - record.stage.offsetHeight);
      const p = clamp((top - r.top) / budget);
      record.root.style.setProperty(`--${record.key}-progress`,Math.max(.045,p).toFixed(4));
      record.activate(Math.min(record.count-1,Math.floor(p * record.count)));
    });
    if (proof) {
      const r = proof.getBoundingClientRect();
      const arrive = reduce.matches ? 1 : clamp((innerHeight*.9 - r.top) / (innerHeight*.65));
      proof.style.setProperty('--case-arrive',arrive.toFixed(4));
    }
    if (phone) {
      const p = clamp((70-phone.getBoundingClientRect().top)/Math.max(1,phone.offsetHeight-innerHeight));
      phone.style.setProperty('--story-progress',Math.max(.06,p).toFixed(4));
    }
    if (video) {
      if (videoVisibility() >= .45) startVideo();
      else { if(!video.paused)video.pause(); claimed=false; if(!video.muted){video.muted=true;buttons();} }
    }
  }
  function schedule() { if(!scheduled){scheduled=true;requestAnimationFrame(draw);} }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  reduce.addEventListener('change',()=>{if(video&&reduce.matches)video.pause();scenes.forEach(r=>r.active=-1);schedule();});
  const planGrid = document.querySelector('#planGrid');
  const reveal = new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-present');reveal.unobserve(entry.target);}
  }),{threshold:.12});
  function bindPlans(){planGrid?.querySelectorAll('.plan-card:not([data-motion-card])').forEach((card,i)=>{
    card.dataset.motionCard='true';card.style.transitionDelay=`${(i%4)*70}ms`;reveal.observe(card);
  });}
  if(planGrid){new MutationObserver(bindPlans).observe(planGrid,{childList:true});bindPlans();}
  schedule();
})();
