/**
 * ==========================================================================
 * PREMIUM EXECUTIVE PERSONAL PORTFOLIO — JAVASCRIPT CONTROLLER
 * Client / Subject: Srey ArunRatha — Chairman & Founder
 * Architecture: Vanilla JavaScript (ES6+), Zero external runtime dependencies
 * ==========================================================================
 */

'use strict';

/* --------------------------------------------------------------------------
   1. EDITABLE CENTRAL PORTFOLIO CONFIGURATION
   -------------------------------------------------------------------------- */
const portfolioConfig = {
  name: "Srey ArunRatha",
  position: "CHAIRMAN & FOUNDER",

  tagline:
    "Your speech makes people trust you in a while but your character makes people trust you forever.",

  images: {
    portrait: "assets/portrait.jpg",
    signature: "assets/signature.png"
  },

  journeyUrl: "",

  social: {
    telegram: "https://t.me/arunratha",
    linkedin: "",
    facebook: "https://www.facebook.com/share/19figcq498/?mibextid=wwXIfr",
    youtube: "",
    email: "office@arunratha.com"
  },

  office: {
    ventures: "LBC • Magic Iron • BG • Statesman • Saravan",
    role: "Chairman & Founder"
  }
};

/* --------------------------------------------------------------------------
   2. DOM READY & INITIALIZATION
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  applyPortfolioConfiguration();
  initSignatureAnimation();
  initExecutiveModal();
  initActionButtons();
  initVCardDownload();
});

/* --------------------------------------------------------------------------
   3. APPLY CENTRAL CONFIGURATION TO DOM
   -------------------------------------------------------------------------- */
function applyPortfolioConfiguration() {
  document.querySelectorAll('.brand-signature, .modal-signature').forEach(el => {
    el.textContent = portfolioConfig.name;
  });

  const executiveTitleEl = document.getElementById('executiveTitle');
  if (executiveTitleEl) {
    const parts = portfolioConfig.position.split('&');
    if (parts.length === 2) {
      executiveTitleEl.innerHTML = `${parts[0].trim()} <span class="gold-amp">&amp;</span> ${parts[1].trim()}`;
    } else {
      executiveTitleEl.textContent = portfolioConfig.position;
    }
  }

  const modalTitleEl = document.querySelector('.modal-title');
  if (modalTitleEl) modalTitleEl.textContent = portfolioConfig.position;

  const taglineEl = document.getElementById('heroTagline');
  if (taglineEl) taglineEl.textContent = portfolioConfig.tagline.replace(/^"|"$/g, '');

  const modalQuoteEl = document.querySelector('.modal-bio-quote');
  if (modalQuoteEl) modalQuoteEl.textContent = `"${portfolioConfig.tagline.replace(/^"|"$/g, '')}"`;

  if (portfolioConfig.images.portrait) {
    const cssPath = portfolioConfig.images.portrait.startsWith('../')
      ? portfolioConfig.images.portrait
      : `../${portfolioConfig.images.portrait.replace(/^\.\//, '')}`;
    document.documentElement.style.setProperty('--portrait-image', `url("${cssPath}")`);
  }

  bindSocialLinks();
}

/* --------------------------------------------------------------------------
   3.1  SIGNATURE HANDWRITING ANIMATION — CANVAS PIXEL-SCAN APPROACH
   The signature PNG is loaded onto a hidden canvas. We scan opaque pixels
   left-to-right per segment band to build accurate waypoints that follow the
   actual ink strokes. The golden spark follows those waypoints exactly.
   -------------------------------------------------------------------------- */
