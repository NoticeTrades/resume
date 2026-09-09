import '../mobileNav.css';

// Move the existing links, preserving their URLs, current-page state and listeners.
export function initializeMobileNav(header = document.querySelector('.site-header')) {
  if (!header) return () => {};
  const nav = header.querySelector('nav');
  const cardMarks = [...nav.querySelectorAll('a')].map((link, index) => {
    const mark = document.createElement('span');
    mark.className = 'nav-card';
    mark.setAttribute('aria-hidden', 'true');
    mark.innerHTML = `<span>${['A', '2', '3', '4', '5'][index]}</span><span>♠</span>`;
    link.append(mark);
    return mark;
  });
  const socials = header.querySelector('.social-icons');
  const links = [...socials.querySelectorAll('a')];
  const navHome = document.createComment('navigation');
  nav.before(navHome);
  const socialHomes = links.map(link => {
    const marker = document.createComment('social');
    link.before(marker);
    return marker;
  });
  const toggle = document.createElement('button');
  toggle.className = 'menu-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.setAttribute('aria-controls', 'mobileMenu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span></span><span></span>';
  const dialog = document.createElement('dialog');
  dialog.id = 'mobileMenu';
  dialog.className = 'mobile-menu';
  dialog.setAttribute('aria-labelledby', 'mobileMenuTitle');
  dialog.innerHTML = `
    <div class="mobile-menu-top">
      <span id="mobileMenuTitle">Navigation</span>
      <button class="menu-close" type="button" aria-label="Close menu" autofocus>×</button>
    </div>
    <div class="mobile-menu-links"></div>
    <div class="mobile-menu-footer">
      <span>Elsewhere</span>
      <div class="social-icons" aria-label="Social links"></div>
    </div>`;
  header.append(toggle, dialog);
  header.classList.add('has-mobile-menu');
  const mobile = matchMedia('(max-width: 900px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let animation;
  let entrances = [];
  let scrollState;
  let closing = false;

  function restoreScroll() {
    if (!scrollState) return;
    const { x, y, styles } = scrollState;
    Object.assign(document.body.style, styles);
    scrollState = null;
    window.scrollTo({ left: x, top: y, behavior: 'instant' });
  }

  function finishClose() {
    entrances.forEach(effect => effect.cancel());
    entrances = [];
    animation?.cancel();
    animation = null;
    // Restore layout before native dialog focus returns to the sticky trigger.
    // Otherwise Safari/Chromium can scroll toward its temporarily fixed position.
    restoreScroll();
    dialog.close();
    // Touch activation does not focus buttons in Safari, so native dialog
    // restoration alone can leave keyboard focus on the document body.
    if (mobile.matches && toggle.isConnected) toggle.focus({ preventScroll: true });
    closing = false;
    toggle.setAttribute('aria-expanded', 'false');
  }

  function close(immediate = false) {
    if (!dialog.open) return;
    if (immediate || reducedMotion.matches) return finishClose();
    if (closing) return;
    closing = true;
    const from = getComputedStyle(dialog).transform;
    animation?.cancel();
    animation = dialog.animate([{ transform: from }, { transform: 'translateX(100%)' }], {
      duration: 200, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'both',
    });
    animation.finished.then(finishClose).catch(() => {});
  }

  function open() {
    if (!mobile.matches || dialog.open) return;
    const styles = {};
    for (const key of ['position', 'top', 'left', 'width']) styles[key] = document.body.style[key];
    scrollState = { x: scrollX, y: scrollY, styles };
    Object.assign(document.body.style, {
      position: 'fixed', top: `${-scrollY}px`, left: `${-scrollX}px`, width: '100%',
    });
    dialog.showModal(); // Native focus containment and background inertness.
    toggle.setAttribute('aria-expanded', 'true');
    if (!reducedMotion.matches) {
      entrances = [...nav.children].map((link, index) => link.animate([
        { opacity: 0, transform: 'translate(22px, 6px)' },
        { opacity: 1, transform: 'translate(0, 0)' },
      ], { duration: 340, delay: 110 + index * 65, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' }));
      animation = dialog.animate([{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], {
        duration: 360, easing: 'cubic-bezier(.22, 1, .36, 1)',
      });
    }
  }

  function layout() {
    close(true);
    if (mobile.matches) {
      dialog.querySelector('.mobile-menu-links').append(nav);
      dialog.querySelector('.social-icons').append(...links);
    } else {
      navHome.after(nav);
      links.forEach((link, index) => socialHomes[index].after(link));
    }
  }

  toggle.addEventListener('click', open);
  dialog.querySelector('.menu-close').addEventListener('click', () => close());
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const items = [...dialog.querySelectorAll('button, a[href]')];
    // Safari can omit links from its native Tab order. Include every menu
    // destination consistently, including with an external iPad keyboard.
    const index = items.indexOf(document.activeElement);
    const next = (index + (event.shiftKey ? -1 : 1) + items.length) % items.length;
    event.preventDefault();
    items[next].focus();
  });
  // Restore the page before the browser follows a same-page anchor.
  dialog.addEventListener('click', event => {
    if (event.target.closest('a')) close(true);
  });
  let backdropDown = false;
  const outside = event => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  dialog.addEventListener('pointerdown', event => { backdropDown = event.target === dialog && outside(event); });
  dialog.addEventListener('pointerup', event => {
    if (backdropDown && event.target === dialog && outside(event)) close();
    backdropDown = false;
  });
  mobile.addEventListener('change', layout);
  const onPageHide = () => close(true);
  const onMotionChange = () => {
    if (reducedMotion.matches) {
      entrances.forEach(effect => effect.cancel());
      animation?.finish();
    }
  };
  reducedMotion.addEventListener('change', onMotionChange);
  window.addEventListener('pagehide', onPageHide);
  layout();

  return () => {
    close(true);
    mobile.removeEventListener('change', layout);
    reducedMotion.removeEventListener('change', onMotionChange);
    window.removeEventListener('pagehide', onPageHide);
    navHome.replaceWith(nav);
    cardMarks.forEach(mark => mark.remove());
    socialHomes.forEach((marker, index) => marker.replaceWith(links[index]));
    toggle.remove();
    dialog.remove();
    header.classList.remove('has-mobile-menu');
  };
}
