(() => {
  'use strict';

  /* ---------- 뷰포트 크기 헬퍼 ----------
     일부 모바일 브라우저(및 이 프로젝트에서 테스트에 사용한 미리보기 환경)는
     window.innerWidth/innerHeight가 실제 시각 뷰포트보다 크게 보고되는
     경우가 있다(레이아웃 뷰포트와 시각 뷰포트 불일치). 이 값을 스크롤/애니메이션
     계산에 그대로 쓰면 위치 계산이 어긋나 캐릭터가 잘못된 지점에서
     나타나거나 사라지는 문제로 이어진다. document.documentElement의
     clientWidth/clientHeight(스크롤바를 제외한 실제 렌더링 뷰포트)를
     항상 우선 사용해 이 문제를 원천적으로 피한다. */
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

  /* ---------- 고정(fixed) 바 너비 보정 ----------
     position:fixed 요소의 width:100%/left:right:0 는 일부 환경에서
     "레이아웃 뷰포트"를 기준으로 계산되어 실제 화면보다 넓게 잡히는
     경우가 있다(위 viewportWidth 헬퍼가 필요한 이유와 동일한 원인).
     헤더와 모바일 고정 캐릭터 바는 실제 clientWidth 값을 인라인
     스타일로 강제 지정해 이 문제를 확실히 피한다. */
  function fixFixedBarWidths() {
    const w = viewportWidth() + 'px';
    const headerEl = document.querySelector('.site-header');
    const storyVisualEl = document.querySelector('.story-visual');
    if (headerEl) headerEl.style.width = w;
    if (storyVisualEl && window.matchMedia('(max-width: 860px)').matches) {
      storyVisualEl.style.width = w;
    } else if (storyVisualEl) {
      storyVisualEl.style.width = '';
    }
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
  const navSectionIds = ['hero', 'market', 'process', 'cases', 'services', 'founder', 'contact'];
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

  /* ---------- 프로세스 단계 심화 설명 (PC 호버 / 모바일 탭) ----------
     펼침 자체는 CSS :hover로 처리되지만, 터치 기기는 hover가 불안정하므로
     클릭/탭 시 .is-open을 토글해 명시적으로 펼치고 접을 수 있게 한다. */
  document.querySelectorAll('.process-step').forEach((step) => {
    step.addEventListener('click', (e) => {
      // 링크/버튼 등 다른 인터랙션 요소를 누른 경우는 토글하지 않는다(현재는 없지만 안전장치)
      if (e.target.closest('a, button')) return;
      const isOpen = step.classList.contains('is-open');
      document.querySelectorAll('.process-step.is-open').forEach((other) => {
        if (other !== step) other.classList.remove('is-open');
      });
      step.classList.toggle('is-open', !isOpen);
    });
  });

  /* ---------- "이런 분들께 추천해요" 말풍선 아코디언 ---------- */
  document.querySelectorAll('.quote-bubble').forEach((bubble) => {
    bubble.addEventListener('click', () => {
      const isOpen = bubble.classList.contains('is-open');
      bubble.classList.toggle('is-open', !isOpen);
      bubble.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---------- 모달(찜 고객 vs 팬 고객 비교) ---------- */
  function openModal(modal) {
    modal.hidden = false;
    // hidden 해제와 같은 틱에 바로 is-open을 주면 트랜지션이 안 걸리는
    // 경우가 있어 한 틱 미룬다. requestAnimationFrame은 탭이 실제로
    // 프레임을 그리고 있지 않으면(백그라운드 탭 등) 아예 호출되지 않을 수
    // 있어, 렌더링 여부와 무관하게 항상 실행되는 setTimeout을 쓴다.
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
      if (modal) openModal(modal);
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

  /* ---------- 캐릭터 크로스페이드 (스티키 마스코트) ---------- */
  const charImgs = document.querySelectorAll('.char-img');
  const charBadge = document.getElementById('charBadge');
  const badgeText = {
    hero: '엄지척!',
    surprised: '헉, 벌써 이만큼?!',
    curious: '오, 이거 궁금한데?',
  };
  const storyPanels = document.querySelectorAll('.story-panels .panel[data-char]');
  let currentCharKey = null;

  if (charImgs.length && storyPanels.length) {
    const charObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const charKey = entry.target.getAttribute('data-char');
            charImgs.forEach((img) => {
              img.style.opacity = img.getAttribute('data-char') === charKey ? '1' : '0';
            });
            if (charBadge && badgeText[charKey] && charKey !== currentCharKey) {
              currentCharKey = charKey;
              charBadge.textContent = badgeText[charKey];
              charBadge.classList.remove('is-bouncing');
              // eslint-disable-next-line no-unused-expressions
              void charBadge.offsetWidth; // 애니메이션 재시작을 위한 리플로우 강제
              charBadge.classList.add('is-bouncing');
            }
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );
    storyPanels.forEach((panel) => charObserver.observe(panel));
  }

  /* ---------- 스티키/고정 캐릭터 노출 제어 ----------
     [근본 원인] 처음에는 "뷰포트 전체 높이"를, 그다음엔 ".char-stage 자신의
     좌표"를 기준점으로 페이드를 계산했는데, 두 방식 모두 sticky가 실제로
     "풀리는(un-pin)" 시점부터는 기준으로 삼은 요소가 .story와 함께 등속으로
     스크롤되기 시작해 두 좌표의 차이가 어떤 상수값에 고정되어 버렸다.
     그 상수가 우연히 임계값 밖에 있으면 캐릭터가 사라져야 할 시점을 지나도
     "고정된 것처럼" 계속 보이거나(관찰됨), 반대로 패널에 들어가자마자
     사라지는 등 재현할 때마다 다른 방식으로 어긋났다 — 이게 "몇 번을 고쳐도
     같은 문제가 재발한" 진짜 이유다.

     [수정] 기준점 두 개를 모두 "sticky/fixed의 영향을 받지 않는" 값으로만
     계산한다: rect.bottom은 일반 흐름(normal flow)인 .story에서 가져오므로
     항상 스크롤에 정비례해 신뢰할 수 있고, 마스코트 하단 위치는 (다른 요소를
     측정하는 대신) 우리 CSS 수치로부터 직접 계산한 "고정 공식" 값을 쓴다.
     이러면 un-pin 여부와 무관하게 두 값의 차이가 스크롤에 항상 선형으로
     반응해서, 방향과 무관하게 정확히 한 번만 자연스럽게 페이드되고 그 이후
     되돌아오지 않는다. */
  const storyEl = document.querySelector('.story');
  const storyVisualEl = document.querySelector('.story-visual');
  if (storyEl && storyVisualEl) {
    const FADE_ZONE = 160; // px, 마스코트 하단 기준 페이드가 시작되는 여유 구간
    const mobileQuery = window.matchMedia('(max-width: 860px)');

    // 마스코트 하단이 뷰포트 상단에서 얼마나 떨어져 있는지를 CSS 수치로 직접 계산.
    // (측정이 아니라 계산이므로 sticky/fixed pin 여부와 무관하게 항상 일정하다)
    function mascotBottomOffset(isMobile) {
      if (isMobile) return 60 + 190; // 모바일: top 오프셋(60) + 밴드 min-height(190)
      return viewportHeight() * 0.75; // 데스크톱: 100vh 박스 안에서 캐릭터가 대략 상위 75% 지점에서 끝남
    }

    function updateStoryVisualState() {
      const rect = storyEl.getBoundingClientRect();
      const isMobile = mobileQuery.matches;
      const bandTop = isMobile ? 60 : 0;

      if (isMobile && rect.top > bandTop) {
        // .story가 아직 고정 밴드까지 스크롤되지 않음 → 노출하지 않음
        storyVisualEl.style.opacity = '0';
        storyVisualEl.style.pointerEvents = 'none';
        return;
      }

      const distanceToBottom = rect.bottom - mascotBottomOffset(isMobile);
      let opacity = 1;
      if (distanceToBottom < FADE_ZONE) {
        opacity = Math.max(0, Math.min(1, distanceToBottom / FADE_ZONE));
      }
      storyVisualEl.style.opacity = String(opacity);
      storyVisualEl.style.pointerEvents = opacity < 0.05 ? 'none' : '';
    }

    window.addEventListener('scroll', updateStoryVisualState, { passive: true });
    window.addEventListener('resize', updateStoryVisualState);
    updateStoryVisualState();
  }

  /* ---------- 한국 지도 확산 애니메이션 (화살표 draw-in) ---------- */
  function animateKoreaMap(mapEl) {
    const svg = mapEl.querySelector('.korea-map-overlay');
    if (!svg) return;
    const cx = 381;
    const cy = 653;
    const duration = 900;
    svg.querySelectorAll('.korea-map-arrow').forEach((path, i) => {
      const x2 = parseFloat(path.getAttribute('data-x2'));
      const y2 = parseFloat(path.getAttribute('data-y2'));
      const delay = 300 + i * 140;
      window.setTimeout(() => {
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const curX = cx + (x2 - cx) * eased;
          const curY = cy + (y2 - cy) * eased;
          path.setAttribute('d', `M${cx} ${cy} L${curX} ${curY}`);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }, delay);
    });
  }

  /* ---------- 스크롤 리빌 애니메이션 ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            if (entry.target.classList.contains('korea-map')) {
              animateKoreaMap(entry.target);
            }
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

  /* ---------- 데이터 섹션: 5년 추이 바 차트 + 카운트업 강조 애니메이션 ---------- */
  const statGrid = document.querySelector('.stat-grid');

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

  if (statGrid) {
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
      { threshold: 0.4 }
    );
    statObserver.observe(statGrid);
  }

  /* ---------- 문의 폼 → 구글폼 연동 제출 ---------- */
  const GOOGLE_FORM_ACTION =
    'https://docs.google.com/forms/d/e/1FAIpQLScP5FnNGQbpHRVy5_fFzDju0I0FiSq36ajaP3aOo3s8UUx_hA/formResponse';
  const GOOGLE_FORM_FIELDS = {
    storeName: 'entry.113098425',
    storeArea: 'entry.1254021817',
    phone: 'entry.601816022',
    onlineSales: 'entry.1558172882',
    message: 'entry.1781088824',
  };

  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const hiddenIframe = document.getElementById('hiddenFormTarget');

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

      const finish = () => {
        formStatus.textContent = '상담 신청이 접수되었습니다. 빠르게 연락드릴게요!';
        formStatus.className = 'form-status is-success';
        submitBtn.disabled = false;
        contactForm.reset();
        hiddenIframe.removeEventListener('load', finish);
      };
      hiddenIframe.addEventListener('load', finish, { once: true });

      document.body.appendChild(gForm);
      gForm.submit();
      document.body.removeChild(gForm);

      // load 이벤트가 오지 않는 경우를 대비한 안전장치
      window.setTimeout(() => {
        if (submitBtn.disabled) finish();
      }, 3000);
    });
  }
})();
