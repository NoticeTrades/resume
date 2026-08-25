const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const PHYSICS_STEP = 1000 / 60;
const MAX_STEPS_PER_FRAME = 4;

const TARGET_PIECE_SIZE = 58;
const MIN_COLUMNS = 4;
const MAX_COLUMNS = 8;
const MIN_ROWS = 4;
const MAX_ROWS = 9;

// Knob measurements are fractions of the shorter piece dimension so tabs stay
// proportional on every screen size. The ball is wider than the neck, which is
// what makes neighbouring pieces actually interlock.
const NECK_HALF = 0.062;
const BALL_RADIUS = 0.115;
const BALL_CENTER = 0.145;
const FILLET = 0.04;
const KNOB_REACH = BALL_CENTER + BALL_RADIUS;
const KNOB_FOOTPRINT = NECK_HALF + FILLET;

const INTRO_DELAY = 200;
const INTRO_STAGGER = 850;
const INTRO_FLIGHT = 760;

const RETURN_SPRING = 0.031;
const RETURN_DAMPING = 0.785;
const FREE_DRAG = 0.968;
const ANGLE_SPRING = 0.036;
const ANGLE_DAMPING = 0.8;
const SPIN_DAMPING = 0.94;
const EDGE_RESTITUTION = 0.52;
const HOLD_BASE = 260;
const HOLD_SPREAD = 850;
const MAX_PIECE_SPEED = 26;
const MAX_SPIN = 0.22;

const HOVER_RADIUS = 96;
const HOVER_PUSH = 8;
const SWIPE_SPEED = 13;
const SWIPE_HOLD = 110;
const SWIPE_HOLD_SPREAD = 240;
const SETTLE_DISTANCE = 0.6;
const SETTLE_SPEED = 0.35;

const SHEEN_PERIOD = 7600;
const SHEEN_SWEEP = 0.32;
const FLASH_FADE = 340;
const FLASH_STRENGTH = 0.22;

