(() => {
  'use strict';

  const clamp01 = (value) => Math.max(0, Math.min(1, value));

  function init(options = {}) {
    const root = document.querySelector(options.root);
    if (!root || root.dataset.tigerEffectsReady === 'true') return;
    root.dataset.tigerEffectsReady = 'true';

    const hero = document.querySelector(options.hero);
    const header = document.querySelector(options.header);
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
    const sectionSelector = options.sections || ':scope > section';
    const sections = [...root.querySelectorAll(sectionSelector)].filter((section) => section !== hero);
    const lightSections = new Set(options.lightSections || []);
    const clawLayer = document.querySelector('.global-claw-sweep');
    const clawZones = (options.clawAnchors || []).map((selector) => document.querySelector(selector)).filter(Boolean);
    let activeClawZone = null;
    let ticking = false;

    const clearClaw = () => {
      clawLayer?.classList.remove('is-active');
      activeClawZone = null;
    };

    const interactionIsActive = () => {
      const focused = document.activeElement;
      return document.body.classList.contains('form-open')
        || Boolean(document.querySelector('dialog[open],[role="dialog"][aria-modal="true"]'))
        || Boolean(focused && focused.matches('input,textarea,select'))
        || Boolean(focused && focused.closest('form,dialog,[role="dialog"]'));
    };

    const updatePattern = () => {
      if (!sections.length) return;
      const headerHeight = header?.offsetHeight || 0;
      if (hero && hero.getBoundingClientRect().bottom > headerHeight + 8) {
        root.style.setProperty('--tiger-base-opacity', '0');
        root.style.setProperty('--tiger-glow-opacity', '0');
        clearClaw();
        return;
      }
      if (reducedMotion) {
        root.style.setProperty('--tiger-base-opacity', '.3');
        root.style.setProperty('--tiger-glow-opacity', '.08');
        root.style.setProperty('--tiger-glow-x', '64%');
        root.style.setProperty('--tiger-glow-y', '46%');
        return;
      }

      const focusY = window.innerHeight * .52;
      let activeSection = sections[0];
      let nearestDistance = Infinity;
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const distance = rect.top <= focusY && rect.bottom >= focusY
          ? 0
          : Math.min(Math.abs(rect.top - focusY), Math.abs(rect.bottom - focusY));
        if (distance < nearestDistance) {
          nearestDistance = distance;
          activeSection = section;
        }
      });

      const rect = activeSection.getBoundingClientRect();
      const progress = clamp01((focusY - rect.top) / Math.max(1, rect.height));
      const activeIndex = Math.max(0, sections.indexOf(activeSection));
      const mobile = window.innerWidth <= 809;
      const isLightSection = lightSections.has(activeSection.id);
      const glowStrength = (isLightSection ? .015 : .055)
        + Math.sin(Math.PI * progress) * (isLightSection ? .03 : (mobile ? .17 : .2));
      root.style.setProperty('--tiger-base-opacity', isLightSection ? '.07' : (mobile ? '.27' : '.31'));
      root.style.setProperty('--tiger-glow-opacity', glowStrength.toFixed(3));
      root.style.setProperty('--tiger-glow-x', `${18 + ((activeIndex * 31) % 64)}%`);
      root.style.setProperty('--tiger-glow-y', `${12 + progress * 76}%`);

      if (activeClawZone && !activeClawZone.matches(':hover')) {
        const activeRect = activeClawZone.getBoundingClientRect();
        if (activeRect.bottom <= 0 || activeRect.top >= window.innerHeight) clearClaw();
      }
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        updatePattern();
      });
    };

    if (!reducedMotion && clawLayer && 'IntersectionObserver' in window) {
      clawLayer.addEventListener('animationend', clearClaw);
      const clawObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            if (entry.target === activeClawZone) clearClaw();
            return;
          }
          if (entry.target.dataset.clawPlayed === 'true' || interactionIsActive()) return;
          entry.target.dataset.clawPlayed = 'true';
          activeClawZone = entry.target;
          clawLayer.dataset.anchor = entry.target.id;
          clawLayer.classList.remove('is-active');
          void clawLayer.offsetWidth;
          clawLayer.classList.add('is-active');
        });
      }, { threshold: .18 });
      clawZones.forEach((zone) => clawObserver.observe(zone));
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    updatePattern();
  }

  window.TigerSurfaceEffects = { init };
})();
