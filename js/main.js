(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 연도 ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 헤더 스크롤 상태 ---------- */
  const header = document.getElementById('siteHeader');
  function onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('is-scrolled', scrollTop > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 헤더 모바일 메뉴 (Escape + focus 이동) ---------- */
  const headerMenuBtn = document.getElementById('headerMenuBtn');
  const headerMobileNav = document.getElementById('headerMobileNav');
  function closeMobileNav() {
    headerMenuBtn.setAttribute('aria-expanded', 'false');
    headerMenuBtn.setAttribute('aria-label', '메뉴 열기');
    headerMobileNav.hidden = true;
  }
  if (headerMenuBtn && headerMobileNav) {
    headerMenuBtn.addEventListener('click', () => {
      const isOpen = headerMenuBtn.getAttribute('aria-expanded') === 'true';
      if (isOpen) { closeMobileNav(); }
      else {
        headerMenuBtn.setAttribute('aria-expanded', 'true');
        headerMenuBtn.setAttribute('aria-label', '메뉴 닫기');
        headerMobileNav.hidden = false;
        const firstLink = headerMobileNav.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });
    headerMobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileNav));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && headerMenuBtn.getAttribute('aria-expanded') === 'true') {
        closeMobileNav();
        headerMenuBtn.focus();
      }
      if (e.key === 'Tab' && headerMenuBtn.getAttribute('aria-expanded') === 'true') {
        const focusables = [headerMenuBtn, ...headerMobileNav.querySelectorAll('a, button:not([disabled])')];
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- 스크롤 이동: 고정 Header 높이만큼 offset ---------- */
  function scrollToEl(el) {
    if (!el) return;
    const headerH = header.offsetHeight;
    const y = el.getBoundingClientRect().top + window.pageYOffset - headerH - 12;
    window.scrollTo({ top: Math.max(y, 0), behavior: reducedMotion ? 'auto' : 'smooth' });
  }
  function scrollToId(id) { scrollToEl(document.getElementById(id)); }

  document.querySelectorAll('[data-scroll-to]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToId(btn.getAttribute('data-scroll-to'));
    });
  });

  /* =========================================================
     HERO — 5 slide 데이터 동기 시스템
     ========================================================= */
  const HERO_SLIDES = [
    {
      id: 'brand-master',
      image: 'assets/home/hero/TIGER_HOME_HERO_01_NIGHT_SEARCH.png',
      alt: '손님이 없는 야간 매장을 바라보는 산군',
      focus: { desktop: '78% center', tablet: '72% center', mobile: '66% 28%' },
      eyebrow: 'TIGER COMMERCE LAB',
      title: {
        desktop: '장사는 <span class="hl">사장님</span>이,<br>고객이 오는 <span class="hl">채널</span>은 타이거가 운영합니다.',
        tablet: '장사는 <span class="hl">사장님</span>이,<br>고객이 오는 채널은<br>타이거가 운영합니다.',
        mobile: '장사는 <span class="hl">사장님</span>이,<br>고객이 오는 채널은<br><span class="hl">타이거</span>가 운영합니다.',
      },
      desc: 'SNS에서 발견되고, 검색에서 선택받고, 매장방문과 온라인구매로 이어지는 고객 흐름을 만듭니다.',
      primary: { label: '우리 매장의 성장기회 확인하기', diagnosisType: null },
      secondary: { label: '놓치고 있는 고객 보기', target: 'opportunity-loss' },
    },
    {
      id: 'nationwide-sales',
      image: 'assets/home/hero/TIGER_HOME_HERO_02_SANGUN_REVEAL.png',
      alt: '모습을 드러내며 매장 앞으로 걸어오는 산군',
      focus: { desktop: '70% center', tablet: '65% center', mobile: '56% 28%' },
      eyebrow: 'RESTAURANT MENU TO NATIONWIDE SALES',
      title: {
        desktop: '배달 반경은 짧아도,<br><span class="hl">메뉴가 팔릴 범위</span>까지 짧을 필요는 없습니다.',
        tablet: '배달 반경은 짧아도,<br><span class="hl">메뉴가 팔릴 범위</span>까지<br>짧을 필요는 없습니다.',
        mobile: '배달 반경은 짧아도,<br><span class="hl">메뉴가 팔릴 범위</span>까지<br>짧을 필요는 없습니다.',
      },
      desc: '매장에서 잘 팔리는 메뉴를 상품화·판매채널·콘텐츠·재구매로 연결할 가능성을 확인합니다.',
      primary: { label: '온라인판매 가능성 점검', diagnosisType: 'nationwide' },
      secondary: { label: '온라인판매 구조 보기', target: 'nationwide-sales' },
    },
    {
      id: 'sns',
      image: 'assets/home/hero/TIGER_HOME_HERO_03_CUSTOMER_DISCOVERY.png',
      alt: '숏폼 콘텐츠를 보며 매장을 발견하는 고객과 산군',
      focus: { desktop: '64% center', tablet: '61% center', mobile: '58% 25%' },
      eyebrow: 'SNS CHANNEL MANAGEMENT',
      title: {
        desktop: '손님은 매장에 오기 전,<br><span class="hl">SNS</span>에서 이미 어디로 갈지 정합니다.',
        tablet: '손님은 매장에 오기 전,<br><span class="hl">SNS</span>에서 이미<br>어디로 갈지 정합니다.',
        mobile: '손님은 매장에 오기 전,<br><span class="hl">SNS</span>에서 이미<br>어디로 갈지 정합니다.',
      },
      desc: '기획·촬영·제작·게시·반응분석을 이어가며 멈춘 채널을 고객이 찾아오는 접점으로 바꿉니다.',
      primary: { label: 'SNS 통합진단', diagnosisType: 'sns' },
      secondary: { label: 'SNS가 필요한 이유', target: 'why-sns' },
    },
    {
      id: 'place',
      image: 'assets/home/hero/TIGER_HOME_HERO_04_SEARCH_SAVE_INQUIRY.png',
      alt: '검색·저장·문의 아이콘과 함께 매장을 확인하는 고객',
      focus: { desktop: '60% center', tablet: '62% center', mobile: '61% 22%' },
      eyebrow: 'NAVER PLACE CONVERSION',
      title: {
        desktop: '검색됐는데 <span class="hl">선택받지 못하면</span>,<br>좋은 메뉴도 발견되지 않습니다.',
        tablet: '검색됐는데<br><span class="hl">선택받지 못하면</span>,<br>좋은 메뉴도 발견되지 않습니다.',
        mobile: '검색됐는데<br><span class="hl">선택받지 못하면</span>,<br>좋은 메뉴도 발견되지 않습니다.',
      },
      desc: '사진·메뉴·리뷰·예약·문의 흐름을 점검해 검색한 고객이 방문할 근거를 만듭니다.',
      primary: { label: '플레이스 무료점검', diagnosisType: 'place' },
      secondary: { label: '고객 유입 구조 보기', target: 'tiger-system' },
    },
    {
      id: 'integrated-operation',
      image: 'assets/home/hero/TIGER_HOME_HERO_05_STORE_REOPEN_CUSTOMER_ENTRY.png',
      alt: '다음 날 불이 켜진 매장으로 들어서는 손님들',
      focus: { desktop: '72% center', tablet: '70% center', mobile: '65% 26%' },
      eyebrow: 'FROM CONTENT TO COMMERCE',
      title: {
        desktop: '게시물 몇 개가 아니라,<br>고객이 <span class="hl">다시 찾아오는 구조</span>를 만듭니다.',
        tablet: '게시물 몇 개가 아니라,<br>고객이 <span class="hl">다시 찾아오는 구조</span>를<br>만듭니다.',
        mobile: '게시물 몇 개가 아니라,<br>고객이 <span class="hl">다시 찾아오는 구조</span>를<br>만듭니다.',
      },
      desc: 'SNS·플레이스·온라인판매를 고객의 발견·방문·구매·재구매 흐름으로 연결합니다.',
      primary: { label: 'TIGER 운영 상담', diagnosisType: 'sns' },
      secondary: { label: '실제 성과 보기', target: 'proof-cases' },
    },
  ];

  const heroBgSlidesEl = document.getElementById('heroBgSlides');
  if (heroBgSlidesEl) {
    heroBgSlidesEl.innerHTML = '';
    HERO_SLIDES.forEach((slide, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'hero-bg-slide' + (index === 0 ? ' is-active' : '');
      wrapper.dataset.slide = String(index);
      const image = document.createElement('img');
      image.src = slide.image;
      image.alt = slide.alt;
      image.loading = index === 0 ? 'eager' : 'lazy';
      if (index === 0) image.fetchPriority = 'high';
      wrapper.appendChild(image);
      heroBgSlidesEl.appendChild(wrapper);
    });
  }
  const heroBgSlides = document.querySelectorAll('.hero-bg-slide');
  const heroDots = document.querySelectorAll('.hero-dot');
  const heroPrev = document.getElementById('heroPrev');
  const heroNext = document.getElementById('heroNext');
  const heroEyebrowEl = document.getElementById('heroEyebrow');
  const heroTitleEl = document.getElementById('heroTitle');
  const heroDescEl = document.getElementById('heroDesc');
  const heroPrimaryCta = document.getElementById('heroPrimaryCta');
  const heroSecondaryCta = document.getElementById('heroSecondaryCta');
  const heroLiveRegion = document.getElementById('heroLiveRegion');
  const heroSection = document.getElementById('hero');
  const heroContent = document.querySelector('.hero-content');

  let heroIndex = 0;
  let heroTimer = null;

  function heroViewportKey() {
    if (window.innerWidth <= 640) return 'mobile';
    if (window.innerWidth <= 1024) return 'tablet';
    return 'desktop';
  }

  function applyHeroMedia() {
    const key = heroViewportKey();
    heroBgSlides.forEach((el, index) => {
      const image = el.querySelector('img');
      if (image) image.style.objectPosition = HERO_SLIDES[index].focus[key];
    });
    const current = HERO_SLIDES[heroIndex];
    if (current && heroTitleEl) heroTitleEl.innerHTML = current.title[key];
  }

  function renderHeroSlide(i, { announce = true } = {}) {
    heroIndex = (i + HERO_SLIDES.length) % HERO_SLIDES.length;
    const slide = HERO_SLIDES[heroIndex];

    heroBgSlides.forEach((el) => el.classList.toggle('is-active', +el.dataset.slide === heroIndex));
    heroDots.forEach((el) => {
      const active = +el.getAttribute('data-slide') === heroIndex;
      el.classList.toggle('is-active', active);
      el.setAttribute('aria-selected', String(active));
    });

    heroEyebrowEl.textContent = slide.eyebrow;
    heroTitleEl.innerHTML = slide.title[heroViewportKey()];
    heroDescEl.textContent = slide.desc;
    heroPrimaryCta.textContent = slide.primary.label;
    heroSecondaryCta.textContent = slide.secondary.label;

    if (!reducedMotion && heroContent) {
      heroContent.classList.remove('is-entering');
      window.requestAnimationFrame(() => heroContent.classList.add('is-entering'));
    }

    if (announce && heroLiveRegion) heroLiveRegion.textContent = `${heroIndex + 1}번째 슬라이드: ${slide.eyebrow}`;
  }

  function startHeroAutoplay() {
    if (reducedMotion) return;
    stopHeroAutoplay();
    heroTimer = window.setInterval(() => renderHeroSlide(heroIndex + 1), 6500);
  }
  function stopHeroAutoplay() {
    if (heroTimer) window.clearInterval(heroTimer);
    heroTimer = null;
  }
  function userChangeSlide(i) {
    renderHeroSlide(i);
    startHeroAutoplay();
  }

  if (heroBgSlides.length) {
    renderHeroSlide(0, { announce: false });
    startHeroAutoplay();

    heroDots.forEach((dot) => dot.addEventListener('click', () => userChangeSlide(+dot.getAttribute('data-slide'))));
    if (heroPrev) heroPrev.addEventListener('click', () => userChangeSlide(heroIndex - 1));
    if (heroNext) heroNext.addEventListener('click', () => userChangeSlide(heroIndex + 1));
    if (heroSection) {
      heroSection.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') userChangeSlide(heroIndex - 1);
        if (e.key === 'ArrowRight') userChangeSlide(heroIndex + 1);
      });
      heroSection.addEventListener('mouseenter', stopHeroAutoplay);
      heroSection.addEventListener('mouseleave', startHeroAutoplay);
      heroSection.addEventListener('focusin', stopHeroAutoplay);
      heroSection.addEventListener('focusout', startHeroAutoplay);
    }
    applyHeroMedia();
    let heroBreakpoint = heroViewportKey();
    window.addEventListener('resize', () => {
      const next = heroViewportKey();
      if (next !== heroBreakpoint) { heroBreakpoint = next; applyHeroMedia(); }
    }, { passive: true });
  }

  /* =========================================================
     진단 CTA 유입정보 + 단일 진단 폼
     ========================================================= */
  const diagSelector = document.getElementById('diagSelector');
  const diagCards = document.querySelectorAll('.diag-card');
  const diagnosisPanel = document.getElementById('diagnosisPanel');
  const diagPanelTitle = document.getElementById('diagPanelTitle');
  const diagPanelResult = document.getElementById('diagPanelResult');
  const diagnosisForm = document.getElementById('diagnosisForm');
  const formStatus = document.getElementById('formStatus');

  const inquiryTypeField = document.getElementById('inquiryType');
  const planField = document.getElementById('planField');
  const termField = document.getElementById('termField');
  const sourceSectionField = document.getElementById('sourceSectionField');
  const sourceCTAField = document.getElementById('sourceCTAField');
  const heroSlideField = document.getElementById('heroSlideField');
  const selectedDiagnosisField = document.getElementById('selectedDiagnosisField');
  const selectedPlanField = document.getElementById('selectedPlanField');
  const selectedTermField = document.getElementById('selectedTermField');
  const selectedMonthlyPriceField = document.getElementById('selectedMonthlyPriceField');
  const selectedPlanCtaField = document.getElementById('selectedPlanCtaField');
  const selectedOptionField = document.getElementById('selectedOptionField');
  const diagnosisSelectionSummary = document.getElementById('diagnosisSelectionSummary');

  const DIAG_CONFIG = {
    place: { fieldsetId: 'fieldsetPlace', title: '플레이스 무료점검', result: '검색 노출, 사진·메뉴 정보, 예약·문의 흐름을 점검해 현재 문제와 우선 개선항목을 안내해드립니다.', inquiry: '네이버 플레이스 무료점검' },
    sns: { fieldsetId: 'fieldsetSns', title: 'SNS 통합진단', result: '운영 중인 채널과 콘텐츠 흐름을 확인해 채널별 문제와 운영 우선순위를 안내해드립니다.', inquiry: 'SNS 통합진단' },
    nationwide: { fieldsetId: 'fieldsetNationwide', title: '온라인판매 가능성 점검', result: '메뉴 적합성과 준비 절차를 확인해 판매 가능성과 준비순서를 안내해드립니다.', inquiry: '전국판매 가능성 점검' },
  };
  const ALL_FIELDSET_IDS = Object.values(DIAG_CONFIG).map((c) => c.fieldsetId);

  function setFieldsetActive(fieldsetId, isActive) {
    const fieldset = document.getElementById(fieldsetId);
    if (!fieldset) return;
    fieldset.hidden = !isActive;
    fieldset.disabled = !isActive;
  }

  ALL_FIELDSET_IDS.forEach((id) => setFieldsetActive(id, false));

  function renderSelectionSummary() {
    if (!diagnosisSelectionSummary) return;
    const entries = [];
    if (selectedPlanField.value) entries.push(['선택 플랜', selectedPlanField.value]);
    if (selectedTermField.value) entries.push(['계약기간', `${selectedTermField.value}개월`]);
    if (selectedMonthlyPriceField.value) entries.push(['월 이용료', selectedMonthlyPriceField.value]);
    if (selectedOptionField.value) entries.push(['선택 서비스', selectedOptionField.value]);
    diagnosisSelectionSummary.hidden = entries.length === 0;
    diagnosisSelectionSummary.innerHTML = entries.map(([label, value]) => `<span><small>${label}</small><strong>${value}</strong></span>`).join('');
  }

  function setPanelMeta(opts) {
    if (opts.sourceSection != null) sourceSectionField.value = opts.sourceSection;
    if (opts.sourceCTA != null) sourceCTAField.value = opts.sourceCTA;
    if (opts.heroSlide != null) heroSlideField.value = opts.heroSlide;
    if (opts.plan != null) { planField.value = opts.plan; selectedPlanField.value = opts.plan; }
    if (opts.term != null) { termField.value = opts.term; selectedTermField.value = opts.term; }
    if (opts.monthlyPrice != null) selectedMonthlyPriceField.value = opts.monthlyPrice;
    if (opts.planCta != null) selectedPlanCtaField.value = opts.planCta;
    if (opts.selectedOption != null) selectedOptionField.value = opts.selectedOption;
    renderSelectionSummary();
  }

  function selectDiagCard(type) {
    const cfg = DIAG_CONFIG[type];
    if (!cfg) return;
    diagCards.forEach((btn) => btn.setAttribute('aria-expanded', String(btn.getAttribute('data-diag-type') === type)));
    diagSelector.classList.add('has-selection');
    ALL_FIELDSET_IDS.forEach((id) => setFieldsetActive(id, id === cfg.fieldsetId));
    diagPanelTitle.textContent = cfg.title;
    diagPanelResult.textContent = cfg.result;
    inquiryTypeField.value = cfg.inquiry;
    selectedDiagnosisField.value = type;
    diagnosisPanel.hidden = false;
    renderSelectionSummary();
  }

  function showPlanPanel() {
    diagCards.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
    diagSelector.classList.remove('has-selection');
    ALL_FIELDSET_IDS.forEach((id) => setFieldsetActive(id, false));
    diagPanelTitle.textContent = '서비스 플랜 상담';
    diagPanelResult.textContent = '선택하신 플랜에 맞는 운영 범위를 확인한 뒤 상담해드립니다.';
    inquiryTypeField.value = '서비스 플랜 상담';
    selectedDiagnosisField.value = '';
    diagnosisPanel.hidden = false;
    renderSelectionSummary();
  }

  function showOptionPanel() {
    diagCards.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
    diagSelector.classList.remove('has-selection');
    ALL_FIELDSET_IDS.forEach((id) => setFieldsetActive(id, false));
    diagPanelTitle.textContent = '맘커뮤니티 후기·핫딜 확산 상담';
    diagPanelResult.textContent = '실제 후기와 실제 혜택을 기반으로 운영할 지역·일정·유형을 확인해 상담합니다.';
    inquiryTypeField.value = '선택형 서비스 상담';
    selectedDiagnosisField.value = '';
    diagnosisPanel.hidden = false;
    renderSelectionSummary();
  }

  function openDiagnosisPanel(opts = {}) {
    if (opts.type !== 'plan') {
      planField.value = '';
      selectedPlanField.value = '';
      selectedTermField.value = '';
      selectedMonthlyPriceField.value = '';
      selectedPlanCtaField.value = '';
    }
    if (opts.type !== 'option') selectedOptionField.value = '';
    setPanelMeta(opts);
    if (opts.type === 'plan') showPlanPanel();
    else if (opts.type === 'option') showOptionPanel();
    else if (opts.type) selectDiagCard(opts.type);

    window.requestAnimationFrame(() => {
      const target = !diagnosisPanel.hidden ? diagnosisPanel : document.getElementById('diagnosis');
      scrollToEl(target);
    });
  }

  diagCards.forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-diag-type');
      openDiagnosisPanel({ type, sourceSection: 'diagnosis', sourceCTA: 'diag-card-' + type });
    });
  });

  document.querySelectorAll('[data-diagnosis-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sourceSection = btn.closest('section') ? btn.closest('section').id : 'header';
      openDiagnosisPanel({ sourceSection, sourceCTA: btn.getAttribute('data-source-cta') || '' });
    });
  });

  const nationwideDiagCta = document.getElementById('nationwideDiagCta');
  if (nationwideDiagCta) nationwideDiagCta.addEventListener('click', () => openDiagnosisPanel({ type: 'nationwide', sourceSection: 'nationwide-sales', sourceCTA: 'nationwide-sales-cta' }));
  const snsDiagCta = document.getElementById('snsDiagCta');
  if (snsDiagCta) snsDiagCta.addEventListener('click', () => openDiagnosisPanel({ type: 'sns', sourceSection: 'why-sns', sourceCTA: 'why-sns-cta' }));
  const finalPlaceCta = document.getElementById('finalPlaceCta');
  if (finalPlaceCta) finalPlaceCta.addEventListener('click', () => openDiagnosisPanel({ type: 'place', sourceSection: 'final-cta', sourceCTA: 'final-place' }));
  const finalSnsCta = document.getElementById('finalSnsCta');
  if (finalSnsCta) finalSnsCta.addEventListener('click', () => openDiagnosisPanel({ type: 'sns', sourceSection: 'final-cta', sourceCTA: 'final-sns' }));
  const finalNationwideCta = document.getElementById('finalNationwideCta');
  if (finalNationwideCta) finalNationwideCta.addEventListener('click', () => openDiagnosisPanel({ type: 'nationwide', sourceSection: 'final-cta', sourceCTA: 'final-nationwide' }));
  const momCommunityCta = document.getElementById('momCommunityCta');
  if (momCommunityCta) momCommunityCta.addEventListener('click', () => openDiagnosisPanel({
    type: 'option',
    selectedOption: '맘커뮤니티 후기·핫딜 확산',
    sourceSection: 'service-plan',
    sourceCTA: '맘커뮤니티 확산 운영 상담',
  }));

  if (heroPrimaryCta) {
    heroPrimaryCta.addEventListener('click', () => {
      const slide = HERO_SLIDES[heroIndex];
      openDiagnosisPanel({
        type: slide.primary.diagnosisType,
        sourceSection: 'hero',
        sourceCTA: 'hero-primary-' + slide.id,
        heroSlide: slide.id,
      });
    });
  }
  if (heroSecondaryCta) {
    heroSecondaryCta.addEventListener('click', () => scrollToId(HERO_SLIDES[heroIndex].secondary.target));
  }

  /* 즉석판매제조가공업 신고 "없음"일 때만 현재 영업형태 노출 */
  const businessTypeRow = document.getElementById('ncBusinessTypeRow');
  if (businessTypeRow) {
    document.querySelectorAll('input[name="foodMfgReport"]').forEach((radio) => {
      radio.addEventListener('change', () => { businessTypeRow.hidden = radio.value !== '없음'; });
    });
  }

  /* ---------- 구글폼 연동 제출 (기존 endpoint·field name 유지) ---------- */
  const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLScP5FnNGQbpHRVy5_fFzDju0I0FiSq36ajaP3aOo3s8UUx_hA/formResponse';
  const GOOGLE_FORM_FIELDS = {
    storeName: 'entry.113098425',
    storeArea: 'entry.1254021817',
    phone: 'entry.601816022',
    onlineSales: 'entry.1558172882',
    message: 'entry.1781088824',
  };
  const GOOGLE_FORM_CATEGORY_ENTRY = ''; // 구분값 entry.ID 등록 시 채워 넣는다
  const hiddenIframe = document.getElementById('hiddenFormTarget');

  function submitToGoogleForm(data, category, { onFinish } = {}) {
    const gForm = document.createElement('form');
    gForm.action = GOOGLE_FORM_ACTION;
    gForm.method = 'POST';
    gForm.target = 'hiddenFormTarget';
    gForm.style.display = 'none';
    Object.entries(GOOGLE_FORM_FIELDS).forEach(([key, entry]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = entry;
      input.value = (data.get(key) || '').toString();
      gForm.appendChild(input);
    });
    if (GOOGLE_FORM_CATEGORY_ENTRY && category) {
      const categoryInput = document.createElement('input');
      categoryInput.type = 'hidden';
      categoryInput.name = GOOGLE_FORM_CATEGORY_ENTRY;
      categoryInput.value = category;
      gForm.appendChild(categoryInput);
    }
    let finished = false;
    const finish = () => { if (finished) return; finished = true; hiddenIframe.removeEventListener('load', finish); if (onFinish) onFinish(); };
    hiddenIframe.addEventListener('load', finish, { once: true });
    document.body.appendChild(gForm);
    gForm.submit();
    document.body.removeChild(gForm);
    window.setTimeout(finish, 3000);
  }

  const NATIONAL_CHECK_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwiFxOMP-nPOJK_KIOEOaB6SfaktJz8b9EPmlSRKtyx85pnrlhMdtXqTt1wpVurmaxf/exec';

  function resetDiagnosisFormFields() {
    diagnosisForm.reset();
    renderSelectionSummary();
  }

  function buildSubmissionContext(data) {
    const keys = [
      ['문의유형', 'inquiryType'],
      ['유입섹션', 'sourceSection'],
      ['유입CTA', 'sourceCTA'],
      ['HERO슬라이드', 'heroSlide'],
      ['선택진단', 'selectedDiagnosis'],
      ['선택플랜', 'selectedPlan'],
      ['선택기간', 'selectedTerm'],
      ['월이용료', 'selectedMonthlyPrice'],
      ['플랜CTA', 'selectedPlanCta'],
      ['선택서비스', 'selectedOption'],
    ];
    return keys.map(([label, key]) => {
      const value = (data.get(key) || '').toString().trim();
      return value ? `${label}: ${value}` : '';
    }).filter(Boolean).join('\n');
  }

  if (diagnosisForm) {
    diagnosisForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(diagnosisForm);
      const get = (key) => (data.get(key) || '').toString().trim();
      const inquiryType = get('inquiryType');
      const storeName = get('storeName');
      const storeArea = get('storeArea');
      const phone = get('phone');
      const consent = diagnosisForm.querySelector('#privacyConsent').checked;

      if (!inquiryType || !storeName || !storeArea || !phone || !consent) {
        formStatus.textContent = '필수 항목(*)을 모두 입력하고 개인정보 수집·이용에 동의해주세요.';
        formStatus.className = 'form-status is-error';
        return;
      }

      const originalMessage = get('message');
      const submissionContext = buildSubmissionContext(data);
      data.set('message', [originalMessage, submissionContext ? `[유입·선택정보]\n${submissionContext}` : ''].filter(Boolean).join('\n\n'));

      const submitBtn = diagnosisForm.querySelector('.form-submit');
      const selectedType = get('selectedDiagnosis');

      if (selectedType === 'nationwide') {
        const ncRequired = ['bizNum', 'foodMfgReport', 'onlineSalesReport', 'spaceSeparation', 'healthCert', 'hygieneEdu', 'operatingPeriod', 'menu1', 'menu1Price'];
        if (ncRequired.some((key) => !get(key))) {
          formStatus.textContent = '전국판매 점검에 필요한 필수 항목을 모두 입력해주세요.';
          formStatus.className = 'form-status is-error';
          return;
        }
        const payload = {
          매장명: storeName, 지역: storeArea, 연락처: phone,
          사업자등록여부: get('bizNum'), 즉석판매제조가공업여부: get('foodMfgReport'), 통신판매업여부: get('onlineSalesReport'),
          현재영업형태: get('businessType'), 공간분리가능여부: get('spaceSeparation'), 보건증: get('healthCert'), 위생교육: get('hygieneEdu'),
          대표메뉴1: get('menu1'), 대표메뉴1가격: get('menu1Price'), 대표메뉴2: get('menu2'), 대표메뉴2가격: get('menu2Price'),
          대표메뉴3: get('menu3'), 대표메뉴3가격: get('menu3Price'), 포장비: get('packagingCost'), 배송비부담주체: get('deliveryCostBy'),
          운영기간: get('operatingPeriod'), 강점스토리: get('storyStrength'),
          문의유형: get('inquiryType'), 유입섹션: get('sourceSection'), 유입CTA: get('sourceCTA'), HERO슬라이드: get('heroSlide'),
          선택진단: get('selectedDiagnosis'), 선택플랜: get('selectedPlan'), 선택기간: get('selectedTerm'), 월이용료: get('selectedMonthlyPrice'),
          플랜CTA: get('selectedPlanCta'), 선택서비스: get('selectedOption'), 추가메시지: originalMessage,
        };
        submitBtn.disabled = true;
        formStatus.textContent = '전송 중입니다...';
        formStatus.className = 'form-status';
        fetch(NATIONAL_CHECK_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) })
          .then((res) => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            formStatus.textContent = '온라인판매 가능성 점검 신청이 접수되었습니다. 빠르게 연락드릴게요!';
            formStatus.className = 'form-status is-success';
            submitBtn.disabled = false;
            resetDiagnosisFormFields();
          })
          .catch(() => {
            formStatus.textContent = '전송에 실패했습니다. 잠시 후 다시 시도해주세요.';
            formStatus.className = 'form-status is-error';
            submitBtn.disabled = false;
          });
        return;
      }

      submitBtn.disabled = true;
      formStatus.textContent = '전송 중입니다...';
      formStatus.className = 'form-status';
      submitToGoogleForm(data, inquiryType, {
        onFinish: () => {
          formStatus.textContent = `${inquiryType} 신청이 접수되었습니다. 빠르게 연락드릴게요!`;
          formStatus.className = 'form-status is-success';
          submitBtn.disabled = false;
          resetDiagnosisFormFields();
        },
      });
    });
  }

  /* ---------- 모바일 고정 CTA: HERO 통과 후 노출, 폼 입력 중·Footer 노출 시 숨김 ---------- */
  const mobileFixedCta = document.getElementById('mobileFixedCta');
  let heroPassed = false, footerVisible = false, formFocused = false, submitVisible = false, keyboardOpen = false;
  function updateMobileCtaVisibility() {
    if (!mobileFixedCta) return;
    mobileFixedCta.classList.toggle('is-hidden', !(heroPassed && !footerVisible && !formFocused && !submitVisible && !keyboardOpen));
  }
  if (mobileFixedCta && window.IntersectionObserver) {
    if (heroSection) {
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => { heroPassed = !entry.isIntersecting; updateMobileCtaVisibility(); });
      }, { threshold: 0 }).observe(heroSection);
    }
    const footerEl = document.querySelector('.site-footer');
    if (footerEl) {
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => { footerVisible = entry.isIntersecting; updateMobileCtaVisibility(); });
      }, { threshold: 0 }).observe(footerEl);
    }
    if (diagnosisForm) {
      diagnosisForm.addEventListener('focusin', () => { formFocused = true; updateMobileCtaVisibility(); });
      diagnosisForm.addEventListener('focusout', () => { formFocused = false; updateMobileCtaVisibility(); });
      const submitButton = diagnosisForm.querySelector('.form-submit');
      if (submitButton) {
        new IntersectionObserver((entries) => {
          entries.forEach((entry) => { submitVisible = entry.isIntersecting; updateMobileCtaVisibility(); });
        }, { threshold: 0.1 }).observe(submitButton);
      }
    }
    if (window.visualViewport) {
      const onViewportChange = () => {
        keyboardOpen = window.visualViewport.height < window.innerHeight * 0.78;
        updateMobileCtaVisibility();
      };
      window.visualViewport.addEventListener('resize', onViewportChange, { passive: true });
      onViewportChange();
    }
    updateMobileCtaVisibility();
  }

  /* ---------- FAQ 아코디언 ---------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = q.getAttribute('aria-expanded') === 'true';
      q.setAttribute('aria-expanded', String(!isOpen));
      a.hidden = isOpen;
    });
  });

  /* ---------- 대시보드: 탭 전환 ---------- */
  const dashTabs = document.querySelectorAll('.dash-tab');
  const dashShotImg = document.getElementById('dashShotImg');
  const dashShotDesc = document.getElementById('dashShotDesc');
  const DASH_SHOTS = {
    'dash-roadmap': { src: 'assets/dashboard-preview/dashboard-1-score-roadmap.JPEG', alt: '로드맵 화면', desc: '프로젝트의 현재 단계와 다음 실행 항목을 한눈에 확인합니다.' },
    'dash-monthly': { src: 'assets/dashboard-preview/dashboard-2-monthly-performance.JPEG', alt: '월간성과 화면', desc: '월간 게시·반응·성과 흐름을 확인하고 다음 콘텐츠 개선에 반영합니다.' },
    'dash-calendar': { src: 'assets/dashboard-preview/dashboard-3-calendar.JPEG', alt: '운영 캘린더 화면', desc: '기획·제작·검수·게시 일정을 캘린더에서 확인합니다.' },
    'dash-menu': { src: 'assets/dashboard-preview/dashboard-4-menu-board.JPEG', alt: '메뉴단가·소통게시판 화면', desc: '메뉴정보와 소통 내용을 같은 운영화면에서 관리합니다.' },
    'dash-login': { src: 'assets/dashboard-preview/login-screenshot.JPEG', alt: '로그인 화면', desc: '계약 고객은 전용 로그인으로 운영현황 화면에 접근합니다.' },
  };
  if (dashTabs.length && dashShotImg) {
    dashTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        dashTabs.forEach((t) => { t.classList.toggle('is-active', t === tab); t.setAttribute('aria-selected', String(t === tab)); });
        const shot = DASH_SHOTS[tab.getAttribute('data-target')];
        if (shot) {
          dashShotImg.src = shot.src;
          dashShotImg.alt = shot.alt;
          if (dashShotDesc) dashShotDesc.textContent = shot.desc;
        }
      });
    });
  }

  /* ---------- 스크롤 리빌 애니메이션 (critical content는 대상에서 제외) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && window.IntersectionObserver) {
    document.documentElement.classList.add('reveal-ready');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el, i) => { el.style.transitionDelay = (i % 5) * 50 + 'ms'; revealObserver.observe(el); });
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Proof 수치: 실제 값에서 정확히 멈추는 1회 count-up ---------- */
  const proofSection = document.getElementById('proof-cases');
  const proofCountEls = document.querySelectorAll('[data-count-final]');
  function animateProofCount(el) {
    if (el.dataset.counted === 'true') return;
    el.dataset.counted = 'true';
    const finalText = el.getAttribute('data-count-final');
    const hasPlus = finalText.startsWith('+');
    const hasK = finalText.endsWith('K');
    const target = Number(finalText.replace(/[+K]/g, ''));
    const decimals = finalText.includes('.') ? 1 : 0;
    const startedAt = performance.now();
    const duration = 900;
    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      const value = decimals ? current.toFixed(decimals) : Math.round(current).toString();
      el.textContent = `${hasPlus ? '+' : ''}${value}${hasK ? 'K' : ''}`;
      if (progress < 1) window.requestAnimationFrame(tick);
      else el.textContent = finalText;
    };
    window.requestAnimationFrame(tick);
  }
  if (proofSection && proofCountEls.length && !reducedMotion && window.IntersectionObserver) {
    const proofObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        proofCountEls.forEach(animateProofCount);
        proofObserver.disconnect();
      }
    }, { threshold: 0.25 });
    proofObserver.observe(proofSection);
  }

  /* =========================================================
     서비스 플랜 — 기간선택 → 4플랜 요약비교 → 선택플랜 상세 → 공통제공
     data/proposals/_common.json 단일 소스. 카드 전체 재생성 없이 가격
     텍스트만 갱신해 6개월 계약 전환 시 카드가 사라지는 문제를 원천 차단한다.
     ========================================================= */
  const planTermToggle = document.getElementById('planTermToggle');
  const planVatLabel = document.getElementById('planVatLabel');
  const planSummaryGrid = document.getElementById('planSummaryGrid');
  const planDetail = document.getElementById('planDetail');

  if (planTermToggle && planSummaryGrid && planDetail) {
    let planState = { term: 12, items: [], highlight: 'PERFORMANCE', selected: 'PERFORMANCE', vatLabel: 'VAT 별도' };

    function escHtml(str) {
      return (str == null ? '' : String(str)).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function manwon(n) { return Math.round(n / 10000) + '만원'; }
    function planPriceFor(p, term) {
      const v = p.prices ? p.prices[String(term)] : null;
      return v != null ? v : p.price_krw;
    }

    function renderPlanSummary() {
      planSummaryGrid.innerHTML = planState.items.map((p) => {
        const isHighlight = p.id === planState.highlight;
        return `
        <button type="button" class="plan-summary-card${isHighlight ? ' is-highlight' : ''}" data-plan-id="${escHtml(p.id)}" aria-pressed="false">
          ${isHighlight ? '<span class="plan-summary-badge">TIGER 추천</span>' : ''}
          <p class="plan-summary-name">${escHtml(p.name)}</p>
          <p class="plan-summary-price" data-price-for="${escHtml(p.id)}">${manwon(planPriceFor(p, planState.term))}<span>/월</span></p>
          <p class="plan-summary-qty">쇼츠 ${p.shorts} · 카드뉴스 ${p.card_news}</p>
        </button>`;
      }).join('');
      planSummaryGrid.querySelectorAll('.plan-summary-card').forEach((btn) => {
        btn.addEventListener('click', () => selectPlanDetail(btn.getAttribute('data-plan-id')));
      });
      syncSummarySelection();
    }

    function syncSummarySelection() {
      planSummaryGrid.querySelectorAll('.plan-summary-card').forEach((btn) => {
        const active = btn.getAttribute('data-plan-id') === planState.selected;
        btn.classList.toggle('is-selected', active);
        btn.setAttribute('aria-pressed', String(active));
      });
    }

    function updatePlanPrices() {
      planState.items.forEach((p) => {
        const el = planSummaryGrid.querySelector(`[data-price-for="${p.id}"]`);
        if (el) el.innerHTML = `${manwon(planPriceFor(p, planState.term))}<span>/월</span>`;
      });
      renderPlanDetail(planState.selected);
    }

    function selectPlanDetail(planId) {
      planState.selected = planId;
      syncSummarySelection();
      renderPlanDetail(planId);
    }

    function renderPlanDetail(planId) {
      const p = planState.items.find((x) => x.id === planId);
      if (!p) return;
      planDetail.innerHTML = `
        <p class="plan-detail-name">${escHtml(p.name)}</p>
        <p class="plan-detail-desire">${escHtml(p.desire || '')}</p>
        <p class="plan-detail-price">${manwon(planPriceFor(p, planState.term))}<span>/월 · ${escHtml(planState.vatLabel)}</span></p>
        <p class="plan-detail-qty">쇼츠 ${p.shorts}편 · 카드뉴스 ${p.card_news}건 · Threads ${p.threads}건 · 블로그 ${p.blog}건</p>
        <ul class="plan-detail-list">${(p.included || []).map((l) => `<li>${escHtml(l)}</li>`).join('')}</ul>
        ${p.reason ? `<p class="plan-detail-reason">${escHtml(p.reason)}</p>` : ''}
        <button type="button" class="btn btn-primary plan-detail-cta" id="planDetailCtaBtn">${escHtml(p.cta_label || '상담하기')}</button>`;
      const ctaBtn = document.getElementById('planDetailCtaBtn');
      if (ctaBtn) ctaBtn.addEventListener('click', () => {
        openDiagnosisPanel({
          type: 'plan',
          plan: p.id,
          term: planState.term,
          monthlyPrice: `${manwon(planPriceFor(p, planState.term))}/월 · ${planState.vatLabel}`,
          planCta: p.cta_label || '상담하기',
          sourceSection: 'service-plan',
          sourceCTA: 'plan-cta-' + p.id,
        });
      });
    }

    function setTerm(term) {
      planState.term = term;
      planTermToggle.querySelectorAll('button').forEach((btn) => {
        const active = Number(btn.getAttribute('data-term')) === term;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
      updatePlanPrices();
    }

    fetch('/data/proposals/_common.json')
      .then((res) => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then((common) => {
        const plans = common.plans || {};
        const featureRows = plans.feature_rows || [];
        const commonRowCount = 3; /* SNS 채널 운영 / 플랫폼 업로드 / 콘텐츠 기획은 공통 섹션에서 한 번만 표시 */
        const items = (plans.items || []).map((p, i) => ({
          ...p,
          included: featureRows.slice(commonRowCount).filter((row) => row.values[i]).map((row) => row.label),
        }));
        const terms = plans.terms || [{ months: 12, label: '12개월 계약' }, { months: 6, label: '6개월 계약' }];
        const defaultTerm = plans.default_term_months || 12;

        planState = { term: defaultTerm, items, highlight: 'PERFORMANCE', selected: 'PERFORMANCE', vatLabel: plans.vat_label || 'VAT 별도' };

        planTermToggle.innerHTML = terms.map((t) => `
          <button type="button" data-term="${t.months}" class="${t.months === defaultTerm ? 'is-active' : ''}" aria-pressed="${t.months === defaultTerm}">${escHtml(t.label)}</button>`).join('');
        planTermToggle.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => setTerm(Number(btn.getAttribute('data-term')))));

        if (planVatLabel) planVatLabel.textContent = '월 이용료 · ' + planState.vatLabel;

        renderPlanSummary();
        renderPlanDetail(planState.selected);
      })
      .catch((err) => {
        console.error('요금제 데이터를 불러오지 못했습니다.', err);
        planSummaryGrid.innerHTML = '<p class="plan-grid-error">요금제 정보를 불러오지 못했습니다. 상담 시 확인해 주세요.</p>';
      });
  }
})();
