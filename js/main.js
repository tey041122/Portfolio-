/**
 * ==========================================================================
 * Srey ArunRatha — Chairman & Founder
 * Digital NFC card: "The Gold Card"
 *
 *   1. portfolioConfig      editable content: phone, links, portrait
 *   2. Signature engine     the handwritten signature writes itself
 *   3. Card stage           3D tilt, glare, gold dust and the card flip
 *   4. Contact page         reveals, the gold keys
 * ==========================================================================
 */
'use strict';

const portfolioConfig = {
  name: 'Srey ArunRatha',
  position: 'Chairman & Founder',
  tagline: 'Your speech makes people trust you in a while but your character makes people trust you forever.',
  images: { portrait: 'assets/portrait.jpg' },
  // The ventures on page 2. To show a real logo, save the file in
  // assets/logos/ and put its path in "logo", for example
  // logo: 'assets/logos/lbc.png'. A transparent PNG or an SVG works best.
  // While "logo" is empty the coin shows the letters in "mark" instead.
  ventures: [
    { name: 'Brand Growth',      mark: 'BG',  logo: 'assets/logos/bg.png' },
    { name: 'LBC',               mark: 'LBC', logo: 'assets/logos/lbc.png' },
    { name: 'Magic Iron',        mark: 'MI',  logo: 'assets/logos/magic-iron.png' },
    { name: 'Vireakchun Police', mark: 'VP',  logo: 'assets/logos/vireakchun-police.png' },
    { name: 'Vireakchun Civil',  mark: 'VC',  logo: 'assets/logos/vireakchun-civil.png' }
  ],
  // PLACEHOLDER VALUES, copied from the design mock-up on 2026-11-16.
  // Replace phone, website and location with the real ones before publishing.
  // Leave any of them empty to hide it everywhere on the page.
  phone: '+855 12 345 678',
  website: 'www.arunratha.com',
  location: 'Phnom Penh, Cambodia',
  social: {
    telegram: 'https://t.me/arunratha',
    facebook: 'https://www.facebook.com/share/19figcq498/?mibextid=wwXIfr',
    email: 'office@arunratha.com'
  }
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  applyPortfolioConfiguration();
  initSignatureEngine();
  initCardStage();
  initContactPage();
  initVentureOrbit();
  initConnect();
});

