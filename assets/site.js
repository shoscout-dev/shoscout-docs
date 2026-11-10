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
  let activeSupport = null;
  let supportTrigger = null;
  function closeSupport(restoreFocus = false) {
    if (activeSupport) activeSupport.hidden = true;
    activeSupport = null;
    supportButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
    if (restoreFocus) supportTrigger?.focus();
  }
  supportButtons.forEach(button => button.addEventListener('click', () => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    if (activeSupport === panel) {
      closeSupport(true);
      return;
    }
    closeSupport();
    supportTrigger = button;
    activeSupport = panel;
    panel.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    panel.scrollTop = 0;
    panel.querySelector('[data-panel-focus]')?.focus({ preventScroll: true });
  }));
  document.querySelectorAll('[data-close-support]').forEach(button => {
    button.addEventListener('click', () => closeSupport(true));
  });
  document.addEventListener('click', event => {
    if (activeSupport && !activeSupport.contains(event.target) &&
      !supportButtons.some(button => button.contains(event.target))) closeSupport();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeSupport) {
      event.preventDefault();
      closeSupport(true);
    }
  });

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

