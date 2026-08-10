(() => {
  'use strict';

  /* ---------- 슬러그 추출 (/proposal/:slug rewrite → proposal.html) ---------- */
  const slug = location.pathname.replace(/\/+$/, '').split('/').pop();

  const root = document.getElementById('proposalRoot');
  if (!root) return;

  Promise.all([
    fetch('/data/proposals/' + slug + '.json').then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }),
    fetch('/data/proposals/_common.json').then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }),
  ])
    .then(([data, common]) => render(data, common))
    .catch(() => {
      root.innerHTML =
        '<div class="prop-error">' +
        '<p>제안서를 찾을 수 없습니다.</p>' +
        '</div>';
    });

  /* ---------- 유틸 ---------- */
  function esc(str) {
    return (str == null ? '' : String(str)).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }
  function byId(list, id) {
    return (list || []).find((item) => item.id === id);
  }
  /* ---------- 공용 브랜드/케이스 자산은 항상 /assets/proposals/_brand/ 에서 조회 (업체별 base_path와 분리) ---------- */
  function brandAssetUrl(common, id) {
    const a = byId(common.brand_assets, id);
    return a ? '/assets/proposals/_brand/' + a.filename : null;
  }
  function commonPlacementAsset(list, placement) {
    const a = (list || []).find((item) => (item.placement || []).includes(placement));
    if (!a) return null;
    return { url: '/assets/proposals/_brand/' + a.filename, caption: a.caption || '' };
  }
  function statusLabel(status) {
    if (status === 'ACTIVE') return '운영 중';
    if (status === 'NOT_VERIFIED') return '미확인';
    return status || '미확인';
  }
  function krw(n) {
    return Number(n).toLocaleString('ko-KR') + '원';
  }

  /* ---------- 메인 렌더 ---------- */
  function render(data, common) {
    document.title = (data.web && data.web.page_title) || document.title;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta && data.web && data.web.meta_description) descMeta.setAttribute('content', data.web.meta_description);

    const sections = data.sections || [];
    const renderers = {
      'hero': () => renderHero(data),
      'current-position': (s) => renderCurrentPosition(s, data),
      'opportunity': (s) => renderOpportunity(s),
      'why-now': (s) => renderWhyNow(s),
      'customer-flow': (s) => renderCustomerFlow(s, data),
      'content-engine': (s) => renderContentEngine(s, data),
      'content-examples': (s) => renderContentExamples(s, data),
      'proof-case': (s) => renderProofCase(s, data, common),
      'monthly-execution': (s) => renderMonthlyExecution(s),
      'plans': (s) => renderPlans(s, data, common),
      'why-tiger': () => renderWhyTiger(common),
      'final-cta': (s) => renderFinalCta(s, data, common),
    };

    root.innerHTML = sections.map((s) => {
      const fn = renderers[s.type];
      return fn ? fn(s) : '';
    }).join('');

    initReveal();
    initCountUp();
    initAccordions();
    wireCtaScrolls();
  }

  /* ---------- SECTION 01 — HERO (업체별) ---------- */
  function renderHero(data) {
    const h = data.hero || {};
    return `
    <section id="section-01" class="prop-section prop-hero">
      <div class="section-inner container">
        <p class="eyebrow reveal">${esc(h.eyebrow)}</p>
        <h1 class="prop-hero-title reveal">${esc(h.headline)}</h1>
        <p class="prop-hero-sub reveal">${esc(h.subheadline)}</p>
        <div class="prop-hero-ctas reveal">
          <button type="button" class="btn btn-primary btn-large" data-prop-scroll="section-10">${esc(h.primary_cta)}</button>
          <button type="button" class="btn btn-outline btn-large" data-prop-scroll="section-09">${esc(h.secondary_cta)}</button>
        </div>
        <p class="prop-hero-trust reveal">${esc(h.trust_note)}</p>
      </div>
    </section>`;
  }

  /* ---------- SECTION 02 — CURRENT POSITION (업체별) ---------- */
  function renderCurrentPosition(s, data) {
    const cards = (s.cards || []).map((c) => `<div class="prop-chip reveal">${esc(c)}</div>`).join('');
    const channelOrder = ['naver_place', 'naver_blog', 'instagram', 'tiktok', 'youtube', 'threads'];
    const channelNames = { naver_place: '네이버 플레이스', naver_blog: '네이버 블로그', instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', threads: 'Threads' };
    const channels = (data.channels || {});
    const channelCards = channelOrder.filter((k) => channels[k]).map((k) => {
      const c = channels[k];
      const activeClass = c.status === 'ACTIVE' ? 'is-active' : 'is-unverified';
      return `
        <div class="prop-channel-card card-notch card-bracket reveal">
          <div class="prop-channel-head">
            <span class="prop-channel-name">${esc(channelNames[k])}</span>
            <span class="prop-channel-status ${activeClass}">${esc(statusLabel(c.status))}</span>
          </div>
          <p class="prop-channel-desc">${esc(c.analysis)}</p>
        </div>`;
    }).join('');

    return `
    <section id="section-02" class="prop-section prop-current-position">
      <div class="section-inner container">
        <p class="eyebrow reveal">${esc(s.eyebrow)}</p>
        <h2 class="section-title reveal">${esc(s.headline)}</h2>
        <p class="section-lead reveal">${esc(s.body)}</p>
        <div class="prop-chip-row">${cards}</div>
        <div class="prop-channel-grid">${channelCards}</div>
      </div>
    </section>`;
  }

  /* ---------- SECTION 03 — OPPORTUNITY (업체별) ---------- */
  function renderOpportunity(s) {
    const rows = (s.comparison || []).map((c) => `
      <div class="prop-compare-row reveal">
        <span class="prop-compare-before">${esc(c.before)}</span>
        <span class="prop-compare-arrow" aria-hidden="true">→</span>
        <span class="prop-compare-after">${esc(c.after)}</span>
      </div>`).join('');
    return `
    <section id="section-03" class="prop-section prop-opportunity">
      <div class="section-inner container">
        <p class="eyebrow reveal">${esc(s.eyebrow)}</p>
        <h2 class="section-title reveal">${esc(s.headline)}</h2>
        <p class="section-lead reveal">${esc(s.body)}</p>
        <div class="prop-compare-list">${rows}</div>
      </div>
    </section>`;
  }

  /* ---------- SECTION 04 — WHY NOW (업체별) ---------- */
  function renderWhyNow(s) {
    return `
    <section id="section-04" class="prop-section prop-why-now">
      <div class="section-inner container">
        <p class="eyebrow reveal">${esc(s.eyebrow)}</p>
        <h2 class="section-title reveal">${esc(s.headline)}</h2>
        <p class="section-lead reveal">${esc(s.body)}</p>
        <p class="prop-highlight reveal">${esc(s.highlight)}</p>
      </div>
    </section>`;
  }

  /* ---------- SECTION 05 — CUSTOMER FLOW (업체별) ---------- */
  function renderCustomerFlow(s, data) {
    const steps = (s.steps || []).map((step, i) => `
      <div class="prop-flow-step reveal">
        <span class="prop-flow-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="prop-flow-label">${esc(step)}</span>
      </div>`).join('<span class="prop-flow-arrow reveal" aria-hidden="true">→</span>');

    const roles = (data.strategy && data.strategy.platform_roles) || [];
    const roleRows = roles.map((r) => `
      <div class="prop-role-row reveal">
        <span class="prop-role-platform">${esc(r.platform)}</span>
        <span class="prop-role-desc">${esc(r.role)}</span>
        <span class="prop-role-action">${esc(r.customer_action)}</span>
      </div>`).join('');

    return `
    <section id="section-05" class="prop-section prop-customer-flow">
      <div class="section-inner container">
        <p class="eyebrow reveal">${esc(s.eyebrow)}</p>
        <h2 class="section-title reveal">${esc(s.headline)}</h2>
        <p class="section-lead reveal">${esc(s.body)}</p>
        <div class="prop-flow-track">${steps}</div>
        <div class="prop-role-table">${roleRows}</div>
      </div>
    </section>`;
  }

  /* ---------- SECTION 06 — CONTENT ENGINE (업체별) ---------- */
  function renderContentEngine(s, data) {
    const framework = (s.framework || []).map((f) => `<div class="prop-framework-box reveal"><span>${esc(f)}</span></div>`).join('<span class="prop-flow-arrow reveal" aria-hidden="true">→</span>');
    const pillars = ((data.strategy && data.strategy.content_pillars) || []).map((p) => `<span class="prop-chip reveal">${esc(p)}</span>`).join('');
    return `
    <section id="section-06" class="prop-section prop-content-engine">
      <div class="section-inner container">
        <p class="eyebrow reveal">${esc(s.eyebrow)}</p>
        <h2 class="section-title reveal">${esc(s.headline)}</h2>
        <p class="section-lead reveal">${esc(s.body)}</p>
        <div class="prop-framework-track">${framework}</div>
        <div class="prop-chip-row">${pillars}</div>
      </div>
    </section>`;
  }

  /* ---------- SECTION 07 — CONTENT EXAMPLES (업체별) ---------- */
  function renderContentExamples(s, data) {
    const cards = (s.content_example_ids || []).map((id) => byId(data.content_examples, id)).filter(Boolean).map((ex) => `
      <article class="prop-example-card card-notch card-bracket reveal">
        <span class="prop-example-format">${esc(ex.format)}</span>
        <h3 class="prop-example-title">${esc(ex.title)}</h3>
        <p class="prop-example-hook">${esc(ex.hook)}</p>
        <details class="prop-example-detail">
          <summary>구조 더 보기</summary>
          <p><strong>RETENTION</strong> ${esc(ex.retention)}</p>
          <p><strong>VALUE</strong> ${esc(ex.value)}</p>
          <p><strong>CTA</strong> ${esc(ex.cta)}</p>
        </details>
      </article>`).join('');
    return `
    <section id="section-07" class="prop-section prop-content-examples">
      <div class="section-inner container">
        <p class="eyebrow reveal">${esc(s.eyebrow)}</p>
        <h2 class="section-title reveal">${esc(s.headline)}</h2>
        <p class="section-lead reveal">${esc(s.body)}</p>
        <div class="prop-example-grid">${cards}</div>
      </div>
    </section>`;
  }

  /* ---------- SECTION 08 — PROOF / CASE ----------
     조가네 CASE는 TIGER 공통 Proof 자산 (common.case_studies.JOGANE).
     업체별로 달라지는 것은 이 CASE를 해당 업체에 어떻게 연결하는지 설명하는
     한 문장(data.case_study.connection_to_client)뿐이다. */
  function renderProofCase(s, data, common) {
    const cs = (common.case_studies && common.case_studies.JOGANE) || {};
    const m = cs.verified_metrics || {};
    const metricCards = [
      { label: 'VIEWS', value: m.views, isNumber: false },
      { label: 'LIKES', value: m.likes, isNumber: true },
      { label: 'COMMENTS', value: m.comments, isNumber: true },
      { label: 'SAVES', value: m.saves, isNumber: true },
      { label: 'FOLLOWERS', value: m.new_followers, isNumber: true, prefix: '+' },
    ].map((item) => `
      <div class="prop-metric-card reveal">
        <span class="prop-metric-value">${item.isNumber
          ? `${item.prefix || ''}<span class="count-up" data-count-to="${item.value}">0</span>`
          : esc(item.value)}</span>
        <span class="prop-metric-label">${item.label}</span>
      </div>`).join('');

    const primary = commonPlacementAsset(cs.assets, 'section-08-primary-proof');
    const secondary = commonPlacementAsset(cs.assets, 'section-08-secondary-proof');
    const shots = [primary, secondary].filter(Boolean).map((shot) => `
      <figure class="prop-case-shot reveal">
        <img src="${esc(shot.url)}" alt="${esc(shot.caption)}" loading="lazy">
        ${shot.caption ? `<figcaption>${esc(shot.caption)}</figcaption>` : ''}
      </figure>`).join('');

    const connection = (data.case_study && data.case_study.connection_to_client) || '';

    return `
    <section id="section-08" class="prop-section prop-proof-case">
      <div class="section-inner container">
        <p class="eyebrow reveal">${esc(cs.eyebrow)}</p>
        <h2 class="section-title reveal">${esc(cs.headline)}</h2>
        <p class="section-lead reveal">${esc(connection)}</p>
        <div class="prop-metric-grid">${metricCards}</div>
        ${shots ? `<div class="prop-case-shots">${shots}</div>` : ''}
        <p class="prop-disclaimer reveal">${esc(cs.disclaimer)}</p>
      </div>
    </section>`;
  }

  /* ---------- SECTION 09 — MONTHLY EXECUTION (업체별) ---------- */
  function renderMonthlyExecution(s) {
    const weeks = (s.weeks || []).map((w) => `
      <div class="prop-week-card card-notch card-bracket reveal">
        <span class="prop-week-badge">${esc(w.week)}</span>
        <h3 class="prop-week-focus">${esc(w.focus)}</h3>
        <ul class="prop-week-actions">${(w.actions || []).map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
      </div>`).join('');
    return `
    <section id="section-09" class="prop-section prop-monthly-execution">
      <div class="section-inner container">
        <p class="eyebrow reveal">${esc(s.eyebrow)}</p>
        <h2 class="section-title reveal">${esc(s.headline)}</h2>
        <div class="prop-week-grid">${weeks}</div>
      </div>
    </section>`;
  }

  /* ---------- SECTION 10 — PLANS ----------
     가격/구성표는 TIGER 공통 서비스 데이터(common.plans). 업체별로 달라지는
     것은 헤드라인·추천 사유(rec)와 어떤 플랜을 추천(highlight_plan)하는지뿐이다. */
  function renderPlans(s, data, common) {
    const planIds = (s.plan_ids && s.plan_ids.length) ? s.plan_ids : ['BASIC', 'GROWTH', 'PERFORMANCE', 'COMMERCE'];
    const items = planIds.map((id) => byId(common.plans && common.plans.items, id)).filter(Boolean);
    const highlight = s.highlight_plan || (data.recommendation && data.recommendation.recommended_plan);
    const cards = items.map((p) => {
      const isHighlight = p.id === highlight;
      return `
      <div class="prop-plan-card ${isHighlight ? 'is-highlight' : ''} reveal">
        ${isHighlight ? '<span class="prop-plan-badge">추천</span>' : ''}
        <p class="prop-plan-level">${esc(p.level)}</p>
        <h3 class="prop-plan-name">${esc(p.name)}</h3>
        <p class="prop-plan-price">${krw(p.price_krw)}<span>/월</span></p>
        <ul class="prop-plan-list">
          <li>숏폼 월 ${p.shorts}편</li>
          <li>카드뉴스 월 ${p.card_news}건</li>
          <li>Threads 월 ${p.threads}건</li>
          <li>블로그 월 ${p.blog}건</li>
        </ul>
        <p class="prop-plan-value">${esc(p.value)}</p>
      </div>`;
    }).join('');

    const rec = data.recommendation || {};
    return `
    <section id="section-10" class="prop-section prop-plans">
      <div class="section-inner container">
        <p class="eyebrow reveal">${esc(s.eyebrow)}</p>
        <h2 class="section-title reveal">${esc(s.headline)}</h2>
        <p class="section-lead reveal">${esc(s.body)}</p>
        <div class="prop-plan-grid">${cards}</div>
        ${rec.reason ? `<p class="prop-highlight reveal">${esc(rec.reason)}</p>` : ''}
        ${common.plans && common.plans.performance_note ? `<p class="prop-disclaimer reveal">${esc(common.plans.performance_note)}</p>` : ''}
      </div>
    </section>`;
  }

  /* ---------- SECTION 11 — WHY TIGER (완전 공통, 업체별 데이터 없음) ---------- */
  function renderWhyTiger(common) {
    const t = common.tiger || {};
    const points = (t.points || []).map((p) => `<li>${esc(p)}</li>`).join('');
    const profileUrl = brandAssetUrl(common, t.profile_asset_id);
    return `
    <section id="section-11" class="prop-section prop-why-tiger">
      <div class="section-inner container">
        <div class="prop-tiger-layout${profileUrl ? '' : ' no-image'}">
          <div class="prop-tiger-copy">
            <p class="eyebrow reveal">${esc(t.eyebrow)}</p>
            <h2 class="section-title reveal">${esc(t.headline)}</h2>
            <p class="section-lead reveal">${esc(t.body)}</p>
            <ul class="prop-tiger-list reveal">${points}</ul>
          </div>
          ${profileUrl ? `
          <div class="prop-tiger-portrait reveal">
            <img src="${esc(profileUrl)}" alt="TIGER COMMERCE LAB 운영자">
          </div>` : ''}
        </div>
      </div>
    </section>`;
  }

  /* ---------- SECTION 12 — FINAL CTA (문구는 업체별, 명함 이미지는 공통) ---------- */
  function renderFinalCta(s, data, common) {
    const fc = data.final_cta || {};
    const cardUrl = brandAssetUrl(common, 'TIGER_YB_BUSINESS_CARD');
    return `
    <section id="section-12" class="prop-section prop-final-cta">
      <div class="section-inner container">
        <h2 class="prop-final-title reveal">${esc(s.headline)}</h2>
        <p class="prop-final-body reveal">${esc(s.body)}</p>
        <a href="/index.html#contact" class="btn btn-primary btn-large reveal">${esc(s.primary_cta)}</a>
        <p class="prop-final-contact reveal">${esc(fc.contact_method)}</p>
        ${cardUrl ? `
        <div class="prop-final-card reveal">
          <img src="${esc(cardUrl)}" alt="TIGER COMMERCE LAB 상담 명함">
        </div>` : ''}
      </div>
    </section>`;
  }

  /* ---------- 인터랙션: 스크롤 리빌 (기존 사이트 .reveal 패턴과 동일) ---------- */
  function initReveal() {
    const els = root.querySelectorAll('.reveal');
    if (!els.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    els.forEach((el, i) => {
      el.style.transitionDelay = (i % 5) * 60 + 'ms';
      observer.observe(el);
    });
  }

  /* ---------- 인터랙션: 카운트업 (기존 사이트 animateCountUp과 동일 로직) ---------- */
  function initCountUp() {
    const counters = root.querySelectorAll('.count-up');
    if (!counters.length) return;
    function animate(counter) {
      const target = parseFloat(counter.getAttribute('data-count-to')) || 0;
      const start = performance.now();
      const duration = 1200;
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        counter.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
        else counter.textContent = target;
      }
      requestAnimationFrame(tick);
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => observer.observe(c));
  }

  /* ---------- 접근성: details 아코디언은 네이티브 동작 그대로 사용 ---------- */
  function initAccordions() {
    // 네이티브 <details>/<summary> 사용 — 별도 JS 불필요 (키보드·ARIA 기본 지원)
  }

  /* ---------- CTA 버튼 스크롤 ---------- */
  function wireCtaScrolls() {
    root.querySelectorAll('[data-prop-scroll]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.getAttribute('data-prop-scroll'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
})();
