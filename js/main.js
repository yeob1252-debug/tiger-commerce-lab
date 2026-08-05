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
  const navSectionIds = ['hero', 'free-check', 'main-service', 'cases', 'process', 'market', 'pricing', 'dashboard-preview', 'contact'];
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

  /* ---------- 히어로 키워드 순환 (v2 §5 코드 그대로 이식) ---------- */
  const cycleWordEl = document.getElementById('cycleWord');
  if (cycleWordEl) {
    const words = ['틱톡', '유튜브', '네이버'];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % words.length;
      cycleWordEl.style.opacity = 0;
      setTimeout(() => {
        cycleWordEl.textContent = words[i];
        cycleWordEl.style.opacity = 1;
      }, 200);
    }, 1800);
  }

  /* ---------- 업무 프로세스 6단계: 스크롤 타임라인 (v2 §8 코드 그대로 이식) ---------- */
  const tlCards = document.querySelectorAll('.tl-card');
  const tlFill = document.getElementById('tlFill');
  if (tlCards.length && tlFill) {
    const tlObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('lit');
            tlFill.style.width = (+e.target.dataset.step / tlCards.length * 100) + '%';
          }
        });
      },
      { threshold: 0.5 }
    );
    tlCards.forEach((c) => tlObserver.observe(c));
  }

  /* ---------- 서비스안내 Phase 아코디언 + 캐릭터 파츠 조립 (v2 §9) ----------
     아코디언을 펼칠 때마다 해당 phase까지의 파츠가 하나씩 조립된 상태로
     보이게 한다(Phase 1→body만, Phase 2→body+head, ... Phase 4 이상→전부). */
  const phaseItems = document.querySelectorAll('.phase-item');
  const tigerParts = document.querySelectorAll('.tiger-part');
  function assembleParts(upToPhase) {
    tigerParts.forEach((part) => {
      const partPhase = +part.dataset.phase;
      part.classList.toggle('assembled', partPhase <= upToPhase);
    });
  }
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
      if (!isOpen) assembleParts(+item.dataset.phase);
    });
  });
  // 초기 상태(Phase 1 펼쳐짐)에 맞춰 파츠 1개만 조립해 둔다
  if (phaseItems.length) assembleParts(1);

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
  const statBlocks = document.querySelectorAll('.market-card, .channel-store-grid');

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
  const hiddenIframe = document.getElementById('hiddenFormTarget');

  function submitToGoogleForm(data, { onFinish } = {}) {
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

      if (!storeName || !storeArea || !phone || !onlineSales) {
        formStatus.textContent = '필수 항목(*)을 모두 입력해주세요.';
        formStatus.className = 'form-status is-error';
        return;
      }

      const submitBtn = contactForm.querySelector('.form-submit');
      submitBtn.disabled = true;
      formStatus.textContent = '전송 중입니다...';
      formStatus.className = 'form-status';

      submitToGoogleForm(data, {
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

      submitToGoogleForm(data, {
        onFinish: () => {
          fcFormStatus.textContent = '무료 점검 신청이 접수되었습니다. 빠르게 연락드릴게요!';
          fcFormStatus.className = 'form-status is-success';
          submitBtn.disabled = false;
          freeCheckForm.reset();
        },
      });
    });
  }
})();
