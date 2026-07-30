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
      renderDashboard(data);
      loadingEl.hidden = true;
      contentEl.hidden = false;
    })
    .catch(function () {
      loadingEl.textContent = '연결에 실패했습니다. 인터넷 연결을 확인해주세요.';
    });

  function renderDashboard(data) {
    document.getElementById('storeNameLabel').textContent = data.storeName || '타이거커머스랩';
    document.title = (data.storeName || '사장님') + ' 대시보드 | 타이거커머스랩';

    renderProgress(data.dashboard);
    renderScorecards(data.dashboard);
    renderPhases(data.dashboard);
    renderMonthly(data.monthly || []);
    renderCalendar(data.calendar || []);
    renderMenu(data.menu || []);
    renderBoard(data.board || []);
    setupBoardForm();
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

  /* ---------- 계약 진행률 ---------- */
  function renderProgress(dash) {
    const start = new Date(dash['계약시작일']);
    const end = new Date(dash['계약종료일']);
    const now = new Date();
    let pct = 0;
    if (!isNaN(start) && !isNaN(end) && end > start) {
      pct = Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
    }
    const fill = document.getElementById('progressFill');
    const pctLabel = document.getElementById('progressPct');
    window.setTimeout(function () {
      fill.style.width = pct + '%';
    }, 100);
    countUp(pctLabel, pct, { duration: 1100, format: function (v) { return Math.round(v) + '%'; } });
  }

  /* ---------- 스코어카드 ---------- */
  function renderScorecards(dash) {
    const items = [
      {
        icon: '💰',
        value: Number(dash['총영업외추가매출액']) || 0,
        label: '총 영업외 추가매출액',
        format: function (v) { return '₩' + Math.round(v).toLocaleString('ko-KR'); },
      },
      {
        icon: '🎬',
        value: Number(dash['유튜브틱톡누적조회수']) || 0,
        label: '유튜브·틱톡 누적조회수',
        format: function (v) { return Math.round(v).toLocaleString('ko-KR') + '회'; },
      },
      {
        icon: '👥',
        value: Number(dash['단골가두기방회원수']) || 0,
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

  /* ---------- Phase 타임라인 ---------- */
  function renderPhases(dash) {
    const wrap = document.getElementById('phasesWrap');
    const phases = [1, 2, 3, 4].map(function (i) {
      return { name: dash[i + '단계명'] || i + '단계', status: dash[i + '단계상태'] || '예정' };
    });
    wrap.innerHTML = phases
      .map(function (p) {
        const stateClass = p.status === '완료' ? 'is-done' : p.status === '진행중' ? 'is-current' : '';
        return (
          '<div class="dash-phase ' + stateClass + '">' +
          '<div class="dash-phase-badge">' + (p.status === '완료' ? '✓' : phases.indexOf(p) + 1) + '</div>' +
          '<div class="dash-phase-name">' + p.name + '</div>' +
          '<span class="dash-phase-status">' + p.status + '</span>' +
          '</div>'
        );
      })
      .join('');
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
    const labels = monthlyRows.map(function (r) { return r['월']; });
    const values = monthlyRows.map(function (r) { return Number(r[currentMetric]) || 0; });

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
  }

  /* ---------- 운영 캘린더 ---------- */
  function getWeekRange(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return [monday, sunday];
  }

  function renderCalendar(rows) {
    const wrap = document.getElementById('calendarWrap');
    if (!rows.length) {
      wrap.innerHTML = '<p class="dash-board-empty">등록된 콘텐츠 일정이 없습니다</p>';
      return;
    }
    const [weekStart, weekEnd] = getWeekRange(new Date());
    const current = [];
    const others = [];
    rows.forEach(function (r) {
      const d = new Date(r['시작일']);
      if (!isNaN(d) && d >= weekStart && d <= weekEnd) current.push(r);
      else others.push(r);
    });
    others.sort(function (a, b) { return new Date(a['시작일']) - new Date(b['시작일']); });

    let html = '';
    if (current.length) {
      html += current
        .map(function (r) {
          return (
            '<div class="dash-calendar-current">' +
            '<span class="dash-calendar-current-badge">이번 주</span>' +
            '<p class="dash-calendar-title">' + (r['콘텐츠'] || '') + '</p>' +
            '<p class="dash-calendar-desc">' + (r['설명'] || '') + '</p>' +
            '<p class="dash-calendar-meta">' + (r['주차'] || '') + ' · ' + formatDate(r['시작일']) + (r['상태'] ? ' · ' + r['상태'] : '') + '</p>' +
            '</div>'
          );
        })
        .join('');
    } else {
      html += '<p class="dash-board-empty">이번 주 예정된 콘텐츠가 없습니다</p>';
    }

    if (others.length) {
      html +=
        '<div class="dash-calendar-accordion">' +
        others
          .map(function (r, i) {
            return (
              '<div class="dash-calendar-row" data-idx="' + i + '">' +
              '<div class="dash-calendar-row-head">' +
              '<span>' + (r['주차'] || '') + ' · ' + (r['콘텐츠'] || '') + '</span>' +
              '<span class="dash-calendar-row-arrow" aria-hidden="true">▾</span>' +
              '</div>' +
              '<div class="dash-calendar-row-body">' + (r['설명'] || '') + ' (' + formatDate(r['시작일']) + (r['상태'] ? ', ' + r['상태'] : '') + ')</div>' +
              '</div>'
            );
          })
          .join('') +
        '</div>';
    }
    wrap.innerHTML = html;

    wrap.querySelectorAll('.dash-calendar-row-head').forEach(function (head) {
      head.addEventListener('click', function () {
        head.parentElement.classList.toggle('is-open');
      });
    });
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
