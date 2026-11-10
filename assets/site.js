(() => {
  'use strict';
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function activateTab(tab, focus = false) {
    tabs.forEach(candidate => {
      const active = candidate === tab;
      candidate.setAttribute('aria-selected', String(active));
      candidate.tabIndex = active ? 0 : -1;
      document.getElementById(candidate.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length :
        event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length :
        event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (next !== null) {
        event.preventDefault();
        activateTab(tabs[next], true);
      }
    });
  });

  const supportButtons = [...document.querySelectorAll('[data-support]')];
  const supportPanels = [...document.querySelectorAll('.support-panel')];
  const desktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const narrowViewport = window.matchMedia('(max-width: 1100px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const backToTop = document.querySelector('.quick-top');
  let activeSupport = null;
  let supportTrigger = null;
  let supportPinned = false;
  let openTimer;
  let closeTimer;
  let navigationFrame;

  function clearSupportTimers() {
    window.clearTimeout(openTimer);
    window.clearTimeout(closeTimer);
  }

  function positionSupport() {
    if (!activeSupport) return;
    if (narrowViewport.matches) {
      activeSupport.style.removeProperty('top');
      activeSupport.style.removeProperty('right');
      return;
    }
    const trigger = supportTrigger.getBoundingClientRect();
    const center = trigger.top + trigger.height / 2;
    const height = activeSupport.offsetHeight;
    const top = Math.max(12, Math.min(center - height / 2, innerHeight - height - 12));
    activeSupport.style.top = top + 'px';
    activeSupport.style.right = (innerWidth - trigger.left + 18) + 'px';
    activeSupport.style.setProperty('--support-arrow-y', Math.max(22, Math.min(center - top, height - 22)) + 'px');
  }

  function closeSupport(restoreFocus = false) {
    clearSupportTimers();
    if (activeSupport) activeSupport.hidden = true;
    activeSupport = null;
    supportPinned = false;
    supportButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
    if (restoreFocus) supportTrigger?.focus({ preventScroll: true });
  }

  function openSupport(button, pin = false) {
    clearSupportTimers();
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    if (activeSupport !== panel) {
      closeSupport();
      supportTrigger = button;
      activeSupport = panel;
      panel.hidden = false;
      panel.querySelector('.support-body').scrollTop = 0;
      button.setAttribute('aria-expanded', 'true');
    }
    supportPinned = supportPinned || pin;
    positionSupport();
    if (pin) panel.querySelector('[data-panel-focus]')?.focus({ preventScroll: true });
  }

  function scheduleClose() {
    clearSupportTimers();
    if (supportPinned) return;
    closeTimer = window.setTimeout(() => {
      if (!activeSupport) return;
      const interacting = supportTrigger.matches(':hover') ||
        activeSupport.matches(':hover') ||
        activeSupport.contains(document.activeElement);
      if (!interacting) closeSupport();
    }, 280);
  }

  supportButtons.forEach(button => {
    button.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' || !desktopPointer.matches || narrowViewport.matches) return;
      clearSupportTimers();
      if (supportPinned) return;
      openTimer = window.setTimeout(() => {
        if (button.matches(':hover')) openSupport(button);
      }, 160);
    });
    button.addEventListener('pointerleave', scheduleClose);
    button.addEventListener('click', () => {
      if (activeSupport?.id === button.getAttribute('aria-controls') && supportPinned) {
        closeSupport(true);
      } else {
        openSupport(button, true);
      }
    });
  });

  supportPanels.forEach(panel => {
    panel.addEventListener('pointerenter', clearSupportTimers);
    panel.addEventListener('pointerleave', scheduleClose);
    panel.addEventListener('focusout', scheduleClose);
  });
  document.querySelectorAll('[data-close-support]').forEach(button => {
    button.addEventListener('click', () => closeSupport(true));
  });
  document.addEventListener('pointerdown', event => {
    if (!activeSupport?.contains(event.target) &&
      !supportButtons.some(button => button.contains(event.target))) closeSupport();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      clearSupportTimers();
      if (activeSupport) {
        event.preventDefault();
        closeSupport(true);
      }
    }
  });

  function updateNavigation() {
    navigationFrame = null;
    backToTop.hidden = scrollY < Math.max(600, innerHeight * 0.9);
    positionSupport();
  }
  function scheduleNavigationUpdate() {
    if (!navigationFrame) navigationFrame = requestAnimationFrame(updateNavigation);
  }
  window.addEventListener('scroll', scheduleNavigationUpdate, { passive: true });
  window.addEventListener('resize', scheduleNavigationUpdate);
  desktopPointer.addEventListener('change', () => {
    if (!supportPinned) closeSupport();
  });
  backToTop.addEventListener('click', event => {
    event.preventDefault();
    closeSupport();
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    document.querySelector('.site-brand').focus({ preventScroll: true });
  });
  updateNavigation();



  const dialog = document.querySelector('.image-dialog');
  const fullImage = dialog.querySelector('img');
  const caption = document.getElementById('image-caption');
  let imageTrigger = null;
  document.querySelectorAll('[data-enlarge]').forEach(button => button.addEventListener('click', () => {
    const image = button.querySelector('img');
    imageTrigger = button;
    fullImage.src = image.currentSrc || image.src;
    fullImage.alt = image.alt;
    caption.textContent = image.alt;
    dialog.showModal();
    dialog.querySelector('[data-close-image]').focus();
  }));
  dialog.querySelector('[data-close-image]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right ||
      event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    fullImage.removeAttribute('src');
    imageTrigger?.focus({ preventScroll: true });
  });
})();

