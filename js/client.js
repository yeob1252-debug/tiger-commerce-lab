(function () {
  'use strict';

  const slug = window.location.pathname.split('/').filter(Boolean).pop();
  const isPreview = new URLSearchParams(window.location.search).get('mock') === '1';
  const session = isPreview
    ? { slug: slug, storeName: '미리보기', token: 'preview' }
    : DashboardCommon.requireSession(slug);
  if (!session) return; // requireSession already redirected to /login

  const loadingEl = document.getElementById('dashLoading');
  const contentEl = document.getElementById('dashContent');
  let monthlyChart = null;
  let monthlyRows = [];
  let currentMetric = '조회수';

  document.getElementById('logoutBtn').addEventListener('click', function () {
    DashboardCommon.clearSession();
    window.location.href = '/login';
  });

  DashboardCommon.getFromScript('getClientData', { slug: slug, token: session.token })
    .then(function (data) {
      if (data.error === 'unauthorized') {
        DashboardCommon.clearSession();
        window.location.href = '/login';
        return;
      }
      if (data.error) {
        loadingEl.textContent = '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
        return;
      }
      // #dashContent를 먼저 보이게 한 다음 렌더링해야 한다. 숨겨진(display:none)
      // 상태에서 Chart.js 캔버스를 만들면 캔버스 크기가 0으로 고정되어 버려서
      // (데이터가 1건이든 여러 건이든) 그래프 자체가 그려지지 않는 문제가 있었다.
      loadingEl.hidden = true;
      contentEl.hidden = false;
      renderDashboard(data);
    })
    .catch(function () {
      loadingEl.textContent = '연결에 실패했습니다. 인터넷 연결을 확인해주세요.';
    });

  /* 매장 slug별 로고 — 시트에 로고 컬럼이 없어 코드에서 매핑한다.
     새 매장이 추가되면 이 목록에 한 줄만 추가하면 된다. */
  const STORE_LOGOS = {
    joganemgg: 'assets/characters/joga_profile_full.png',
  };

  function renderDashboard(data) {
    document.getElementById('storeNameLabel').textContent = data.storeName || '타이거커머스랩';
    document.title = (data.storeName || '사장님') + ' 대시보드 | 타이거커머스랩';

    const logoEl = document.getElementById('channelLogo');
    logoEl.src = STORE_LOGOS[slug] || 'assets/characters/logo.png';
    logoEl.alt = (data.storeName || '매장') + ' 로고';

    renderScorecards(data.dashboard);
    renderPhases(data.dashboard);
    renderMonthly(data.monthly || []);
    renderCalendar(data.calendar || []);
    renderMenu(data.menu || []);
    renderBoard(data.board || []);
    setupBoardForm();
  }

  /* 시트에 콤마(1,234)나 원(₩) 기호가 섞인 텍스트로 숫자가 입력되어 있어도
     Number()가 NaN을 반환해 0으로 표시되던 문제가 있었다 — 숫자가 아닌
     문자를 걷어내고 파싱한다. */
  function toNum(v) {
    if (typeof v === 'number') return v;
    if (v === null || v === undefined || v === '') return 0;
    const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  /* ---------- 카운트업 ---------- */
  function countUp(el, target, opts) {
    opts = opts || {};
    const duration = opts.duration || 1300;
    const format = opts.format || function (v) { return Math.round(v).toLocaleString('ko-KR'); };
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(eased * target);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = format(target);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- 스코어카드: 운영중인 채널현황 ---------- */
  function renderScorecards(dash) {
    const items = [
      {
        icon: '▶️',
        value: toNum(dash['유튜브조회수']),
        label: '유튜브 조회수',
        format: function (v) { return Math.round(v).toLocaleString('ko-KR') + '회'; },
      },
      {
        icon: '🎵',
        value: toNum(dash['틱톡조회수']),
        label: '틱톡 조회수',
        format: function (v) { return Math.round(v).toLocaleString('ko-KR') + '회'; },
      },
      {
        icon: '👥',
        value: toNum(dash['단골가두기방회원수']),
        label: '단골 가두기방 회원수',
        format: function (v) { return Math.round(v).toLocaleString('ko-KR') + '명'; },
      },
    ];
    const wrap = document.getElementById('scorecards');
    wrap.innerHTML = items
      .map(function (item, i) {
        return (
          '<div class="dash-scorecard">' +
          '<span class="dash-scorecard-icon" aria-hidden="true">' + item.icon + '</span>' +
          '<div class="dash-scorecard-value" data-idx="' + i + '">0</div>' +
          '<div class="dash-scorecard-label">' + item.label + '</div>' +
          '</div>'
        );
      })
      .join('');
    wrap.querySelectorAll('.dash-scorecard-value').forEach(function (el) {
      const item = items[Number(el.getAttribute('data-idx'))];
      countUp(el, item.value, { duration: 1600, format: item.format });
    });
  }

  /* ---------- 업무 로드맵 (고정 5단계, 시트의 '현재단계' 숫자로 진행상태만 결정) ---------- */
  var ROADMAP_STEPS = [
    '브랜딩 작업',
    'SNS 채널 오픈 및 콘텐츠 축적',
    'SNS 댓글·구매문의 대응',
    '라이브 방송',
    '스마트스토어 판매라인 확장',
  ];

  function renderPhases(dash) {
    const wrap = document.getElementById('phasesWrap');
    const current = toNum(dash['현재단계']) || 1;
    wrap.innerHTML = ROADMAP_STEPS.map(function (name, idx) {
      const step = idx + 1;
      const stateClass = step < current ? 'is-done' : step === current ? 'is-current' : '';
      const status = step < current ? '완료' : step === current ? '진행중' : '예정';
      const isMain = step === 2;
      return (
        '<div class="dash-phase ' + stateClass + '">' +
        '<div class="dash-phase-badge">' + (step < current ? '✓' : step) + '</div>' +
        '<div class="dash-phase-name">' + name + (isMain ? ' <span class="dash-phase-main-tag">메인 업무</span>' : '') + '</div>' +
        '<span class="dash-phase-status">' + status + '</span>' +
        '</div>'
      );
    }).join('');
  }

  /* ---------- 월간 성과 ---------- */
  function renderMonthly(rows) {
    monthlyRows = rows;
    const tabs = document.querySelectorAll('.dash-chart-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        currentMetric = tab.getAttribute('data-metric');
        drawChart();
      });
    });

    const toggle = document.getElementById('rawTableToggle');
    const tableWrap = document.getElementById('rawTableWrap');
    toggle.addEventListener('click', function () {
      const isOpen = tableWrap.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
    });
    buildRawTable(rows);
    drawChart();
  }

  function buildRawTable(rows) {
    const table = document.getElementById('monthlyTable');
    if (!rows.length) {
      table.innerHTML = '<tr><td>데이터가 아직 없습니다</td></tr>';
      return;
    }
    const headers = Object.keys(rows[0]);
    table.innerHTML =
      '<thead><tr>' + headers.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' +
      rows
        .map(function (r) {
          return '<tr>' + headers.map(function (h) { return '<td>' + formatCell(r[h]) + '</td>'; }).join('') + '</tr>';
        })
        .join('') +
      '</tbody>';
  }

  function formatCell(v) {
    if (typeof v === 'number') return v.toLocaleString('ko-KR');
    return v;
  }

  function drawChart() {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    const labels = monthlyRows.map(function (r) { return String(r['월'] || ''); });
    const values = monthlyRows.map(function (r) { return toNum(r[currentMetric]); });

    if (monthlyChart) monthlyChart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(255,106,26,0.28)');
    gradient.addColorStop(1, 'rgba(255,106,26,0)');

    monthlyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: currentMetric,
            data: values,
            borderColor: '#FF6A1A',
            backgroundColor: gradient,
            borderWidth: 3,
            pointBackgroundColor: '#FF6A1A',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.35,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1C1A18',
            padding: 10,
            titleFont: { family: 'Pretendard', weight: '700' },
            bodyFont: { family: 'Pretendard', weight: '600' },
            callbacks: {
              label: function (ctx) {
                return currentMetric + ': ' + Number(ctx.raw).toLocaleString('ko-KR');
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Pretendard' } } },
          y: {
            grid: { color: '#F1F1EE' },
            ticks: {
              font: { family: 'Pretendard' },
              callback: function (v) { return Number(v).toLocaleString('ko-KR'); },
            },
          },
        },
      },
    });

    // 방어적 재계산: 탭이 비활성 상태 등으로 최초 생성 시점에 캔버스 크기가
    // 0으로 잡히는 경우가 있어, 다음 프레임에 한 번 더 리사이즈를 강제한다.
    requestAnimationFrame(function () {
      if (monthlyChart) monthlyChart.resize();
    });
  }

  /* ---------- 운영 캘린더: 월간 달력 ---------- */
  const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

  function pad2(n) { return String(n).padStart(2, '0'); }
  function dateKeyOf(y, m, d) { return y + '-' + pad2(m + 1) + '-' + pad2(d); }

  function renderCalendar(rows) {
    const wrap = document.getElementById('calendarWrap');
    const today = new Date();
    const todayKey = dateKeyOf(today.getFullYear(), today.getMonth(), today.getDate());

    const byDate = {};
    rows.forEach(function (r) {
      const key = String(r['날짜'] || '').trim().slice(0, 10);
      if (key) byDate[key] = r;
    });

    const state = { year: today.getFullYear(), month: today.getMonth() };

    function draw() {
      const first = new Date(state.year, state.month, 1);
      const startWeekday = first.getDay();
      const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();
      const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

      let cellsHtml = '';
      for (let i = 0; i < totalCells; i++) {
        const dayNum = i - startWeekday + 1;
        if (dayNum < 1 || dayNum > daysInMonth) {
          cellsHtml += '<div class="dash-cal-day is-empty" aria-hidden="true"></div>';
          continue;
        }
        const key = dateKeyOf(state.year, state.month, dayNum);
        const entry = byDate[key];
        const classes = ['dash-cal-day'];
        if (key === todayKey) classes.push('is-today');
        if (entry) classes.push('has-entry');
        const tag = entry ? 'button' : 'div';
        const entryStatus = entry ? (entry['진행상황'] || '') : '';
        const entryPrefix = entryStatus === '업무완료' ? '✓ ' : '';
        cellsHtml +=
          '<' + tag + (entry ? ' type="button" data-date="' + key + '"' : '') + ' class="' + classes.join(' ') + '">' +
          '<span class="dash-cal-day-num">' + dayNum + '</span>' +
          (entry
            ? '<span class="dash-cal-day-entry" data-status="' + entryStatus + '">' + entryPrefix + (entry['콘텐츠주제'] || '') + '</span>'
            : '') +
          '</' + tag + '>';
      }

      wrap.innerHTML =
        '<div class="dash-cal-nav">' +
        '<button type="button" class="dash-cal-nav-btn" id="calPrevBtn" aria-label="이전 달">‹</button>' +
        '<span class="dash-cal-nav-label">' + state.year + '년 ' + (state.month + 1) + '월</span>' +
        '<button type="button" class="dash-cal-nav-btn" id="calNextBtn" aria-label="다음 달">›</button>' +
        '</div>' +
        '<div class="dash-cal-weekdays">' + WEEKDAY_LABELS.map(function (d) { return '<span>' + d + '</span>'; }).join('') + '</div>' +
        '<div class="dash-cal-grid">' + cellsHtml + '</div>' +
        '<div class="dash-cal-legend">' +
        '<span class="dash-cal-legend-item"><i data-status="업무진행중"></i>업무진행중</span>' +
        '<span class="dash-cal-legend-item"><i data-status="업무예정"></i>업무예정</span>' +
        '<span class="dash-cal-legend-item"><i data-status="업무완료"></i>업무완료</span>' +
        '<span class="dash-cal-legend-item"><i data-status="이벤트"></i>이벤트</span>' +
        '</div>';

      document.getElementById('calPrevBtn').addEventListener('click', function () {
        state.month--;
        if (state.month < 0) { state.month = 11; state.year--; }
        draw();
      });
      document.getElementById('calNextBtn').addEventListener('click', function () {
        state.month++;
        if (state.month > 11) { state.month = 0; state.year++; }
        draw();
      });
      wrap.querySelectorAll('.dash-cal-day.has-entry').forEach(function (btn) {
        btn.addEventListener('click', function () {
          showCalPopup(byDate[btn.getAttribute('data-date')]);
        });
      });
    }

    draw();
  }

  function showCalPopup(entry) {
    if (!entry) return;
    let overlay = document.getElementById('calPopupOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'calPopupOverlay';
      overlay.className = 'dash-cal-popup-overlay';
      overlay.innerHTML =
        '<div class="dash-cal-popup">' +
        '<button type="button" class="dash-cal-popup-close" aria-label="닫기">✕</button>' +
        '<div class="dash-cal-popup-body"></div>' +
        '</div>';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay || e.target.closest('.dash-cal-popup-close')) {
          overlay.classList.remove('is-open');
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') overlay.classList.remove('is-open');
      });
    }
    const status = entry['진행상황'] || '';
    const statusLabel = status === '업무완료' ? '✓ ' + status : status;
    const body = overlay.querySelector('.dash-cal-popup-body');
    body.innerHTML =
      '<span class="dash-cal-popup-status" data-status="' + status + '">' + statusLabel + '</span>' +
      '<p class="dash-cal-popup-date">' + formatDate(entry['날짜']) + '</p>' +
      '<h3 class="dash-cal-popup-title">' + (entry['콘텐츠주제'] || '') + '</h3>' +
      (entry['대표님협조사항']
        ? '<div class="dash-cal-popup-row"><strong>대표님 협조사항</strong><p>' + entry['대표님협조사항'] + '</p></div>'
        : '') +
      (entry['콘텐츠비용']
        ? '<div class="dash-cal-popup-row"><strong>콘텐츠 비용</strong><p>' + entry['콘텐츠비용'] + '</p></div>'
        : '');
    overlay.classList.add('is-open');
  }

  function formatDate(v) {
    const d = new Date(v);
    if (isNaN(d)) return v;
    return (d.getMonth() + 1) + '/' + d.getDate();
  }

  /* ---------- 메뉴 단가표 ---------- */
  function renderMenu(rows) {
    const table = document.getElementById('menuTable');
    if (!rows.length) {
      table.innerHTML = '<tr><td>등록된 메뉴가 없습니다</td></tr>';
      return;
    }
    table.innerHTML =
      '<thead><tr><th>메뉴명</th><th>가격</th><th>비고</th></tr></thead>' +
      '<tbody>' +
      rows
        .map(function (r) {
          const price = Number(r['가격']);
          return (
            '<tr><td>' + (r['메뉴명'] || '') + '</td>' +
            '<td class="dash-menu-price">' + (isNaN(price) ? r['가격'] : '₩' + price.toLocaleString('ko-KR')) + '</td>' +
            '<td>' + (r['비고'] || '') + '</td></tr>'
          );
        })
        .join('') +
      '</tbody>';
  }

  /* ---------- 소통 게시판 ---------- */
  function isYb(author) {
    return String(author || '').toUpperCase().indexOf('YB') !== -1;
  }

  function renderBoard(rows) {
    const list = document.getElementById('boardList');
    list.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'dash-board-empty';
      empty.textContent = '아직 등록된 글이 없습니다. 첫 메시지를 남겨보세요!';
      list.appendChild(empty);
      return;
    }
    rows.forEach(function (r) {
      const bubble = document.createElement('div');
      bubble.className = 'dash-bubble ' + (isYb(r['작성자']) ? 'dash-bubble-yb' : 'dash-bubble-owner');

      const author = document.createElement('div');
      author.className = 'dash-bubble-author';
      author.textContent = r['작성자'] || '사장님';

      const text = document.createElement('div');
      text.className = 'dash-bubble-text';
      text.textContent = r['내용'] || '';

      const time = document.createElement('div');
      time.className = 'dash-bubble-time';
      time.textContent = r['날짜'] || '';

      bubble.appendChild(author);
      bubble.appendChild(text);
      bubble.appendChild(time);
      list.appendChild(bubble);
    });
  }

  function setupBoardForm() {
    const form = document.getElementById('boardForm');
    const input = document.getElementById('boardInput');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      const submitBtn = form.querySelector('.dash-board-submit');
      submitBtn.disabled = true;
      DashboardCommon.postToScript('addComment', {
        slug: slug,
        token: session.token,
        author: session.storeName,
        text: text,
      })
        .then(function (res) {
          submitBtn.disabled = false;
          if (res && res.success) {
            input.value = '';
            return DashboardCommon.getFromScript('getClientData', { slug: slug, token: session.token });
          }
        })
        .then(function (data) {
          if (data && data.board) renderBoard(data.board);
        })
        .catch(function () {
          submitBtn.disabled = false;
        });
    });
  }
})();
