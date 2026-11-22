(() => {
  'use strict';
  const endpoint='https://script.google.com/macros/s/AKfycbwiFxOMP-nPOJK_KIOEOaB6SfaktJz8b9EPmlSRKtyx85pnrlhMdtXqTt1wpVurmaxf/exec';
  const $=id=>document.getElementById(id), form=$('consultForm');
  const token=new URLSearchParams(location.hash.slice(1)).get('k')||'';
  let pending=false;
  const field=name=>form.elements.namedItem(name);
  function rpc(mode,extra={}) {
    return new Promise((resolve,reject)=>{
      const requestId=crypto.randomUUID(), frame=document.createElement('iframe'), relay=document.createElement('form'), input=document.createElement('input');
      frame.name='followup-'+requestId;frame.hidden=true;frame.title='상담 신청 처리';
      relay.hidden=true;relay.method='POST';relay.action=endpoint;relay.target=frame.name;
      input.name='payload';input.value=JSON.stringify({mode,token,requestId,...extra});relay.append(input);
      let done=false;
      const finish=(error,result)=>{if(done)return;done=true;clearTimeout(timer);window.removeEventListener('message',receive);relay.remove();frame.remove();error?reject(error):resolve(result);};
      const receive=e=>{if(e.origin!=='https://script.google.com'&&!/^https:\/\/[^/]+\.googleusercontent\.com$/.test(e.origin))return;const m=e.data;if(!m||m.source!=='TIGER_FOLLOWUP_SYNC'||m.requestId!==requestId)return;finish(m.ok?null:new Error(m.message||'연결을 확인할 수 없습니다.'),m);};
      const timer=setTimeout(()=>finish(new Error('연결 확인이 늦어지고 있습니다. 잠시 뒤 다시 시도해주세요. 이미 저장된 신청은 중복 접수하지 않습니다.')),55000);
      window.addEventListener('message',receive);document.body.append(frame,relay);relay.submit();
    });
  }
  function success(result={}) {
    form.hidden=true;$('loading').hidden=true;$('success').hidden=false;
    $('successMessage').textContent=result.already?'이미 상담 요청이 접수되어 있습니다. 내용을 확인한 뒤 연락드리겠습니다.':result.contactMethod==='phone'?'상담 요청을 받았습니다. 남겨주신 연락처와 희망 시간대를 확인해 연락드리겠습니다. 전화 예약이 확정된 상태는 아닙니다.':'상담 요청을 받았습니다. 무료점검을 신청하신 이메일로 연락드리겠습니다.';
    $('consultationId').textContent=result.consultationId?'상담번호: '+result.consultationId:'';
    $('success').querySelector('h2').focus();
  }
  function phoneMode() {
    const enabled=field('contactMethod').value==='phone';$('phoneFields').hidden=!enabled;$('emailHint').hidden=enabled;
    for(const name of ['phone','preferredTime']){field(name).disabled=!enabled;field(name).required=enabled;}
  }
  form.querySelectorAll('[name="contactMethod"]').forEach(el=>el.addEventListener('change',phoneMode));
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(pending)return;$('formError').hidden=true;
    const method=field('contactMethod').value, phone=field('phone').value.trim(), time=field('preferredTime').value.trim();
    let message='';
    if(!field('interest').value)message='지금 가장 필요한 도움을 선택해주세요.';
    else if(method==='phone'&&!/^0[0-9 -]{8,15}$/.test(phone))message='연락받을 전화번호를 확인해주세요.';
    else if(method==='phone'&&!time)message='편한 요일·시간대를 알려주세요.';
    else if(!field('consent').checked)message='개인정보 수집·이용 안내를 확인하고 동의해주세요.';
    if(message){$('formError').textContent=message;$('formError').hidden=false;return;}
    const button=form.querySelector('[type="submit"]');pending=true;button.disabled=true;button.textContent='상담 요청을 전하고 있습니다…';
    try{success(await rpc('followup_consult',{interest:field('interest').value,contactMethod:method,phone:method==='phone'?phone:'',preferredTime:method==='phone'?time:'',note:field('note').value.trim(),consent:true,website:field('website').value}));}
    catch(error){$('formError').textContent=error.message;$('formError').hidden=false;}
    finally{pending=false;button.disabled=false;button.textContent='우리 매장 다음 단계 상담 ↗';}
  });
  async function init(){
    if(!/^[a-f0-9]{64}$/.test(token)){$('loading').hidden=true;$('unavailable').hidden=false;return;}
    try{const result=await rpc('followup_context');$('loading').hidden=true;if(result.requested){success({already:true});return;}$('storeName').textContent=result.storeName;form.hidden=false;}
    catch(error){$('loading').hidden=true;$('unavailable').hidden=false;$('unavailableText').textContent=error.message;}
  }
  window.addEventListener('hashchange',()=>location.reload());
  init();
})();
