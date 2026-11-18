(() => {
  'use strict';
  const form = document.querySelector('#readinessForm');
  if (!form) return;
  const error = document.querySelector('#readinessError');
  const space = document.querySelector('#spaceQuestion');
  const endpoint = 'https://script.google.com/macros/s/AKfycbwiFxOMP-nPOJK_KIOEOaB6SfaktJz8b9EPmlSRKtyx85pnrlhMdtXqTt1wpVurmaxf/exec';
  let pending = false;
  let retryId = '';
  let retryBody = '';
  function send(payload) {
    return new Promise((resolve,reject) => {
      const frame=document.createElement('iframe');
      frame.name='ready-'+crypto.randomUUID(); frame.hidden=true; frame.title='무료점검 접수 처리';
      const relay=document.createElement('form'); relay.method='POST'; relay.action=endpoint; relay.target=frame.name; relay.hidden=true;
      const input=document.createElement('input');input.name='payload';input.value=JSON.stringify(payload);relay.append(input);
      const finish=(error,result)=>{clearTimeout(timer);window.removeEventListener('message',receive);relay.remove();frame.remove();error?reject(error):resolve(result);};
      const receive=event=>{
        if(event.origin!=='https://script.google.com' && !/^https:\/\/[^/]+\.googleusercontent\.com$/.test(event.origin))return;
        const m=event.data;if(!m||m.source!=='TIGER_READY_SYNC'||m.leadId!==payload.leadId)return;
        finish(m.ok?null:new Error(m.message||'접수를 완료하지 못했습니다.'),m);
      };
      const timer=setTimeout(()=>finish(new Error('처리 결과 확인이 지연되고 있습니다. 이메일을 확인해주세요. 같은 내용으로 다시 누르면 중복 접수되지 않습니다.')),55000);
      window.addEventListener('message',receive);document.body.append(frame,relay);relay.submit();
    });
  }
  const values = name => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(x => x.value);
  const setSummary = group => {
    const chosen = values(group.dataset.group);
    group.querySelector('[data-choice-summary]').textContent = chosen.length ? chosen.join(' · ') : group.dataset.placeholder;
  };
  form.querySelectorAll('[data-group]').forEach(group => {
    group.addEventListener('change', event => {
      if (event.target.type !== 'checkbox') return;
      if (event.target.checked) {
        const exclusive = event.target.dataset.exclusive === 'true';
        group.querySelectorAll('input[type="checkbox"]').forEach(input => {
          if (input !== event.target && (exclusive || input.dataset.exclusive === 'true')) input.checked = false;
        });
      }
      setSummary(group);
      const own = values('salesMethod').includes('매장에서 만들어 소비자에게 택배');
      space.hidden = !own;
      space.querySelector('select').disabled = !own;
      if (!own) space.querySelector('select').value = '';
    });
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if(pending)return;
    error.hidden = true;
    const field = name => form.elements.namedItem(name);
    const failures = [];
    for (const [name,message] of [['storeName','매장명을 입력해주세요.'],['storeArea','매장 지역을 입력해주세요.'],['menu','대표 메뉴를 입력해주세요.']]) {
      if (!field(name).value.trim()) failures.push({message, element:field(name)});
    }
    for (const [name,label] of [['businessType','현재 영업 종류를'],['salesMethod','제조·판매 방식을']]) {
      if (!values(name).length) failures.push({message:`${label} 선택해주세요. 잘 모르셔도 신청할 수 있습니다.`,element:form.querySelector(`[data-group="${name}"] summary`)});
    }
    if (!space.hidden && !field('space').value) failures.push({message:'제조·포장 공간을 선택해주세요. 잘 모름도 선택할 수 있습니다.',element:field('space')});
    if (!field('email').value.trim() || !field('email').validity.valid) failures.push({message:'보고서를 받을 이메일 주소를 확인해주세요.',element:field('email')});
    if (!field('consent').checked) failures.push({message:'개인정보 수집·이용 안내를 확인하고 동의해주세요.',element:field('consent')});
    if (failures.length) {error.textContent=failures[0].message;error.hidden=false;failures[0].element.focus();return;}
    const payload={mode:'readiness',storeName:field('storeName').value.trim(),storeArea:field('storeArea').value.trim(),menu:field('menu').value.trim(),businessType:values('businessType'),salesMethod:values('salesMethod'),space:field('space').value,email:field('email').value.trim(),consent:true,website:field('website').value,source:location.pathname+(()=>{const q=new URLSearchParams(location.search),s=new URLSearchParams();for(const k of ['utm_source','utm_medium','utm_campaign','utm_content'])if(q.has(k))s.set(k,q.get(k).slice(0,40));return s.size?'?'+s.toString():'';})()};
    const body=JSON.stringify(payload);
    if(body!==retryBody){retryId='TREADY-'+crypto.randomUUID();retryBody=body;}
    payload.leadId=retryId;
    const button=form.querySelector('button[type="submit"]');pending=true;button.disabled=true;button.textContent='점검 자료를 준비하고 있습니다…';
    let result;
    try{result=await send(payload);}catch(e){error.textContent=e.message;error.hidden=false;return;}
    finally{pending=false;button.disabled=false;button.textContent='우리 메뉴 무료점검 받기';}
    const summary = document.querySelector('#previewInputSummary');
    summary.replaceChildren();
    const rows=[['매장',field('storeName').value.trim()],['지역',field('storeArea').value.trim()],['메뉴',field('menu').value.trim()],['영업 종류',values('businessType').join(', ')],['판매 방식',values('salesMethod').join(', ')],['이메일',field('email').value.trim()]];
    if (!space.hidden) rows.splice(5,0,['공간',field('space').value]);
    for(const [key,value] of rows){const row=document.createElement('div');const dt=document.createElement('dt');const dd=document.createElement('dd');dt.textContent=key;dd.textContent=value;row.append(dt,dd);summary.append(row);}
    form.hidden=true;
    const success=document.querySelector('#previewSuccess');success.hidden=false;success.querySelector('h2').focus();
    document.querySelector('#deliveryMessage').textContent=result.mailSent?'입력하신 이메일로 점검 보고서를 보냈습니다. 수신까지 잠시 걸릴 수 있으며, 보이지 않으면 스팸함도 확인해주세요.':'신청은 저장됐지만 보고서 메일 발송을 확인하지 못했습니다. 홈페이지 상담 신청에서 접수번호를 알려주시면 확인해드리겠습니다.';
    document.querySelector('#submissionId').textContent='접수번호: '+result.leadId;
    if(typeof window.tigerReadinessReceived==='function')window.tigerReadinessReceived(result.leadId);
  });
  document.querySelector('#editPreview').addEventListener('click',()=>{document.querySelector('#previewSuccess').hidden=true;form.hidden=false;form.elements.storeName.focus();});
})();
