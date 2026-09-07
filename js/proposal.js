(() => {
  'use strict';

  const root = document.getElementById('proposalRoot');
  if (!root) return;

  const pathParts = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  const slug = pathParts[pathParts.length - 1] === 'proposal.html'
    ? new URLSearchParams(location.search).get('slug') || 'gijang-endhouse'
    : pathParts[pathParts.length - 1];
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  const KAKAO_URL = 'https://open.kakao.com/o/sgxBgDIi';

  Promise.all([
    fetch(`/data/proposals/${slug}.json`).then(assertResponse),
    fetch('/data/proposals/_common.json').then(assertResponse),
  ])
    .then(([data, common]) => render(data, common))
    .catch((error) => {
      console.error('제안서 로드 실패', error);
      root.innerHTML = '<div class="prop-error"><p>제안서를 찾을 수 없습니다.</p></div>';
    });

  function assertResponse(response) {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  function esc(value) {
    return (value == null ? '' : String(value)).replace(/[&<>"']/g, (char) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
    ));
  }

  function byId(list, id) {
    return (list || []).find((item) => item.id === id);
  }

  function krw(value) {
    return Number(value || 0).toLocaleString('ko-KR');
  }

  function render(data, common) {
    document.title = data.web?.page_title || document.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && data.web?.meta_description) meta.content = data.web.meta_description;
    applyDocumentMeta(data);

    const sections = Object.fromEntries((data.sections || []).map((section) => [section.type, section]));

    const contextPlan = data.recommendation?.recommended_plan || sections.plans?.highlight_plan || '';
    try {
      sessionStorage.setItem('tiger_proposal_context', JSON.stringify({
        businessName: data.client?.business_name || '',
        proposalSlug: data.meta?.client_slug || '',
        selectedPlan: contextPlan,
        contractTerm: data.recommendation?.recommended_term_months || (contextPlan ? (common.plans?.default_term_months || 12) : ''),
      }));
    } catch (_) { /* storage can be unavailable */ }
    root.innerHTML = [
      renderHero(data),
      renderAnalysisZone(data, sections),
      renderPrioritiesZone(data, sections),
      renderTailoredZone(data, sections),
      renderPricingZone(data, sections, common),
      renderContactZone(data, sections, common),
    ].join('');
    document.querySelector('.prop-mobile-cta')?.remove();
    document.body.insertAdjacentHTML('beforeend', renderMobileCta(common, data));

    document.body.classList.add('proposal-ready');
    initReveal();
    initHero();
    initScrollStories();
    initPlanToggle(common);
    initPlanLinks();
    initCountUp();
    initScrollButtons();
    window.TigerSurfaceEffects?.init({
      root: '#proposalRoot',
      hero: '#section-01',
      header: '.prop-header',
      sections: ':scope > .prop-zone',
      clawAnchors: ['#proposal-tailored', '#proposal-pricing', '#proposal-contact'],
      lightSections: ['proposal-priorities'],
    });
  }

  function renderAnalysisZone(data, sections) {
    const section = sections['current-position'] || {};
    const statusName = { ACTIVE: '운영 중', NOT_VERIFIED: '미확인' };
    const names = { naver_place: '네이버 플레이스', naver_blog: '네이버 블로그', instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', threads: 'Threads' };
    const strengths = (section.cards || []).slice(0, 4).map((item, index) => `
      <li><span>0${index + 1}</span><strong>${esc(item)}</strong></li>`).join('');
    const channels = Object.entries(data.channels || {}).map(([key, channel]) => `
      <article class="prop-analysis-channel">
        <div><strong>${esc(names[key] || key)}</strong><span class="${channel.status === 'ACTIVE' ? 'is-active' : ''}">${esc(statusName[channel.status] || channel.status)}</span></div>
        <p>${esc(channel.analysis)}</p>
      </article>`).join('');
    return `
      <section id="proposal-analysis" class="prop-section prop-zone prop-zone-analysis">
        <div class="prop-section-inner">
          <p class="prop-kicker prop-reveal">01 · STORE ANALYSIS</p>
          <h2 class="prop-title prop-reveal">${esc(section.headline || `${data.client?.business_name || '이 매장'}의 현재 위치`)}</h2>
          <p class="prop-lead prop-reveal">${esc(section.body || '현재 공개 채널과 매장 정보를 기준으로 유지할 강점과 보강할 지점을 구분했습니다.')}</p>
          <div class="prop-evidence-head"><span>확인된 강점</span><small>공개 정보와 제공 자료 기준</small></div>
          <ul class="prop-analysis-strengths">${strengths}</ul>
          <div class="prop-evidence-head"><span>채널 상태</span><small>미확인 항목은 사실로 단정하지 않습니다</small></div>
          <div class="prop-analysis-channels">${channels}</div>
        </div>
      </section>`;
  }

  function renderPrioritiesZone(data, sections) {
    const gap = sections.opportunity || {};
    const why = sections['why-now'] || {};
    const priorities = (gap.comparison || []).slice(0, 3).map((item, index) => `
      <article class="prop-priority prop-reveal">
        <span>PRIORITY 0${index + 1}</span>
        <p class="prop-priority-now">${esc(item.before)}</p>
        <i aria-hidden="true">→</i>
        <h3>${esc(item.after)}</h3>
      </article>`).join('');
    return `
      <section id="proposal-priorities" class="prop-section prop-zone prop-zone-priorities">
        <div class="prop-section-inner">
          <div class="prop-zone-head prop-reveal"><div><p class="prop-kicker">02 · TOP THREE</p><h2 class="prop-title">먼저 보강할 세 가지</h2></div><p>${esc(gap.body || why.body || '강점은 살리고 고객의 다음 행동이 끊기는 지점부터 보강합니다.')}</p></div>
          <p class="prop-inference-note"><strong>제안 기준</strong> 아래 방향은 확인된 현황을 바탕으로 한 운영 제안이며 성과를 보장하는 예측이 아닙니다.</p>
          <div class="prop-priority-grid">${priorities}</div>
          ${why.highlight ? `<p class="prop-priority-highlight prop-reveal">${esc(why.highlight)}</p>` : ''}
        </div>
      </section>`;
  }

  function renderTailoredZone(data, sections) {
    const section = sections['content-examples'] || {};
    const weeks = sections['monthly-execution']?.weeks || [];
    const examples = (section.content_example_ids || []).map((id) => byId(data.content_examples, id)).filter(Boolean).slice(0, 3);
    const exampleCards = examples.map((item, index) => `
      <article class="prop-tailored-card prop-cut prop-reveal">
        <span>EXAMPLE 0${index + 1} · ${esc(item.format)}</span>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.hook)}</p>
        <dl><div><dt>역할</dt><dd>${esc(item.value)}</dd></div><div><dt>다음 행동</dt><dd>${esc(item.cta)}</dd></div></dl>
      </article>`).join('');
    const weekCards = weeks.slice(0, 4).map((item) => `
      <li><span>${esc(item.week)}</span><div><strong>${esc(item.focus)}</strong><small>${esc((item.actions || []).join(' · '))}</small></div></li>`).join('');
    const roles = (data.strategy?.platform_roles || []).slice(0, 4).map((item) => `<li><strong>${esc(item.platform)}</strong><span>${esc(item.customer_action || item.role)}</span></li>`).join('');
    return `
      <section id="proposal-tailored" class="prop-section prop-zone prop-zone-tailored">
        <div class="prop-section-inner">
          <p class="prop-kicker prop-reveal">03 · FOR THIS STORE</p>
          <h2 class="prop-title prop-reveal">${esc(section.headline || `${data.client?.business_name || '이 매장'}에 맞춘 실행안`)}</h2>
          <p class="prop-lead prop-reveal">${esc(section.body || '매장 이야기와 대표 메뉴를 채널별 고객 행동에 맞춰 나눕니다.')}</p>
          <div class="prop-tailored-layout">
            <div class="prop-tailored-examples">${exampleCards}</div>
            <aside><h3>채널 역할</h3><ul class="prop-role-list">${roles}</ul><h3>첫 달 실행</h3><ol class="prop-month-list">${weekCards}</ol></aside>
          </div>
        </div>
      </section>`;
  }

  function renderPricingZone(data, sections, common) {
    const section = sections.plans || {};
    const plans = common.plans || {};
    const term = Number(data.recommendation?.recommended_term_months || plans.default_term_months || 12);
    const recommendedId = data.recommendation?.recommended_plan || section.highlight_plan || '';
    const recommended = (plans.items || []).find((plan) => plan.id === recommendedId) || null;
    const recommendationTitle = recommended
      ? `이 매장에는<br>${esc(recommended.name || recommendedId)} 운영안을 제안합니다.`
      : '추천 운영안은<br>확인 후 함께 정합니다.';
    const recommendationReason = recommended
      ? (recommended.reason || recommended.value || '현재 목표와 필요한 운영 범위를 기준으로 제안합니다.')
      : '목표·예산·운영 가능 범위를 확인한 뒤 근거와 함께 추천안을 제시합니다.';
    const cards = (plans.items || []).map((plan) => planMarkup(plan, term, recommendedId)).join('');
    return `
      <section id="proposal-pricing" class="prop-section prop-zone prop-zone-pricing">
        <div class="prop-section-inner">
          <div class="prop-plan-top"><div><p class="prop-kicker prop-reveal">04 · 추천 운영안</p><h2 class="prop-title prop-reveal">${recommendationTitle}</h2><p class="prop-lead prop-reveal">${esc(recommendationReason)}</p></div><div class="prop-term-wrap"><div class="prop-term-toggle" role="group" aria-label="계약 기간">${(plans.terms || []).map((item) => `<button type="button" data-prop-term="${item.months}" class="${item.months === term ? 'is-active' : ''}" aria-pressed="${item.months === term}">${esc(item.label)}</button>`).join('')}</div><p class="prop-plan-vat">월 운영비 · ${esc(plans.vat_label || 'VAT 별도')}</p></div></div>
          <div class="prop-plan-grid" data-plan-grid>${cards}</div>
          <p class="prop-plan-note">${esc(plans.performance_note)}</p>
          <a class="prop-home-detail" href="/index.html#what-we-do">촬영·제작·운영 범위 자세히 보기 →</a>
        </div>
      </section>`;
  }

  function renderContactZone(data, sections, common) {
    const section = sections['final-cta'] || {};
    const tiger = common.tiger || {};
    const kakao = common.contact?.kakao_url || KAKAO_URL;
    const plan = data.recommendation?.recommended_plan || sections.plans?.highlight_plan || '';
    const term = data.recommendation?.recommended_term_months || (plan ? (common.plans?.default_term_months || 12) : '');
    const consultUrl = `/index.html?proposal=1&business=${encodeURIComponent(data.client?.business_name || '')}&slug=${encodeURIComponent(data.meta?.client_slug || '')}&plan=${encodeURIComponent(plan)}&term=${encodeURIComponent(term)}#contact`;
    return `
      <section id="proposal-contact" class="prop-section prop-zone prop-zone-contact">
        <div class="prop-section-inner">
          <div class="prop-contact-grid">
            <div><p class="prop-kicker prop-reveal">05 · NEXT STEP</p><h2 class="prop-title prop-reveal">${esc(section.headline || '매장에 맞는 첫 실행 범위를 정합니다.')}</h2><p class="prop-lead prop-reveal">${esc(section.body || data.final_cta?.body || '상담에서 매장 상황과 우선순위를 확인한 뒤 범위와 일정을 확정합니다.')}</p><div class="prop-final-actions prop-reveal"><a class="prop-button prop-button-primary" href="${consultUrl}">${esc(section.primary_cta || '맞춤 상담 신청')}</a><a class="prop-button prop-button-kakao" href="${esc(kakao)}" target="_blank" rel="noopener noreferrer">대표자 1:1 카카오톡</a></div><p class="prop-final-note">상담 신청은 계약이나 결제를 의미하지 않습니다.</p></div>
            <aside class="prop-contact-tiger"><span>TIGER COMMERCE LAB</span><h3>${esc(tiger.headline)}</h3><p>${esc(tiger.body)}</p><ul>${(tiger.points || []).slice(0, 3).map((point) => `<li>${esc(point)}</li>`).join('')}</ul></aside>
          </div>
        </div>
      </section>`;
  }

  function applyDocumentMeta(data) {
    const web = data.web || {};
    const og = web.og || {};
    const pageTitle = web.page_title || og.title;
    const description = web.meta_description || og.description;
    const imagePath = '/assets/og/tiger-commerce-lab-share-v3.png?v=20260907';
    const imageUrl = new URL(imagePath, location.origin).href;
    const setMeta = (selector, value) => {
      const node = document.querySelector(selector);
      if (node && value) node.content = value;
    };
    setMeta('meta[name="robots"]', web.robots || (web.noindex ? 'noindex,nofollow,noarchive' : 'index,follow'));
    setMeta('meta[property="og:title"]', pageTitle);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:image"]', imageUrl);
    setMeta('meta[property="og:image:secure_url"]', imageUrl);
    setMeta('meta[property="og:image:alt"]', 'TIGER COMMERCE LAB 음식점 SNS 통합운영');
    setMeta('meta[name="twitter:image"]', imageUrl);
  }

  function renderHero(data) {
    const hero = data.hero || {};
    const clientHero = data.assets?.hero?.filename;
    const headline = esc(hero.headline)
      .replace('이제 전국에서', '<em>이제 전국에서')
      .replace('먼저 떠오르게 만들 차례입니다.', '<em>먼저 떠오르게 만들 차례입니다.');
    const formattedHeadline = headline.includes('<em>') ? `${headline}</em>` : headline;
    const heroMedia = clientHero
      ? `<img class="prop-hero-tiger" src="${esc(clientHero)}" alt="${esc(hero.image_alt || '불향 석쇠불고기 제안용 생성 이미지')}">`
      : `<picture>
              <source media="(max-width:809px)" srcset="assets/home/v7/tiger-hero-mobile-cinematic.webp">
              <img class="prop-hero-tiger prop-hero-tiger-base" src="assets/home/v7/tiger-hero-mobile-cinematic.webp" alt="">
            </picture>
            <picture>
              <source media="(max-width:809px)" srcset="assets/home/v7/tiger-hero-mobile-illuminated.webp">
              <img class="prop-hero-tiger prop-hero-tiger-lit" src="assets/home/v7/tiger-hero-mobile-illuminated.webp" alt="">
            </picture>`;
    return `
      <section id="section-01" class="prop-section prop-hero" aria-label="${esc(data.client?.business_name)} 맞춤 제안">
        <div class="prop-hero-media" aria-hidden="true">
          <div class="prop-hero-media-stage">
            ${heroMedia}
          </div>
          <div class="prop-hero-frame"></div>
          <p class="prop-hero-guide">${clientHero ? '제안용 생성 이미지 · 실제 매장 촬영본이 아닙니다' : '스크롤해 호랑이의 눈빛을 깨워보세요'}</p>
        </div>
        <div class="prop-hero-copy">
          <div class="prop-hero-copy-inner">
            <p class="prop-kicker prop-reveal">${esc(hero.eyebrow)}</p>
            <h1 class="prop-reveal">${formattedHeadline}</h1>
            <p class="prop-hero-sub prop-reveal">${esc(hero.subheadline)}</p>
            <div class="prop-hero-actions prop-reveal">
              <button class="prop-button prop-button-primary" type="button" data-prop-scroll="proposal-pricing">${esc(hero.primary_cta)}</button>
              <button class="prop-button" type="button" data-prop-scroll="proposal-tailored">${esc(hero.secondary_cta)}</button>
            </div>
            <p class="prop-hero-trust">${esc(hero.trust_note || data.client?.business_name + ' 맞춤 제안')} · PRIVATE DOCUMENT</p>
          </div>
        </div>
      </section>`;
  }

  function planMarkup(plan, term, highlightId) {
    const price = plan.prices?.[String(term)] ?? plan.price_krw;
    const recommended = plan.id === highlightId;
    return `
      <article class="prop-plan-card prop-cut ${recommended ? 'is-recommended' : ''}" data-plan-id="${esc(plan.id)}">
        <span class="prop-plan-badge">${recommended ? 'TIGER RECOMMENDED' : '&nbsp;'}</span>
        <h3>${esc(plan.name)}</h3>
        <p class="prop-plan-price">${krw(price)}<em>원 / 월</em></p>
        <p class="prop-plan-value">${esc(plan.value)}</p>
        <p class="prop-plan-desire">${esc(plan.desire)}</p>
        <ul class="prop-plan-qty"><li><span>쇼츠</span><strong>월 ${plan.shorts}편</strong></li><li><span>카드뉴스</span><strong>월 ${plan.card_news}건</strong></li><li><span>Threads</span><strong>월 ${plan.threads}건</strong></li><li><span>블로그</span><strong>월 ${plan.blog}건</strong></li></ul>
        <button class="prop-button ${recommended ? 'prop-button-primary' : ''}" type="button" data-prop-plan="${esc(plan.id)}" data-prop-term-value="${term}" data-prop-price="${price}" data-prop-cta="${esc(plan.cta_label)}">${esc(plan.cta_label)}</button>
      </article>`;
  }

  function renderMobileCta(common, data) {
    const kakao = common.contact?.kakao_url || KAKAO_URL;
    return `<nav class="prop-mobile-cta" aria-label="빠른 상담"><a href="/index.html?proposal=1&business=${encodeURIComponent(data.client?.business_name || '')}&slug=${encodeURIComponent(data.meta?.client_slug || '')}#contact">상담 신청</a><a href="${esc(kakao)}" target="_blank" rel="noopener noreferrer">1:1 카톡</a></nav>`;
  }

  function initReveal() {
    const items = [...document.querySelectorAll('.prop-reveal')];
    if (reducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    items.forEach((item) => observer.observe(item));
  }

  function initHero() {
    const hero = document.querySelector('.prop-hero');
    if (!hero || reducedMotion || !document.querySelector('.prop-hero-tiger-lit')) return;
    hero.addEventListener('pointermove', (event) => {
      if (window.innerWidth <= 809) return;
      const box = hero.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      const distance = Math.hypot(x - .78, y - .42);
      const eye = Math.max(0, Math.min(1, 1 - distance * 3.4));
      hero.style.setProperty('--mx', `${x * 100}%`);
      hero.style.setProperty('--my', `${y * 100}%`);
      hero.style.setProperty('--eye', String(.18 + eye * .82));
    });
    hero.addEventListener('pointerleave', () => {
      if (window.innerWidth > 809) {
        hero.style.setProperty('--mx', '78%');
        hero.style.setProperty('--my', '42%');
        hero.style.setProperty('--eye', '.3');
      }
    });
  }

  function scrollProgress(section, topOffset = 0) {
    const rect = section.getBoundingClientRect();
    const total = Math.max(1, section.offsetHeight - window.innerHeight + topOffset);
    return Math.max(0, Math.min(1, (-rect.top + topOffset) / total));
  }

  function setIndexedState(elements, index, pastClass = true) {
    elements.forEach((element, itemIndex) => {
      element.classList.toggle('is-active', itemIndex === index);
      if (pastClass) element.classList.toggle('is-past', itemIndex < index);
    });
  }

  function initScrollStories() {
    const hero = document.querySelector('.prop-hero');
    const flow = document.querySelector('[data-scroll-story="flow"]');
    const flowCards = [...document.querySelectorAll('[data-flow-step]')];
    const flowProgress = document.querySelector('.prop-flow-progress');
    const engine = document.querySelector('[data-scroll-story="engine"]');
    const engineTabs = [...document.querySelectorAll('[data-engine-step]')];
    const engineCard = document.querySelector('.prop-engine-card');
    let framework = [];
    try { framework = JSON.parse(engine?.dataset.engineJson || '[]'); } catch (_) { framework = []; }
    const week = document.querySelector('[data-scroll-story="week"]');
    const weekCards = [...document.querySelectorAll('[data-week-step]')];
    const operation = document.querySelector('[data-scroll-story="operation"]');
    const operationTabs = [...document.querySelectorAll('[data-operation-step]')];
    let operationItems = [];
    try { operationItems = JSON.parse(operation?.dataset.operationJson || '[]'); } catch (_) { operationItems = []; }

    const setFlow = (index) => {
      setIndexedState(flowCards, index);
      const percent = flowCards.length > 1 ? (index / (flowCards.length - 1)) * 100 : 100;
      flowProgress?.style.setProperty('--progress', `${percent}%`);
    };
    const setEngine = (index) => {
      const item = framework[index];
      if (!item || !engineCard) return;
      setIndexedState(engineTabs, index, false);
      engineCard.dataset.step = `0${index + 1}`;
      const label = engineCard.querySelector('.prop-engine-label');
      const title = engineCard.querySelector('h3');
      const body = engineCard.querySelector('p');
      const image = engineCard.querySelector('.prop-engine-image');
      if (label) label.textContent = `0${index + 1} / ${item.stage}`;
      if (title) title.textContent = item.stage;
      if (body) body.textContent = item.role;
      if (image && item.image) {
        image.src = item.image;
        image.alt = item.image_alt || '';
      }
    };
    const setWeek = (index) => setIndexedState(weekCards, index);
    const setOperation = (index) => {
      const item = operationItems[index];
      if (!item || !operation) return;
      setIndexedState(operationTabs, index, false);
      operationTabs.forEach((tab, tabIndex) => tab.setAttribute('aria-selected', String(tabIndex === index)));
      const setText = (selector, value) => { const node = operation.querySelector(selector); if (node) node.textContent = value; };
      setText('[data-operation-eyebrow]', item.eyebrow);
      setText('[data-operation-title]', item.title);
      setText('[data-operation-description]', item.description);
      setText('[data-operation-caption]', item.caption);
      const image = operation.querySelector('[data-operation-image]');
      if (image) { image.src = item.image; image.alt = item.alt; }
    };

    flowCards.forEach((card, index) => card.addEventListener('click', () => setFlow(index)));
    engineTabs.forEach((tab, index) => tab.addEventListener('click', () => setEngine(index)));
    weekCards.forEach((card, index) => card.addEventListener('click', () => setWeek(index)));
    operationTabs.forEach((tab, index) => tab.addEventListener('click', () => setOperation(index)));

    let ticking = false;
    const update = () => {
      ticking = false;
      if (hero && window.innerWidth <= 809 && !reducedMotion) {
        const progress = Math.min(1, scrollProgress(hero) * 1.4);
        hero.style.setProperty('--mx', '76%');
        hero.style.setProperty('--my', `${66 - progress * 28}%`);
        hero.style.setProperty('--eye', String(.22 + progress * .72));
      }
      if (window.innerWidth <= 809 || window.innerWidth >= 1200) {
        if (flow) setFlow(Math.min(flowCards.length - 1, Math.floor(scrollProgress(flow) * flowCards.length)));
        if (engine) setEngine(Math.min(engineTabs.length - 1, Math.floor(scrollProgress(engine) * engineTabs.length)));
        if (week) setWeek(Math.min(weekCards.length - 1, Math.floor(scrollProgress(week) * weekCards.length)));
        if (operation) setOperation(Math.min(operationTabs.length - 1, Math.floor(scrollProgress(operation) * operationTabs.length)));
      }
    };
    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    framework.slice(1).forEach((item) => { if (item.image) { const preload = new Image(); preload.src = item.image; } });
    setFlow(0); setEngine(0); setWeek(0); setOperation(0); update();
  }

  function initPlanToggle(common) {
    const plans = common.plans || {};
    const grid = document.querySelector('[data-plan-grid]');
    const highlight = document.querySelector('.prop-plan-card.is-recommended')?.dataset.planId || '';
    document.querySelectorAll('[data-prop-term]').forEach((button) => button.addEventListener('click', () => {
      const term = Number(button.dataset.propTerm);
      document.querySelectorAll('[data-prop-term]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      if (grid) grid.innerHTML = (plans.items || []).map((plan) => planMarkup(plan, term, highlight)).join('');
      initPlanLinks();
    }));
  }

  function initPlanLinks() {
    document.querySelectorAll('[data-prop-plan]').forEach((button) => button.addEventListener('click', () => {
      const payload = {
        planId: button.dataset.propPlan,
        term: Number(button.dataset.propTermValue),
        monthlyPrice: Number(button.dataset.propPrice),
        planCta: button.dataset.propCta,
        source: 'proposal',
      };
      try { sessionStorage.setItem('tiger_plan_interest', JSON.stringify(payload)); } catch (_) { /* storage can be unavailable */ }
      location.href = '/index.html?proposalPlan=1#contact';
    }));
  }

  function initCountUp() {
    const targets = [...document.querySelectorAll('[data-count],[data-count-decimal]')];
    const run = (node) => {
      if (node.dataset.counted) return;
      node.dataset.counted = 'true';
      const decimal = node.dataset.countDecimal;
      const end = decimal != null ? Number(decimal) : Number(node.dataset.count);
      const duration = reducedMotion ? 0 : 850;
      const started = performance.now();
      const frame = (now) => {
        const progress = duration === 0 ? 1 : Math.min(1, (now - started) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = decimal != null ? (end * eased).toFixed(1) : Math.round(end * eased).toLocaleString('ko-KR');
        if (progress < 1) requestAnimationFrame(frame);
        else node.closest('.prop-proof-number')?.classList.add('is-counted');
      };
      requestAnimationFrame(frame);
    };
    if (!('IntersectionObserver' in window)) { targets.forEach(run); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      run(entry.target); observer.unobserve(entry.target);
    }), { threshold: .45 });
    targets.forEach((target) => observer.observe(target));
  }

  function initScrollButtons() {
    document.querySelectorAll('[data-prop-scroll]').forEach((button) => button.addEventListener('click', () => {
      document.getElementById(button.dataset.propScroll)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }));
  }
})();
