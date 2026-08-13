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

  function brandAsset(common, id) {
    const asset = byId(common.brand_assets, id);
    return asset ? `/assets/proposals/_brand/${asset.filename}` : '';
  }

  function caseAsset(common, placement) {
    const study = common.case_studies?.JOGANE;
    const asset = study?.assets?.find((item) => item.placement?.includes(placement));
    return asset ? { src: `/assets/proposals/_brand/${asset.filename}`, caption: asset.caption || '' } : null;
  }

  function krw(value) {
    return Number(value || 0).toLocaleString('ko-KR');
  }

  function render(data, common) {
    document.title = data.web?.page_title || document.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && data.web?.meta_description) meta.content = data.web.meta_description;
    applyDocumentMeta(data);

    const renderers = {
      hero: () => renderHero(data),
      'current-position': (section) => renderStrength(section, data),
      opportunity: (section) => renderGap(section),
      'why-now': (section) => renderWhyNow(section),
      'customer-flow': (section) => renderFlow(section, data),
      'content-engine': (section) => renderEngine(section, data),
      'content-examples': (section) => renderExamples(section, data),
      'proof-case': () => renderProof(data, common),
      'monthly-execution': (section) => renderWeeks(section),
      plans: (section) => renderPlans(section, common),
      'why-tiger': () => renderWhyTiger(common),
      'final-cta': (section) => renderFinal(section, data, common),
    };

    try {
      sessionStorage.setItem('tiger_proposal_context', JSON.stringify({
        businessName: data.client?.business_name || '',
        proposalSlug: data.meta?.client_slug || '',
        selectedPlan: data.recommendation?.recommended_plan || 'PERFORMANCE',
        contractTerm: data.recommendation?.recommended_term_months || 12,
      }));
    } catch (_) { /* storage can be unavailable */ }
    root.innerHTML = (data.sections || []).map((section) => renderers[section.type]?.(section) || '').join('');
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
  }

  function applyDocumentMeta(data) {
    const web = data.web || {};
    const og = web.og || {};
    const pageTitle = web.page_title || og.title;
    const description = web.meta_description || og.description;
    const imagePath = og.image || '/assets/og/tiger-commerce-lab-share-v2.png';
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
    setMeta('meta[property="og:image:alt"]', `${data.client?.business_name || '맞춤'} SNS 운영 제안`);
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
              <img class="prop-hero-tiger" src="assets/home/v6/tiger-hero-cinematic.webp" alt="">
            </picture>
            <picture>
              <source media="(max-width:809px)" srcset="assets/home/v7/tiger-hero-mobile-illuminated.webp">
              <img class="prop-hero-tiger prop-hero-tiger-lit" src="assets/home/v6/tiger-hero-illuminated.webp" alt="">
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
              <button class="prop-button prop-button-primary" type="button" data-prop-scroll="section-10">${esc(hero.primary_cta)}</button>
              <button class="prop-button" type="button" data-prop-scroll="section-09">${esc(hero.secondary_cta)}</button>
            </div>
            <p class="prop-hero-trust">${esc(hero.trust_note || data.client?.business_name + ' 맞춤 제안')} · PRIVATE DOCUMENT</p>
          </div>
        </div>
      </section>`;
  }

  function renderStrength(section, data) {
    const statusName = { ACTIVE: '운영 중', NOT_VERIFIED: '미확인' };
    const names = { naver_place: '네이버 플레이스', naver_blog: '네이버 블로그', instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', threads: 'Threads' };
    const cards = (section.cards || []).map((label, index) => `
      <article class="prop-strength-card prop-reveal"><span>0${index + 1}</span><strong>${esc(label)}</strong></article>`).join('');
    const channels = Object.entries(data.channels || {}).map(([key, channel]) => `
      <article class="prop-channel-card prop-cut prop-reveal">
        <div class="prop-channel-head"><strong class="prop-channel-name">${esc(names[key] || key)}</strong><span class="prop-channel-status ${channel.status === 'ACTIVE' ? 'is-active' : ''}">${esc(statusName[channel.status] || channel.status)}</span></div>
        <p>${esc(channel.analysis)}</p>
      </article>`).join('');
    return `
      <section id="section-02" class="prop-section prop-strength">
        <div class="prop-section-inner">
          <p class="prop-kicker prop-reveal">${esc(section.eyebrow)}</p>
          <h2 class="prop-title prop-reveal">${esc(section.headline)}</h2>
          <p class="prop-lead prop-reveal">${esc(section.body)}</p>
          <div class="prop-strength-grid">${cards}</div>
          <div class="prop-channel-grid">${channels}</div>
        </div>
      </section>`;
  }

  function renderGap(section) {
    const rows = (section.comparison || []).map((item) => `
      <div class="prop-compare-row prop-reveal">
        <span class="prop-before">${esc(item.before)}</span><span class="prop-arrow" aria-hidden="true">→</span><span>${esc(item.after)}</span>
      </div>`).join('');
    return `
      <section id="section-03" class="prop-section prop-gap">
        <div class="prop-section-inner">
          <p class="prop-kicker prop-reveal">${esc(section.eyebrow)}</p>
          <h2 class="prop-title prop-reveal">${esc(section.headline)}</h2>
          <p class="prop-lead prop-reveal">${esc(section.body)}</p>
          <div class="prop-compare">${rows}</div>
        </div>
      </section>`;
  }

  function renderWhyNow(section) {
    return `
      <section id="section-04" class="prop-section prop-why-now">
        <div class="prop-section-inner">
          <p class="prop-kicker prop-reveal">${esc(section.eyebrow)}</p>
          <h2 class="prop-title prop-reveal">${esc(section.headline)}</h2>
          <p class="prop-lead prop-reveal">${esc(section.body)}</p>
          <p class="prop-highlight prop-reveal">${esc(section.highlight)}</p>
        </div>
      </section>`;
  }

  function renderFlow(section, data) {
    const journey = data.strategy?.customer_flow || [];
    const flowDetails = journey.map((item) => typeof item === 'object' ? item.action : '');
    const cards = (section.steps || []).map((step, index) => `
      <button class="prop-flow-card ${index === 0 ? 'is-active' : ''}" type="button" data-flow-step="${index}">
        <span>0${index + 1}</span><strong>${esc(step)}</strong><small>${esc(flowDetails[index] || '')}</small>
      </button>`).join('');
    const roleText = (data.strategy?.platform_roles || []).map((role) => `${role.platform}: ${role.customer_action || role.role}`).join(' · ');
    return `
      <section id="section-05" class="prop-section prop-flow" data-scroll-story="flow">
        <div class="prop-flow-stage">
          <div class="prop-flow-head">
            <p class="prop-kicker">${esc(section.eyebrow)}</p>
            <h2 class="prop-title">${esc(section.headline)}</h2>
            <p class="prop-lead">${esc(section.body)}</p>
          </div>
          <div class="prop-flow-track"><span class="prop-flow-progress" aria-hidden="true"></span>${cards}</div>
          <p class="prop-role-strip">${esc(roleText)}</p>
        </div>
      </section>`;
  }

  function renderEngine(section, data) {
    const framework = data.strategy?.framework || [];
    const tabs = framework.map((item, index) => `<button class="${index === 0 ? 'is-active' : ''}" type="button" data-engine-step="${index}">${esc(item.stage)}</button>`).join('');
    const first = framework[0] || { stage: 'HOOK', role: '' };
    const pillars = (data.strategy?.content_pillars || []).map((item) => `<span>${esc(item)}</span>`).join('');
    return `
      <section id="section-06" class="prop-section prop-engine" data-scroll-story="engine" data-engine-json="${esc(JSON.stringify(framework))}">
        <div class="prop-engine-stage">
          <div class="prop-engine-copy">
            <p class="prop-kicker">${esc(section.eyebrow)}</p>
            <h2 class="prop-title">${esc(section.headline)}</h2>
            <p class="prop-lead">${esc(section.body)}</p>
            <div class="prop-engine-tabs" role="tablist">${tabs}</div>
            <div class="prop-pillar-row">${pillars}</div>
          </div>
          <article class="prop-engine-card prop-cut" data-step="01">
            <img class="prop-engine-image" src="${esc(first.image || '')}" alt="${esc(first.image_alt || '')}">
            <div class="prop-engine-card-copy">
              <span class="prop-engine-label">01 / ${esc(first.stage)}</span>
              <h3>${esc(first.stage)}</h3>
              <p>${esc(first.role)}</p>
            </div>
          </article>
        </div>
      </section>`;
  }

  function renderExamples(section, data) {
    const examples = (section.content_example_ids || []).map((id) => byId(data.content_examples, id)).filter(Boolean);
    const cards = examples.map((item, index) => `
      <article class="prop-example-card prop-cut prop-reveal" data-index="0${index + 1}">
        <span class="prop-example-format">${esc(item.format)}</span>
        <h3>${esc(item.title)}</h3>
        <p class="prop-example-hook">${esc(item.hook)}</p>
        <details><summary>콘텐츠 구조 보기</summary><p><strong>RETENTION</strong>${esc(item.retention)}</p><p><strong>VALUE</strong>${esc(item.value)}</p><p><strong>CTA</strong>${esc(item.cta)}</p></details>
      </article>`).join('');
    return `
      <section id="section-07" class="prop-section prop-examples">
        <div class="prop-section-inner">
          <p class="prop-kicker prop-reveal">${esc(section.eyebrow)}</p>
          <h2 class="prop-title prop-reveal">${esc(section.headline)}</h2>
          <p class="prop-lead prop-reveal">${esc(section.body)}</p>
          <div class="prop-example-grid">${cards}</div>
        </div>
      </section>`;
  }

  function renderProof(data, common) {
    const study = common.case_studies?.JOGANE || {};
    const metrics = study.verified_metrics || {};
    const primary = caseAsset(common, 'section-08-primary-proof');
    const secondary = caseAsset(common, 'section-08-secondary-proof');
    const metricCards = [
      ['좋아요', metrics.likes], ['댓글', metrics.comments], ['저장', metrics.saves], ['신규 팔로워', metrics.new_followers, '+'],
    ].map(([label, value, prefix]) => `
      <div class="prop-metric"><strong>${prefix || ''}<span data-count="${Number(value) || 0}">0</span></strong><span>${esc(label)}</span></div>`).join('');
    return `
      <section id="section-08" class="prop-section prop-proof">
        <div class="prop-section-inner">
          <div class="prop-proof-main">
            <div>
              <p class="prop-kicker prop-reveal">${esc(study.eyebrow)}</p>
              <div class="prop-proof-number prop-reveal"><span data-count-decimal="66.1">0.0</span><em>K</em></div>
              <p class="prop-proof-note">VERIFIED CONTENT VIEWS</p>
              <h2 class="prop-title prop-reveal">${esc(study.headline)}</h2>
            </div>
            <div class="prop-proof-shots prop-reveal">
              ${primary ? `<figure><img src="${esc(primary.src)}" alt="${esc(primary.caption)}"><figcaption>${esc(primary.caption)}</figcaption></figure>` : ''}
              ${secondary ? `<figure><img src="${esc(secondary.src)}" alt="${esc(secondary.caption)}"><figcaption>${esc(secondary.caption)}</figcaption></figure>` : ''}
            </div>
          </div>
          <div class="prop-metrics">${metricCards}</div>
          <p class="prop-proof-disclaimer">${esc(study.disclaimer)}</p>
          <p class="prop-proof-connection prop-reveal">${esc(data.case_study?.connection_to_client)}</p>
        </div>
      </section>`;
  }

  function renderWeeks(section) {
    const cards = (section.weeks || []).map((item, index) => `
      <article class="prop-week-card ${index === 0 ? 'is-active' : ''}" data-week-step="${index}">
        <span>${esc(item.week)}</span><h3>${esc(item.focus)}</h3><ul>${(item.actions || []).map((action) => `<li>${esc(action)}</li>`).join('')}</ul>
      </article>`).join('');
    return `
      <section id="section-09" class="prop-section prop-week" data-scroll-story="week">
        <div class="prop-week-stage">
          <div class="prop-week-head"><p class="prop-kicker">${esc(section.eyebrow)}</p><h2 class="prop-title">${esc(section.headline)}</h2></div>
          <div class="prop-week-grid">${cards}</div>
        </div>
      </section>`;
  }

  function renderPlans(section, common) {
    const plans = common.plans || {};
    const items = plans.items || [];
    const cards = items.map((plan) => planMarkup(plan, plans.default_term_months || 12, section.highlight_plan)).join('');
    return `
      <section id="section-10" class="prop-section prop-plans">
        <div class="prop-section-inner">
          <div class="prop-plan-top">
            <div><p class="prop-kicker prop-reveal">${esc(section.eyebrow)}</p><h2 class="prop-title prop-reveal">홈페이지와 동일한 운영 플랜입니다.</h2><p class="prop-lead prop-reveal">콘텐츠 양보다 고객이 움직이는 연결 범위에 맞춰 선택하실 수 있습니다.</p></div>
            <div class="prop-term-wrap"><div class="prop-term-toggle" role="group" aria-label="계약 기간">${(plans.terms || []).map((term) => `<button type="button" data-prop-term="${term.months}" class="${term.months === plans.default_term_months ? 'is-active' : ''}" aria-pressed="${term.months === plans.default_term_months}">${esc(term.label)}</button>`).join('')}</div><p class="prop-plan-vat">월 이용료 · ${esc(plans.vat_label || 'VAT 별도')}</p></div>
          </div>
          <div class="prop-plan-grid" data-plan-grid>${cards}</div>
          <p class="prop-plan-note">${esc(plans.performance_note)}</p>
          ${renderOperation(common)}
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

  function renderOperation(common) {
    const source = common.operation_support || {};
    const items = [
      source.dashboard || { id: 'dashboard', tab: '전용 Dashboard', eyebrow: 'VISIBLE WORKFLOW', title: '진행 상황을 투명하게 공유합니다.', description: '기획·제작·검수·게시·성과 확인 과정을 전용 화면에서 함께 확인하실 수 있습니다.', image: 'assets/home/v6/tiger-dashboard-example.webp', alt: 'TIGER 음식점 SNS 운영 전용 Dashboard 예시 화면', caption: '전용 Dashboard 업무 화면 예시입니다.' },
      source.live || { id: 'live', tab: '자체 LIVE 지원', eyebrow: 'AWARD-WINNING LIVE COMMERCE', title: 'GRIP 선정 24·25 신인판매왕, 팔아야산다2 우승 핫 쇼호스트.', description: '직접 팔아본 경험을 바탕으로 상품 선정부터 방송 기획, 사장님·직원 교육, 방송 지원과 재구매 콘텐츠까지 연결해 드립니다.', image: 'assets/home/v6/menu-to-commerce.webp', alt: '대표메뉴가 상품과 자체 라이브커머스로 이어지는 장면', caption: '매장 사장님·직원이 직접 방송할 때의 자체 LIVE 지원' },
      source.community || { id: 'community', tab: '맘커뮤니티 옵션', eyebrow: 'OPTIONAL EXPANSION', title: '지역 맘커뮤니티까지 자연스럽게 확장할 수 있습니다.', description: '실제 체험과 실제 혜택을 바탕으로 후기형·핫딜형을 구분해 운영합니다. 허위 후기와 가짜 성과는 만들지 않습니다.', image: 'assets/home/v6/mom-community-spread.webp', alt: '지역 맘커뮤니티 확산 운영 장면 예시', caption: '맘커뮤니티 확산 운영 장면 예시 · 실제 후기·성과값 아님' },
    ];
    const tabs = items.map((item, index) => `<button class="${index === 0 ? 'is-active' : ''}" type="button" role="tab" aria-selected="${index === 0}" data-operation-step="${index}">${esc(item.tab)}</button>`).join('');
    const first = items[0];
    return `
      <div class="prop-operation" data-scroll-story="operation" data-operation-json="${esc(JSON.stringify(items))}">
        <div class="prop-operation-stage">
          <div class="prop-operation-tabs" role="tablist">${tabs}</div>
          <div class="prop-operation-panel" aria-live="polite">
            <div class="prop-operation-copy"><p class="prop-kicker" data-operation-eyebrow>${esc(first.eyebrow)}</p><h3 data-operation-title>${esc(first.title)}</h3><p data-operation-description>${esc(first.description)}</p></div>
            <figure class="prop-operation-media"><img data-operation-image src="${esc(first.image)}" alt="${esc(first.alt)}"><figcaption data-operation-caption>${esc(first.caption)}</figcaption></figure>
          </div>
        </div>
      </div>`;
  }

  function renderWhyTiger(common) {
    const tiger = common.tiger || {};
    const profile = brandAsset(common, tiger.profile_asset_id);
    return `
      <section id="section-11" class="prop-section prop-why-tiger">
        <div class="prop-section-inner prop-why-grid">
          <figure class="prop-profile prop-cut prop-reveal"><img src="${esc(profile)}" alt="TIGER COMMERCE LAB 박영남 대표"><figcaption>TIGER COMMERCE LAB · 박영남 대표</figcaption></figure>
          <div><p class="prop-kicker prop-reveal">${esc(tiger.eyebrow)}</p><h2 class="prop-title prop-reveal">${esc(tiger.headline)}</h2><p class="prop-lead prop-reveal">${esc(tiger.body)}</p><ul class="prop-tiger-points">${(tiger.points || []).map((point) => `<li>${esc(point)}</li>`).join('')}</ul><p class="prop-career prop-reveal">${esc(tiger.career_highlight || 'GRIP 선정 24·25 신인판매왕, 팔아야산다2 우승 핫 쇼호스트.')}</p></div>
        </div>
      </section>`;
  }

  function renderFinal(section, data, common) {
    const kakao = common.contact?.kakao_url || KAKAO_URL;
    return `
      <section id="section-12" class="prop-section prop-final">
        <div class="prop-section-inner">
          <p class="prop-kicker prop-reveal">${esc(section.eyebrow)}</p>
          <h2 class="prop-title prop-reveal">${esc(section.headline)}</h2>
          <p class="prop-lead prop-reveal">${esc(section.body || data.final_cta?.body)}</p>
          <div class="prop-final-actions prop-reveal"><a class="prop-button prop-button-primary" href="/index.html?proposal=1#contact">${esc(section.primary_cta)}</a><a class="prop-button prop-button-kakao" href="${esc(kakao)}" target="_blank" rel="noopener noreferrer">대표자 1:1 카카오톡</a></div>
          ${data.client?.naver_place ? `<a class="prop-naver-link" href="${esc(data.client.naver_place)}" target="_blank" rel="noopener noreferrer">네이버 플레이스에서 남천불고기 확인하기 →</a>` : ''}
          <p class="prop-final-note">상담 신청 후 제안 범위와 촬영·운영 일정을 확정해 드립니다.</p>
        </div>
      </section>`;
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
      hero.style.setProperty('--eye', String(Math.max(0, Math.min(1, 1 - distance * 3.4))));
    });
    hero.addEventListener('pointerleave', () => {
      if (window.innerWidth > 809) hero.style.setProperty('--eye', '0');
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
      if (hero && window.innerWidth <= 809 && !reducedMotion) hero.style.setProperty('--eye', String(Math.min(1, scrollProgress(hero) * 1.65)));
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
    const highlight = document.querySelector('.prop-plan-card.is-recommended')?.dataset.planId || 'PERFORMANCE';
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
