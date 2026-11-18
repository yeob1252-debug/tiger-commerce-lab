(() => {
  'use strict';
  const form = document.querySelector('#readinessForm');
  if (!form) return;
  const error = document.querySelector('#readinessError');
  const space = document.querySelector('#spaceQuestion');
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
  form.addEventListener('submit', event => {
    event.preventDefault();
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
    const summary = document.querySelector('#previewInputSummary');
    summary.replaceChildren();
    const rows=[['매장',field('storeName').value.trim()],['지역',field('storeArea').value.trim()],['메뉴',field('menu').value.trim()],['영업 종류',values('businessType').join(', ')],['판매 방식',values('salesMethod').join(', ')],['이메일',field('email').value.trim()]];
    if (!space.hidden) rows.splice(5,0,['공간',field('space').value]);
    for(const [key,value] of rows){const row=document.createElement('div');const dt=document.createElement('dt');const dd=document.createElement('dd');dt.textContent=key;dd.textContent=value;row.append(dt,dd);summary.append(row);}
    form.hidden=true;
    const success=document.querySelector('#previewSuccess');success.hidden=false;success.querySelector('h2').focus();
  });
  document.querySelector('#editPreview').addEventListener('click',()=>{document.querySelector('#previewSuccess').hidden=true;form.hidden=false;form.elements.storeName.focus();});
})();
