const pokemonOptions = [
  { name: "Bulbasaur", src: "/pokemon/bulbasaur.webp", size: "sm" },
  { name: "Shinx", src: "/pokemon/shinx.webp", size: "sm" },
  { name: "Flareon", src: "/pokemon/flareon.webp", size: "lg" },
  { name: "Gengar", src: "/pokemon/gengar.webp", size: "md" },
  { name: "Pikachu", src: "/pokemon/pikachu.webp", size: "md" },
  { name: "Blastoise", src: "/pokemon/blastoise.webp", size: "lg" },
  { name: "Dragonite", src: "/pokemon/dragonite.webp", size: "sm" },
  { name: "Mewtwo", src: "/pokemon/mewtwo.webp", size: "md" },
  { name: "Charizard", src: "/pokemon/charizard.webp", size: "lg" },
  { name: "Giratina", src: "/pokemon/giratina.webp", size: "lg" },
];

export function initializePokemonRelease() {
  const button = document.getElementById("pokeballRelease");
  const pokemon = document.getElementById("pokemonWalker");
  const sprite = document.getElementById("pokemonSprite");

  if (!button || !pokemon || !sprite) return () => {};

  const state = {
    released: false,
    dragging: false,
    x: window.innerWidth - 150,
    y: 120,
    vx: 1.6,
    vy: 1.15,
    facing: 1,
    frameId: 0,
    lastTime: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
  };

  function setPosition() {
    const bob = Math.sin(performance.now() / 140) * 5;
    pokemon.style.setProperty("--x", `${state.x}px`);
    pokemon.style.setProperty("--y", `${state.y + bob}px`);
    pokemon.style.setProperty("--facing", state.facing);
  }

  function clampToViewport() {
    const rect = pokemon.getBoundingClientRect();
    const maxX = Math.max(8, window.innerWidth - rect.width - 8);
    const maxY = Math.max(70, window.innerHeight - rect.height - 8);

    if (state.x < 8) {
      state.x = 8;
      state.vx = Math.abs(state.vx);
    } else if (state.x > maxX) {
      state.x = maxX;
      state.vx = -Math.abs(state.vx);
    }

    if (state.y < 70) {
      state.y = 70;
      state.vy = Math.abs(state.vy);
    } else if (state.y > maxY) {
      state.y = maxY;
      state.vy = -Math.abs(state.vy);
    }
  }

  function launch() {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 0.75;
    state.vx = Math.cos(angle) * speed || 1.5;
    state.vy = Math.sin(angle) * speed || 1;
    state.facing = state.vx >= 0 ? 1 : -1;
  }

  function animate(time) {
    if (!state.released || document.hidden) {
      state.frameId = 0;
      return;
    }

    const dt = Math.min(2.2, Math.max(0.75, (time - (state.lastTime || time)) / 16.67));
    state.lastTime = time;

    if (!state.dragging) {
      state.x += state.vx * dt;
      state.y += state.vy * dt;
      clampToViewport();
    }

    state.facing = state.vx >= 0 ? 1 : -1;
    setPosition();
    state.frameId = requestAnimationFrame(animate);
  }

  function ensureAnimation() {
    if (!state.frameId && state.released && !document.hidden) {
      state.lastTime = 0;
      state.frameId = requestAnimationFrame(animate);
    }
  }

  function releasePokemon() {
    const selected = pokemonOptions[Math.floor(Math.random() * pokemonOptions.length)];
    sprite.src = selected.src;
    sprite.alt = selected.name;
    pokemon.dataset.size = selected.size;
    pokemon.classList.remove("is-popping");
    requestAnimationFrame(() => pokemon.classList.add("is-popping"));

    button.classList.add("is-open");
    window.setTimeout(() => button.classList.remove("is-open"), 700);
    launch();

    if (!state.released) {
      const ballRect = button.getBoundingClientRect();
      state.x = ballRect.left - 40;
      state.y = ballRect.bottom + 8;
      state.released = true;
      pokemon.classList.add("is-released");
      setPosition();
    }

    ensureAnimation();
  }

  function startDrag(event) {
    if (!state.released) return;
    const rect = pokemon.getBoundingClientRect();
    state.dragging = true;
    state.dragOffsetX = event.clientX - rect.left;
    state.dragOffsetY = event.clientY - rect.top;
    pokemon.classList.add("is-dragging");
    pokemon.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function updateDrag(event) {
    if (!state.dragging) return;
    const previousX = state.x;
    const previousY = state.y;
    state.x = event.clientX - state.dragOffsetX;
    state.y = event.clientY - state.dragOffsetY;
    state.vx = (state.x - previousX) * 0.22;
    state.vy = (state.y - previousY) * 0.22;
    clampToViewport();
    setPosition();
  }

  function endDrag(event) {
    if (!state.dragging) return;
    state.dragging = false;
    pokemon.classList.remove("is-dragging");
    pokemon.releasePointerCapture?.(event.pointerId);
    const speed = Math.hypot(state.vx, state.vy);
    if (speed < 1.2) {
      launch();
    } else if (speed > 3.1) {
      state.vx = (state.vx / speed) * 3.1;
      state.vy = (state.vy / speed) * 3.1;
    }
  }

  function handleVisibilityChange() {
    if (document.hidden && state.frameId) {
      cancelAnimationFrame(state.frameId);
      state.frameId = 0;
    } else {
      ensureAnimation();
    }
  }

  function handleResize() {
    if (!state.released) return;
    clampToViewport();
    setPosition();
  }

  function clearPopAnimation() {
    pokemon.classList.remove("is-popping");
  }

  button.addEventListener("click", releasePokemon);
  pokemon.addEventListener("animationend", clearPopAnimation);
  pokemon.addEventListener("pointerenter", launch);
  pokemon.addEventListener("pointerdown", startDrag);
  window.addEventListener("pointermove", updateDrag);
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);
  window.addEventListener("resize", handleResize);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    if (state.frameId) cancelAnimationFrame(state.frameId);
    button.removeEventListener("click", releasePokemon);
    pokemon.removeEventListener("animationend", clearPopAnimation);
    pokemon.removeEventListener("pointerenter", launch);
    pokemon.removeEventListener("pointerdown", startDrag);
    window.removeEventListener("pointermove", updateDrag);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}
