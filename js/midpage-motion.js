(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const slots = [...document.querySelectorAll('[data-motion-clip]')];
  const sources = { food: 'assets/home/video-upgrade/tiger-food-detail-v1.mp4', live: 'assets/home/video-upgrade/tiger-live-commerce-web-v1.mp4' };
  const players = new Map();
  const records = new Map();
  // Lucide Play, Pause, RotateCcw, Bookmark and MessageCircle (ISC, lucide.dev).
  const paths = {
    play: '<path d="m6 3 14 9-14 9V3Z"/>',
    pause: '<path d="M10 4H6v16h4zM18 4h-4v16h4z"/>',
    replay: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5"/>',
    bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
  document.querySelectorAll('[data-motion-icon]').forEach(node => node.insertAdjacentHTML('afterbegin', icon(node.dataset.motionIcon)));

  const story = document.querySelector('#story');
  if (story) story.dataset.filmEnhanced = 'true';
  const staticPhone = () => {
    if (!motion.matches) return;
    document.querySelectorAll('[data-phone-stage],[data-phone-scene]').forEach(panel => { panel.inert = false; panel.setAttribute('aria-hidden', 'false'); });
  };
  staticPhone();

  function updateButton(record) {
    const state = record.slot.dataset.motionState;
    const active = state === 'playing';
    record.button.innerHTML = icon(active ? 'pause' : record.completed ? 'replay' : 'play');
    const label = active ? '영상 일시 정지' : record.completed ? '영상 다시 재생' : '영상 재생';
    record.button.setAttribute('aria-label', label);
    record.button.title = label;
    record.button.hidden = motion.matches || record.slot.dataset.motionReady !== 'true' || record.failed;
  }
  function state(record, value) { record.slot.dataset.motionState = value; updateButton(record); }
  function pause(player, reason) {
    player.request += 1;
    player.video.pause();
    if (player.owner && !player.owner.completed) state(player.owner, reason);
  }
  function playerFor(key) {
    if (players.has(key)) return players.get(key);
    const video = document.createElement('video');
    video.muted = true; video.defaultMuted = true; video.playsInline = true; video.preload = 'none';
    video.setAttribute('muted', ''); video.setAttribute('playsinline', ''); video.setAttribute('aria-hidden', 'true');
    video.setAttribute('tabindex', '-1'); video.disablePictureInPicture = true;
    const player = { video, key, owner: null, request: 0 };
    players.set(key, player);
    video.addEventListener('ended', () => {
      if (!player.owner) return;
      player.owner.completed = true;
      state(player.owner, 'ended');
    });
    video.addEventListener('error', () => {
      if (!player.owner) return;
      player.owner.failed = true;
      player.owner.slot.dataset.frameVisible = 'false';
      pause(player, 'error');
    });
    return player;
  }
  function visible(record) {
    const scene = record.slot.closest('[data-phone-scene]');
    if (scene && (!scene.classList.contains('is-active') || scene.inert || scene.getAttribute('aria-hidden') === 'true')) return 0;
    if (!record.slot.getClientRects().length || getComputedStyle(record.slot).visibility !== 'visible') return 0;
    const box = record.slot.getBoundingClientRect();
    const height = Math.max(0, Math.min(box.bottom, innerHeight - 76) - Math.max(box.top, 62));
    return height / Math.max(1, Math.min(box.height, innerHeight - 138));
  }
  async function start(record, explicit = false) {
    if (motion.matches || record.failed || record.slot.dataset.motionReady !== 'true' || document.hidden || visible(record) < .25) return;
    if (!explicit && (record.completed || record.userPaused || record.blocked)) return;
    const player = playerFor(record.slot.dataset.motionClip);
    const { video } = player;
    const changedOwner = player.owner !== record;
    if (!changedOwner && !video.paused) return;
    if (changedOwner) {
      pause(player, 'paused-offscreen');
      if (player.owner) player.owner.slot.dataset.frameVisible = 'false';
      player.owner = record;
      record.slot.appendChild(video);
    }
    if (!video.getAttribute('src')) video.src = sources[player.key];
    if ((explicit && record.completed) || (changedOwner && !record.started)) video.currentTime = 0;
    record.userPaused = false; record.blocked = false; record.completed = false; record.started = true;
    const request = ++player.request;
    state(record, 'loading');
    window.dispatchEvent(new CustomEvent('tiger:video-claim', { detail: { video } }));
    try {
      await video.play();
      if (request !== player.request) return;
      if (visible(record) < .25 || document.hidden || motion.matches) { pause(player, 'paused-offscreen'); return; }
      const showFrame = () => { if (player.owner === record && request === player.request) record.slot.dataset.frameVisible = 'true'; };
      if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(showFrame);
      else showFrame();
      state(record, 'playing');
    } catch (error) {
      if (request !== player.request || error.name === 'AbortError') return;
      record.blocked = error.name === 'NotAllowedError';
      record.failed = !record.blocked;
      state(record, record.blocked ? 'autoplay-blocked' : 'error');
    }
  }
  slots.forEach(slot => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'motion-video-toggle';
    slot.appendChild(button);
    const record = { slot, button, completed: false, failed: false, started: false, userPaused: false, blocked: false };
    records.set(slot, record);
    state(record, slot.dataset.motionReady === 'true' ? 'idle' : 'awaiting-media');
    button.addEventListener('click', () => {
      const player = players.get(slot.dataset.motionClip);
      if (player?.owner === record && !player.video.paused) {
        record.userPaused = true; pause(player, 'paused-user');
      } else start(record, true);
    });
  });
  function reconcile() {
    const active = [...records.values()].filter(record => visible(record) >= .25);
    active.sort((a, b) => visible(b) - visible(a));
    const chosen = active[0];
    for (const player of players.values()) {
      if (motion.matches || document.hidden || player.owner !== chosen) pause(player, motion.matches ? 'reduced-motion' : 'paused-offscreen');
    }
    if (document.querySelector('#hero')?.dataset.videoState === 'playing') return;
    if (chosen) start(chosen);
  }
  let ticking = false;
  const schedule = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; reconcile(); });
  };
  const observer = new IntersectionObserver(schedule, { threshold: [0, .25, .5, .75, 1], rootMargin: '-62px 0px -76px 0px' });
  slots.forEach(slot => observer.observe(slot));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('tiger:story-step', () => {
    for (const player of players.values()) {
      if (player.owner && visible(player.owner) === 0) pause(player, 'paused-hidden-stage');
    }
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('tiger:video-claim', event => {
    for (const player of players.values()) if (player.video !== event.detail.video) pause(player, 'paused-other-video');
  });
  motion.addEventListener('change', () => { staticPhone(); records.forEach(updateButton); schedule(); });

  const showcase = document.querySelector('.operation-showcase');
  const figure = showcase?.querySelector('.operation-panel figure');
  if (showcase && figure) {
    showcase.dataset.workflowEnhanced = 'true';
    figure.classList.add('workflow-figure');
    const workflow = [
      ['기획', '무엇을, 누구에게 보여줄지.', '대표 메뉴·고객·채널의 역할을 정리하고 촬영 방향을 맞춥니다.'],
      ['제작', '촬영한 장면을 콘텐츠로.', '촬영 원본에서 핵심 컷을 고르고 채널에 맞게 편집합니다.'],
      ['검수', '게시 전에 함께 확인.', '메뉴 정보와 표현, 수정할 부분을 확인합니다.'],
      ['게시', '어느 채널에, 언제 나갈지.', '게시 일정과 채널별 진행 상태를 확인합니다.'],
    ];
    const foodPoster = 'assets/home/video-upgrade/tiger-food-detail-poster-v1.webp';
    const scenes = [
      `<div class="brief-sheet"><header><span>CONTENT BRIEF</span><b>대표 메뉴 소개</b></header><dl><div><dt>대상</dt><dd>매장을 처음 만나는 고객</dd></div><div><dt>전달</dt><dd>메뉴 특징과 방문 전 필요한 정보</dd></div><div><dt>촬영</dt><dd>전체 상차림 → 메뉴 디테일</dd></div></dl><ol class="brief-schedule"><li><span>준비</span><b>메뉴 확인</b></li><li><span>촬영</span><b>장면 구성</b></li><li><span>초안</span><b>함께 검토</b></li></ol></div>`,
      `<div class="production-desk"><div class="shot-strip">${['전체 메뉴','디테일','마무리 컷'].map((label, i) => `<figure><img src="${foodPoster}" alt="${label} 편집 소재 예시" loading="lazy" class="shot-crop-${i}"><figcaption>${label}</figcaption></figure>`).join('')}</div><div class="edit-timeline"><div><span>영상</span><ol><li>메뉴 전체</li><li>특징 컷</li><li>마무리</li></ol></div><div><span>자막</span><ol><li>메뉴 소개</li><li>정보 확인</li></ol></div></div><p class="workflow-note">촬영 목록 → 컷 선택 → 채널별 편집</p></div>`,
      `<div class="review-desk"><ul class="review-checks"><li><span>확인 항목</span><b>메뉴명 · 실제 구성</b></li><li><span>확인 항목</span><b>가격 · 운영 정보</b></li><li><span>확인 항목</span><b>사진 · 표현 · 사용 권리</b></li></ul><div class="review-feedback"><span>피드백 예시</span><p>메뉴 구성 설명을 먼저 보여 주세요.</p><b>초안 수정 → 재확인 → 게시 승인</b></div></div>`,
      `<div class="publish-board"><div class="publish-row publish-head"><span>채널</span><span>콘텐츠</span><span>일정 · 상태</span></div>${[['YouTube','Shorts','일정 협의'],['Instagram','릴스','검수 후 예약'],['TikTok','세로 영상','일정 협의'],['네이버 클립','메뉴 소개','게시 전 확인']].map(row => `<div class="publish-row"><b>${row[0]}</b><span>${row[1]}</span><em>${row[2]}</em></div>`).join('')}<p class="workflow-note">승인된 콘텐츠를 채널별 일정에 맞춰 게시</p></div>`,
    ];
    const surface = document.createElement('div');
    surface.className = 'workflow-surface';
    surface.innerHTML = `<p class="workflow-heading">함께 확인하는 진행 단계 · 업무 흐름 예시</p><div class="workflow-steps" role="tablist" aria-label="운영 업무 단계">${workflow.map((step, i) => `<button type="button" class="workflow-step" role="tab" id="workflowTab${i}" aria-controls="workflowPanel${i}" data-workflow-step="${i}">${step[0]}</button>`).join('')}</div><div class="workflow-details">${workflow.map((step, i) => `<section class="workflow-detail" role="tabpanel" id="workflowPanel${i}" data-workflow-scene="${i}" aria-labelledby="workflowTab${i}"><h4>${step[1]}</h4><div class="workflow-canvas">${scenes[i]}</div><p class="workflow-summary">${step[2]}</p></section>`).join('')}</div>`;
    figure.prepend(surface);
    let active = -1;
    const setWorkflow = index => {
      if (index === active) return;
      active = index; showcase.dataset.workflowStep = String(index);
      surface.querySelectorAll('.workflow-step').forEach((button, i) => {
        button.classList.toggle('is-active', i === index); button.setAttribute('aria-selected', String(i === index));
        button.tabIndex = i === index ? 0 : -1;
      });
      surface.querySelectorAll('.workflow-detail').forEach((panel, i) => { panel.classList.toggle('is-active', i === index); panel.setAttribute('aria-hidden', String(i !== index && !motion.matches)); panel.inert = i !== index && !motion.matches; });
    };
    surface.querySelectorAll('.workflow-step').forEach((button, i) => {
      button.addEventListener('click', () => setWorkflow(i));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 3 : (active + (event.key === 'ArrowRight' ? 1 : 3)) % 4;
        setWorkflow(next); surface.querySelectorAll('.workflow-step')[next].focus();
      });
    });
    window.addEventListener('tiger:workflow-step', event => setWorkflow(event.detail.index));
    motion.addEventListener('change', () => { const index = active; active = -1; setWorkflow(index); });
    setWorkflow(0);
  }
})();
