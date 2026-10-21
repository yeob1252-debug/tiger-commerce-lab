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
  document.getElementById('copyReply').addEventListener('click',async()=>{const status=document.getElementById('copyStatus');try{await navigator.clipboard.writeText(document.getElementById('replyText').textContent);status.textContent=`복사했습니다. 받은 ${channel} 채팅에 붙여 넣고 목표와 일정을 채워주세요.`}catch{document.querySelector('.reply-example').open=true;status.textContent=`아래 답장 예시를 복사해 받은 ${channel} 채팅에 보내주세요.`}});
})();
