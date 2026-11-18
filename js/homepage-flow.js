/* Meaningful scroll emphasis; all copy remains readable without motion. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pinned = matchMedia('(min-width:1000px) and (min-height:720px)');
  const story = document.querySelector('[data-owner-story]');
  if (!story) return;
  document.body.classList.add('motion-enhanced');
  const track = story.querySelector('.owner-track'), stage = story.querySelector('.owner-stage');
  const scenes = [...story.querySelectorAll('[data-owner-scene]')], buttons = [...story.querySelectorAll('[data-owner-select]')];
  let active = -1, raf = 0, manualY = null, nearby = false;
  function select(index) {
    if (active === index) return;
    active = index;story.dataset.activeOwner=String(index);story.style.setProperty('--owner-index',index);
    scenes.forEach((scene,i)=>{scene.classList.toggle('is-active',i===index);scene.inert=pinned.matches&&!reduced.matches&&i!==index;});
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    story.querySelector('.owner-page b').textContent=String(index+1).padStart(2,'0');
  }
  function draw(){
    raf=0;if(!nearby||reduced.matches)return;
    if(manualY!==null&&Math.abs(scrollY-manualY)<70)return;manualY=null;
    if(pinned.matches){const r=track.getBoundingClientRect(),budget=Math.max(1,track.offsetHeight-stage.offsetHeight);const p=Math.max(0,Math.min(1,(72-r.top)/budget));select(Math.min(2,Math.floor(p*3)));}
    else{const center=innerHeight*.48,distances=scenes.map(scene=>{const r=scene.getBoundingClientRect();return Math.abs(r.top+r.height*.48-center);});select(distances.indexOf(Math.min(...distances)));}
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(draw);}
  new IntersectionObserver(entries=>{nearby=entries[0].isIntersecting;if(nearby)schedule();},{rootMargin:'100px'}).observe(track);
  buttons.forEach((button,index)=>button.addEventListener('click',()=>{select(index);manualY=scrollY;if(!pinned.matches)scenes[index].scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'center'});}));
  function reset(){active=-1;scenes.forEach(scene=>{scene.inert=false;});select(0);schedule();}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);pinned.addEventListener('change',reset);reduced.addEventListener('change',reset);select(0);
  const filmStory=document.querySelector('[data-case-story]'),video=filmStory?.querySelector('video'),play=filmStory?.querySelector('.jogane-play');
  let inView=false,userPaused=false,autoSuspended=true;
  function pause(){if(video){autoSuspended=true;video.pause();}}
  async function start(explicit=false){
    if(!video||(!explicit&&(reduced.matches||userPaused||video.ended))||document.hidden)return;
    autoSuspended=false;if(explicit){userPaused=false;if(video.ended)video.currentTime=0;}
    dispatchEvent(new CustomEvent('tiger:video-claim',{detail:{video}}));
    try{await video.play();}catch(_){play.hidden=false;}
  }
  if(video){
    play.addEventListener('click',()=>start(true));video.addEventListener('play',()=>{play.hidden=true;userPaused=false;});
    video.addEventListener('pause',()=>{if(!autoSuspended&&!video.ended)userPaused=true;});
    video.addEventListener('ended',()=>{play.hidden=false;play.innerHTML='영상 다시 보기 <span aria-hidden="true">↻</span>';play.setAttribute('aria-label','조가네 실제 영상 다시 재생');});
    new IntersectionObserver(entries=>{const e=entries[0];inView=e.isIntersecting&&e.intersectionRatio>=.3;if(inView)start();else pause();},{threshold:[0,.3,.65]}).observe(video);
    new IntersectionObserver(entries=>{if(entries[0].isIntersecting)filmStory.classList.add('is-visible');},{threshold:.15}).observe(filmStory);
    addEventListener('tiger:video-claim',event=>{if(event.detail?.video!==video)pause();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(inView)start();});
    reduced.addEventListener('change',()=>{if(reduced.matches)pause();else if(inView)start();});
  }
  const plans=document.querySelector('#planGrid');
  const cardObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-present');cardObserver.unobserve(entry.target);}});},{threshold:.13});
  function bindCards(){plans?.querySelectorAll('.plan-card:not([data-motion-card])').forEach((card,index)=>{card.dataset.motionCard='true';card.style.transitionDelay=(index%2)*80+'ms';cardObserver.observe(card);});}
  if(plans){new MutationObserver(bindCards).observe(plans,{childList:true});bindCards();}
})();
