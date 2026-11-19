(() => {
  'use strict';
  const endpoint='https://script.google.com/macros/s/AKfycbwiFxOMP-nPOJK_KIOEOaB6SfaktJz8b9EPmlSRKtyx85pnrlhMdtXqTt1wpVurmaxf/exec';
  const key='tiger-funnel-session-v1',choiceKey='tiger-site-stats-excluded-v1';
  const page=location.pathname==='/free-check/'||location.pathname==='/free-check/index.html'?'free_check':location.pathname==='/'||location.pathname==='/index.html'?'home':null;
  const ttl=30*60*1000,hostAllowed=['www.tigercommercelab.com','tigercommercelab.com','localhost','127.0.0.1'].includes(location.hostname);
  let state=null,busy=false,retryTimer=0,attempts=0;
  const privacySignal=navigator.globalPrivacyControl===true || navigator.doNotTrack==='1';
  function excluded(){try{return privacySignal||localStorage.getItem(choiceKey)==='yes';}catch{return privacySignal;}}
  function save(){try{sessionStorage.setItem(key,JSON.stringify(state));}catch{}}
  function source(){
    const q=new URLSearchParams(location.search),raw=q.get('utm_source'),allowed=['ig','fb','meta','facebook','instagram','naver','google','youtube'];
    let s=allowed.includes(raw)?raw:raw?'other':'direct';
    if(!raw&&document.referrer){try{const h=new URL(document.referrer).hostname;if(!['www.tigercommercelab.com','tigercommercelab.com'].includes(h))s=h.includes('instagram.com')?'instagram':h.includes('facebook.com')?'facebook':h.includes('naver.com')?'naver':h.includes('google.')?'google':'other';}catch{}}
    return {source:s,campaign:q.get('utm_campaign')==='tiger_ready'?'tiger_ready':'',ad:/^\d{10,25}$/.test(q.get('utm_content')||'')?q.get('utm_content'):'',test:q.get('tiger_qa')==='1'};
  }
  function session(){
    if(!hostAllowed||excluded())return null;
    if(!state){try{state=JSON.parse(sessionStorage.getItem(key));}catch{}}
    const now=Date.now();
    if(!state||!/^TF-[a-f0-9-]{36}$/.test(state.sid||'')||!Array.isArray(state.queued)||!Array.isArray(state.done)||now-state.last>ttl||now-state.started>86400000||state.started>now+300000){state={sid:'TF-'+crypto.randomUUID(),started:now,last:now,entry:page||'home',...source(),done:[],queued:[]};}
    if(new URLSearchParams(location.search).get('tiger_qa')==='1')state.test=true;
    state.last=now;save();return state;
  }
  function snapshot(s){return s?{sid:s.sid,started:s.started,source:s.source,campaign:s.campaign,ad:s.ad,entry:s.entry,test:s.test}:null;}
  function context(){return snapshot(session());}
  function queue(stage){
    const s=session();if(!s||!page)return;
    // A resumed, expired form session gets a visit and landing stage before its first input.
    for(const item of ['visit',...(page==='free_check'?['form_view']:[]),stage])if(!s.done.includes(item)&&!s.queued.includes(item))s.queued.push(item);
    save();flush();
  }
  function transport(payload){return new Promise((resolve,reject)=>{
    const frame=document.createElement('iframe');frame.name='funnel-'+crypto.randomUUID();frame.hidden=true;frame.title='방문 통계 처리';
    const form=document.createElement('form');form.method='POST';form.action=endpoint;form.target=frame.name;form.hidden=true;
    const input=document.createElement('input');input.name='payload';input.value=JSON.stringify(payload);form.append(input);
    const finish=(error,result)=>{clearTimeout(timer);window.removeEventListener('message',receive);form.remove();frame.remove();error?reject(error):resolve(result);};
    const receive=e=>{if(e.origin!=='https://script.google.com'&&!/^https:\/\/[^/]+\.googleusercontent\.com$/.test(e.origin))return;const m=e.data;if(!m||m.source!=='TIGER_FUNNEL_SYNC'||m.batchId!==payload.batchId)return;finish(null,m);};
    const timer=setTimeout(()=>finish(new Error('timeout')),35000);window.addEventListener('message',receive);document.body.append(frame,form);form.submit();
  });}
  async function flush(){
    if(busy||excluded()||!state||!state.queued.length||attempts>=3)return;
    busy=true;attempts++;
    const sid=state.sid,events=state.queued.slice(0,6),payload={mode:'funnel',batchId:'FB-'+crypto.randomUUID(),context:snapshot(state),events:events.map(stage=>({stage,page}))};
    try{const result=await transport(payload);if(result.ok&&state.sid===sid){state.done=[...new Set([...state.done,...events])];state.queued=state.queued.filter(s=>!events.includes(s));save();attempts=0;}}
    catch{}finally{busy=false;if(state&&state.queued.length&&attempts<3)retryTimer=setTimeout(flush,1500* Math.max(attempts,1));}
  }
  function beacon(){
    if(excluded()||!state||!state.queued.length||!navigator.sendBeacon)return;
    const payload={mode:'funnel',batchId:'FB-'+crypto.randomUUID(),context:snapshot(state),events:state.queued.slice(0,6).map(stage=>({stage,page}))};
    try{navigator.sendBeacon(endpoint,new URLSearchParams({payload:JSON.stringify(payload)}));}catch{}
  }
  window.tigerFunnel={context,record:queue,markTest(){const s=session();if(s){s.test=true;save();}},excluded};
  function settings(){
    const button=document.querySelector('[data-site-stats-choice]'),status=document.querySelector('[data-site-stats-status]');
    if(!button)return;
    const render=()=>{button.textContent=excluded()?'방문 통계 다시 허용':'이 브라우저의 방문 통계 제외';button.disabled=privacySignal;if(status)status.textContent=privacySignal?'브라우저의 추적 제한 설정에 따라 통계에서 제외됩니다.':excluded()?'이 브라우저는 방문 통계에서 제외됩니다.':'이름·연락처·입력 내용 없이 방문 단계를 집계합니다.';};
    button.addEventListener('click',()=>{if(privacySignal)return;const no=!excluded();try{localStorage.setItem(choiceKey,no?'yes':'no');sessionStorage.removeItem(key);}catch{}state=null;clearTimeout(retryTimer);render();});render();
  }
  settings();
  if(!page||!hostAllowed||excluded())return;
  queue(page==='free_check'?'form_view':'visit');
  const form=document.querySelector('#readinessForm');
  if(form){const start=e=>{const el=e.target;if(!el.name||['website','consent'].includes(el.name))return;if(el.name==='storeName'&&el.value.includes('[TEST]'))window.tigerFunnel.markTest();queue('form_start');if(typeof window.tigerReadinessStarted==='function')window.tigerReadinessStarted();};form.addEventListener('input',start);form.addEventListener('change',start);}
  window.addEventListener('pagehide',beacon);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')beacon();else{attempts=0;flush();}});
})();
