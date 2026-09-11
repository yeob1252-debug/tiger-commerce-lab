(() => {
  'use strict';

  const hero = document.querySelector('#hero');
  const stage = hero?.querySelector('.hero-media-stage');
  if (!hero || !stage) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 809px)');
  const review = new URLSearchParams(window.location.search).get('tiger-video-review') === 'v2';
  const ready = review || hero.dataset.videoReady === 'true';
  const mobileApproved = review || hero.dataset.videoMobile === 'true';
  const source = review ? 'assets/home/video-pilot/tiger-approach-web-v2.mp4' : hero.dataset.videoSrc;
  hero.dataset.videoMode = review ? 'review-v2' : 'default';
  hero.dataset.videoState = ready ? 'idle' : 'awaiting-media';
  hero.dataset.videoVisible = 'false';
  if (!ready) return;

  const video = document.createElement('video');
  video.className = 'hero-approach-video';
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.setAttribute('tabindex', '-1');
  video.disablePictureInPicture = true;
  stage.appendChild(video);

  // Lucide RotateCcw, Play and Pause icon geometry (ISC license, lucide.dev).
  const iconNodes = {
    replay: [['path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }], ['path', { d: 'M3 3v5h5' }]],
    play: [['path', { d: 'M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z' }]],
    pause: [['rect', { x: '14', y: '3', width: '5', height: '18', rx: '1' }], ['rect', { x: '5', y: '3', width: '5', height: '18', rx: '1' }]],
  };
  const controls = document.createElement('div');
  controls.className = 'hero-video-controls';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'hero-video-toggle';
  controls.appendChild(button);
  // Only decorative children are hidden; the native playback control remains accessible.
  hero.querySelector('.hero-media').removeAttribute('aria-hidden');
  stage.querySelector('.scanlines')?.setAttribute('aria-hidden', 'true');
  stage.querySelector('.hero-eye-guide')?.setAttribute('aria-hidden', 'true');
  stage.appendChild(controls);

  let inView = false;
  let attempted = false;
  let completed = false;
  let failed = false;
  let resumeOnEntry = false;
  let startTimer = 0;
  let requestId = 0;
  const allowed = () => !motion.matches && (!mobile.matches || mobileApproved);
  const visible = () => inView && document.visibilityState === 'visible';
  function icon(name, label) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    for (const [key, value] of Object.entries({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' })) svg.setAttribute(key, value);
    for (const [tag, attributes] of iconNodes[name]) {
      const node = document.createElementNS(svg.namespaceURI, tag);
      for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
      svg.appendChild(node);
    }
    button.replaceChildren(svg);
    button.setAttribute('aria-label', label);
  }
  function state(value, showFrame = false) {
    hero.dataset.videoState = value;
    hero.dataset.videoVisible = String(showFrame);
    button.disabled = value === 'loading';
    button.hidden = !allowed() || failed;
    controls.hidden = button.hidden;
    if (value === 'playing' || value === 'buffering') icon('pause', '영상 일시 정지');
    else if (value === 'ended') icon('replay', '영상 다시 재생');
    else icon('play', value === 'loading' ? '영상 불러오는 중' : '영상 재생');
  }
  function clearStartTimer() { window.clearTimeout(startTimer); startTimer = 0; }
  function stop(value) {
    requestId += 1;
    clearStartTimer();
    resumeOnEntry = false;
    video.pause();
    state(value);
  }
  function fail() {
    failed = true;
    stop('error');
    video.removeAttribute('src');
    video.load();
  }
  async function play(replay = false) {
    if (!allowed() || !visible() || failed) return;
    const id = ++requestId;
    attempted = true;
    resumeOnEntry = false;
    if (!video.getAttribute('src')) video.src = source;
    if (replay) { video.currentTime = 0; completed = false; }
    state('loading', video.readyState >= 2 && video.currentTime > 0);
    clearStartTimer();
    startTimer = window.setTimeout(() => { if (id === requestId && video.paused) fail(); }, 10000);
    try {
      window.dispatchEvent(new CustomEvent('tiger:video-claim', { detail: { video } }));
      await video.play();
      if (id !== requestId) return;
      if (!allowed() || !visible()) { suspend(); return; }
      clearStartTimer();
      state('playing', true);
    } catch (error) {
      if (id !== requestId) return;
      clearStartTimer();
      if (error.name === 'NotAllowedError') state('autoplay-blocked');
      else if (error.name !== 'AbortError') fail();
    }
  }
  function suspend() {
    const active = ['playing', 'buffering', 'loading'].includes(hero.dataset.videoState);
    if (!active) return;
    requestId += 1;
    clearStartTimer();
    resumeOnEntry = true;
    video.pause();
    state('paused-offscreen', video.readyState >= 2);
  }
  function reconcile() {
    if (!allowed()) { stop(motion.matches ? 'reduced-motion' : 'mobile-original'); return; }
    if (!visible()) { suspend(); return; }
    if ((!attempted || resumeOnEntry) && !completed && !failed) { play(); return; }
    if (['reduced-motion', 'mobile-original'].includes(hero.dataset.videoState)) state(completed ? 'ended' : 'idle');
  }
  video.addEventListener('playing', () => {
    if (!allowed() || !visible()) { suspend(); return; }
    clearStartTimer();
    state('playing', true);
  });
  video.addEventListener('waiting', () => {
    if (hero.dataset.videoState === 'playing') state('buffering', true);
  });
  video.addEventListener('ended', () => {
    clearStartTimer();
    completed = true;
    resumeOnEntry = false;
    state('ended');
  });
  video.addEventListener('error', () => { if (!failed) fail(); });
  button.addEventListener('click', () => {
    if (['playing', 'buffering'].includes(hero.dataset.videoState)) {
      requestId += 1;
      clearStartTimer();
      resumeOnEntry = false;
      video.pause();
      state('paused-user', true);
    } else play(completed);
  });
  document.addEventListener('visibilitychange', reconcile);
  window.addEventListener('tiger:video-claim', event => { if (event.detail.video !== video) suspend(); });
  motion.addEventListener('change', reconcile);
  mobile.addEventListener('change', reconcile);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= .15;
      reconcile();
    }, { threshold: [0, .15], rootMargin: '-62px 0px 0px 0px' }).observe(stage);
  } else { inView = true; reconcile(); }
  state(allowed() ? 'idle' : motion.matches ? 'reduced-motion' : 'mobile-original');
})();
