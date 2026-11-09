/* Help-only navigation. No extension APIs, storage or network. */
(() => {
  'use strict';
  const links = [...document.querySelectorAll('.guide-nav a[href^="#"]')];
  const entries = links.map(link => ({link, section: document.getElementById(link.hash.slice(1))})).filter(entry => entry.section);
  let frame = 0;
  const update = () => {
    frame = 0;
    let current = null;
    const line = Math.min(160, innerHeight * .25);
    for (const entry of entries) if (entry.section.getBoundingClientRect().top <= line) current = entry;
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) current = entries.at(-1);
    for (const entry of entries) {
      if (entry === current) entry.link.setAttribute('aria-current', 'location');
      else entry.link.removeAttribute('aria-current');
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  addEventListener('hashchange', schedule);
  addEventListener('load', schedule);
  if (typeof ResizeObserver === 'function') new ResizeObserver(schedule).observe(document.body);
  schedule();
})();