export function createPuzzlePortrait({ hero, canvas, image, shell }) {
  const ctx = canvas.getContext("2d");
  const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);

  const board = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    columns: 0,
    rows: 0,
    pieceWidth: 0,
    pieceHeight: 0,
    unit: 0,
  };
  // Loose pieces roam this box rather than the whole hero, which keeps the
  // scatter centred on the portrait instead of drifting across the headline.
  const spread = { left: 0, top: 0, right: 0, bottom: 0 };
  const pointer = { x: 0, y: 0, speed: 0, active: false, seen: false };

  let pieces = [];
  let seams = null;
  let seamKey = "";
  let viewWidth = 0;
  let viewHeight = 0;
  let phase = "empty";
  let frameId = 0;
  let accumulator = 0;
  let ready = false;
  // Every timestamp in here comes from the animation loop so intro tweens,
  // scatter holds and settle checks can never drift onto different clocks.
  let clock = 0;
  let lastFrame = 0;
  let introStart = -1;
  let builtSignature = "";

  function layoutSignature() {
    return [
      viewWidth,
      viewHeight,
      board.x,
      board.y,
      board.width,
      board.height,
      board.columns,
      board.rows,
    ].join(":");
  }

  const prefersReducedMotion = () => motionQuery.matches;

  function measure() {
    const heroRect = hero.getBoundingClientRect();
    const shellRect = shell.getBoundingClientRect();

    viewWidth = Math.max(1, Math.round(heroRect.width));
    viewHeight = Math.max(1, Math.round(heroRect.height));
    board.width = Math.max(1, Math.round(shellRect.width));
    board.height = Math.max(1, Math.round(shellRect.height));
    board.x = Math.round(shellRect.left - heroRect.left);
    board.y = Math.round(shellRect.top - heroRect.top);

    board.columns = clamp(Math.round(board.width / TARGET_PIECE_SIZE), MIN_COLUMNS, MAX_COLUMNS);
    board.rows = clamp(Math.round(board.height / TARGET_PIECE_SIZE), MIN_ROWS, MAX_ROWS);
    board.pieceWidth = board.width / board.columns;
    board.pieceHeight = board.height / board.rows;
    board.unit = Math.min(board.pieceWidth, board.pieceHeight);

    spread.left = Math.max(6, board.x - board.width * 0.62);
    spread.right = Math.min(viewWidth - 6, board.x + board.width * 1.38);
    spread.top = Math.max(6, board.y - board.height * 0.3);
    spread.bottom = Math.min(viewHeight - 6, board.y + board.height * 1.3);

    return shellRect.width > 0 && shellRect.height > 0;
  }

  function resizeCanvas() {
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(viewWidth * ratio);
    canvas.height = Math.round(viewHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  // Seams are stored once per grid so a tab on one piece is always mirrored by a
  // socket on its neighbour. Border seams stay flat.
  function buildSeams() {
    const key = `${board.columns}x${board.rows}`;
    if (seams && seamKey === key) return;

    const vertical = [];
    const horizontal = [];

    for (let row = 0; row < board.rows; row += 1) {
      vertical.push(
        Array.from({ length: board.columns - 1 }, () => (Math.random() < 0.5 ? -1 : 1))
      );
    }
    for (let row = 0; row < board.rows - 1; row += 1) {
      horizontal.push(Array.from({ length: board.columns }, () => (Math.random() < 0.5 ? -1 : 1)));
    }

    seams = { vertical, horizontal };
    seamKey = key;
  }

  function seamSigns(column, row) {
    return {
      top: row === 0 ? 0 : -seams.horizontal[row - 1][column],
      right: column === board.columns - 1 ? 0 : seams.vertical[row][column],
      bottom: row === board.rows - 1 ? 0 : seams.horizontal[row][column],
      left: column === 0 ? 0 : -seams.vertical[row][column - 1],
    };
  }

  function buildPiecePath(piece, offsetX, offsetY) {
    const { pieceWidth: width, pieceHeight: height, unit } = board;
    const left = offsetX;
    const top = offsetY;
    const right = offsetX + width;
    const bottom = offsetY + height;
    const path = new Path2D();

    path.moveTo(left, top);
    traceEdge(path, left, top, right, top, piece.signs.top, unit);
    traceEdge(path, right, top, right, bottom, piece.signs.right, unit);
    traceEdge(path, right, bottom, left, bottom, piece.signs.bottom, unit);
    traceEdge(path, left, bottom, left, top, piece.signs.left, unit);
    path.closePath();

    return path;
  }

  function renderPieceBitmap(piece) {
    const { pieceWidth: width, pieceHeight: height, unit } = board;
    const margin = Math.ceil(KNOB_REACH * unit) + 6;
    const bitmapWidth = Math.ceil(width) + margin * 2;
    const bitmapHeight = Math.ceil(height) + margin * 2;
    const ratio = Math.min(2, window.devicePixelRatio || 1);

    const bitmap = document.createElement("canvas");
    bitmap.width = Math.round(bitmapWidth * ratio);
    bitmap.height = Math.round(bitmapHeight * ratio);
    const pctx = bitmap.getContext("2d");
    pctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    pctx.translate(margin, margin);

    const path = buildPiecePath(piece, 0, 0);
    const cover = coverImage();
    const originX = cover.left - piece.column * width;
    const originY = cover.top - piece.row * height;

    pctx.save();
    pctx.clip(path);

    pctx.filter = "saturate(0.74) contrast(1.1) brightness(0.9)";
    pctx.drawImage(image, originX, originY, cover.width, cover.height);
    pctx.filter = "none";

    // Multiplying by a cool blue drops the photo into the hero's navy range and
    // strips the warm cast without flattening the face.
    pctx.globalCompositeOperation = "multiply";
    pctx.fillStyle = "rgb(136, 178, 214)";
    pctx.fillRect(-margin, -margin, bitmapWidth, bitmapHeight);

    const tint = pctx.createLinearGradient(
      -piece.column * width,
      -piece.row * height,
      -piece.column * width + board.width,
      -piece.row * height + board.height
    );
    tint.addColorStop(0, "rgba(9, 34, 64, 0.55)");
    tint.addColorStop(0.6, "rgba(14, 46, 80, 0.3)");
    tint.addColorStop(1, "rgba(89, 241, 215, 0.22)");
    pctx.globalCompositeOperation = "soft-light";
    pctx.fillStyle = tint;
    pctx.fillRect(-margin, -margin, bitmapWidth, bitmapHeight);

    const vignette = pctx.createRadialGradient(
      board.width / 2 - piece.column * width,
      board.height / 2.3 - piece.row * height,
      board.height * 0.16,
      board.width / 2 - piece.column * width,
      board.height / 2.3 - piece.row * height,
      board.height * 0.74
    );
    vignette.addColorStop(0, "rgba(5, 17, 33, 0)");
    vignette.addColorStop(0.65, "rgba(5, 17, 33, 0.42)");
    vignette.addColorStop(1, "rgba(5, 17, 33, 0.88)");
    pctx.globalCompositeOperation = "source-atop";
    pctx.fillStyle = vignette;
    pctx.fillRect(-margin, -margin, bitmapWidth, bitmapHeight);
    pctx.globalCompositeOperation = "source-over";

    // Bevel: strokes are centred on the outline, so the clip keeps only the
    // inner half. Offsetting them gives the piece a lit and a shaded edge.
    pctx.lineJoin = "round";
    pctx.save();
    pctx.translate(1.5, 1.5);
    pctx.strokeStyle = "rgba(2, 9, 18, 0.62)";
    pctx.lineWidth = 3.4;
    pctx.stroke(path);
    pctx.restore();

    pctx.save();
    pctx.translate(-1, -1);
    pctx.strokeStyle = "rgba(196, 240, 255, 0.12)";
    pctx.lineWidth = 1.6;
    pctx.stroke(path);
    pctx.restore();
    pctx.restore();

    pctx.strokeStyle = "rgba(3, 11, 22, 0.9)";
    pctx.lineWidth = 1;
    pctx.lineJoin = "round";
    pctx.stroke(path);

    pctx.strokeStyle = "rgba(89, 241, 215, 0.08)";
    pctx.lineWidth = 0.6;
    pctx.stroke(path);

    piece.bitmap = bitmap;
    piece.bitmapWidth = bitmapWidth;
    piece.bitmapHeight = bitmapHeight;
    piece.pivotX = margin + width / 2;
    piece.pivotY = margin + height / 2;
  }

  function coverImage() {
    const naturalWidth = image.naturalWidth || board.width;
    const naturalHeight = image.naturalHeight || board.height;
    const scale =
      Math.max(board.width / naturalWidth, board.height / naturalHeight) * 1.04;
    const width = naturalWidth * scale;
    const height = naturalHeight * scale;
    return {
      width,
      height,
      left: (board.width - width) / 2,
      top: (board.height - height) / 2 + board.height * 0.012,
    };
  }

  function build({ replayIntro }) {
    if (!measure()) return false;

    resizeCanvas();
    buildSeams();

    const centerX = board.x + board.width / 2;
    const centerY = board.y + board.height / 2;
    const maxDistance = Math.hypot(board.width, board.height) / 2;
    const next = [];

    for (let row = 0; row < board.rows; row += 1) {
      for (let column = 0; column < board.columns; column += 1) {
        const piece = {
          column,
          row,
          signs: seamSigns(column, row),
          homeX: board.x + (column + 0.5) * board.pieceWidth,
          homeY: board.y + (row + 0.5) * board.pieceHeight,
        };

        piece.homePath = buildPiecePath(
          piece,
          board.x + column * board.pieceWidth,
          board.y + row * board.pieceHeight
        );
        renderPieceBitmap(piece);

        const fromCenter = Math.hypot(piece.homeX - centerX, piece.homeY - centerY);
        piece.distanceRank = maxDistance === 0 ? 0 : Math.min(1, fromCenter / maxDistance);
        piece.x = piece.homeX;
        piece.y = piece.homeY;
        piece.vx = 0;
        piece.vy = 0;
        piece.angle = 0;
        piece.spin = 0;
        piece.scale = 1;
        piece.alpha = 1;
        piece.hoverX = 0;
        piece.hoverY = 0;
        piece.flash = 0;
        piece.locked = true;
        piece.holdUntil = 0;
        piece.intro = null;

        next.push(piece);
      }
    }

    pieces = next;
    ready = true;
    builtSignature = layoutSignature();

    if (replayIntro && !prefersReducedMotion()) {
      startIntro(centerX, centerY);
    } else {
      phase = "live";
    }

    return true;
  }

  function startIntro(centerX, centerY) {
    phase = "intro";
    introStart = -1;

    const half = Math.max(board.pieceWidth, board.pieceHeight) * 0.5;
    // Ranking by distance spreads the delays evenly, so pieces click in at a
    // steady cadence from the outside in instead of arriving in one clump.
    const order = [...pieces].sort((a, b) => b.distanceRank - a.distanceRank);
    const lastIndex = Math.max(1, order.length - 1);
    order.forEach((piece, index) => {
      piece.introRank = index / lastIndex;
    });

    for (const piece of pieces) {
      const offsetX = piece.homeX - centerX;
      const offsetY = piece.homeY - centerY;
      // Each piece flies in from its own side of the board so the paths fan out
      // instead of crossing through each other.
      const outward =
        Math.hypot(offsetX, offsetY) < 1
          ? Math.random() * Math.PI * 2
          : Math.atan2(offsetY, offsetX);
      const angle = outward + (Math.random() - 0.5) * 0.7;
      const reach = Math.hypot(board.width, board.height) * (0.62 + Math.random() * 0.45);

      piece.intro = {
        startX: clamp(centerX + Math.cos(angle) * reach, spread.left + half, spread.right - half),
        startY: clamp(
          centerY + Math.sin(angle) * reach * 0.82,
          spread.top + half,
          spread.bottom - half
        ),
        startAngle: (Math.random() - 0.5) * 1.5,
        curve: (Math.random() - 0.5) * 46,
        delay: INTRO_DELAY + piece.introRank * INTRO_STAGGER + Math.random() * 60,
        duration: INTRO_FLIGHT + Math.random() * 120,
      };
      piece.locked = false;
      piece.alpha = 0;
      piece.x = piece.intro.startX;
      piece.y = piece.intro.startY;
      piece.angle = piece.intro.startAngle;
      piece.scale = 1.16;
    }
  }

  function advanceIntro(now) {
    if (introStart < 0) introStart = now;
    let settled = 0;

    for (const piece of pieces) {
      const intro = piece.intro;
      if (!intro) {
        settled += 1;
        continue;
      }

      const elapsed = now - introStart - intro.delay;
      if (elapsed <= 0) {
        piece.alpha = 0;
        continue;
      }

      const t = Math.min(1, elapsed / intro.duration);
      const eased = easeOutBack(t);
      const drift = Math.sin(Math.PI * t) * intro.curve;

      piece.x = intro.startX + (piece.homeX - intro.startX) * eased + drift;
      piece.y = intro.startY + (piece.homeY - intro.startY) * eased - drift * 0.6;
      piece.angle = intro.startAngle * (1 - easeOutCubic(Math.min(1, t * 1.15)));
      piece.scale = 1 + 0.16 * (1 - eased);
      piece.alpha = Math.min(1, t * 5);

      if (t >= 1) {
        seat(piece);
        settled += 1;
      }
    }

    if (settled === pieces.length) {
      phase = "live";
    }
  }

  function seat(piece) {
    piece.intro = null;
    piece.x = piece.homeX;
    piece.y = piece.homeY;
    piece.vx = 0;
    piece.vy = 0;
    piece.angle = 0;
    piece.spin = 0;
    piece.scale = 1;
    piece.alpha = 1;
    piece.locked = true;
    piece.flash = 1;
  }

  function step(now) {
    const pushRadius = HOVER_RADIUS;

    for (const piece of pieces) {
      if (piece.locked) {
        let targetX = 0;
        let targetY = 0;

        if (pointer.active && !prefersReducedMotion()) {
          const dx = piece.homeX - pointer.x;
          const dy = piece.homeY - pointer.y;
          const distance = Math.hypot(dx, dy);

          if (distance < pushRadius && distance > 0.001) {
            const falloff = (1 - distance / pushRadius) ** 2;

            if (pointer.speed > SWIPE_SPEED) {
              // Short hold: a swept cursor knocks pieces loose but the board
              // starts healing straight away instead of piling into a corner.
              release(
                piece,
                dx / distance,
                dy / distance,
                falloff * (2.6 + pointer.speed * 0.5),
                now,
                SWIPE_HOLD,
                SWIPE_HOLD_SPREAD
              );
            } else {
              targetX = (dx / distance) * falloff * HOVER_PUSH;
              targetY = (dy / distance) * falloff * HOVER_PUSH;
            }
          }
        }

        piece.hoverX += (targetX - piece.hoverX) * 0.16;
        piece.hoverY += (targetY - piece.hoverY) * 0.16;
        continue;
      }

      if (now >= piece.holdUntil) {
        piece.vx += (piece.homeX - piece.x) * RETURN_SPRING;
        piece.vy += (piece.homeY - piece.y) * RETURN_SPRING;
        piece.vx *= RETURN_DAMPING;
        piece.vy *= RETURN_DAMPING;
        piece.spin += (0 - piece.angle) * ANGLE_SPRING;
        piece.spin *= ANGLE_DAMPING;
      } else {
        piece.vx *= FREE_DRAG;
        piece.vy *= FREE_DRAG;
        piece.spin *= SPIN_DAMPING;
      }

      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.angle += piece.spin;
      piece.hoverX *= 0.86;
      piece.hoverY *= 0.86;

      bounceInsideSpread(piece);

      const distance = Math.hypot(piece.homeX - piece.x, piece.homeY - piece.y);
      const speed = Math.hypot(piece.vx, piece.vy);
      const lift = Math.min(1, distance / 46);
      piece.scale += (1 + lift * 0.1 - piece.scale) * 0.2;

      if (
        now >= piece.holdUntil &&
        distance < SETTLE_DISTANCE &&
        speed < SETTLE_SPEED &&
        Math.abs(piece.angle) < 0.02
      ) {
        seat(piece);
      }
    }
  }

  function bounceInsideSpread(piece) {
    const half = Math.max(board.pieceWidth, board.pieceHeight) * 0.5;
    if (piece.x < spread.left + half) {
      piece.x = spread.left + half;
      piece.vx = Math.abs(piece.vx) * EDGE_RESTITUTION;
    } else if (piece.x > spread.right - half) {
      piece.x = spread.right - half;
      piece.vx = -Math.abs(piece.vx) * EDGE_RESTITUTION;
    }

    if (piece.y < spread.top + half) {
      piece.y = spread.top + half;
      piece.vy = Math.abs(piece.vy) * EDGE_RESTITUTION;
    } else if (piece.y > spread.bottom - half) {
      piece.y = spread.bottom - half;
      piece.vy = -Math.abs(piece.vy) * EDGE_RESTITUTION;
    }
  }

  // The walker and a fast cursor both push every frame they overlap a piece, so
  // impulses are capped to stop velocity compounding into a blur.
  function release(piece, dirX, dirY, force, now, hold = HOLD_BASE, holdSpread = HOLD_SPREAD) {
    piece.locked = false;
    piece.vx += dirX * force + (Math.random() - 0.5) * 1.4;
    piece.vy += dirY * force + (Math.random() - 0.5) * 1.4;
    piece.spin = clamp(piece.spin + (Math.random() - 0.5) * 0.09, -MAX_SPIN, MAX_SPIN);

    const speed = Math.hypot(piece.vx, piece.vy);
    if (speed > MAX_PIECE_SPEED) {
      piece.vx = (piece.vx / speed) * MAX_PIECE_SPEED;
      piece.vy = (piece.vy / speed) * MAX_PIECE_SPEED;
    }

    piece.holdUntil = Math.max(piece.holdUntil, now + hold + Math.random() * holdSpread);
  }

  function render(now) {
    ctx.clearRect(0, 0, viewWidth, viewHeight);
    if (!pieces.length) return;

    for (const piece of pieces) {
      const offset = Math.hypot(piece.x + piece.hoverX - piece.homeX, piece.y + piece.hoverY - piece.homeY);
      if (piece.locked && offset < 1.2 && piece.flash <= 0) continue;

      ctx.fillStyle = "rgba(3, 11, 22, 0.72)";
      ctx.fill(piece.homePath);
      ctx.strokeStyle = "rgba(89, 241, 215, 0.1)";
      ctx.lineWidth = 1;
      ctx.stroke(piece.homePath);
    }

    drawPieces(true);
    drawPieces(false);

    for (const piece of pieces) {
      if (piece.flash <= 0) continue;
      ctx.strokeStyle = `rgba(89, 241, 215, ${(piece.flash * FLASH_STRENGTH).toFixed(3)})`;
      ctx.lineWidth = 1.4;
      ctx.stroke(piece.homePath);
    }

    if (phase === "live" && !prefersReducedMotion()) {
      drawSheen(now);
    }
  }

  function drawPieces(lockedPass) {
    for (const piece of pieces) {
      if (piece.locked !== lockedPass) continue;
      if (piece.alpha <= 0) continue;

      const lift = Math.min(1, Math.max(0, piece.scale - 1) * 9);

      ctx.save();
      ctx.globalAlpha = piece.alpha;
      if (lift > 0.02) {
        ctx.shadowColor = "rgba(2, 9, 20, 0.5)";
        ctx.shadowBlur = 16 * lift;
        ctx.shadowOffsetY = 7 * lift;
      }
      ctx.translate(piece.x + piece.hoverX, piece.y + piece.hoverY);
      ctx.rotate(piece.angle);
      ctx.scale(piece.scale, piece.scale);
      ctx.drawImage(
        piece.bitmap,
        -piece.pivotX,
        -piece.pivotY,
        piece.bitmapWidth,
        piece.bitmapHeight
      );
      ctx.restore();
    }
  }

  // `source-atop` keeps the sheen inside the pieces already on the canvas, so
  // the highlight sweeps across the portrait instead of the empty hero.
  function drawSheen(now) {
    const progress = (now % SHEEN_PERIOD) / SHEEN_PERIOD;
    if (progress > SHEEN_SWEEP) return;

    const travel = progress / SHEEN_SWEEP;
    const span = board.width * 0.55;
    const head = board.x - span + travel * (board.width + span * 2);
    const sheen = ctx.createLinearGradient(head - span, board.y, head + span, board.y + board.height);
    sheen.addColorStop(0, "rgba(89, 241, 215, 0)");
    sheen.addColorStop(0.5, "rgba(140, 255, 238, 0.1)");
    sheen.addColorStop(1, "rgba(89, 241, 215, 0)");

    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, viewWidth, viewHeight);
    ctx.restore();
  }

  function frame() {
    if (document.hidden) {
      frameId = 0;
      return;
    }

    const now = performance.now();
    const delta = lastFrame ? Math.min(120, Math.max(0, now - lastFrame)) : PHYSICS_STEP;
    clock = now;
    lastFrame = now;

    // Seat flashes fade on wall-clock time so pieces that lock early during the
    // intro do not hold a highlight until the whole board finishes.
    const flashDecay = delta / FLASH_FADE;
    for (const piece of pieces) {
      if (piece.flash > 0) piece.flash = Math.max(0, piece.flash - flashDecay);
    }

    if (phase === "intro") {
      advanceIntro(now);
    } else {
      accumulator = Math.min(accumulator + delta, PHYSICS_STEP * MAX_STEPS_PER_FRAME);
      while (accumulator >= PHYSICS_STEP) {
        step(now);
        accumulator -= PHYSICS_STEP;
      }
    }

    pointer.speed *= 0.72;
    render(now);
    frameId = requestAnimationFrame(frame);
  }

  function start() {
    if (frameId || !ready) return;
    if (prefersReducedMotion()) {
      render(clock);
      return;
    }
    lastFrame = 0;
    accumulator = 0;
    frameId = requestAnimationFrame(frame);
  }

  function stop() {
    cancelAnimationFrame(frameId);
    frameId = 0;
    lastFrame = 0;
  }

  function scatterFrom(heroX, heroY, strength = 1) {
    if (!ready || phase === "intro" || prefersReducedMotion()) return;

    const now = clock;
    for (const piece of pieces) {
      const dx = piece.x - heroX;
      const dy = piece.y - heroY;
      const distance = Math.max(12, Math.hypot(dx, dy));
      const falloff = 0.35 + Math.max(0, 1 - distance / (board.height * 0.9)) * 0.65;
      const force = (7 + Math.random() * 6) * falloff * strength;
      release(piece, dx / distance, dy / distance, force, now);
    }
  }

  function disturb(heroX, heroY, radius = 120, strength = 6) {
    if (!ready || phase === "intro" || prefersReducedMotion()) return;

    const now = clock;
    for (const piece of pieces) {
      const dx = piece.x - heroX;
      const dy = piece.y - heroY;
      const distance = Math.hypot(dx, dy);
      if (distance >= radius) continue;

      const falloff = 1 - distance / radius;
      const direction = distance < 1 ? Math.random() * Math.PI * 2 : Math.atan2(dy, dx);
      release(piece, Math.cos(direction), Math.sin(direction), falloff * strength, now);
    }
  }

  function toHeroPoint(clientX, clientY) {
    const heroRect = hero.getBoundingClientRect();
    return { x: clientX - heroRect.left, y: clientY - heroRect.top };
  }

  function handlePointerMove(event) {
    const point = toHeroPoint(event.clientX, event.clientY);
    if (pointer.seen) {
      pointer.speed = Math.max(pointer.speed, Math.hypot(point.x - pointer.x, point.y - pointer.y));
    }
    pointer.x = point.x;
    pointer.y = point.y;
    pointer.active = true;
    pointer.seen = true;
  }

  function handlePointerLeave() {
    pointer.active = false;
    pointer.seen = false;
    pointer.speed = 0;
  }

  function handleShellActivate(event) {
    const isKeyboard = event.detail === 0;
    const point = isKeyboard
      ? { x: board.x + board.width / 2, y: board.y + board.height * 0.42 }
      : toHeroPoint(event.clientX, event.clientY);
    scatterFrom(point.x, point.y, isKeyboard ? 0.8 : 1);
  }

  let resizeTimer = 0;
  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      // Mobile browsers fire resize when the address bar hides, so only rebuild
      // when the board geometry actually moved.
      if (!measure() || layoutSignature() === builtSignature) return;
      if (build({ replayIntro: phase !== "live" })) {
        stop();
        start();
      }
    }, 160);
  }

  function handleMotionPreference() {
    if (build({ replayIntro: false })) {
      stop();
      start();
    }
  }

  hero.addEventListener("pointermove", handlePointerMove);
  hero.addEventListener("pointerleave", handlePointerLeave);
  shell.addEventListener("click", handleShellActivate);
  window.addEventListener("resize", handleResize);
  motionQuery.addEventListener?.("change", handleMotionPreference);

  function init() {
    if (build({ replayIntro: true })) start();
  }

  if (image.complete && image.naturalWidth) {
    init();
  } else {
    image.addEventListener("load", init, { once: true });
  }

  return {
    disturb,
    scatterFrom,
    resume: start,
    pause: stop,
    getBoard: () => ({ ...board }),
  };
}