function applyPortfolioConfiguration() {
  const s = portfolioConfig.social;
  document.querySelectorAll('.social-link-telegram').forEach(el => { if (s.telegram) el.href = s.telegram; });
  document.querySelectorAll('.social-link-facebook').forEach(el => { if (s.facebook) el.href = s.facebook; });
  document.querySelectorAll('.social-link-email').forEach(el => {
    if (!s.email) return;
    el.href = `mailto:${s.email}`;
    const value = el.querySelector('.js-email-value');
    if (value) value.textContent = s.email;
  });

  // Phone: shown only when a number is set
  const phone = (portfolioConfig.phone || '').trim();
  if (phone) {
    const dial = phone.replace(/[^+d]/g, '');
    document.querySelectorAll('[data-contact="phone"]').forEach(el => { el.hidden = false; });
    document.querySelectorAll('.social-link-phone').forEach(el => { el.href = `tel:${dial}`; });
    document.querySelectorAll('.js-phone-value').forEach(el => { el.textContent = phone; });
  }

  // Website and location: shown only when set
  const website = (portfolioConfig.website || '').trim();
  if (website) {
    document.querySelectorAll('[data-contact="website"]').forEach(el => { el.hidden = false; });
    document.querySelectorAll('.js-website-link').forEach(el => { el.href = `https://${website.replace(/^https?:\/\//, '')}`; });
    document.querySelectorAll('.js-website-value').forEach(el => { el.textContent = website; });
  }
  const place = (portfolioConfig.location || '').trim();
  if (place) {
    document.querySelectorAll('[data-contact="location"]').forEach(el => { el.hidden = false; });
    document.querySelectorAll('.js-location-value').forEach(el => { el.textContent = place; });
  }

  const portrait = portfolioConfig.images.portrait;
  if (portrait) {
    document.querySelectorAll('.js-portrait').forEach(img => {
      if (img.getAttribute('src') !== portrait) img.src = portrait;
    });
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   SIGNATURE ENGINE
   The signature PNG is revealed through an SVG mask. Each mask path is one
   pen stroke; its dash offset is animated in writing order while a spark
   follows the tip of the stroke.
   ══════════════════════════════════════════════════════════════════════════ */
function initSignatureEngine() {
  const sigWrap   = document.getElementById('signatureWrap');
  const guideSvg  = document.getElementById('sigDrawSvg');
  const penCursor = document.getElementById('penCursor');
  const emberCv   = document.getElementById('sigEmberCanvas');

  if (!sigWrap || !guideSvg) return;

  const maskPaths = Array.from(document.querySelectorAll('#maskStrokes .sig-mask-path'));
  if (!maskPaths.length) return;

  // With reduced motion the signature is simply shown, already written.
  if (reduceMotion) return;

  const strokeData = maskPaths.map(p => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len} ${len}`;
    p.style.strokeDashoffset = `${len}`;
    return { el: p, len };
  });
  const totalLength = strokeData.reduce((acc, s) => acc + s.len, 0);

  // The traced strokes are narrower than the ink in places (the "e" of Srey).
  // Once the writing ends, this rectangle opens the mask so the whole
  // signature artwork shows.
  const fullReveal = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  fullReveal.setAttribute('width', '560');
  fullReveal.setAttribute('height', '260');
  fullReveal.setAttribute('fill', '#ffffff');
  fullReveal.style.opacity = '0';
  document.getElementById('sigMask').appendChild(fullReveal);

  const START_DELAY = 1500;          // ms: the portrait develops first
  const TOTAL_WRITING_TIME = 4600;   // ms
  const PEN_LIFT = 40;               // ms between strokes

  // Ember canvas
  const pctx = emberCv ? emberCv.getContext('2d') : null;
  function resizeEmber() {
    if (!emberCv) return;
    emberCv.width = sigWrap.offsetWidth || 360;
    emberCv.height = sigWrap.offsetHeight || 164;
  }
  resizeEmber();
  window.addEventListener('resize', resizeEmber);

  const particles = [];
  let particleLoop = null;

  function emitSparkle(x, y, count) {
    if (!emberCv) return;
    const px = (x / 560) * emberCv.width;
    const py = (y / 260) * emberCv.height;
    for (let i = 0; i < count; i++) {
      if (particles.length > 70) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 1.1;
      particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.25,
        size: 0.6 + Math.random() * 1.4,
        life: 1.0,
        decay: 0.025 + Math.random() * 0.035,
        color: Math.random() > 0.3 ? '#f1d48a' : '#ffffff'
      });
    }
  }

  function renderParticles() {
    if (!pctx) return;
    pctx.clearRect(0, 0, emberCv.width, emberCv.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      pctx.globalAlpha = Math.max(0, p.life);
      pctx.beginPath();
      pctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      pctx.fillStyle = p.color;
      pctx.fill();
    }
    pctx.globalAlpha = 1;
  }

  function setPen(x, y, opacity) {
    if (!penCursor) return;
    penCursor.style.left = `${(x / 560) * sigWrap.offsetWidth}px`;
    penCursor.style.top = `${(y / 260) * sigWrap.offsetHeight}px`;
    penCursor.style.opacity = `${opacity}`;
  }

  let isAnimating = false;

  function write(delay) {
    if (isAnimating) return;
    isAnimating = true;

    strokeData.forEach(s => { s.el.style.strokeDashoffset = `${s.len}`; });
    fullReveal.style.transition = 'none';
    fullReveal.style.opacity = '0';
    setPen(0, 0, 0);

    // The ember loop runs only while there is something to draw.
    function particleTicker() {
      renderParticles();
      if (isAnimating || particles.length) {
        particleLoop = requestAnimationFrame(particleTicker);
      } else {
        particleLoop = null;
      }
    }
    if (!particleLoop) particleTicker();

    setTimeout(() => {
      let strokeIndex = 0;
      let strokeStartTime = performance.now();

      function frame(now) {
        if (strokeIndex >= strokeData.length) {
          finish();
          return;
        }

        const current = strokeData[strokeIndex];
        const strokeDuration = Math.max(120, (current.len / totalLength) * TOTAL_WRITING_TIME);
        const progress = Math.min(1, (now - strokeStartTime) / strokeDuration);

        // Ease in and out: the pen gathers speed, then settles
        const ease = progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

        current.el.style.strokeDashoffset = `${current.len * (1 - ease)}`;

        const pt = current.el.getPointAtLength(ease * current.len);
        setPen(pt.x, pt.y, 1);
        emitSparkle(pt.x, pt.y, 2);

        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          strokeIndex++;
          setTimeout(() => {
            strokeStartTime = performance.now();
            requestAnimationFrame(frame);
          }, PEN_LIFT);
        }
      }

      requestAnimationFrame(frame);
    }, delay);

    function finish() {
      const last = strokeData[strokeData.length - 1];
      const endPt = last.el.getPointAtLength(last.len);
      emitSparkle(endPt.x, endPt.y, 22);
      fullReveal.style.transition = 'opacity 0.7s ease';
      fullReveal.style.opacity = '1';
      setTimeout(() => { if (penCursor) penCursor.style.opacity = '0'; }, 300);
      isAnimating = false;
    }
  }

  // Tap, click or key to replay
  sigWrap.addEventListener('click', () => write(120));
  sigWrap.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      write(120);
    }
  });

  write(START_DELAY);
}

/* ══════════════════════════════════════════════════════════════════════════
   CARD STAGE
   The gold card tilts toward the pointer, a finger drag or the phone's own
   motion, and sways gently when left alone. The tilt drives the glare, the
   rim light and the gold dust behind the card. One button turns it over.
   ══════════════════════════════════════════════════════════════════════════ */
function initCardStage() {
  const stage = document.getElementById('top');
  const scene = document.getElementById('cardScene');
  const flip = document.getElementById('cardFlip');
  const dustCv = document.getElementById('dust');
  if (!stage || !scene || !flip) return;

  // The card turns over on a double-tap, or a double-click with a mouse.
  // This works with or without motion.
  const back = flip.querySelector('.card-back');
  const front = flip.querySelector('.card-front');

  function turnCard() {
    const flipped = flip.classList.toggle('is-flipped');
    if (back) back.setAttribute('aria-hidden', String(!flipped));
    if (front) front.setAttribute('aria-hidden', String(flipped));
  }

  let lastTap = null;
  let lastTouchTurn = 0;

  // Touch: two taps close together in time and place
  scene.addEventListener('pointerup', e => {
    if (e.pointerType === 'mouse' || e.target.closest('a')) return;
    const now = performance.now();
    if (lastTap && now - lastTap.t < 340 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 34) {
      lastTap = null;
      lastTouchTurn = now;
      turnCard();
    } else {
      lastTap = { t: now, x: e.clientX, y: e.clientY };
    }
  });

  // Mouse. Some phones also send dblclick after a double-tap: ignore that echo.
  scene.addEventListener('dblclick', e => {
    if (e.target.closest('a')) return;
    if (performance.now() - lastTouchTurn < 700) return;
    turnCard();
  });

  if (reduceMotion) return;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const TILT = 0.8;
  const tiltEl = document.getElementById('cardTilt');
  const glareEls = scene.querySelectorAll('.card-glare');
  let lastGlare = '';
  let frameNo = 0;

  // Tilt, in degrees. target* is where the input points; cur* eases toward it.
  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  let inputActive = false;   // a pointer or finger is steering right now
  let gyroActive = false;
  let gyroBase = null;
  let inView = true;
  let running = false;

  /* --- Mouse: the card looks toward the pointer --------------------------- */
  stage.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = stage.getBoundingClientRect();
    targetY = ((e.clientX - r.left) / r.width - 0.5) * 30;
    targetX = -((e.clientY - r.top) / r.height - 0.5) * 20;
    inputActive = true;
  });
  stage.addEventListener('pointerleave', () => { inputActive = false; });

  /* --- Touch: drag sideways on the card to swing it ----------------------- */
  let dragStartX = null;
  scene.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return;
    dragStartX = e.clientX;
    requestGyro();
  });
  scene.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse' || dragStartX === null) return;
    targetY = clamp(((e.clientX - dragStartX) / scene.offsetWidth) * 70, -32, 32);
    targetX = 0;
    inputActive = true;
  });
  const endDrag = () => { dragStartX = null; inputActive = false; };
  scene.addEventListener('pointerup', endDrag);
  scene.addEventListener('pointercancel', endDrag);

  /* --- Phone motion -------------------------------------------------------- */
  function onOrientation(e) {
    if (e.gamma === null || e.beta === null) return;
    if (!gyroBase) gyroBase = { g: e.gamma, b: e.beta };
    gyroActive = true;
    if (inputActive) return;
    targetY = clamp((e.gamma - gyroBase.g) * 0.75, -20, 20);
    targetX = clamp(-(e.beta - gyroBase.b) * 0.5, -14, 14);
  }

  let gyroRequested = false;
  function requestGyro() {
    if (gyroRequested) return;
    gyroRequested = true;
    const DOE = window.DeviceOrientationEvent;
    // iOS asks the visitor once; it must follow a touch
    if (DOE && typeof DOE.requestPermission === 'function') {
      DOE.requestPermission()
        .then(state => { if (state === 'granted') window.addEventListener('deviceorientation', onOrientation); })
        .catch(() => {});
    }
  }
  if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission !== 'function') {
    window.addEventListener('deviceorientation', onOrientation);
  }

  /* --- Gold dust ----------------------------------------------------------- */
  const dctx = dustCv ? dustCv.getContext('2d') : null;
  let dw = 0, dh = 0;
  const motes = [];

  function sizeDust() {
    if (!dustCv) return;
    const dpr = 1;   // soft dots need no extra sharpness, and a small canvas is fast
    dw = stage.offsetWidth;
    dh = stage.offsetHeight;
    dustCv.width = Math.round(dw * dpr);
    dustCv.height = Math.round(dh * dpr);
    dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seedDust() {
    motes.length = 0;
    const count = dw < 600 ? 22 : 60;
    for (let i = 0; i < count; i++) {
      motes.push({
        x: Math.random(),
        y: Math.random(),
        depth: 0.25 + Math.random() * 0.75,          // nearer motes are larger and move more
        drift: 0.00006 + Math.random() * 0.00014,
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.0006 + Math.random() * 0.0012
      });
    }
  }

  function drawDust(now) {
    if (!dctx) return;
    dctx.clearRect(0, 0, dw, dh);
    for (const m of motes) {
      m.y -= m.drift * m.depth * 32;
      if (m.y < -0.03) { m.y = 1.03; m.x = Math.random(); }
      const x = m.x * dw + curY * m.depth * 1.6 + Math.sin(now * 0.0004 + m.phase) * 6 * m.depth;
      const y = m.y * dh - curX * m.depth * 1.6;
      const glow = 0.35 + 0.65 * Math.abs(Math.sin(now * m.twinkle + m.phase));
      dctx.globalAlpha = glow * (0.18 + m.depth * 0.5);
      dctx.fillStyle = m.depth > 0.8 ? '#fff1bf' : '#d4a843';
      dctx.beginPath();
      dctx.arc(x, y, 0.5 + m.depth * 1.5, 0, Math.PI * 2);
      dctx.fill();
    }
    dctx.globalAlpha = 1;
  }

  if (dctx) {
    sizeDust();
    seedDust();
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { sizeDust(); seedDust(); }, 160);
    });
  }

  /* --- The loop: runs only while the card is on screen -------------------- */
  function frame(now) {
    if (!inView || document.hidden) {
      running = false;
      return;
    }

    // Left alone, the card sways so the light keeps moving across it
    let goalX = targetX;
    let goalY = targetY;
    if (!inputActive) {
      const sway = gyroActive ? 0.35 : 1;
      goalX += Math.sin(now / 2100) * 4.5 * sway;
      goalY += Math.sin(now / 2900) * 10 * sway;
      if (!gyroActive) { targetX *= 0.94; targetY *= 0.94; }
    }

    curX += (goalX - curX) * 0.085;
    curY += (goalY - curY) * 0.085;

    // Only transforms change each frame. Transforms are moved by the phone's
    // graphics chip; anything else would repaint the full-screen card.
    const floatY = Math.sin(now / 1700) * 6;
    tiltEl.style.transform =
      `translate3d(0, ${floatY.toFixed(1)}px, 0) rotateX(${(curX * TILT).toFixed(2)}deg) rotateY(${(curY * TILT).toFixed(2)}deg)`;
    const glare = `${(curY * 14).toFixed(0)}%`;
    if (glare !== lastGlare) {
      lastGlare = glare;
      glareEls.forEach(el => el.style.setProperty('--glare', glare));
    }

    // The dust is drawn on every second frame
    frameNo++;
    if (frameNo % 2 === 0) drawDust(now);
    requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    if (inView) start();
  }).observe(stage);

  document.addEventListener('visibilitychange', () => { if (!document.hidden && inView) start(); });
  start();
}

/* ══════════════════════════════════════════════════════════════════════════
   CONTACT PAGE: reveals, the keys swinging up, light under the finger
   ══════════════════════════════════════════════════════════════════════════ */
function initContactPage() {
  // A page that is off screen stops animating (see [data-offscreen] in the CSS)
  if ('IntersectionObserver' in window) {
    const rest = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.toggleAttribute('data-offscreen', !entry.isIntersecting));
    });
    document.querySelectorAll('.stage, .reach').forEach(el => rest.observe(el));
  }

  const keyItems = Array.from(document.querySelectorAll('.key-item:not([hidden])'));
  const targets = Array.from(document.querySelectorAll('.reveal')).concat(keyItems);

  keyItems.forEach((item, i) => item.style.setProperty('--k', i));

  if (!('IntersectionObserver' in window) || reduceMotion) {
    targets.forEach(el => el.classList.add('in'));
  } else {
    // The keys list is watched as a whole, so its keys swing up in order
    const list = document.querySelector('.keys');
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (entry.target === list) keyItems.forEach(item => item.classList.add('in'));
        else entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    if (list) io.observe(list);
  }

  if (reduceMotion) return;

  // Light follows the finger or pointer along each key
  document.querySelectorAll('.key').forEach(key => {
    const light = e => {
      const r = key.getBoundingClientRect();
      key.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    };
    key.addEventListener('pointermove', light);
    key.addEventListener('pointerdown', light);
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   VENTURE ORBIT: 3D Amphitheater Motion System
   Coins glide smoothly along the 3D elliptical track:
   - When a logo is clicked, it smoothly glides to the Center Front Hero spot.
   - When untouched, the logos glide one by one automatically every 3.2s.
   - Smooth 60fps easing loop with waypoint interpolation along the energy trails.
   ══════════════════════════════════════════════════════════════════════════ */
function initVentureOrbit() {
  const orbit = document.getElementById('orbit');
  const nameEl = document.getElementById('orbitName');
  const dotsEl = document.getElementById('orbitDots');
  const ventures = portfolioConfig.ventures || [];
  if (!orbit || !ventures.length) return;

  const N = ventures.length;
  const coins = Array.from(orbit.querySelectorAll('.orbit-coin'));

  // Calibrated 3D Waypoints along the amphitheater loop:
  // p = 0: Left Outer
  // p = 1: Left Inner
  // p = 2: Center Hero Front (largest, lowest, glowing gold halo!)
  // p = 3: Right Inner
  // p = 4: Right Outer
  // p = 4.5: High Back Transit
  function getTrackPoint(p) {
    p = ((p % 5) + 5) % 5;
    let p0, p1, t;

    if (p < 1) {
      p0 = { x: 12, y: 36, s: 0.74, z: 40 };
      p1 = { x: 31, y: 21, s: 0.86, z: 60 };
      t = p;
    } else if (p < 2) {
      p0 = { x: 31, y: 21, s: 0.86, z: 60 };
      p1 = { x: 50, y: 66, s: 1.24, z: 100 };
      t = p - 1;
    } else if (p < 3) {
      p0 = { x: 50, y: 66, s: 1.24, z: 100 };
      p1 = { x: 69, y: 21, s: 0.86, z: 60 };
      t = p - 2;
    } else if (p < 4) {
      p0 = { x: 69, y: 21, s: 0.86, z: 60 };
      p1 = { x: 88, y: 36, s: 0.74, z: 40 };
      t = p - 3;
    } else if (p < 4.5) {
      p0 = { x: 88, y: 36, s: 0.74, z: 40 };
      p1 = { x: 50, y: 13, s: 0.62, z: 20 };
      t = (p - 4) / 0.5;
    } else {
      p0 = { x: 50, y: 13, s: 0.62, z: 20 };
      p1 = { x: 12, y: 36, s: 0.74, z: 40 };
      t = (p - 4.5) / 0.5;
    }

    const ease = t * t * (3 - 2 * t);
    return {
      x: p0.x + (p1.x - p0.x) * ease,
      y: p0.y + (p1.y - p0.y) * ease,
      s: p0.s + (p1.s - p0.s) * ease,
      z: Math.round(p0.z + (p1.z - p0.z) * ease)
    };
  }

  // cur is the current continuous rotational offset.
  // cur = 0 puts venture 0 (Brand Growth) at p = 2 (Center Hero).
  let cur = 0;
  let goal = 0;
  let running = false;
  let inView = true;
  let lastTouch = 0;
  let currentFront = -1;

  function setFront(index) {
    if (index === currentFront) return;
    currentFront = index;

    dots.forEach((d, k) => d.classList.toggle('is-on', k === index));

    if (nameEl) {
      nameEl.textContent = ventures[index].name;
      nameEl.classList.remove('is-swapping');
      void nameEl.offsetWidth; // restart entrance animation
      nameEl.classList.add('is-swapping');
    }
  }

  function place() {
    for (let i = 0; i < N; i++) {
      // Offset such that when cur == i, coin i is at p = 2 (Hero Front)
      const p = ((i - cur + 2) % N + N) % N;
      const pt = getTrackPoint(p);
      const coin = coins[i];

      coin.style.left = `${pt.x.toFixed(2)}%`;
      coin.style.top = `${pt.y.toFixed(2)}%`;
      coin.style.transform = `translate(-50%, -50%) scale(${pt.s.toFixed(3)})`;
      coin.style.zIndex = String(pt.z);

      // Hero active glow when at or near center front
      const distToFront = Math.abs(p - 2);
      coin.classList.toggle('is-active', distToFront < 0.35);
    }

    const frontIdx = ((Math.round(cur) % N) + N) % N;
    setFront(frontIdx);
  }

  function frame() {
    let busy = false;
    const diff = goal - cur;

    if (Math.abs(diff) > 0.001) {
      cur += diff * 0.085;
      busy = true;
    } else {
      cur = goal;
    }

    place();

    if (busy && inView) {
      requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }

  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  function goTo(index) {
    lastTouch = performance.now();
    // Find shortest rotational direction to bring venture index to front
    const curNorm = ((cur % N) + N) % N;
    let diff = index - curNorm;
    if (diff > N / 2) diff -= N;
    if (diff < -N / 2) diff += N;
    goal = cur + diff;
    start();
  }

  // Build dots
  if (dotsEl) {
    dotsEl.innerHTML = '';
  }
  const dots = ventures.map((v, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'orbit-dot';
    dot.setAttribute('aria-label', `Select ${v.name}`);
    dot.addEventListener('click', () => goTo(i));
    if (dotsEl) dotsEl.appendChild(dot);
    return dot;
  });

  // Attach click listener to each coin so clicking moves it directly to the front!
  coins.forEach((coin, i) => {
    coin.addEventListener('click', () => {
      goTo(i);
    });
  });

  // Drag sideways to turn the 3D track
  let dragX = 0;
  let dragCur = 0;
  let moved = false;
  let dragging = false;

  orbit.addEventListener('pointerdown', e => {
    if (e.target.closest('a')) return;
    dragX = e.clientX;
    dragCur = cur;
    moved = false;
    dragging = true;
    lastTouch = performance.now();
    start();
  });

  window.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - dragX;
    if (Math.abs(dx) > 6) moved = true;
    // Dragging left moves next (clockwise), dragging right moves previous
    cur = dragCur - dx / 150;
    goal = cur;
    place();
  });

  const release = () => {
    if (!dragging) return;
    dragging = false;
    goal = Math.round(cur);
    lastTouch = performance.now();
    start();
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);

  // Initial render
  place();
  orbit.classList.add('is-live');

  // Automatic running motion: moves one by one even when not clicked!
  if (!reduceMotion) {
    setInterval(() => {
      if (!inView || dragging || document.hidden) return;
      if (performance.now() - lastTouch < 4500) return; // give the visitor time after a click
      goal = Math.round(goal) + 1;
      start();
    }, 3200);
  }

  // Intersection observer: only animate when in view
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView && !reduceMotion) start();
    }, { threshold: 0.2 }).observe(orbit);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   CONNECT: Save Contact (vCard), the QR code, and sharing the card
   ══════════════════════════════════════════════════════════════════════════ */
function initConnect() {
  const cfg = portfolioConfig;
  const status = document.querySelector('.save-status');

  // The address the QR code and the share button point to: this page itself
  const pageUrl = window.location.href.split('#')[0];

  /* --- QR code, drawn locally by js/vendor/uqr.js ------------------------- */
  if (window.UQR) {
    try {
      const qr = window.UQR.encode(pageUrl, { ecc: 'M', border: 0 });
      let path = '';
      for (let y = 0; y < qr.size; y++) {
        for (let x = 0; x < qr.size; x++) {
          if (qr.data[y][x]) path += `M${x} ${y}h1v1h-1z`;
        }
      }
      const svg = `<svg viewBox="0 0 ${qr.size} ${qr.size}" shape-rendering="crispEdges" aria-hidden="true"><path fill="#1a1206" d="${path}"/></svg>`;
      document.querySelectorAll('.js-qr').forEach(el => { el.innerHTML = svg; });
    } catch (err) {
      document.querySelectorAll('.js-qr').forEach(el => { el.hidden = true; });
    }
  }
  document.querySelectorAll('.js-page-url').forEach(el => { el.textContent = pageUrl.replace(/^https?:\/\//, ''); });

  /* --- Save Contact -------------------------------------------------------- */
  const saveBtn = document.getElementById('saveContact');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${cfg.name}`,
        'N:ArunRatha;Srey;;;',
        `TITLE:${cfg.position}`
      ];
      if (cfg.phone) lines.push(`TEL;TYPE=CELL:${cfg.phone.replace(/[^+\d]/g, '')}`);
      if (cfg.social.email) lines.push(`EMAIL;TYPE=INTERNET,WORK:${cfg.social.email}`);
      if (cfg.website) lines.push(`URL:https://${cfg.website.replace(/^https?:\/\//, '')}`);
      if (cfg.location) lines.push(`ADR;TYPE=WORK:;;;${cfg.location.replace(/,\s*/g, ';')}`);
      if (cfg.social.telegram) lines.push(`X-SOCIALPROFILE;TYPE=telegram:${cfg.social.telegram}`);
      lines.push('END:VCARD');

      const blob = new Blob([lines.join('\r\n')], { type: 'text/vcard;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Srey_ArunRatha.vcf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (status) status.textContent = 'Contact card saved. Open it to add him to your contacts.';
    });
  }

  /* --- Share QR Code ------------------------------------------------------- */
  const sheet = document.getElementById('qrSheet');
  const openBtn = document.getElementById('shareQr');
  const closeBtn = document.getElementById('closeQr');
  const shareBtn = document.getElementById('shareLink');

  if (sheet && openBtn && typeof sheet.showModal === 'function') {
    openBtn.addEventListener('click', () => sheet.showModal());
    if (closeBtn) closeBtn.addEventListener('click', () => sheet.close());
    // A tap on the dark area outside the sheet closes it
    sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });
  } else if (openBtn) {
    openBtn.hidden = true;
  }

  if (shareBtn) {
    const label = shareBtn.querySelector('.pill-label');
    if (!navigator.share) label.textContent = 'Copy link';
    shareBtn.addEventListener('click', async () => {
      try {
        if (navigator.share) {
          await navigator.share({ title: `${cfg.name} — ${cfg.position}`, url: pageUrl });
        } else {
          await navigator.clipboard.writeText(pageUrl);
          label.textContent = 'Link copied';
          setTimeout(() => { label.textContent = 'Copy link'; }, 2200);
        }
      } catch (err) {
        // The visitor closed the share sheet, or copying is blocked: nothing to do
      }
    });
  }
}