function initSignatureAnimation() {
  const sigWrap   = document.getElementById('signatureWrap');
  const execTitle = document.getElementById('executiveTitle');
  const goldDiv   = document.getElementById('heroGoldDivider');

  // Hide the SVG-based approach; we use canvas instead
  const oldSvg = document.getElementById('heroSignatureSvg');
  if (oldSvg) oldSvg.style.display = 'none';

  // Create main signature canvas
  let canvas = document.getElementById('heroSigCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'heroSigCanvas';
    canvas.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';
    if (sigWrap) sigWrap.appendChild(canvas);
  }

  // Create particle/spark canvas (on top)
  let pCanvas = document.getElementById('heroParticlesCanvas');
  if (!pCanvas) {
    pCanvas = document.createElement('canvas');
    pCanvas.id = 'heroParticlesCanvas';
    pCanvas.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';
    if (sigWrap) sigWrap.appendChild(pCanvas);
  }

  // Load the signature PNG
  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    const W = img.naturalWidth;   // 1256
    const H = img.naturalHeight;  // 552

    canvas.width = W;
    canvas.height = H;
    pCanvas.width = W;
    pCanvas.height = H;

    // Off-screen canvas to read pixel data
    const offscreen = document.createElement('canvas');
    offscreen.width = W;
    offscreen.height = H;
    const octx = offscreen.getContext('2d');
    octx.drawImage(img, 0, 0);
    const pixData = octx.getImageData(0, 0, W, H).data;

    // Full-signature canvas (source of truth for drawing)
    const revealCanvas = document.createElement('canvas');
    revealCanvas.width = W;
    revealCanvas.height = H;
    revealCanvas.getContext('2d').drawImage(img, 0, 0);

    const ALPHA = 60; // opacity threshold for "ink"

    // Writing segments: each defines which portion of the signature to reveal
    // and what XY band is used to find the spark waypoints.
    // ts=time start, te=time end (seconds), xs/xe=x range, ys/ye=y range for centroid scan
    const segments = [
      { xs: 15,  xe: 480, ys: 10,  ye: 360, ts: 0.1, te: 1.3 },  // S
      { xs: 380, xe: 970, ys: 80,  ye: 360, ts: 1.3, te: 2.6 },  // rey + flourish sweep
      { xs: 15,  xe: 390, ys: 155, ye: 552, ts: 2.7, te: 3.9 },  // capital A
      { xs: 100, xe: 695, ys: 300, ye: 480, ts: 3.9, te: 5.1 },  // a crossbar + run
      { xs: 625, xe: 905, ys: 220, ye: 552, ts: 5.1, te: 6.1 },  // capital R
      { xs: 840, xe: 1256,ys: 215, ye: 475, ts: 6.1, te: 7.1 },  // atha
      { xs: 440, xe: 1256,ys: 320, ye: 552, ts: 7.1, te: 8.2 },  // underline flourish
    ];

    // Build column-centroid waypoints for each segment
    segments.forEach(seg => {
      const pts = [];
      for (let x = seg.xs; x <= seg.xe; x += 2) {
        let sumY = 0, count = 0;
        for (let y = seg.ys; y <= seg.ye; y++) {
          const idx = (y * W + x) * 4;
          if (pixData[idx + 3] > ALPHA) { sumY += y; count++; }
        }
        if (count > 0) pts.push({ x, y: sumY / count });
      }
      seg.pts = pts;
    });

    // Smooth the waypoints with a simple moving-average to prevent jitter
    function smoothPts(pts, win = 5) {
      if (pts.length < win) return pts;
      return pts.map((p, i) => {
        let sx = 0, sy = 0, cnt = 0;
        for (let k = Math.max(0, i - win); k <= Math.min(pts.length - 1, i + win); k++) {
          sx += pts[k].x; sy += pts[k].y; cnt++;
        }
        return { x: sx / cnt, y: sy / cnt };
      });
    }
    segments.forEach(seg => { seg.pts = smoothPts(seg.pts, 6); });

    // Interpolate position along a waypoint array at fraction t (0..1)
    function ptAt(pts, t) {
      if (!pts || !pts.length) return { x: 0, y: 0 };
      if (t <= 0) return pts[0];
      if (t >= 1) return pts[pts.length - 1];
      const fi = t * (pts.length - 1);
      const lo = Math.floor(fi), hi = Math.min(lo + 1, pts.length - 1);
      const f = fi - lo;
      return { x: pts[lo].x + (pts[hi].x - pts[lo].x) * f,
               y: pts[lo].y + (pts[hi].y - pts[lo].y) * f };
    }

    // Particle system
    const pctx = pCanvas.getContext('2d');
    const particles = [];
    for (let i = 0; i < 28; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.45) * 0.4,
        vy: -0.2 - Math.random() * 0.5,
        size: 0.7 + Math.random() * 1.8,
        baseAlpha: 0.1 + Math.random() * 0.55,
        alpha: 0,
        pulseSpeed: 0.02 + Math.random() * 0.04,
        isTrail: false
      });
    }

    function emitTrail(x, y) {
      if (particles.length > 90) return;
      particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 1.0,
        vy: (Math.random() - 0.5) * 1.0 - 0.3,
        size: 1.0 + Math.random() * 2.4,
        alpha: 0.9, baseAlpha: 0.9, pulseSpeed: 0.05,
        isTrail: true, life: 1.0
      });
    }

    function drawSparkFlare(ctx2, x, y, op) {
      ctx2.save();
      ctx2.globalAlpha = op;
      ctx2.translate(x, y);

      // Outer soft aura
      const aura = ctx2.createRadialGradient(0,0,0,0,0,52);
      aura.addColorStop(0,   'rgba(255,255,255,0.95)');
      aura.addColorStop(0.18,'rgba(255,235,120,0.8)');
      aura.addColorStop(0.5, 'rgba(220,160,50,0.35)');
      aura.addColorStop(1,   'rgba(200,130,30,0)');
      ctx2.beginPath();
      ctx2.arc(0,0,52,0,Math.PI*2);
      ctx2.fillStyle = aura;
      ctx2.fill();

      // 4-point star
      ctx2.save();
      ctx2.shadowColor = '#ffd56b';
      ctx2.shadowBlur = 20;
      ctx2.fillStyle = 'rgba(255,245,180,0.92)';
      const s = new Path2D('M0,-36 Q3,-3 0,0 Q-3,-3 0,-36 M0,36 Q3,3 0,0 Q-3,3 0,36 M-36,0 Q-3,3 0,0 Q-3,-3 -36,0 M36,0 Q3,3 0,0 Q3,-3 36,0');
      ctx2.fill(s);
      ctx2.restore();

      // Bright core
      ctx2.beginPath(); ctx2.arc(0,0,8,0,Math.PI*2);
      ctx2.fillStyle = '#fff';
      ctx2.shadowColor = '#fff'; ctx2.shadowBlur = 22;
      ctx2.fill();

      // Sparkle dots
      [[-16,10],[15,-11],[10,16],[-13,-17]].forEach(([dx,dy]) => {
        ctx2.beginPath(); ctx2.arc(dx,dy,2.0,0,Math.PI*2);
        ctx2.fillStyle = 'rgba(255,218,100,0.88)';
        ctx2.shadowBlur = 7; ctx2.fill();
      });

      ctx2.restore();
    }

    function renderParticles(spx, spy, spOp) {
      pctx.clearRect(0,0,W,H);
      const now = Date.now();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.isTrail) {
          p.life -= 0.028; p.alpha = Math.max(0, p.life * 0.85);
          if (p.life <= 0) { particles.splice(i,1); continue; }
        } else {
          p.alpha = p.baseAlpha * (0.55 + 0.45 * Math.sin(now * p.pulseSpeed * 0.05));
          if (p.y < -10) p.y = H+10;
          if (p.x < -10) p.x = W+10;
          if (p.x > W+10) p.x = -10;
        }
        pctx.save();
        pctx.beginPath();
        pctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        pctx.fillStyle = `rgba(245,207,123,${p.alpha.toFixed(2)})`;
        pctx.shadowColor = '#e5a93b'; pctx.shadowBlur = 7;
        pctx.fill(); pctx.restore();
      }
      if (spOp > 0.01) drawSparkFlare(pctx, spx, spy, spOp);
    }

    const ctx = canvas.getContext('2d');
    let startTime = null, animId = null;
    let sparkX = 0, sparkY = 0, sparkOp = 0;

    function ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

    function updateToTime(elapsed) {
      ctx.clearRect(0,0,W,H);
      sparkOp = 0; // reset, will be set by active segment

      segments.forEach(seg => {
        if (elapsed < seg.ts) return;
        const frac = elapsed >= seg.te
          ? 1.0
          : ease(Math.min(1, Math.max(0, (elapsed - seg.ts) / (seg.te - seg.ts))));

        if (frac <= 0) return;

        // Clip region: reveal up to revealX for this segment
        const revealX = seg.xs + (seg.xe - seg.xs) * frac;
        const PAD_Y = 45, PAD_X = 20;
        ctx.save();
        ctx.beginPath();
        ctx.rect(
          Math.max(0, seg.xs - PAD_X),
          Math.max(0, seg.ys - PAD_Y),
          revealX - seg.xs + PAD_X * 2,
          (seg.ye - seg.ys) + PAD_Y * 2
        );
        ctx.clip();
        ctx.drawImage(revealCanvas, 0, 0);
        ctx.restore();

        // Update spark for the currently active (in-progress) segment
        if (elapsed >= seg.ts && elapsed < seg.te) {
          const pt = ptAt(seg.pts, frac);
          sparkX = pt.x; sparkY = pt.y; sparkOp = 1;
          if (Math.random() > 0.4) emitTrail(pt.x, pt.y);
        }
      });

      // Pen lift glide: end-of-rey → start-of-A
      if (elapsed >= 2.6 && elapsed < 2.7) {
        const tg = (elapsed - 2.6) / 0.1;
        const rPts = segments[1].pts, aPts = segments[2].pts;
        const ep = rPts.length ? rPts[rPts.length-1] : {x:960,y:140};
        const sp = aPts.length ? aPts[0]              : {x:80, y:480};
        sparkX = ep.x + (sp.x - ep.x) * tg;
        sparkY = ep.y + (sp.y - ep.y) * tg;
        sparkOp = 1 - tg * 0.4;
      }

      // Touchdown
      if (elapsed < 0.1) {
        const sp0 = segments[0].pts;
        sparkX = sp0.length ? sp0[0].x : 440;
        sparkY = sp0.length ? sp0[0].y : 95;
        sparkOp = elapsed / 0.1;
      }

      // Fade out after completion
      if (elapsed >= 8.2 && elapsed < 8.6) sparkOp = Math.max(0, 1 - (elapsed - 8.2) / 0.4);
      if (elapsed >= 8.6) sparkOp = 0;

      // Full reveal after completion (sharp, no mask)
      if (elapsed >= 8.2) {
        ctx.clearRect(0,0,W,H);
        ctx.drawImage(revealCanvas, 0, 0);
        if (execTitle) execTitle.classList.add('is-visible');
        if (goldDiv)   goldDiv.classList.add('is-visible');
      } else {
        if (execTitle) execTitle.classList.remove('is-visible');
        if (goldDiv)   goldDiv.classList.remove('is-visible');
      }

      renderParticles(sparkX, sparkY, sparkOp);
    }

    function renderFrame(ts) {
      if (!startTime) startTime = ts;
      updateToTime((ts - startTime) / 1000);
      animId = requestAnimationFrame(renderFrame);
    }

    function playAnimation() {
      if (animId) cancelAnimationFrame(animId);
      startTime = null; sparkOp = 0;
      ctx.clearRect(0,0,W,H);
      if (execTitle) execTitle.classList.remove('is-visible');
      if (goldDiv)   goldDiv.classList.remove('is-visible');
      animId = requestAnimationFrame(renderFrame);
    }

    if (sigWrap) {
      sigWrap.addEventListener('click', playAnimation);
      sigWrap.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playAnimation(); }
      });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const testT = urlParams.get('t');
    if (testT !== null) updateToTime(parseFloat(testT));
    else playAnimation();
  };

  img.onerror = () => console.warn('[Sig] Failed to load signature PNG.');
  img.src = portfolioConfig.images.signature;
}

