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
    document.querySelectorAll('[data-phone-stage]').forEach(panel => { panel.inert = false; panel.setAttribute('aria-hidden', 'false'); });
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
    const surface = document.createElement('div');
    surface.className = 'workflow-surface';
    surface.innerHTML = `<p class="workflow-heading">함께 확인하는 진행 단계</p><div class="workflow-steps" role="tablist" aria-label="운영 업무 단계">${workflow.map((step, i) => `<button type="button" class="workflow-step" role="tab" id="workflowTab${i}" aria-controls="workflowPanel${i}" data-workflow-step="${i}">${step[0]}</button>`).join('')}</div><div class="workflow-details">${workflow.map((step, i) => `<div class="workflow-detail" role="tabpanel" id="workflowPanel${i}" aria-labelledby="workflowTab${i}"><strong>${step[1]}</strong><p>${step[2]}</p></div>`).join('')}</div>`;
    figure.prepend(surface);
    let active = -1;
    const setWorkflow = index => {
      if (index === active) return;
      active = index; showcase.dataset.workflowStep = String(index);
      surface.querySelectorAll('.workflow-step').forEach((button, i) => {
        button.classList.toggle('is-active', i === index); button.setAttribute('aria-selected', String(i === index));
        button.tabIndex = i === index ? 0 : -1;
      });
      surface.querySelectorAll('.workflow-detail').forEach((panel, i) => { panel.classList.toggle('is-active', i === index); panel.setAttribute('aria-hidden', String(i !== index)); });
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
    setWorkflow(0);
  }
})();
