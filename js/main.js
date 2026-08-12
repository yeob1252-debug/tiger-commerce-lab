(() => {
  'use strict';

  /* ---------- 뷰포트 크기 헬퍼 ---------- */
  function viewportWidth() {
    return document.documentElement.clientWidth || window.innerWidth;
  }
  function viewportHeight() {
    return document.documentElement.clientHeight || window.innerHeight;
  }

  /* ---------- 연도 ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 헤더 스크롤 상태 + 진행바 ---------- */
  const header = document.getElementById('siteHeader');
  const progress = document.getElementById('scrollProgress');

  function onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('is-scrolled', scrollTop > 20);

    const docHeight = document.documentElement.scrollHeight - viewportHeight();
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progress.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 고정(fixed) 바 너비 보정 ---------- */
  function fixFixedBarWidths() {
    const w = viewportWidth() + 'px';
    const headerEl = document.querySelector('.site-header');
    if (headerEl) headerEl.style.width = w;
  }
  window.addEventListener('resize', fixFixedBarWidths);
  fixFixedBarWidths();

  /* ---------- 스크롤 이동 (data-scroll-to / side-nav) ---------- */
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

  const sideNavDots = document.querySelectorAll('.side-nav-dot');
  sideNavDots.forEach((dot) => {
    dot.addEventListener('click', () => scrollToId(dot.getAttribute('data-target')));
  });

  /* ---------- 사이드 내비 활성 점 ---------- */
  const navSectionIds = ['hero', 'national-check', 'free-check', 'main-service', 'cases', 'process', 'market', 'pricing', 'dashboard-preview', 'contact'];
  const navSections = navSectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (sideNavDots.length && navSections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            sideNavDots.forEach((dot) => {
              dot.classList.toggle('is-active', dot.getAttribute('data-target') === id);
            });
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    navSections.forEach((sec) => navObserver.observe(sec));
  }

  /* ---------- 업무프로세스: 연속 스크롤 진행 스토리 (600vh, sticky 트랙) ----------
     기존 IntersectionObserver 방식은 카드가 threshold를 넘는 순간 한번에
     "몰아서 점등"되는 점프 버그가 있었다. 대신 스크롤 위치에서 진행률을
     실시간으로 계산해 진행바 너비와 활성 카드를 매 프레임 갱신한다.
     899px 이하에서는 CSS가 sticky 트랙을 일반 문서 흐름으로 되돌리므로
     (6장이 100vh 안에 다 안 들어가 뒤쪽 카드가 화면 밖에 갇히는 문제 때문)
     이 스크롤 하이재킹 계산 자체를 데스크톱에서만 돌린다. */
  const processScroll = document.querySelector('.process-scroll');
  const tlCards = document.querySelectorAll('.tl-card');
  const tlFill = document.getElementById('tlFill');
  const desktopProcessMq = window.matchMedia('(min-width: 900px)');
  if (processScroll && tlCards.length && tlFill) {
    function updateProcessScroll() {
      if (!desktopProcessMq.matches) return;
      const rect = processScroll.getBoundingClientRect();
      const total = rect.height - viewportHeight();
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const progress = total > 0 ? scrolled / total : 0;

      tlFill.style.width = (progress * 100) + '%';

      const activeStep = Math.min(Math.floor(progress * tlCards.length), tlCards.length - 1);
      tlCards.forEach((card, i) => {
        card.classList.toggle('active', i === activeStep);
      });
    }
    window.addEventListener('scroll', updateProcessScroll, { passive: true });
    window.addEventListener('resize', updateProcessScroll);
    updateProcessScroll();
  }

  /* ---------- 서비스안내 Phase 아코디언 ---------- */
  const phaseItems = document.querySelectorAll('.phase-item');
  phaseItems.forEach((item) => {
    const head = item.querySelector('.phase-item-head');
    const body = item.querySelector('.phase-item-body');
    head.addEventListener('click', () => {
      const isOpen = head.getAttribute('aria-expanded') === 'true';
      phaseItems.forEach((other) => {
        const otherHead = other.querySelector('.phase-item-head');
        const otherBody = other.querySelector('.phase-item-body');
        if (other !== item) {
          otherHead.setAttribute('aria-expanded', 'false');
          otherBody.hidden = true;
        }
      });
      head.setAttribute('aria-expanded', String(!isOpen));
      body.hidden = isOpen;
    });
  });

  /* ---------- 히어로 스크롤 스토리: 스크롤 위치에 따라 5단계 이미지/캡션 전환 ---------- */
  const scrollstory = document.querySelector('.scrollstory');
  const scrollstoryImgWraps = document.querySelectorAll('.scrollstory__img-wrap');
  const scrollstoryCaptions = document.querySelectorAll('.scrollstory__caption');
  if (scrollstory && scrollstoryImgWraps.length) {
    const steps = scrollstoryImgWraps.length;
    function updateScrollstory() {
      const rect = scrollstory.getBoundingClientRect();
      const total = rect.height - viewportHeight();
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const progress = total > 0 ? scrolled / total : 0;
      const step = Math.min(Math.floor(progress * steps), steps - 1);
      scrollstoryImgWraps.forEach((el) => el.classList.toggle('active', +el.dataset.step === step));
      scrollstoryCaptions.forEach((el) => el.classList.toggle('active', +el.dataset.step === step));
    }
    window.addEventListener('scroll', updateScrollstory, { passive: true });
    window.addEventListener('resize', updateScrollstory);
    updateScrollstory();
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

  /* ---------- 진행사례 카드: 모바일 탭 → active (v2 §13) ---------- */
  const isTouchDevice = window.matchMedia('(max-width: 768px)').matches;
  if (isTouchDevice) {
    document.querySelectorAll('.case-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        document.querySelectorAll('.case-card.is-active').forEach((other) => {
          if (other !== card) other.classList.remove('is-active');
        });
        card.classList.toggle('is-active');
      });
    });
  }

  /* ---------- 모달(찜 고객 vs 팬 고객 비교) ---------- */
  function openModal(modal) {
    modal.hidden = false;
    window.setTimeout(() => modal.classList.add('is-open'), 10);
    document.body.style.overflow = 'hidden';
  }
  function closeModal(modal) {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    window.setTimeout(() => { modal.hidden = true; }, 260);
  }
  document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const modal = document.getElementById(trigger.getAttribute('data-modal-open'));
      if (!modal) return;
      openModal(modal);
    });
  });
  document.querySelectorAll('.modal-overlay').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('[data-modal-close]')) {
        closeModal(modal);
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(modal);
    });
  });

  /* ---------- 스크롤 리빌 애니메이션 ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
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
      el.style.transitionDelay = (i % 5) * 60 + 'ms';
      revealObserver.observe(el);
    });
  }

  /* ---------- 대시보드 화면 카드: 전용 IntersectionObserver로 순차 fly-in ---------- */
  const dashShotCards = document.querySelectorAll('.dash-shot-card');
  if (dashShotCards.length) {
    const dashShotObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            dashShotObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    dashShotCards.forEach((el, i) => {
      el.style.transitionDelay = i * 150 + 'ms';
      dashShotObserver.observe(el);
    });
  }

  /* ---------- 데이터 섹션: 5년 추이 바 차트 + 카운트업 강조 애니메이션 (v2 §10) ---------- */
  const statBlocks = document.querySelectorAll('.market-card, .channel-store-grid, .dash-mock-card');

  function animateCountUp(counter, { duration = 1300, delay = 0 } = {}) {
    const target = parseFloat(counter.getAttribute('data-count-to')) || 0;
    const decimals = parseInt(counter.getAttribute('data-decimals'), 10) || 0;
    window.setTimeout(() => {
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        counter.textContent = (eased * target).toFixed(decimals);
        if (p < 1) {
          requestAnimationFrame(tick);
        } else {
          counter.textContent = target.toFixed(decimals);
          const popEl = counter.closest('.bar-chart-num, .stat-big-number') || counter;
          popEl.classList.remove('is-popping');
          void popEl.offsetWidth;
          popEl.classList.add('is-popping');
        }
      }
      requestAnimationFrame(tick);
    }, delay);
  }

  if (statBlocks.length) {
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          statObserver.unobserve(entry.target);

          entry.target.querySelectorAll('.bar-chart').forEach((chart) => {
            const max = parseFloat(chart.getAttribute('data-max')) || 100;
            chart.querySelectorAll('.bar-chart-row').forEach((row, i) => {
              const bar = row.querySelector('.bar-chart-fill');
              const counter = row.querySelector('.count-up');
              const delay = i * 180;
              if (bar) {
                const value = parseFloat(bar.getAttribute('data-value')) || 0;
                window.setTimeout(() => {
                  bar.style.width = Math.min((value / max) * 100, 100) + '%';
                }, delay);
              }
              if (counter) animateCountUp(counter, { duration: 900, delay });
            });
          });

          const sparkLine = entry.target.querySelector('.dash-mock-spark-line');
          if (sparkLine) {
            const length = sparkLine.getTotalLength();
            sparkLine.style.transition = 'none';
            sparkLine.style.strokeDasharray = length;
            sparkLine.style.strokeDashoffset = length;
            void sparkLine.getBoundingClientRect();
            sparkLine.style.transition = 'stroke-dashoffset 1.4s ease';
            requestAnimationFrame(() => { sparkLine.style.strokeDashoffset = '0'; });
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    statBlocks.forEach((block) => statObserver.observe(block));
  }

  /* ---------- .bar-chart 밖에 홀로 있는 카운트업 숫자 ---------- */
  const standaloneCounters = document.querySelectorAll('.count-up:not(.bar-chart .count-up)');
  if (standaloneCounters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          counterObserver.unobserve(entry.target);
          animateCountUp(entry.target, { duration: 1000 });
        });
      },
      { threshold: 0.6 }
    );
    standaloneCounters.forEach((el) => counterObserver.observe(el));
  }

  /* ---------- 구글폼 연동 제출 (공통 헬퍼) ---------- */
  const GOOGLE_FORM_ACTION =
    'https://docs.google.com/forms/d/e/1FAIpQLScP5FnNGQbpHRVy5_fFzDju0I0FiSq36ajaP3aOo3s8UUx_hA/formResponse';
  const GOOGLE_FORM_FIELDS = {
    storeName: 'entry.113098425',
    storeArea: 'entry.1254021817',
    phone: 'entry.601816022',
    onlineSales: 'entry.1558172882',
    message: 'entry.1781088824',
  };
  /* 신청 유형 구분값("무료 플레이스점검" / "SNS온라인판매 문의")을 시트에 남기려면
     구글폼 편집 화면에서 "구분" 단답형 질문을 추가한 뒤, 그 질문의 entry.ID를
     아래에 채워 넣어야 한다. 비워두면(현재 상태) 이 값은 전송되지 않는다. */
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

  /* ---------- 최종 CTA 문의 폼 ---------- */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(contactForm);
      const storeName = (data.get('storeName') || '').toString().trim();
      const storeArea = (data.get('storeArea') || '').toString().trim();
      const phone = (data.get('phone') || '').toString().trim();
      const onlineSales = (data.get('onlineSales') || '').toString().trim();
      const inquiryType = (data.get('inquiryType') || '').toString().trim();

      if (!storeName || !storeArea || !phone || !onlineSales || !inquiryType) {
        formStatus.textContent = '필수 항목(*)을 모두 입력해주세요.';
        formStatus.className = 'form-status is-error';
        return;
      }

      const submitBtn = contactForm.querySelector('.form-submit');
      submitBtn.disabled = true;
      formStatus.textContent = '전송 중입니다...';
      formStatus.className = 'form-status';

      submitToGoogleForm(data, inquiryType, {
        onFinish: () => {
          formStatus.textContent = '상담 신청이 접수되었습니다. 빠르게 연락드릴게요!';
          formStatus.className = 'form-status is-success';
          submitBtn.disabled = false;
          contactForm.reset();
        },
      });
    });
  }

  /* ---------- 무료 플레이스 점검 리드폼 (§6 — 기존 구글폼 연동 방식 재사용) ---------- */
  const freeCheckForm = document.getElementById('freeCheckForm');
  const fcFormStatus = document.getElementById('fcFormStatus');

  if (freeCheckForm) {
    freeCheckForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(freeCheckForm);
      const storeName = (data.get('storeName') || '').toString().trim();
      const storeArea = (data.get('storeArea') || '').toString().trim();
      const phone = (data.get('phone') || '').toString().trim();

      if (!storeName || !storeArea || !phone) {
        fcFormStatus.textContent = '필수 항목(*)을 모두 입력해주세요.';
        fcFormStatus.className = 'form-status is-error';
        return;
      }

      const submitBtn = freeCheckForm.querySelector('.form-submit');
      submitBtn.disabled = true;
      fcFormStatus.textContent = '전송 중입니다...';
      fcFormStatus.className = 'form-status';

      submitToGoogleForm(data, '무료 플레이스점검', {
        onFinish: () => {
          fcFormStatus.textContent = '무료 점검 신청이 접수되었습니다. 빠르게 연락드릴게요!';
          fcFormStatus.className = 'form-status is-success';
          submitBtn.disabled = false;
          freeCheckForm.reset();
        },
      });
    });
  }

  /* ---------- 전국판매 무료점검 리드폼 ----------
     Apps Script Web App에 JSON POST. Content-Type을 text/plain으로 보내
     브라우저의 CORS preflight(OPTIONS)를 피하는 방식 — Apps Script doPost는
     e.postData.contents를 JSON.parse해서 그대로 읽으면 된다. */
  const NATIONAL_CHECK_ENDPOINT =
    'https://script.google.com/macros/s/AKfycbwiFxOMP-nPOJK_KIOEOaB6SfaktJz8b9EPmlSRKtyx85pnrlhMdtXqTt1wpVurmaxf/exec';
  const nationalCheckForm = document.getElementById('nationalCheckForm');
  const ncFormStatus = document.getElementById('ncFormStatus');
  const ncOpenFormBtn = document.getElementById('ncOpenFormBtn');

  if (ncOpenFormBtn && nationalCheckForm) {
    ncOpenFormBtn.addEventListener('click', () => {
      nationalCheckForm.hidden = false;
      requestAnimationFrame(() => {
        nationalCheckForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  if (nationalCheckForm) {
    // 즉석판매제조가공업 신고가 "없음"일 때만 현재 영업형태 질문을 보여준다
    const businessTypeRow = document.getElementById('ncBusinessTypeRow');
    nationalCheckForm.querySelectorAll('input[name="foodMfgReport"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        businessTypeRow.hidden = radio.value !== '없음';
      });
    });

    nationalCheckForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(nationalCheckForm);
      const get = (key) => (data.get(key) || '').toString().trim();

      const required = ['bizNum', 'foodMfgReport', 'onlineSalesReport', 'spaceSeparation', 'healthCert', 'hygieneEdu', 'storeName', 'storeArea', 'phone', 'operatingPeriod', 'menu1', 'menu1Price', 'privacyConsent'];
      const missing = required.some((key) => !get(key));
      if (missing) {
        ncFormStatus.textContent = '필수 항목(*)을 모두 입력해주세요.';
        ncFormStatus.className = 'form-status is-error';
        return;
      }

      const payload = {
        매장명: get('storeName'),
        지역: get('storeArea'),
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
        연락처: get('phone'),
      };

      const submitBtn = nationalCheckForm.querySelector('.form-submit');
      submitBtn.disabled = true;
      ncFormStatus.textContent = '전송 중입니다...';
      ncFormStatus.className = 'form-status';

      fetch(NATIONAL_CHECK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(() => {
          nationalCheckForm.innerHTML =
            '<div class="submit-complete">' +
            '<div class="check-icon">✓</div>' +
            '<p>제출 완료되었습니다</p>' +
            '<p class="sub">확인 후 빠르게 연락드리겠습니다</p>' +
            '</div>';
        })
        .catch(() => {
          ncFormStatus.textContent = '전송에 실패했습니다. 잠시 후 다시 시도해주세요.';
          ncFormStatus.className = 'form-status is-error';
          submitBtn.disabled = false;
        });
    });
  }

  /* ---------- Proposal 페이지에서 넘어온 관심 플랜 prefill ---------- */
  (function prefillFromProposal() {
    let stored = null;
    try {
      stored = sessionStorage.getItem('tiger_plan_interest');
    } catch (e) { /* noop */ }
    if (!stored) return;
    try { sessionStorage.removeItem('tiger_plan_interest'); } catch (e) { /* noop */ }
    const messageEl = document.getElementById('message');
    if (!messageEl) return;
    const info = JSON.parse(stored);
    const prefix = `[관심 플랜: ${info.planId} / ${info.term}개월 계약] `;
    if (!messageEl.value.startsWith('[관심 플랜:')) {
      messageEl.value = prefix + messageEl.value;
    }
    const inquirySelect = document.getElementById('inquiryType');
    if (inquirySelect) inquirySelect.value = '서비스 플랜 상담';
  })();

  /* ---------- SNS 통합진단 CTA: 문의유형 자동 선택 ---------- */
  const snsDiagCta = document.getElementById('snsDiagCta');
  if (snsDiagCta) {
    snsDiagCta.addEventListener('click', () => {
      const inquirySelect = document.getElementById('inquiryType');
      if (inquirySelect) inquirySelect.value = 'SNS 통합진단·채널관리';
      scrollToId('contact');
    });
  }

  /* ---------- 요금제 (BASIC/GROWTH/PERFORMANCE/COMMERCE) ----------
     data/proposals/_common.json 단일 소스를 읽어 렌더링한다. Proposal
     페이지(js/proposal.js)와 동일한 데이터를 쓰므로 가격을 바꿀 땐
     _common.json 한 곳만 고치면 홈페이지·Proposal에 함께 반영된다. */
  const planGrid = document.getElementById('planGrid');
  const planTermToggle = document.getElementById('planTermToggle');
  const planVatLabel = document.getElementById('planVatLabel');

  if (planGrid && planTermToggle) {
    let planState = { term: 12, items: [], highlight: 'PERFORMANCE' };

    function escHtml(str) {
      return (str == null ? '' : String(str)).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
      ));
    }
    function manwonLabel(n) {
      return Math.round(n / 10000) + '만원';
    }
    function planPriceFor(p, term) {
      const v = p.prices ? p.prices[String(term)] : null;
      return (v != null ? v : p.price_krw);
    }

    function renderPlanGrid() {
      planGrid.innerHTML = planState.items.map((p) => {
        const isHighlight = p.id === planState.highlight;
        return `
        <div class="plan-card${isHighlight ? ' is-highlight' : ''}" data-plan-id="${escHtml(p.id)}">
          ${isHighlight ? '<span class="plan-card-badge">가장 많이 선택하는 플랜</span>' : ''}
          <h3 class="plan-card-name">${escHtml(p.name)}</h3>
          <p class="plan-card-price">${manwonLabel(planPriceFor(p, planState.term))}<span>/월</span></p>
          <p class="plan-card-qty">쇼츠 ${p.shorts}편 · 카드뉴스 ${p.card_news}건 · Threads ${p.threads}건 · 블로그 ${p.blog}건</p>
          <ul class="plan-card-list">
            ${(p.included || []).map((label) => `<li>${escHtml(label)}</li>`).join('')}
          </ul>
          <p class="plan-card-value">${escHtml(p.value)}</p>
          <button type="button" class="btn btn-outline plan-card-cta" data-plan-id="${escHtml(p.id)}">상담 신청하기</button>
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
      const messageEl = document.getElementById('message');
      const contactForm = document.getElementById('contactForm');
      if (messageEl && contactForm) {
        const prefix = `[관심 플랜: ${planId} / ${term}개월 계약] `;
        if (!messageEl.value.startsWith('[관심 플랜:')) {
          messageEl.value = prefix + messageEl.value;
        }
      }
      const inquirySelect = document.getElementById('inquiryType');
      if (inquirySelect) inquirySelect.value = '서비스 플랜 상담';
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

        if (planVatLabel && plans.vat_label) planVatLabel.textContent = plans.vat_label;

        renderPlanGrid();

        /* 새로 그려진 카드에도 스크롤 리빌 재적용 */
        const cardEls = planGrid.querySelectorAll('.plan-card');
        if (cardEls.length && window.IntersectionObserver) {
          const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible-plan');
                obs.unobserve(entry.target);
              }
            });
          }, { threshold: 0.1 });
          cardEls.forEach((el) => obs.observe(el));
        }
      })
      .catch((err) => {
        console.error('요금제 데이터를 불러오지 못했습니다.', err);
        planGrid.innerHTML = '<p class="plan-grid-error">요금제 정보는 상담 시 확인해 주세요.</p>';
      });
  }
})();