/* --------------------------------------------------------------------------
   SOCIAL LINKS
   -------------------------------------------------------------------------- */
function bindSocialLinks() {
  const mapping = [
    { key: 'telegram', selector: '.social-link-telegram', label: 'Telegram' },
    { key: 'linkedin', selector: '.social-link-linkedin', label: 'LinkedIn' },
    { key: 'facebook', selector: '.social-link-facebook', label: 'Facebook' },
    { key: 'youtube',  selector: '.social-link-youtube',  label: 'YouTube' },
    { key: 'email',    selector: '.social-link-email',    label: 'Official Email' }
  ];

  mapping.forEach(({ key, selector, label }) => {
    let url = portfolioConfig.social[key];
    if (key === 'telegram' && url) {
      if (url.startsWith('@')) url = `https://t.me/${url.substring(1)}`;
      else if (!url.startsWith('http')) url = `https://t.me/${url.replace(/^t\.me\//, '')}`;
    }
    document.querySelectorAll(selector).forEach(link => {
      if (url && url.trim()) {
        link.href = (key === 'email' && !url.startsWith('mailto:')) ? `mailto:${url}` : url;
        if (key !== 'email') { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
        link.classList.remove('disabled');
        link.removeAttribute('aria-disabled');
        link.title = `Connect on ${label}`;
      } else {
        link.removeAttribute('href');
        link.classList.add('disabled');
        link.setAttribute('aria-disabled', 'true');
        link.setAttribute('role', 'button');
        link.title = `${label} channel available upon direct inquiry`;
        link.addEventListener('click', e => {
          e.preventDefault();
          showToast(`Official ${label} channel will be shared upon direct executive inquiry.`);
        });
      }
    });
  });

  const modalEmail = document.getElementById('modalEmailBtn');
  if (modalEmail && portfolioConfig.social.email)
    modalEmail.href = `mailto:${portfolioConfig.social.email}`;
}

/* --------------------------------------------------------------------------
   4. EXECUTIVE OVERLAY MODAL
   -------------------------------------------------------------------------- */
let isModalOpen = false;

function initExecutiveModal() {
  const hamburgerBtn   = document.getElementById('hamburgerBtn');
  const modal          = document.getElementById('executiveModal');
  const backdrop       = document.getElementById('modalBackdrop');
  const closeBtn       = document.getElementById('modalCloseBtn');
  const desktopProfile = document.getElementById('btnDesktopProfile');
  const desktopContact = document.getElementById('btnDesktopContact');

  if (!modal) return;

  function openModal() {
    isModalOpen = true; modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    if (hamburgerBtn) { hamburgerBtn.classList.add('active'); hamburgerBtn.setAttribute('aria-expanded','true'); }
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    isModalOpen = false; modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (hamburgerBtn) { hamburgerBtn.classList.remove('active'); hamburgerBtn.setAttribute('aria-expanded','false'); }
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', e => { e.preventDefault(); isModalOpen ? closeModal() : openModal(); });
  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (backdrop)  backdrop.addEventListener('click', closeModal);
  if (desktopProfile) desktopProfile.addEventListener('click', openModal);
  if (desktopContact) desktopContact.addEventListener('click', () => {
    if (portfolioConfig.social.email) window.location.href = `mailto:${portfolioConfig.social.email}`;
    else openModal();
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isModalOpen) closeModal(); });
  window.executiveModal = { open: openModal, close: closeModal };
}

/* --------------------------------------------------------------------------
   5. ACTION BUTTONS
   -------------------------------------------------------------------------- */
function initActionButtons() {
  const btnJ = document.getElementById('btnExploreJourney');
  const btnT = document.getElementById('btnGetInTouch');
  if (btnJ) btnJ.addEventListener('click', e => {
    e.preventDefault();
    if (portfolioConfig.journeyUrl?.trim()) window.open(portfolioConfig.journeyUrl,'_blank','noopener,noreferrer');
    else if (window.executiveModal) window.executiveModal.open();
  });
  if (btnT) btnT.addEventListener('click', e => {
    e.preventDefault();
    if (portfolioConfig.social.email) window.location.href = `mailto:${portfolioConfig.social.email}`;
    else if (window.executiveModal) window.executiveModal.open();
  });
}

/* --------------------------------------------------------------------------
   6. VCARD
   -------------------------------------------------------------------------- */
function initVCardDownload() {
  document.querySelectorAll('.download-vcard-btn').forEach(btn =>
    btn.addEventListener('click', e => { e.preventDefault(); downloadExecutiveVCard(); })
  );
}

function downloadExecutiveVCard() {
  const emailVal = portfolioConfig.social.email || 'office@arunratha.com';
  const vc = [
    'BEGIN:VCARD','VERSION:3.0',
    `FN:${portfolioConfig.name}`, `N:ArunRatha;Srey;;;`,
    `TITLE:${portfolioConfig.position}`,
    'ORG:LBC, Magic Iron, BG, Statesman, Saravan',
    `EMAIL;TYPE=INTERNET,WORK:${emailVal}`,
    `NOTE:${portfolioConfig.tagline}`,
    'END:VCARD'
  ].join('\r\n');

  const blob = new Blob([vc], { type: 'text/vcard;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.setAttribute('download', `${portfolioConfig.name.replace(/\s+/g,'_')}_Executive.vcf`);
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Executive vCard downloaded.');
}

/* --------------------------------------------------------------------------
   7. TOAST
   -------------------------------------------------------------------------- */
function showToast(message) {
  let toast = document.getElementById('executiveToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'executiveToast';
    toast.style.cssText = `
      position:fixed;bottom:24px;left:50%;
      transform:translateX(-50%) translateY(30px);
      background:rgba(8,20,38,0.95);backdrop-filter:blur(12px);
      border:1px solid var(--gold,#e4ac41);color:#fff;
      padding:12px 22px;border-radius:9999px;
      font-size:0.84rem;font-family:inherit;
      box-shadow:0 10px 30px rgba(0,0,0,0.6),0 0 15px rgba(228,172,65,0.25);
      z-index:9999;opacity:0;
      transition:all 0.35s cubic-bezier(0.16,1,0.3,1);
      pointer-events:none;text-align:center;max-width:90vw;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(30px)';
  }, 4000);
}
