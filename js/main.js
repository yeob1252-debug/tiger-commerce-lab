(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const scrollToElement = (element) => element && element.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  const clamp01 = (value) => Math.max(0, Math.min(1, value));
  const scrollProgress = (section, topOffset = 0) => {
    if (!section) return 0;
    const rect = section.getBoundingClientRect();
    const visibleHeight = Math.max(1, window.innerHeight - topOffset);
    const range = Math.max(1, section.offsetHeight - visibleHeight);
    return clamp01((topOffset - rect.top) / range);
  };

  /* Header & navigation */
  const header = $('#siteHeader');
  const menuButton = $('#menuButton');
  const mobileNav = $('#mobileNav');
  const menuFocusable = () => mobileNav ? $$('a,button', mobileNav).filter((item) => !item.hidden) : [];

  function setMenu(open) {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    mobileNav.hidden = !open;
    if (open) menuFocusable()[0]?.focus();
  }

  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  mobileNav?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { setMenu(false); menuButton.focus(); return; }
    if (event.key !== 'Tab') return;
    const items = menuFocusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  window.addEventListener('scroll', () => header?.classList.toggle('is-scrolled', window.scrollY > 20), { passive: true });
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const target = $(anchor.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      setMenu(false);
      scrollToElement(target);
    });
  });

  /* Hero rotating outcome & responsive eye glow */
  const hero = $('#hero');
  const heroMedia = $('.hero-media', hero);
  const heroTigerBase = $('.hero-tiger-base', hero);
  const heroTigerIlluminated = $('.hero-tiger-illuminated', hero);
  const mobileTigerMedia = window.matchMedia('(max-width: 809px)');
  const tigerSources = {
    desktop: {
      base: 'assets/home/v6/tiger-hero-cinematic.webp',
      illuminated: 'assets/home/v6/tiger-hero-illuminated.webp',
    },
    mobile: {
      base: 'assets/home/v7/tiger-hero-mobile-cinematic.webp',
      illuminated: 'assets/home/v7/tiger-hero-mobile-illuminated.webp',
    },
  };
  function syncTigerSources() {
    const source = mobileTigerMedia.matches ? tigerSources.mobile : tigerSources.desktop;
    if (heroTigerBase?.getAttribute('src') !== source.base) heroTigerBase?.setAttribute('src', source.base);
    if (heroTigerIlluminated?.getAttribute('src') !== source.illuminated) heroTigerIlluminated?.setAttribute('src', source.illuminated);
  }
  syncTigerSources();
  mobileTigerMedia.addEventListener?.('change', syncTigerSources);
  if (hero && heroMedia && !$('.hero-media-stage', heroMedia)) {
    const heroStage = document.createElement('div');
    heroStage.className = 'hero-media-stage';
    while (heroMedia.firstChild) heroStage.appendChild(heroMedia.firstChild);
    const eyeGuide = $('.hero-eye-guide', heroStage);
    if (eyeGuide) eyeGuide.innerHTML = '<span class="guide-desktop">호랑이의 눈을 향해 움직여보세요</span><span class="guide-mobile">스크롤해 호랑이의 눈빛을 깨워보세요</span>';
    const heroFrame = $('.hero-frame', hero);
    if (heroFrame) heroStage.appendChild(heroFrame);
    heroMedia.appendChild(heroStage);
  }
  const rotatingOutcome = $('#rotatingOutcome');
  const outcomes = ['신규 고객을 만납니다', '팬을 만듭니다', '방문을 만듭니다', '판매로 연결합니다', '라이브로 수익화합니다'];
  let outcomeIndex = 0;
  if (rotatingOutcome && !reducedMotion) {
    window.setInterval(() => {
      rotatingOutcome.classList.remove('is-flipping');
      void rotatingOutcome.offsetWidth;
      rotatingOutcome.classList.add('is-flipping');
      window.setTimeout(() => { outcomeIndex = (outcomeIndex + 1) % outcomes.length; rotatingOutcome.textContent = outcomes[outcomeIndex]; }, 315);
    }, 2800);
  }
  if (hero && window.matchMedia('(min-width: 810px)').matches && !reducedMotion) {
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      const distance = Math.hypot(x - 79, (y - 35) * 1.45);
      const intensity = Math.max(0, Math.min(1, 1 - distance / 24));
      hero.style.setProperty('--pointer-x', `${x}%`);
      hero.style.setProperty('--pointer-y', `${y}%`);
      hero.style.setProperty('--eye-intensity', intensity.toFixed(3));
    });
    hero.addEventListener('pointerleave', () => hero.style.setProperty('--eye-intensity', '0'));
  }

  /* Progressive enhancement reveals. Critical content remains visible without JS. */
  const revealItems = $$('.reveal');
  if (revealItems.length && 'IntersectionObserver' in window && !reducedMotion) {
    document.documentElement.classList.add('reveal-ready');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -7% 0px' });
    revealItems.forEach((item, index) => { item.style.transitionDelay = `${(index % 3) * 70}ms`; revealObserver.observe(item); });
  }

  /* Storytelling reaction */
  const story = $('#story');
  const storySteps = $$('[data-story-step]');
  const storyScreen = $('#storyScreen');
  const storyImage = $('#storyImage');
  const storyContent = [
    { label: '01 / DISCOVERY', title: '오늘 처음 본 고객이<br>화면을 멈춥니다.', meta: 'SHORTS · REELS · TIKTOK', image: 'assets/home/v6/story-discovery.webp', alt: '음식점에서 휴대폰으로 새로운 매장 콘텐츠를 발견한 고객' },
    { label: '02 / CONNECTION', title: '저장하고 댓글을 남긴<br>고객이 팬이 됩니다.', meta: 'SAVE · COMMENT · SHARE', image: 'assets/home/v6/story-connection.webp', alt: '매장 콘텐츠를 함께 보며 저장하고 공유하는 고객들' },
    { label: '03 / CONVERSION', title: '검색하고 비교한 고객이<br>방문과 구매를 선택합니다.', meta: 'SEARCH · PLACE · PURCHASE', image: 'assets/home/v6/story-conversion.webp', alt: '온라인에서 발견한 음식점에 실제 방문하는 고객들' },
    { label: '04 / COMMERCE', title: '쌓인 팬과 인기 메뉴가<br>자체 LIVE로 연결됩니다.', meta: 'ONLINE SALES · OWN LIVE', image: 'assets/home/v6/menu-to-commerce.webp', alt: '인기 메뉴가 온라인판매와 라이브로 확장되는 장면' },
  ];

  function setStoryStep(index) {
    const safeIndex = Math.max(0, Math.min(storyContent.length - 1, index));
    storySteps.forEach((step, stepIndex) => step.classList.toggle('is-active', stepIndex === safeIndex));
    if (!storyScreen) return;
    const content = storyContent[safeIndex];
    storyScreen.dataset.state = String(safeIndex);
    $('.device-label', storyScreen).textContent = content.label;
    $('strong', storyScreen).innerHTML = content.title;
    $('p', storyScreen).textContent = content.meta;
    if (storyImage) { storyImage.src = content.image; storyImage.alt = content.alt; }
  }
  storySteps.forEach((step) => step.addEventListener('click', () => setStoryStep(Number(step.dataset.storyStep))));
  setStoryStep(0);

  /* Omnira-style scroll progress */
  const process = $('#content-commerce');
  const processTrack = $('.process-track');
  const processCards = $$('[data-process-step]');
  const processDots = processTrack ? $$('i', processTrack) : [];
  let scrollTicking = false;
  let updateOperationScroll = () => {};

  function updateScrollStories() {
    scrollTicking = false;
    const mobile = window.innerWidth <= 809;
    if (hero && heroMedia && mobile && !reducedMotion) {
      const tigerProgress = scrollProgress(heroMedia);
      const easedTigerProgress = 1 - Math.pow(1 - tigerProgress, 2);
      hero.style.setProperty('--eye-intensity', easedTigerProgress.toFixed(3));
      hero.dataset.mobileTigerProgress = String(Math.round(tigerProgress * 100));
    }
    if (story && !reducedMotion) {
      const storyProgress = scrollProgress(story, mobile ? 62 : 0);
      setStoryStep(Math.min(3, Math.floor(storyProgress * 4)));
    }
    if (process && (mobile || window.innerWidth >= 1200) && !reducedMotion) {
      const progress = scrollProgress(process, mobile ? 62 : 0);
      const activeIndex = Math.min(3, Math.floor(progress * 4));
      processTrack?.style.setProperty('--progress', `${progress * 100}%`);
      process.style.setProperty('--mobile-progress', `${progress * 100}%`);
      process.dataset.activeStep = String(activeIndex);
      processCards.forEach((card, index) => {
        card.classList.toggle('is-active', index === activeIndex);
        card.classList.toggle('is-complete', index < activeIndex);
      });
      processDots.forEach((dot, index) => dot.classList.toggle('is-on', index <= activeIndex));
    }
    updateOperationScroll();
  }
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollStories);
  }, { passive: true });
  window.addEventListener('resize', updateScrollStories);
  updateScrollStories();

  /* Attention data: animate only the values and their bars when they enter view. */
  const attentionPanel = $('#attentionPanel');
  const attentionValues = attentionPanel ? $$('[data-time-minutes],[data-percentage]', attentionPanel) : [];
  function animateAttentionValue(element) {
    if (element.dataset.animated === 'true') return;
    element.dataset.animated = 'true';
    const minutes = Number(element.dataset.timeMinutes);
    const percentage = Number(element.dataset.percentage);
    const target = Number.isFinite(minutes) ? minutes : percentage;
    const format = (value) => {
      if (Number.isFinite(minutes)) {
        const rounded = Math.round(value);
        const hours = Math.floor(rounded / 60);
        const remaining = rounded % 60;
        return hours ? `${hours}시간 ${remaining}분` : `${remaining}분`;
      }
      return `${value.toFixed(1)}%`;
    };
    const start = performance.now();
    function frame(now) {
      const progress = Math.min(1, (now - start) / 1100);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = format(target * eased);
      if (progress < 1) window.requestAnimationFrame(frame);
      else { element.textContent = format(target); element.classList.add('is-counted'); }
    }
    window.requestAnimationFrame(frame);
  }
  if (attentionPanel) {
    if ('IntersectionObserver' in window && !reducedMotion) {
      attentionPanel.classList.add('attention-ready');
      const attentionObserver = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        attentionPanel.classList.add('is-animated');
        attentionValues.forEach(animateAttentionValue);
        attentionObserver.disconnect();
      }, { threshold: .28 });
      attentionObserver.observe(attentionPanel);
    } else {
      attentionPanel.classList.add('is-animated');
    }
  }

  /* Proof count-up */
  const proof = $('#proof');
  const countItems = $$('[data-count-final]');
  function countToFinal(element) {
    if (element.dataset.counted === 'true') return;
    element.dataset.counted = 'true';
    const finalText = element.dataset.countFinal;
    const hasPlus = finalText.startsWith('+');
    const hasK = finalText.endsWith('K');
    const target = Number(finalText.replace(/[+K]/g, ''));
    const decimal = finalText.includes('.');
    const start = performance.now();
    function frame(now) {
      const progress = Math.min(1, (now - start) / 900);
      const value = target * (1 - Math.pow(1 - progress, 3));
      element.textContent = `${hasPlus ? '+' : ''}${decimal ? value.toFixed(1) : Math.round(value)}${hasK ? 'K' : ''}`;
      if (progress < 1) window.requestAnimationFrame(frame);
      else { element.textContent = finalText; element.classList.add('is-counted'); }
    }
    window.requestAnimationFrame(frame);
  }
  if (proof && countItems.length && 'IntersectionObserver' in window && !reducedMotion) {
    const proofObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      countItems.forEach(countToFinal);
      proofObserver.disconnect();
    }, { threshold: .22 });
    proofObserver.observe(proof);
  }

  /* One shared form: moves into the selected free-service card or final consultation. */
  const formShell = $('#sharedFormShell');
  const diagnosisForm = $('#diagnosisForm');
  const formStatus = $('#formStatus');
  const consultSlot = $('#consultFormSlot');
  const freeButtons = $$('[data-free-check]');
  const freeCards = $$('[data-free-card]');
  const fieldsets = {
    general: $('#fieldsetGeneral'),
    place: $('#fieldsetPlace'),
    nationwide: $('#fieldsetNationwide'),
  };
  let activeFormMode = null;
  let activeFormContext = {};
  consultSlot?.appendChild(formShell);

  const FORM_MODES = {
    general: { label: '1:1 CONSULTATION', title: 'TIGER 통합운영 상담', description: '신규유치·팬심·방문·판매·자체 LIVE 중 지금 필요한 목표를 확인한다.', inquiry: 'SNS 통합운영 상담' },
    place: { label: 'FREE CHECK 01', title: '네이버 플레이스 무료점검', description: '검색한 고객이 방문하지 않는 이유를 확인한다.', inquiry: '네이버 플레이스 무료점검' },
    nationwide: { label: 'FREE CHECK 02', title: '온라인판매 가능성 체크리스트', description: '대표메뉴와 행정·공간·포장·배송 조건을 확인해 가능한 실행순서를 정리한다.', inquiry: '온라인판매 가능성 점검' },
  };

  function setHiddenField(id, value = '') {
    const element = document.getElementById(id);
    if (element) element.value = value == null ? '' : String(value);
  }

  function collapseFreeCards() {
    freeCards.forEach((card) => card.classList.remove('is-open', 'is-sibling-open'));
    freeButtons.forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
      const icon = $('span', button);
      if (icon) icon.textContent = '＋';
    });
  }

  function configureFields(mode) {
    Object.entries(fieldsets).forEach(([key, fieldset]) => {
      if (!fieldset) return;
      const active = key === mode;
      fieldset.hidden = !active;
      fieldset.disabled = !active;
    });
  }

  function openForm(mode = 'general', context = {}) {
    if (!formShell || !diagnosisForm) return;
    const config = FORM_MODES[mode] || FORM_MODES.general;
    const targetSlot = mode === 'general' ? consultSlot : $(`[data-form-slot="${mode}"]`);
    if (!targetSlot) return;
    activeFormMode = mode;
    activeFormContext = context;
    collapseFreeCards();
    if (mode !== 'general') {
      const openCard = $(`[data-free-card="${mode}"]`);
      freeCards.forEach((card) => card.classList.toggle('is-sibling-open', card !== openCard));
      openCard?.classList.add('is-open');
      const button = $(`[data-free-check="${mode}"]`);
      button?.setAttribute('aria-expanded', 'true');
      const icon = button ? $('span', button) : null;
      if (icon) icon.textContent = '×';
    }
    targetSlot.appendChild(formShell);
    formShell.hidden = false;
    document.body.classList.add('form-open');
    configureFields(mode);
    $('#formModeLabel').textContent = config.label;
    $('#formTitle').textContent = config.title;
    $('#formDescription').textContent = config.description;
    setHiddenField('inquiryType', config.inquiry);
    setHiddenField('selectedDiagnosisField', mode === 'general' ? 'sns' : mode);
    setHiddenField('sourceSectionField', context.sourceSection || (mode === 'general' ? 'contact' : 'free-checks'));
    setHiddenField('sourceCTAField', context.sourceCTA || `${mode}-open`);
    setHiddenField('planField', context.plan);
    setHiddenField('termField', context.term);
    setHiddenField('selectedPlanField', context.plan);
    setHiddenField('selectedTermField', context.term);
    setHiddenField('selectedMonthlyPriceField', context.monthlyPrice);
    setHiddenField('selectedPlanCtaField', context.planCta);
    setHiddenField('selectedOptionField', context.option);
    const label = $('.btn-label', diagnosisForm);
    if (label) label.textContent = mode === 'place' ? '플레이스 무료점검 신청하기' : mode === 'nationwide' ? '온라인판매 가능성 점검 신청하기' : '상담 신청하기';
    if (formStatus) { formStatus.textContent = ''; formStatus.className = 'form-status'; }
    updateMobileCta();
    window.setTimeout(() => scrollToElement(formShell), 40);
  }

  function closeFreeForm() {
    if (!formShell || !consultSlot) return;
    formShell.hidden = true;
    consultSlot.appendChild(formShell);
    collapseFreeCards();
    document.body.classList.remove('form-open');
    activeFormMode = null;
    updateMobileCta();
  }

  freeButtons.forEach((button) => button.addEventListener('click', () => {
    const mode = button.dataset.freeCheck;
    const isCurrentOpen = activeFormMode === mode && !formShell.hidden;
    if (isCurrentOpen) closeFreeForm();
    else openForm(mode, { sourceSection: 'free-checks', sourceCTA: `free-${mode}` });
  }));
  $$('[data-consult-open]').forEach((button) => button.addEventListener('click', () => openForm('general', { sourceSection: 'contact', sourceCTA: button.dataset.sourceCta || 'consult-open' })));

  /* Plans */
  const planGrid = $('#planGrid');
  const planTermToggle = $('#planTermToggle');
  const planVatLabel = $('#planVatLabel');
  let planState = { term: 12, items: [], features: [], vat: 'VAT 별도' };
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const toManwon = (value) => `${Math.round(Number(value) / 10000)}만원`;

  function priceFor(plan) { return plan.prices?.[String(planState.term)] ?? plan.price_krw; }
  function renderPlans() {
    if (!planGrid) return;
    planGrid.innerHTML = planState.items.map((plan, index) => {
      const included = planState.features.filter((row) => row.values[index]).map((row) => row.label);
      const highlight = plan.id === 'PERFORMANCE';
      return `<article class="plan-card${highlight ? ' is-highlight' : ''}" data-plan-card="${escapeHtml(plan.id)}">
        ${highlight ? '<span class="plan-badge">TIGER RECOMMENDED</span>' : ''}
        <h3>${escapeHtml(plan.name)}</h3><p class="plan-desire">${escapeHtml(plan.desire)}</p>
        <p class="plan-price">${toManwon(priceFor(plan))}<span>/월 · ${escapeHtml(planState.vat)}</span></p>
        <p class="plan-qty">쇼츠 ${plan.shorts} · 카드뉴스 ${plan.card_news} · Threads ${plan.threads} · 블로그 ${plan.blog}</p>
        <ul class="plan-features">${included.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}</ul>
        <button type="button" class="button ${highlight ? 'button-primary' : 'button-ghost'}" data-plan-consult="${escapeHtml(plan.id)}">${escapeHtml(plan.cta_label)}</button>
      </article>`;
    }).join('');
    $$('[data-plan-consult]', planGrid).forEach((button) => button.addEventListener('click', () => {
      const plan = planState.items.find((item) => item.id === button.dataset.planConsult);
      if (!plan) return;
      openForm('general', { sourceSection: 'plans', sourceCTA: `plan-${plan.id}`, plan: plan.id, term: planState.term, monthlyPrice: `${toManwon(priceFor(plan))}/월 · ${planState.vat}`, planCta: plan.cta_label });
    }));
  }

  if (planGrid && planTermToggle) {
    fetch('/data/proposals/_common.json')
      .then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
      .then((common) => {
        const plans = common.plans || {};
        planState = { term: plans.default_term_months || 12, items: plans.items || [], features: plans.feature_rows || [], vat: plans.vat_label || 'VAT 별도' };
        planTermToggle.innerHTML = (plans.terms || []).map((term) => `<button type="button" data-plan-term="${term.months}" class="${term.months === planState.term ? 'is-active' : ''}" aria-pressed="${term.months === planState.term}">${escapeHtml(term.label)}</button>`).join('');
        $$('[data-plan-term]', planTermToggle).forEach((button) => button.addEventListener('click', () => {
          planState.term = Number(button.dataset.planTerm);
          $$('[data-plan-term]', planTermToggle).forEach((item) => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-pressed', String(active)); });
          renderPlans();
        }));
        if (planVatLabel) planVatLabel.textContent = `월 이용료 · ${planState.vat}`;
        renderPlans();
      })
      .catch((error) => { console.error('요금제 데이터를 불러오지 못했습니다.', error); planGrid.innerHTML = '<p>요금제 정보를 불러오지 못했습니다. 상담 시 확인해 주세요.</p>'; });
  }

  /* Operation showcase */
  const operationData = {
    dashboard: { eyebrow: 'VISIBLE WORKFLOW', title: '진행 상황을 숨기지 않는다.', description: '기획·제작·검수·게시·성과 확인 과정을 전용 화면에서 함께 확인한다.', image: 'assets/home/v6/tiger-dashboard-example.webp', alt: 'TIGER 음식점 SNS 운영 전용 Dashboard 예시 화면', caption: '전용 Dashboard 업무 화면 예시입니다.' },
    live: { eyebrow: 'AWARD-WINNING LIVE COMMERCE', title: 'GRIP 선정 24·25 신인판매왕, 팔아야산다2 우승 핫 쇼호스트.', description: '직접 팔아본 경험을 바탕으로 상품선정, 방송기획, 대본·큐시트, 환경 세팅, 사장님·직원 교육, 사전 홍보, 방송 지원, 재구매 콘텐츠까지 연결한다.', image: 'assets/home/v6/menu-to-commerce.webp', alt: '대표메뉴가 상품과 자체 라이브커머스로 이어지는 장면', caption: '메뉴 → 상품 → 배송 → 자체 LIVE' },
    community: { eyebrow: 'OPTIONAL EXPANSION', title: '지역 맘커뮤니티에 자연스럽게 발견되는 선택형 확장.', description: '실제 체험과 실제 혜택을 기반으로 후기형·핫딜형을 구분해 운영한다. 월 30건 기준 범위와 비용은 별도 상담하며 허위후기와 가짜 성과를 만들지 않는다.', image: 'assets/home/v6/mom-community-spread.webp', alt: '지역 맘커뮤니티에서 음식점 콘텐츠가 공유되고 확산되는 운영 장면 예시', caption: '맘커뮤니티 확산 운영 장면 예시 · 실제 후기·성과값 아님' },
  };
  const operationShowcase = $('.operation-showcase');
  if (operationShowcase) {
    operationShowcase.id = 'operationShowcase';
    operationShowcase.classList.remove('reveal');
    if (!$('.operation-sticky', operationShowcase)) {
      const operationSticky = document.createElement('div');
      operationSticky.className = 'operation-sticky';
      while (operationShowcase.firstChild) operationSticky.appendChild(operationShowcase.firstChild);
      operationShowcase.appendChild(operationSticky);
    }
    $('.operation-panel', operationShowcase)?.setAttribute('aria-live', 'polite');
  }
  const operationTabs = $$('.operation-tab');
  const operationKeys = ['dashboard', 'live', 'community'];
  function setOperation(key) {
    const data = operationData[key];
    if (!data) return;
    operationTabs.forEach((item) => { const active = item.dataset.operation === key; item.classList.toggle('is-active', active); item.setAttribute('aria-selected', String(active)); });
    operationShowcase?.setAttribute('data-active-operation', key);
    $('#operationEyebrow').textContent = data.eyebrow;
    $('#operationTitle').textContent = data.title;
    $('#operationDescription').textContent = data.description;
    $('#operationImage').src = data.image;
    $('#operationImage').alt = data.alt;
    $('#operationCaption').textContent = data.caption;
  }
  operationTabs.forEach((tab) => tab.addEventListener('click', () => setOperation(tab.dataset.operation)));
  updateOperationScroll = () => {
    if (!operationShowcase || window.innerWidth > 809 || reducedMotion) return;
    const progress = scrollProgress(operationShowcase, 62);
    const activeIndex = Math.min(operationKeys.length - 1, Math.floor(progress * operationKeys.length));
    setOperation(operationKeys[activeIndex]);
  };
  setOperation('dashboard');
  updateOperationScroll();

  /* FAQ */
  $$('.faq-question').forEach((question) => question.addEventListener('click', () => {
    const answer = question.nextElementSibling;
    const nextState = question.getAttribute('aria-expanded') !== 'true';
    $$('.faq-question').forEach((item) => { item.setAttribute('aria-expanded', 'false'); item.nextElementSibling.hidden = true; });
    question.setAttribute('aria-expanded', String(nextState));
    answer.hidden = !nextState;
  }));

  /* Conditional nationwide field */
  const businessTypeRow = $('#ncBusinessTypeRow');
  $$('input[name="foodMfgReport"]').forEach((radio) => radio.addEventListener('change', () => { if (businessTypeRow) businessTypeRow.hidden = radio.value !== '없음'; }));

  /* Existing submission endpoints and field names preserved. */
  const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLScP5FnNGQbpHRVy5_fFzDju0I0FiSq36ajaP3aOo3s8UUx_hA/formResponse';
  const GOOGLE_FORM_FIELDS = { storeName: 'entry.113098425', storeArea: 'entry.1254021817', phone: 'entry.601816022', onlineSales: 'entry.1558172882', message: 'entry.1781088824' };
  const NATIONAL_CHECK_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwiFxOMP-nPOJK_KIOEOaB6SfaktJz8b9EPmlSRKtyx85pnrlhMdtXqTt1wpVurmaxf/exec';
  const hiddenIframe = $('#hiddenFormTarget');

  function submitToGoogleForm(data, onFinish) {
    const googleForm = document.createElement('form');
    googleForm.action = GOOGLE_FORM_ACTION;
    googleForm.method = 'POST';
    googleForm.target = 'hiddenFormTarget';
    googleForm.style.display = 'none';
    Object.entries(GOOGLE_FORM_FIELDS).forEach(([key, entry]) => {
      const input = document.createElement('input');
      input.type = 'hidden'; input.name = entry; input.value = String(data.get(key) || ''); googleForm.appendChild(input);
    });
    let finished = false;
    const finish = () => { if (finished) return; finished = true; hiddenIframe?.removeEventListener('load', finish); onFinish?.(); };
    hiddenIframe?.addEventListener('load', finish, { once: true });
    document.body.appendChild(googleForm); googleForm.submit(); googleForm.remove(); window.setTimeout(finish, 3000);
  }

  function submissionContext(data) {
    const fields = [['문의유형','inquiryType'],['유입섹션','sourceSection'],['유입CTA','sourceCTA'],['선택진단','selectedDiagnosis'],['선택플랜','selectedPlan'],['선택기간','selectedTerm'],['월이용료','selectedMonthlyPrice'],['플랜CTA','selectedPlanCta'],['선택서비스','selectedOption']];
    return fields.map(([label,key]) => { const value = String(data.get(key) || '').trim(); return value ? `${label}: ${value}` : ''; }).filter(Boolean).join('\n');
  }

  diagnosisForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(diagnosisForm);
    const get = (key) => String(data.get(key) || '').trim();
    if (!get('inquiryType') || !get('storeName') || !get('storeArea') || !get('phone') || !$('#privacyConsent').checked) {
      formStatus.textContent = '필수 항목(*)을 모두 입력하고 개인정보 수집·이용에 동의해주세요.';
      formStatus.className = 'form-status is-error';
      return;
    }
    const originalMessage = get('message');
    const context = submissionContext(data);
    data.set('message', [originalMessage, context ? `[유입·선택정보]\n${context}` : ''].filter(Boolean).join('\n\n'));
    const submitButton = $('.form-submit', diagnosisForm);

    if (activeFormMode === 'nationwide') {
      const required = ['bizNum','foodMfgReport','onlineSalesReport','spaceSeparation','healthCert','hygieneEdu','operatingPeriod','menu1','menu1Price'];
      if (required.some((key) => !get(key))) {
        formStatus.textContent = '온라인판매 가능성 점검의 필수 항목을 모두 입력해주세요.';
        formStatus.className = 'form-status is-error';
        return;
      }
      const payload = {
        매장명:get('storeName'),지역:get('storeArea'),연락처:get('phone'),사업자등록여부:get('bizNum'),즉석판매제조가공업여부:get('foodMfgReport'),통신판매업여부:get('onlineSalesReport'),현재영업형태:get('businessType'),공간분리가능여부:get('spaceSeparation'),보건증:get('healthCert'),위생교육:get('hygieneEdu'),대표메뉴1:get('menu1'),대표메뉴1가격:get('menu1Price'),대표메뉴2:get('menu2'),대표메뉴2가격:get('menu2Price'),대표메뉴3:get('menu3'),대표메뉴3가격:get('menu3Price'),포장비:get('packagingCost'),배송비부담주체:get('deliveryCostBy'),운영기간:get('operatingPeriod'),강점스토리:get('storyStrength'),문의유형:get('inquiryType'),유입섹션:get('sourceSection'),유입CTA:get('sourceCTA'),선택진단:get('selectedDiagnosis'),선택플랜:get('selectedPlan'),선택기간:get('selectedTerm'),월이용료:get('selectedMonthlyPrice'),플랜CTA:get('selectedPlanCta'),추가메시지:originalMessage,
      };
      submitButton.disabled = true; formStatus.textContent = '전송 중입니다...'; formStatus.className = 'form-status';
      fetch(NATIONAL_CHECK_ENDPOINT, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify(payload) })
        .then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); formStatus.textContent = '온라인판매 가능성 점검 신청이 접수되었습니다. 빠르게 연락드릴게요!'; formStatus.className = 'form-status is-success'; diagnosisForm.reset(); configureFields(activeFormMode); })
        .catch(() => { formStatus.textContent = '전송에 실패했습니다. 잠시 후 다시 시도해주세요.'; formStatus.className = 'form-status is-error'; })
        .finally(() => { submitButton.disabled = false; });
      return;
    }

    submitButton.disabled = true; formStatus.textContent = '전송 중입니다...'; formStatus.className = 'form-status';
    submitToGoogleForm(data, () => {
      formStatus.textContent = `${get('inquiryType')} 신청이 접수되었습니다. 빠르게 연락드릴게요!`;
      formStatus.className = 'form-status is-success';
      submitButton.disabled = false;
      diagnosisForm.reset();
      configureFields(activeFormMode || 'general');
      const config = FORM_MODES[activeFormMode || 'general'];
      setHiddenField('inquiryType', config.inquiry);
    });
  });

  /* Mobile CTA avoids hero, footer and open form/input. */
  const mobileFixedCta = $('#mobileFixedCta');
  const footer = $('#siteFooter');
  let heroPassed = false;
  let footerVisible = false;
  let formFocused = false;
  function updateMobileCta() { mobileFixedCta?.classList.toggle('is-hidden', !(heroPassed && !footerVisible && !formFocused && formShell?.hidden)); }
  if (mobileFixedCta && 'IntersectionObserver' in window) {
    if (hero) new IntersectionObserver((entries) => { heroPassed = !entries[0].isIntersecting; updateMobileCta(); }, { threshold: 0 }).observe(hero);
    if (footer) new IntersectionObserver((entries) => { footerVisible = entries[0].isIntersecting; updateMobileCta(); }, { threshold: .05 }).observe(footer);
    diagnosisForm?.addEventListener('focusin', () => { formFocused = true; updateMobileCta(); });
    diagnosisForm?.addEventListener('focusout', () => { formFocused = false; updateMobileCta(); });
  }
})();
