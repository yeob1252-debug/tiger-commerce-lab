(() => {
  const channel=document.body.dataset.channel || '상담';
  const v=document.getElementById('tigerMotion'), b=document.getElementById('motionToggle');
  const motion=matchMedia('(prefers-reduced-motion: reduce)'); let stopped=motion.matches;
  const sync=()=>{const label=v.ended?'다시 재생':v.paused?'영상 재생':'일시 정지';b.textContent=label;b.setAttribute('aria-label','호랑이 '+label)};
  const play=()=>v.play().catch(sync);
  b.addEventListener('click',()=>{if(v.paused){stopped=false;play()}else{stopped=true;v.pause()}});
  ['play','pause','ended'].forEach(e=>v.addEventListener(e,sync));
  new IntersectionObserver(([e])=>{if(!e.isIntersecting)v.pause();else if(!stopped&&!motion.matches&&!v.ended)play()},{threshold:.2}).observe(v);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)v.pause()});
  motion.addEventListener('change',()=>{if(motion.matches){stopped=true;v.pause()}});sync();
  const tabs=[...document.querySelectorAll('[data-idea]')];
  function select(tab){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById('idea-'+t.dataset.idea).hidden=!active})}
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();select(tabs[n]);tabs[n].focus()})});
  document.getElementById('copyReply').addEventListener('click',async()=>{const status=document.getElementById('copyStatus');try{await navigator.clipboard.writeText(document.getElementById('replyText').textContent);status.textContent=`복사했습니다. 받은 ${channel} 채팅에 붙여 넣고 매장 링크를 채워주세요.`}catch{document.querySelector('.reply-example').open=true;status.textContent=`아래 답장 예시를 복사해 받은 ${channel} 채팅에 보내주세요.`}});
})();