function traceEdge(path, ax, ay, bx, by, sign, unit) {
  const length = Math.hypot(bx - ax, by - ay);

  if (!sign || length / 2 <= KNOB_FOOTPRINT * unit + 2) {
    path.lineTo(bx, by);
    return;
  }

  const ux = (bx - ax) / length;
  const uy = (by - ay) / length;
  // Outward normal for a clockwise walk around the piece.
  const nx = uy;
  const ny = -ux;
  const midpoint = length / 2;

  const point = (along, normal) => [
    ax + ux * (midpoint + along * unit) + nx * normal * unit * sign,
    ay + uy * (midpoint + along * unit) + ny * normal * unit * sign,
  ];

  const inset = Math.sqrt(BALL_RADIUS ** 2 - NECK_HALF ** 2);
  const shoulder = BALL_CENTER - inset;
  const startAngle = Math.atan2(-inset, -NECK_HALF);
  const endAngle = Math.atan2(-inset, NECK_HALF);
  const sweep = -(Math.PI * 2 - (endAngle - startAngle));

  lineToPoint(path, point(-NECK_HALF - FILLET, 0));
  quadraticToPoint(path, point(-NECK_HALF, 0), point(-NECK_HALF, shoulder * 0.45));
  lineToPoint(path, point(-NECK_HALF, shoulder));
  traceArc(path, point, 0, BALL_CENTER, BALL_RADIUS, startAngle, sweep, 4);
  lineToPoint(path, point(NECK_HALF, shoulder * 0.45));
  quadraticToPoint(path, point(NECK_HALF, 0), point(NECK_HALF + FILLET, 0));
  path.lineTo(bx, by);
}

function traceArc(path, point, cx, cy, radius, startAngle, sweep, segments) {
  const step = sweep / segments;
  const handle = (4 / 3) * Math.tan(step / 4) * radius;
  let angle = startAngle;

  for (let index = 0; index < segments; index += 1) {
    const next = angle + step;
    const control1 = point(
      cx + radius * Math.cos(angle) - handle * Math.sin(angle),
      cy + radius * Math.sin(angle) + handle * Math.cos(angle)
    );
    const control2 = point(
      cx + radius * Math.cos(next) + handle * Math.sin(next),
      cy + radius * Math.sin(next) - handle * Math.cos(next)
    );
    const end = point(cx + radius * Math.cos(next), cy + radius * Math.sin(next));
    path.bezierCurveTo(control1[0], control1[1], control2[0], control2[1], end[0], end[1]);
    angle = next;
  }
}

function lineToPoint(path, [x, y]) {
  path.lineTo(x, y);
}

function quadraticToPoint(path, [cx, cy], [x, y]) {
  path.quadraticCurveTo(cx, cy, x, y);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function easeOutBack(t) {
  const overshoot = 0.85;
  const shifted = t - 1;
  return 1 + (overshoot + 1) * shifted ** 3 + overshoot * shifted ** 2;
}
