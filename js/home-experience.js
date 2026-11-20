/* R10 choreography. Reading states are independent of recommendation badges. */
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
      count, key, active:-1, manual:null, manualY:0
    };
    function activate(index) {
      if (record.active === index && !reduce.matches) return;
      record.active = index;
      root.dataset[key === 'owner' ? 'activeOwner' : 'activeWork'] = String(index);
      root.style.setProperty(`--${key}-index`, index);
      record.panels.forEach(panel => {
        const n = Number(panel.dataset.ownerScene ?? panel.dataset.ownerMedia ?? panel.dataset.workCopy ?? panel.dataset.workVisual);
        panel.classList.toggle('is-active', n === index);
        panel.inert = !reduce.matches && n !== index;
        panel.setAttribute('aria-hidden', String(!reduce.matches && n !== index));
      });
      record.buttons.forEach((button,i) => button.setAttribute('aria-pressed', String(i === index)));
      const number = root.querySelector('.owner-page b');
      if (number) number.textContent = String(index + 1).padStart(2,'0');
      dispatchEvent(new CustomEvent('tiger:scene-step'));
    }
    record.activate = activate;
    record.buttons.forEach((button,index) => button.addEventListener('click', () => {
      activate(index);
      record.manual=index;record.manualY=scrollY;
      if (reduce.matches) return;
      if (!record.track.classList.contains('is-pinned')) return;
      const top = parseFloat(getComputedStyle(record.stage).top) || 0;
      const budget = Math.max(1, record.track.offsetHeight - record.stage.offsetHeight);
      const destination = record.track.getBoundingClientRect().top + scrollY - top + budget * ((index + .24) / count);
      window.scrollTo({top:destination, behavior:'smooth'});
    }));
    activate(0);
    scenes.push(record);
  }
  register(owner,'.owner-track','.owner-stage','[data-owner-scene],[data-owner-media]','[data-owner-select]',3,'owner');
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
      const canPin=!reduce.matches&&innerWidth>=1100&&record.stage.offsetHeight<=innerHeight-115;
      record.track.style.setProperty(`--${record.key}-stage-height`,`${record.stage.offsetHeight}px`);
      record.track.classList.toggle('is-pinned',canPin);
      if (reduce.matches) { record.activate(record.manual??0); return; }
      if (!canPin) { record.activate(record.manual??0); return; }
      const r = record.track.getBoundingClientRect();
      const top = parseFloat(getComputedStyle(record.stage).top) || 0;
      const budget = Math.max(1, record.track.offsetHeight - record.stage.offsetHeight);
      const p = clamp((top - r.top) / budget);
      record.root.style.setProperty(`--${record.key}-progress`,Math.max(.045,p).toFixed(4));
      if(record.manual!==null&&Math.abs(scrollY-record.manualY)>30)record.manual=null;
      record.activate(record.manual??Math.min(record.count-1,Math.floor(p * record.count)));
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
    drawAwards();
    drawPlans();
    if (video) {
      if (videoVisibility() >= .45) startVideo();
      else { if(!video.paused)video.pause(); claimed=false; if(!video.muted){video.muted=true;buttons();} }
    }
  }
  function schedule() { if(!scheduled){scheduled=true;requestAnimationFrame(draw);} }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  reduce.addEventListener('change',()=>{if(video&&reduce.matches)video.pause();scenes.forEach(r=>r.active=-1);schedule();});
  const gallery = document.querySelector('[data-award-gallery]');
  const director = document.querySelector('#director');
  const directorTrack = document.querySelector('.director-track');
  const directorStage = document.querySelector('.director-stage');
  const awards = [...document.querySelectorAll('[data-award]')];
  const awardButtons = [...document.querySelectorAll('[data-award-select]')];
  let awardActive=-1, awardManual=null, awardManualY=0;
  function showAward(index) {
    if(index===awardActive && !reduce.matches)return;
    awardActive=index;
    awards.forEach((item,i)=>{item.classList.toggle('is-active',i===index);item.inert=!reduce.matches&&i!==index;item.setAttribute('aria-hidden',String(!reduce.matches&&i!==index));});
    awardButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  }
  awardButtons.forEach((button,i)=>button.addEventListener('click',()=>{awardManual=i;awardManualY=scrollY;showAward(i);}));
  function drawAwards() {
    if(!gallery)return;
    if(awardManual!==null&&Math.abs(scrollY-awardManualY)>100)awardManual=null;
    const canPin=!reduce.matches&&innerWidth>=1100&&directorStage.offsetHeight<=innerHeight-110;
    directorTrack.style.setProperty('--director-stage-height',`${directorStage.offsetHeight}px`);
    directorTrack.classList.toggle('is-pinned',canPin);
    const top=innerWidth<=600?65:90;
    const p=canPin?clamp((top-directorTrack.getBoundingClientRect().top)/Math.max(1,directorTrack.offsetHeight-directorStage.offsetHeight)):clamp((innerHeight*.25-gallery.getBoundingClientRect().top)/Math.max(1,gallery.offsetHeight*.6));
    director.dataset.directorStep=String(p>.45?1:0);
    director.style.setProperty('--director-progress',p.toFixed(4));
    showAward(reduce.matches?0:awardManual??(p>.45?1:0));
  }
  const counted = document.querySelector('.director-credentials');
  let countFrame=0;
  const countObserver=new IntersectionObserver(entries=>{
    if(!entries.some(e=>e.isIntersecting))return;
    countObserver.disconnect();
    counted.classList.add('is-counted');
    const numbers=[...counted.querySelectorAll('[data-director-count]')],start=performance.now();
    const tick=now=>{
      const p=reduce.matches?1:clamp((now-start)/1800),ease=1-Math.pow(1-p,3);
      numbers.forEach(n=>n.textContent=String(Math.round(Number(n.dataset.directorCount)*ease)));
      if(p<1)countFrame=requestAnimationFrame(tick);
    };
    countFrame=requestAnimationFrame(tick);
  },{threshold:.25});
  if(counted)countObserver.observe(counted);
  const keywordObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
    if(e.target.matches('[data-keyword]')&&e.isIntersecting){e.target.classList.add('is-in-view');keywordObserver.unobserve(e.target);}
    else if(e.target.matches('.broadcast-frame'))e.target.dataset.liveVisible=String(e.isIntersecting);
    else { e.target.classList.toggle('is-visible',e.isIntersecting); if(e.isIntersecting)e.target.classList.add('is-in-view'); }
  }),{threshold:.3});
  document.querySelectorAll('[data-keyword],.broadcast-frame,.shop-screen,.evergreen-scene,[data-channel-deck]').forEach(e=>keywordObserver.observe(e));
  const planGrid = document.querySelector('#planGrid');
  const planJourney=document.querySelector('[data-plan-journey]');
  const planStage=document.querySelector('.plan-selection-stage');
  const planButtons=[...document.querySelectorAll('[data-plan-select]')];
  const previousPlan=document.querySelector('[data-plan-prev]');
  const nextPlan=document.querySelector('[data-plan-next]');
  const planPosition=document.querySelector('#planPosition');
  const planName=document.querySelector('#planCurrentName');
  document.querySelector('.plan-recommend-cta')?.addEventListener('click',()=>planGrid.querySelector('[data-plan-consult="PERFORMANCE"]')?.click());
  const pinnedPlans=matchMedia('(min-width:1200px) and (min-height:820px) and (prefers-reduced-motion:no-preference)');
  let planManual=null,planManualY=0,planManualUntil=0;
  function drawPlans() {
    if(!planJourney||!planGrid.children.length)return;
    if(innerWidth<=600)planManual=null;
    const cards=[...planGrid.querySelectorAll('.plan-card')];
    let index=0,finale=false;
    const canPin=pinnedPlans.matches&&planStage.offsetHeight<=innerHeight-100;
    planJourney.style.setProperty('--plan-stage-height',`${planStage.offsetHeight}px`);
    planJourney.classList.toggle('is-pinned',canPin);
    if(canPin) {
      const p=clamp((90-planJourney.getBoundingClientRect().top)/Math.max(1,planJourney.offsetHeight-planStage.offsetHeight));
      index=Math.min(3,Math.floor(p*4));finale=p>=.98;
    } else if(innerWidth<=600) {
      const center=planGrid.getBoundingClientRect().left+planGrid.clientWidth/2;
      let nearest=Infinity;
      cards.forEach((card,i)=>{const r=card.getBoundingClientRect(),distance=Math.abs((r.left+r.right)/2-center);if(distance<nearest){nearest=distance;index=i;}});
    } else {
      // All wide-desktop offers are visible together. Selection is intentional,
      // not inferred from their shared vertical position.
      index=planManual??0;
    }
    if(planManual!==null) {
      if(performance.now()<planManualUntil)planManualY=scrollY;
      else if((canPin||(innerWidth>600&&innerWidth<1200))&&Math.abs(scrollY-planManualY)>100)planManual=null;
      if(planManual!==null){index=planManual;finale=false;}
    }
    planJourney.style.setProperty('--plan-index',index);
    planJourney.dataset.planFinale=String(finale);
    planJourney.dataset.activePlan=String(index);
    cards.forEach((card,i)=>card.classList.toggle('is-current',i===index));
    planButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    if(planPosition)planPosition.textContent=`${index+1} / ${cards.length}`;
    if(planName)planName.textContent=cards[index]?.querySelector('h3')?.textContent||'';
    if(previousPlan)previousPlan.disabled=index===0;
    if(nextPlan)nextPlan.disabled=index===cards.length-1;
  }
  function selectPlan(index) {
    const card=planGrid.querySelectorAll('.plan-card')[index];if(!card)return;
    const isPinned=planJourney.classList.contains('is-pinned');
    planManual=innerWidth<=600?null:index;planManualY=scrollY;planManualUntil=performance.now()+1200;
    if(innerWidth<=600){
      planGrid.scrollTo({left:card.offsetLeft-planGrid.firstElementChild.offsetLeft,behavior:reduce.matches?'instant':'smooth'});
      const top=planGrid.getBoundingClientRect().top;
      if(top<115||top>innerHeight*.5)scrollTo({top:scrollY+top-120,behavior:reduce.matches?'instant':'smooth'});
    }
    else if(isPinned)scrollTo({top:planJourney.getBoundingClientRect().top+scrollY-85+Math.max(1,planJourney.offsetHeight-planStage.offsetHeight)*(index+.15)/4,behavior:reduce.matches?'instant':'smooth'});
    else if(innerWidth<1200)scrollTo({top:card.getBoundingClientRect().top+scrollY-100,behavior:reduce.matches?'instant':'smooth'});
    schedule();
  }
  planButtons.forEach((button,index)=>button.addEventListener('click',()=>selectPlan(index)));
  previousPlan?.addEventListener('click',()=>selectPlan(Math.max(0,Number(planJourney.dataset.activePlan)-1)));
  nextPlan?.addEventListener('click',()=>selectPlan(Math.min(planButtons.length-1,Number(planJourney.dataset.activePlan)+1)));
  planGrid?.addEventListener('keydown',event=>{
    if(innerWidth>600||event.target!==planGrid||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    const current=Number(planJourney.dataset.activePlan)||0;
    const next=event.key==='Home'?0:event.key==='End'?planButtons.length-1:current+(event.key==='ArrowRight'?1:-1);
    selectPlan(Math.max(0,Math.min(planButtons.length-1,next)));
  });
  const reveal = new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-present');reveal.unobserve(entry.target);}
  }),{threshold:.12});
  function bindPlans(){planGrid?.querySelectorAll('.plan-card:not([data-motion-card])').forEach((card,i)=>{
    card.dataset.motionCard='true';card.style.transitionDelay=`${(i%4)*70}ms`;reveal.observe(card);
    const details=card.querySelector('details');
    let disclosureTop=null;
    details?.querySelector('summary').addEventListener('click',()=>{disclosureTop=details.getBoundingClientRect().top;planManual=i;planManualY=scrollY;planManualUntil=performance.now()+1200;});
    details?.addEventListener('toggle',()=>{
      drawPlans();
      if(disclosureTop!==null&&innerWidth>600){scrollBy({top:details.getBoundingClientRect().top-disclosureTop,behavior:'instant'});disclosureTop=null;}
      schedule();
    });
  });
    if(planGrid?.dataset.restorePlan!==undefined){
      const index=Number(planGrid.dataset.restorePlan)||0;
      delete planGrid.dataset.restorePlan;
      const cards=[...planGrid.querySelectorAll('.plan-card')];
      if(innerWidth<=600&&cards[index])planGrid.scrollTo({left:cards[index].offsetLeft-cards[0].offsetLeft,behavior:'instant'});
      else if(index>0){planManual=index;planManualY=scrollY;}
    }
    schedule();
  }
  if(planGrid){new MutationObserver(bindPlans).observe(planGrid,{childList:true});planGrid.addEventListener('scroll',schedule,{passive:true});new ResizeObserver(schedule).observe(planGrid);bindPlans();}
  reduce.addEventListener('change',()=>{if(reduce.matches){cancelAnimationFrame(countFrame);document.querySelectorAll('[data-director-count]').forEach(n=>n.textContent=n.dataset.directorCount);}awardActive=-1;schedule();});
  schedule();
})();
