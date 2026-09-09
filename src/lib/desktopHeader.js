import '../desktopHeader.css';

export function initializeDesktopHeader(header) {
  const desktop = matchMedia('(min-width: 901px)');
  // Reserve the expanded height so shrinking the sticky bar never moves the
  // document or feeds artificial scroll deltas back into direction detection.
  const space = document.createElement('div');
  space.className = 'desktop-header-space';
  header.before(space);
  space.append(header);
  header.classList.add('desktop-scroll-header');
  let compact = false;
  let previous = Math.max(0, scrollY);
  let travel = 0;
  let frame = 0;
  let resizeFrame = 0;

  function setCompact(value) {
    if (compact === value) return;
    compact = value;
    header.classList.toggle('is-compact', compact);
  }
  function measure() {
    header.classList.add('header-measuring');
    setCompact(false);
    space.style.setProperty('--expanded-header-height', `${header.getBoundingClientRect().height}px`);
    // Commit the full-size layout before restoring CSS transitions.
    header.getBoundingClientRect();
    header.classList.remove('header-measuring');
    previous = Math.max(0, scrollY);
    travel = 0;
  }
  function update() {
    frame = 0;
    if (!desktop.matches) return;
    const y = Math.max(0, Math.min(scrollY, document.documentElement.scrollHeight - innerHeight));
    const delta = y - previous;
    previous = y;
    if (y < 80) { travel = 0; setCompact(false); return; }
    if (Math.sign(delta) !== Math.sign(travel)) travel = 0;
    travel += delta;
    if (travel > 18 && !header.querySelector(':focus-visible')) setCompact(true);
    if (travel < -12) setCompact(false);
  }
  function scroll() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  function resize() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(measure);
  }
  const focus = () => { travel = 0; setCompact(false); };
  measure();
  window.addEventListener('scroll', scroll, { passive: true });
  window.addEventListener('resize', resize);
  desktop.addEventListener('change', measure);
  header.addEventListener('focusin', focus);
  return () => {
    cancelAnimationFrame(frame);
    cancelAnimationFrame(resizeFrame);
    window.removeEventListener('scroll', scroll);
    window.removeEventListener('resize', resize);
    desktop.removeEventListener('change', measure);
    header.removeEventListener('focusin', focus);
    header.classList.remove('desktop-scroll-header', 'is-compact', 'header-measuring');
    space.replaceWith(header);
  };
}
