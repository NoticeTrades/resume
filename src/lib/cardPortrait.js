const SHUFFLE_INTERVAL = 10_000;
const DURATION = 3000;
const EASING = 'cubic-bezier(0.45, 0, 0.2, 1)';

// Keep the portrait's existing integration point; the old free-body puzzle
// physics is replaced with bounded card choreography and an idle timer.
export function createCardPortrait({ hero, shell, image }) {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cards = [...shell.querySelectorAll('.portrait-card')];
  let animations = [];
  let timer = 0;
  let ready = false;
  let visible = true;
  let suspended = document.hidden;
  let lastVariation = -1;
  let nextShuffle = performance.now() + SHUFFLE_INTERVAL;
  let lastStarted = -Infinity;
  let generation = 0;
  let bag = [];

  const canAnimate = () => ready && visible && !suspended && !motionQuery.matches;
  const home = (index) => `translate(${(index - 4) * 2}px, ${(4 - index) * 2}px) rotate(0deg) rotateY(${index === 4 ? 0 : 180}deg) scale(1)`;
  const pose = (x, y, rotation, flip = 0) =>
    `translate(${x}%, ${y}%) rotate(${rotation}deg) rotateY(${flip}deg) scale(0.88)`;

  function nextVariation() {
    if (!bag.length) {
      bag = [0, 1, 2];
      for (let index = bag.length - 1; index > 0; index -= 1) {
        const pick = Math.floor(Math.random() * (index + 1));
        [bag[index], bag[pick]] = [bag[pick], bag[index]];
      }
      if (bag[0] === lastVariation) [bag[0], bag[1]] = [bag[1], bag[0]];
    }
    lastVariation = bag.shift();
    return lastVariation;
  }

  function framesFor(index, variation) {
    const rest = home(index);
    const closed = pose((index - 2) * 0.7, (4 - index) * 0.6, 0, 180);
    const face = index === 4 ? 180 : 0;
    const frame = (offset, transform, zIndex = index) => ({ offset, transform, zIndex });
    if (variation === 0) {
      const rank = index - 2;
      return [
        frame(0, rest), frame(0.17, closed),
        frame(0.4, pose(rank * 11, Math.abs(rank) * 2.5 - 4, rank * 12, face)),
        frame(0.59, pose(rank * 11, Math.abs(rank) * 2.5 - 4, rank * 12, face)),
        frame(0.81, closed), frame(1, rest),
      ];
    }
    if (variation === 1) {
      // Two packets hinge inward, release alternating cards, then square up.
      // The release times, rather than whole-card delays, define the riffle.
      const side = index % 2 === 0 ? -1 : 1;
      const packet = pose(side * 24, 0, side * 8, 180);
      const bent = `${pose(side * 24, -1, side * 8, face)} rotateX(16deg)`;
      const release = 0.42 + index * 0.045;
      return [
        frame(0, rest), frame(0.16, closed), frame(0.31, packet),
        frame(0.4, bent), frame(release, bent),
        frame(release + 0.065, `${pose(side * 4, (4 - index) * 0.7, side * 2, face)} rotateX(0deg)`, index + 5),
        frame(0.76, pose(0, (4 - index) * 0.7, 0, face), index + 5),
        frame(0.85, closed), frame(1, rest),
      ];
    }
    // Hindu shuffle: successive small packets are pulled lengthwise from the
    // held deck and caught in a receiving pile below it. No lateral riffle.
    const pull = 0.27 + index * 0.085;
    const held = pose(3, -8, 3, 180);
    const caught = pose(-4, 6 + (4 - index) * 0.5, -2, face);
    return [
      frame(0, rest), frame(0.17, closed), frame(0.25, held),
      frame(pull, held),
      frame(pull + 0.055, pose(-6, 5, -4, face), index + 5),
      frame(pull + 0.11, caught, index + 5),
      frame(0.78, caught, index + 5), frame(0.87, closed), frame(1, rest),
    ];
  }

  function settle() {
    generation += 1;
    animations.forEach((animation) => animation.cancel());
    animations = [];
    shell.dataset.state = 'idle';
  }

  function schedule() {
    clearTimeout(timer);
    if (!canAnimate()) return;
    timer = window.setTimeout(() => {
      nextShuffle = performance.now() + SHUFFLE_INTERVAL;
      shuffle();
      schedule();
    }, Math.max(0, nextShuffle - performance.now()));
  }

  function shuffle() {
    if (!canAnimate() || animations.length) return;
    const variation = nextVariation();
    const currentGeneration = ++generation;
    lastStarted = performance.now();
    shell.dataset.state = 'shuffling';
    shell.dataset.shuffle = ['fan', 'riffle', 'hindu'][variation];
    animations = cards.map((card, index) => card.animate(framesFor(index, variation).map(frame => ({ ...frame, easing: EASING })), {
      duration: DURATION,
      delay: 0,
      easing: 'linear',
      fill: 'both',
    }));
    Promise.all(animations.map((animation) => animation.finished)).then(() => {
      if (generation === currentGeneration) settle();
    }).catch(() => { /* Visibility and motion changes cancel back to the crisp photo. */ });
  }

  function pause() {
    suspended = true;
    clearTimeout(timer);
    settle();
  }

  function resume() {
    suspended = document.hidden;
    nextShuffle = performance.now() + SHUFFLE_INTERVAL;
    schedule();
  }

  // A passing Pokemon may trigger one shuffle, but continuous contact cannot
  // keep restarting the sequence or exhaust the portrait's quiet interval.
  function disturb(x, y, radius = 120) {
    if (performance.now() - lastStarted < SHUFFLE_INTERVAL) return;
    const rect = shell.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();
    const centerX = rect.left - heroRect.left + rect.width / 2;
    const centerY = rect.top - heroRect.top + rect.height / 2;
    if (Math.hypot(centerX - x, centerY - y) < radius + rect.width / 2) shuffle();
  }

  shell.addEventListener('click', () => {
    shuffle();
  });
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) {
      clearTimeout(timer);
      settle();
    } else {
      nextShuffle = performance.now() + SHUFFLE_INTERVAL;
      schedule();
    }
  });
  observer.observe(shell);

  motionQuery.addEventListener('change', () => {
    settle();
    nextShuffle = performance.now() + SHUFFLE_INTERVAL;
    schedule();
  });

  function init() {
    if (ready) return;
    ready = true;
    shuffle();
    schedule();
  }
  if (image.complete && image.naturalWidth) init();
  else image.addEventListener('load', init, { once: true });

  return { disturb, scatterFrom: shuffle, pause, resume };
}
