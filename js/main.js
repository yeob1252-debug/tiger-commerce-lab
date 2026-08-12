(() => {
  'use strict';

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

  /* ---------- 헤더 모바일 메뉴 ---------- */
  const headerMenuBtn = document.getElementById('headerMenuBtn');
  const headerMobileNav = document.getElementById('headerMobileNav');
  if (headerMenuBtn && headerMobileNav) {
    headerMenuBtn.addEventListener('click', () => {
      const isOpen = headerMenuBtn.getAttribute('aria-expanded') === 'true';
      headerMenuBtn.setAttribute('aria-expanded', String(!isOpen));
      headerMobileNav.hidden = isOpen;
    });
    headerMobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        headerMenuBtn.setAttribute('aria-expanded', 'false');
        headerMobileNav.hidden = true;
      });
    });
  }

  /* ---------- 스크롤 이동 (data-scroll-to) ---------- */
  function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.querySelectorAll('[data-scroll-to]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToId(btn.getAttribute('data-scroll-to'));
    });
  });

  /* ---------- HERO: 5장 crossfade ---------- */
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots = document.querySelectorAll('.hero-dot');
  const heroPrev = document.getElementById('heroPrev');
  const heroNext = document.getElementById('heroNext');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroSlides.length) {
    let heroIndex = 0;
    let heroTimer = null;

    function showHeroStep(i) {
      heroIndex = (i + heroSlides.length) % heroSlides.length;
      heroSlides.forEach((el) => el.classList.toggle('is-active', +el.dataset.step === heroIndex));
      heroDots.forEach((el) => el.classList.toggle('is-active', +el.getAttribute('data-step') === heroIndex));
    }
    function startHeroAutoplay() {
      if (reducedMotion) return;
      stopHeroAutoplay();
      heroTimer = window.setInterval(() => showHeroStep(heroIndex + 1), 6000);
    }
    function stopHeroAutoplay() {
      if (heroTimer) window.clearInterval(heroTimer);
      heroTimer = null;
    }

    heroDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        showHeroStep(+dot.getAttribute('data-step'));
        startHeroAutoplay();
      });
    });
    if (heroPrev) heroPrev.addEventListener('click', () => { showHeroStep(heroIndex - 1); startHeroAutoplay(); });
    if (heroNext) heroNext.addEventListener('click', () => { showHeroStep(heroIndex + 1); startHeroAutoplay(); });

    startHeroAutoplay();
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

  /* ---------- 대시보드: 탭 전환 (실제 화면 스크린샷) ---------- */
  const dashTabs = document.querySelectorAll('.dash-tab');
  const dashShotImg = document.getElementById('dashShotImg');
  const DASH_SHOTS = {
    'dash-roadmap': { src: 'assets/dashboard-preview/dashboard-1-score-roadmap.JPEG', alt: '로드맵 화면' },
    'dash-monthly': { src: 'assets/dashboard-preview/dashboard-2-monthly-performance.JPEG', alt: '월간성과 화면' },
    'dash-calendar': { src: 'assets/dashboard-preview/dashboard-3-calendar.JPEG', alt: '운영 캘린더 화면' },
    'dash-menu': { src: 'assets/dashboard-preview/dashboard-4-menu-board.JPEG', alt: '메뉴단가·소통게시판 화면' },
    'dash-login': { src: 'assets/dashboard-preview/login-screenshot.JPEG', alt: '로그인 화면' },
  };
  if (dashTabs.length && dashShotImg) {
    dashTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        dashTabs.forEach((t) => {
          t.classList.toggle('is-active', t === tab);
          t.setAttribute('aria-selected', String(t === tab));
        });
        const shot = DASH_SHOTS[tab.getAttribute('data-target')];
        if (shot) {
          dashShotImg.src = shot.src;
          dashShotImg.alt = shot.alt;
        }
      });
    });
  }

  /* ---------- 스크롤 리빌 애니메이션 (critical content는 대상에서 제외) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && window.IntersectionObserver) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = (i % 5) * 50 + 'ms';
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- 진단 유형 → 문의폼 연동 (문의유형 select + 조건부 필드 표시) ---------- */
  const inquiryTypeSelect = document.getElementById('inquiryType');
  const standardPanel = document.getElementById('standardPanel');
  const nationalPanel = document.getElementById('nationalPanel');

  function updateInquiryConditional() {
    if (!inquiryTypeSelect) return;
    const isNational = inquiryTypeSelect.value === '전국판매 가능성 점검';
    if (nationalPanel) nationalPanel.hidden = !isNational;
    if (standardPanel) standardPanel.hidden = isNational;
  }
  if (inquiryTypeSelect) {
    inquiryTypeSelect.addEventListener('change', updateInquiryConditional);
    updateInquiryConditional();
  }

  function setInquiryType(value) {
    if (!inquiryTypeSelect) return;
    inquiryTypeSelect.value = value;
    updateInquiryConditional();
  }

  /* 즉석판매제조가공업 신고가 "없음"일 때만 현재 영업형태 질문을 보여준다 */
  const businessTypeRow = document.getElementById('ncBusinessTypeRow');
  if (businessTypeRow) {
    document.querySelectorAll('input[name="foodMfgReport"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        businessTypeRow.hidden = radio.value !== '없음';
      });
    });
  }

  /* ---------- 진단 카드 클릭 → #contact로 이동 + 문의유형 prefill ---------- */
  document.querySelectorAll('.diag-card').forEach((card) => {
    card.addEventListener('click', () => {
      setInquiryType(card.getAttribute('data-inquiry'));
      scrollToId('contact');
    });
  });

  /* ---------- 구글폼 연동 제출 (기존 상담 폼 endpoint — field name 변경 없음) ---------- */
  const GOOGLE_FORM_ACTION =
    'https://docs.google.com/forms/d/e/1FAIpQLScP5FnNGQbpHRVy5_fFzDju0I0FiSq36ajaP3aOo3s8UUx_hA/formResponse';
  const GOOGLE_FORM_FIELDS = {
    storeName: 'entry.113098425',
    storeArea: 'entry.1254021817',
    phone: 'entry.601816022',
    onlineSales: 'entry.1558172882',
    message: 'entry.1781088824',
  };
  /* 신청 유형 구분값을 시트에 남기려면 구글폼 편집 화면에서 "구분" 단답형
     질문을 추가한 뒤, 그 질문의 entry.ID를 아래에 채워 넣어야 한다. */
  const GOOGLE_FORM_CATEGORY_ENTRY = ''; // 예: 'entry.987654321'
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
    const finish = () => {
      if (finished) return;
      finished = true;
      hiddenIframe.removeEventListener('load', finish);
      if (onFinish) onFinish();
    };
    hiddenIframe.addEventListener('load', finish, { once: true });
    document.body.appendChild(gForm);
    gForm.submit();
    document.body.removeChild(gForm);
    window.setTimeout(finish, 3000);
  }

  /* ---------- 전국판매 가능성 점검 endpoint (기존 Apps Script, field name 변경 없음) ---------- */
  const NATIONAL_CHECK_ENDPOINT =
    'https://script.google.com/macros/s/AKfycbwiFxOMP-nPOJK_KIOEOaB6SfaktJz8b9EPmlSRKtyx85pnrlhMdtXqTt1wpVurmaxf/exec';

  /* ---------- 단일 진단/상담 폼 ---------- */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(contactForm);
      const get = (key) => (data.get(key) || '').toString().trim();
      const inquiryType = get('inquiryType');
      const storeName = get('storeName');
      const storeArea = get('storeArea');
      const phone = get('phone');
      const consent = contactForm.querySelector('#privacyConsent').checked;

      if (!inquiryType || !storeName || !storeArea || !phone || !consent) {
        formStatus.textContent = '필수 항목(*)을 모두 입력하고 개인정보 수집·이용에 동의해주세요.';
        formStatus.className = 'form-status is-error';
        return;
      }

      const submitBtn = contactForm.querySelector('.form-submit');

      if (inquiryType === '전국판매 가능성 점검') {
        const ncRequired = ['bizNum', 'foodMfgReport', 'onlineSalesReport', 'spaceSeparation', 'healthCert', 'hygieneEdu', 'operatingPeriod', 'menu1', 'menu1Price'];
        const missing = ncRequired.some((key) => !get(key));
        if (missing) {
          formStatus.textContent = '전국판매 점검에 필요한 필수 항목(*)을 모두 입력해주세요.';
          formStatus.className = 'form-status is-error';
          return;
        }

        const payload = {
          매장명: storeName,
          지역: storeArea,
          연락처: phone,
          사업자등록여부: get('bizNum'),
          즉석판매제조가공업여부: get('foodMfgReport'),
          통신판매업여부: get('onlineSalesReport'),
          현재영업형태: get('businessType'),
          공간분리가능여부: get('spaceSeparation'),
          보건증: get('healthCert'),
          위생교육: get('hygieneEdu'),
          대표메뉴1: get('menu1'),
          대표메뉴1가격: get('menu1Price'),
          대표메뉴2: get('menu2'),
          대표메뉴2가격: get('menu2Price'),
          대표메뉴3: get('menu3'),
          대표메뉴3가격: get('menu3Price'),
          포장비: get('packagingCost'),
          배송비부담주체: get('deliveryCostBy'),
          운영기간: get('operatingPeriod'),
          강점스토리: get('storyStrength'),
        };

        submitBtn.disabled = true;
        formStatus.textContent = '전송 중입니다...';
        formStatus.className = 'form-status';

        fetch(NATIONAL_CHECK_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        })
          .then((res) => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            formStatus.textContent = '전국판매 점검 신청이 접수되었습니다. 빠르게 연락드릴게요!';
            formStatus.className = 'form-status is-success';
            submitBtn.disabled = false;
            contactForm.reset();
            updateInquiryConditional();
          })
          .catch(() => {
            formStatus.textContent = '전송에 실패했습니다. 잠시 후 다시 시도해주세요.';
            formStatus.className = 'form-status is-error';
            submitBtn.disabled = false;
          });
        return;
      }

      const onlineSales = get('onlineSales');
      if (!onlineSales) {
        formStatus.textContent = '현재 온라인 판매 여부를 선택해주세요.';
        formStatus.className = 'form-status is-error';
        return;
      }

      submitBtn.disabled = true;
      formStatus.textContent = '전송 중입니다...';
      formStatus.className = 'form-status';

      submitToGoogleForm(data, inquiryType, {
        onFinish: () => {
          formStatus.textContent = '상담 신청이 접수되었습니다. 빠르게 연락드릴게요!';
          formStatus.className = 'form-status is-success';
          submitBtn.disabled = false;
          contactForm.reset();
          updateInquiryConditional();
        },
      });
    });
  }

  /* ---------- Proposal 페이지에서 넘어온 관심 플랜 prefill ---------- */
  (function prefillFromProposal() {
    let stored = null;
    try { stored = sessionStorage.getItem('tiger_plan_interest'); } catch (e) { /* noop */ }
    if (!stored) return;
    try { sessionStorage.removeItem('tiger_plan_interest'); } catch (e) { /* noop */ }
    const info = JSON.parse(stored);
    const planField = document.getElementById('planField');
    const termField = document.getElementById('termField');
    if (planField) planField.value = info.planId || '';
    if (termField) termField.value = info.term || '';
    const messageEl = document.getElementById('message');
    if (messageEl) {
      const prefix = `[관심 플랜: ${info.planId} / ${info.term}개월 계약] `;
      if (!messageEl.value.startsWith('[관심 플랜:')) messageEl.value = prefix + messageEl.value;
    }
    setInquiryType('서비스 플랜 상담');
  })();

  /* ---------- 요금제 (BASIC/GROWTH/PERFORMANCE/COMMERCE) ----------
     data/proposals/_common.json 단일 소스를 읽어 렌더링한다. 가격을 바꿀 땐
     _common.json 한 곳만 고치면 홈페이지·Proposal에 함께 반영된다.
     주의: plan-card는 항상 opacity:1(CSS 기본값)이며, 계약기간 토글로
     전체 재렌더링돼도 reveal/IntersectionObserver에 의존하지 않는다
     (6개월 계약 선택 시 카드가 사라지던 버그의 근본 원인이었음). */
  const planGrid = document.getElementById('planGrid');
  const planTermToggle = document.getElementById('planTermToggle');
  const planVatLabel = document.getElementById('planVatLabel');
  const planField = document.getElementById('planField');
  const termField = document.getElementById('termField');

  if (planGrid && planTermToggle) {
    let planState = { term: 12, items: [], highlight: 'PERFORMANCE' };

    function escHtml(str) {
      return (str == null ? '' : String(str)).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
      ));
    }
    function manwonLabel(n) { return Math.round(n / 10000) + '만원'; }
    function planPriceFor(p, term) {
      const v = p.prices ? p.prices[String(term)] : null;
      return (v != null ? v : p.price_krw);
    }

    function renderPlanGrid() {
      planGrid.innerHTML = planState.items.map((p) => {
        const isHighlight = p.id === planState.highlight;
        return `
        <div class="plan-card${isHighlight ? ' is-highlight' : ''}" data-plan-id="${escHtml(p.id)}">
          ${isHighlight ? '<span class="plan-card-badge">TIGER 추천</span>' : ''}
          <h3 class="plan-card-name">${escHtml(p.name)}</h3>
          <p class="plan-card-reason">${escHtml(p.reason || '')}</p>
          <p class="plan-card-price">${manwonLabel(planPriceFor(p, planState.term))}<span>/월</span></p>
          <p class="plan-card-qty">쇼츠 ${p.shorts}편 · 카드뉴스 ${p.card_news}건 · Threads ${p.threads}건 · 블로그 ${p.blog}건</p>
          <ul class="plan-card-list">
            ${(p.included || []).map((label) => `<li>${escHtml(label)}</li>`).join('')}
          </ul>
          <button type="button" class="btn btn-outline plan-card-cta" data-plan-id="${escHtml(p.id)}">이 플랜으로 상담하기</button>
        </div>`;
      }).join('');

      planGrid.querySelectorAll('.plan-card-cta').forEach((btn) => {
        btn.addEventListener('click', () => {
          prefillPlanContact(btn.getAttribute('data-plan-id'), planState.term);
        });
      });
    }

    function setTerm(term) {
      planState.term = term;
      renderPlanGrid();
      planTermToggle.querySelectorAll('button').forEach((btn) => {
        const active = Number(btn.getAttribute('data-term')) === term;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
    }

    function prefillPlanContact(planId, term) {
      if (planField) planField.value = planId;
      if (termField) termField.value = term;
      const messageEl = document.getElementById('message');
      if (messageEl) {
        const prefix = `[관심 플랜: ${planId} / ${term}개월 계약] `;
        if (!messageEl.value.startsWith('[관심 플랜:')) messageEl.value = prefix + messageEl.value;
      }
      setInquiryType('서비스 플랜 상담');
      scrollToId('contact');
    }

    fetch('/data/proposals/_common.json')
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((common) => {
        const plans = common.plans || {};
        const featureRows = plans.feature_rows || [];
        const items = (plans.items || []).map((p, i) => ({
          ...p,
          included: featureRows.filter((row) => row.values[i]).map((row) => row.label),
        }));
        const terms = plans.terms || [{ months: 12, label: '12개월 계약' }, { months: 6, label: '6개월 계약' }];
        const defaultTerm = plans.default_term_months || 12;

        planState = { term: defaultTerm, items, highlight: 'PERFORMANCE' };

        planTermToggle.innerHTML = terms.map((t) => `
          <button type="button" data-term="${t.months}" class="${t.months === defaultTerm ? 'is-active' : ''}" aria-pressed="${t.months === defaultTerm}">${escHtml(t.label)}</button>`).join('');
        planTermToggle.querySelectorAll('button').forEach((btn) => {
          btn.addEventListener('click', () => setTerm(Number(btn.getAttribute('data-term'))));
        });

        if (planVatLabel && plans.vat_label) planVatLabel.textContent = '월 이용료 · ' + plans.vat_label;

        renderPlanGrid();
      })
      .catch((err) => {
        console.error('요금제 데이터를 불러오지 못했습니다.', err);
        planGrid.innerHTML = '<p class="plan-grid-error">요금제 정보를 불러오지 못했습니다. 상담 시 확인해 주세요.</p>';
      });
  }
})();
