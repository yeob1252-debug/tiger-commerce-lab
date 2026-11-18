(() => {
  'use strict';
  const id='1667096391524043', key='tiger-ad-measurement-v1';
  let allowed=false, loaded=false, pendingLead='';
  const sent=new Set();
  function read(){try{const v=JSON.parse(localStorage.getItem(key));return v&&v.expires>Date.now()?v.value:null;}catch{return null;}}
  function save(value){try{localStorage.setItem(key,JSON.stringify({value,expires:Date.now()+90*86400000}));}catch{}}
  function start(){
    if(loaded){window.fbq('consent','grant');return;}loaded=true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('set','autoConfig',false,id);
    window.fbq('init',id);
    window.fbq('consent','grant');
    window.fbq('trackSingle',id,'PageView');
  }
  function lead(value){
    if(!/^TREADY-[a-zA-Z0-9-]{16,64}$/.test(value))return;
    pendingLead=value;if(!allowed||sent.has(value))return;
    try{if(sessionStorage.getItem('tiger-lead-'+value))return;}catch{}
    window.fbq('trackSingle',id,'Lead',{}, {eventID:value});
    sent.add(value);try{sessionStorage.setItem('tiger-lead-'+value,'1');}catch{}
  }
  window.tigerReadinessReceived=lead;
  const box=document.createElement('section');box.id='adMeasurementChoice';box.setAttribute('aria-label','광고 성과 측정 선택');
  box.innerHTML='<strong>광고 성과 측정에 동의하시나요?</strong><p>허용하면 방문·신청 완료 정보와 브라우저·기기 정보가 Meta에 전달됩니다. 신청서 입력 내용은 보내지 않습니다. 거부해도 무료점검은 이용할 수 있습니다. <a href="/privacy/#ad-measurement" target="_blank" rel="noopener">자세히</a></p><div><button type="button" data-measure="no">거부</button><button type="button" data-measure="yes">허용</button></div>';
  const style=document.createElement('style');style.textContent='#adMeasurementChoice{position:fixed;z-index:9999;bottom:18px;left:18px;max-width:420px;width:calc(100% - 36px);padding:18px;background:#fffdf6;border:1px solid #ddd7c8;box-shadow:0 8px 32px #0002;color:#181914;font:14px/1.5 sans-serif;border-radius:12px}#adMeasurementChoice[hidden]{display:none}#adMeasurementChoice p{font-size:12px;margin:8px 0 12px}#adMeasurementChoice div{display:flex;gap:10px}#adMeasurementChoice button{padding:9px 16px;flex:1;border:1px solid #181914;background:#fff;color:#181914;border-radius:6px;cursor:pointer}#adMeasurementChoice a{color:#875100}.ad-measure-setting{font:inherit;background:none;border:0;text-decoration:underline;color:inherit;cursor:pointer}';document.head.append(style);document.body.append(box);
  const change=document.querySelector('[data-ad-measurement]');if(change)change.addEventListener('click',()=>{box.hidden=false;box.querySelector('button').focus();});
  function choice(value){allowed=value==='yes';save(value);box.hidden=true;if(allowed){start();if(pendingLead)lead(pendingLead);}else if(window.fbq){window.fbq('consent','revoke');for(const name of ['_fbp','_fbc'])for(const domain of ['', '; domain=.tigercommercelab.com','; domain=www.tigercommercelab.com'])document.cookie=name+'=; Max-Age=0; path=/; SameSite=Lax'+domain;}}
  box.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>choice(b.dataset.measure)));
  const previous=read();box.hidden=!!previous;if(previous==='yes'){allowed=true;start();}
})();
