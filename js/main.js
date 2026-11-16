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
   Update your name, executive position, personal statement, assets, and
   social media links here. All components update automatically.
   -------------------------------------------------------------------------- */
const portfolioConfig = {
  name: "Srey ArunRatha",
  position: "CHAIRMAN & FOUNDER",

  tagline:
    "Your speech makes people trust you in a while but your character makes people trust you forever.",

  images: {
    portrait: "assets/portrait.jpg",
    signature: "assets/signature.png?v=full_reveal_v15"
  },

  // Optional external link for 'Explore My Journey' (e.g. LinkedIn, Bio, or CV URL).
  // If left empty (""), tapping the button opens the executive profile drawer.
  journeyUrl: "",

  social: {
    // Direct official executive channels:
    telegram: "https://t.me/arunratha",
    linkedin: "",
    facebook: "https://www.facebook.com/share/19figcq498/?mibextid=wwXIfr",
    youtube: "",
    email: "office@arunratha.com" // Update with official executive email
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
  // Update Executive Name
  const brandSignatures = document.querySelectorAll('.brand-signature, .modal-signature');
  brandSignatures.forEach(el => {
    el.textContent = portfolioConfig.name;
  });

  // Update Executive Position (Preserve gold ampersand formatting)
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
  if (modalTitleEl) {
    modalTitleEl.textContent = portfolioConfig.position;
  }

  // Update Tagline / Personal Statement
  const taglineEl = document.getElementById('heroTagline');
  if (taglineEl) {
    taglineEl.textContent = portfolioConfig.tagline.replace(/^"|"$/g, '');
  }

  const modalQuoteEl = document.querySelector('.modal-bio-quote');
  if (modalQuoteEl) {
    modalQuoteEl.textContent = `“${portfolioConfig.tagline.replace(/^"|"$/g, '')}”`;
  }

  // Update Portrait Background via CSS Variable
  if (portfolioConfig.images.portrait) {
    const cssPath = portfolioConfig.images.portrait.startsWith('../')
      ? portfolioConfig.images.portrait
      : `../${portfolioConfig.images.portrait.replace(/^\.\//, '')}`;
    document.documentElement.style.setProperty('--portrait-image', `url("${cssPath}")`);
  }

  // Update Signature Image & Cursive Fallback
  const sigImg = document.getElementById('heroSignatureImg');
  const sigFallback = document.getElementById('heroSignatureFallback');
  if (sigImg) {
    if (portfolioConfig.images.signature) {
      const currentHref = sigImg.getAttribute('href') || sigImg.getAttribute('xlink:href');
      if (currentHref !== portfolioConfig.images.signature) {
        if (sigImg.tagName.toLowerCase() === 'image') {
          sigImg.setAttribute('href', portfolioConfig.images.signature);
        } else {
          sigImg.src = portfolioConfig.images.signature;
        }
      }
      sigImg.alt = `${portfolioConfig.name} Signature`;
    } else {
      sigImg.style.display = 'none';
      if (sigFallback) {
        sigFallback.style.display = 'block';
        sigFallback.textContent = portfolioConfig.name;
      }
    }
  }

  // Bind Social Links
  bindSocialLinks();
}

/* --------------------------------------------------------------------------
   3.1. SIGNATURE HANDWRITING MOTION CONTROLLER (PURE SVG & PARTICLE DUST)
   Authentic human handwriting motion following the reference video choreography:
   - Full unbroken letter-by-letter reveal (zero clipped strokes)
   - Golden sparkling lens flare with diamond rays at the active pen tip
   - Floating ember particles & dust trail emitted from the writing tip
   - Synchronized fade-in of 'CHAIRMAN & FOUNDER' and gold divider at completion
   - Single-play on load with smooth tap-to-replay
   -------------------------------------------------------------------------- */
function initSignatureAnimation() {
  const svg = document.getElementById('heroSignatureSvg');
  const sigImg = document.getElementById('heroSignatureImg');
  const spark = document.getElementById('sparkFlareGroup');
  const sigWrap = document.getElementById('signatureWrap');
  const particleCanvas = document.getElementById('heroParticlesCanvas');
  const execTitle = document.getElementById('executiveTitle');
  const goldDivider = document.getElementById('heroGoldDivider');

  if (!svg || !sigImg) return;

  const maskSequence = [
    { id: 'sigMask1', envId: 'envS',    start: 0.1, end: 1.3, dur: 1.2 }, // S
    { id: 'sigMask2', envId: 'envRey',  start: 1.3, end: 2.6, dur: 1.3 }, // rey + flourish
    { id: 'sigMask3', envId: 'envA',    start: 2.7, end: 3.9, dur: 1.2 }, // Capital A
    { id: 'sigMask4', envId: 'envRun',  start: 3.9, end: 5.1, dur: 1.2 }, // A crossbar + run
    { id: 'sigMask5', envId: 'envR',    start: 5.1, end: 6.1, dur: 1.0 }, // Capital R
    { id: 'sigMask6', envId: 'envAtha', start: 6.1, end: 7.1, dur: 1.0 }, // atha
    { id: 'sigMask7', envId: 'envFull', start: 7.1, end: 8.2, dur: 1.1 }  // Underline flourish + crossbar
  ];

  // Pre-calculate path lengths and cache envelope rect elements
  const paths = maskSequence.map(item => {
    const el = document.getElementById(item.id);
    const env = document.getElementById(item.envId);
    let len = 1200;
    if (el && typeof el.getTotalLength === 'function') {
      try { len = el.getTotalLength(); } catch (_) {}
    }
    if (el) {
      el.style.strokeDasharray = `${len} ${len}`;
      el.style.strokeDashoffset = `${len}`;
    }
    return { ...item, el, env, len };
  });

  // Floating Golden Embers & Trail Dust Particles System
  let particleCtx = null;
  let particles = [];
  if (particleCanvas && particleCanvas.getContext) {
    particleCtx = particleCanvas.getContext('2d');
    // Initialize ambient golden embers drifting gently in 3D space
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * 1256,
        y: Math.random() * 552,
        vx: (Math.random() - 0.45) * 0.4,
        vy: -0.2 - Math.random() * 0.45,
        size: 0.8 + Math.random() * 2.2,
        alpha: 0.1 + Math.random() * 0.7,
        baseAlpha: 0.1 + Math.random() * 0.7,
        pulseSpeed: 0.02 + Math.random() * 0.04,
        isTrail: false
      });
    }
  }

  function emitTrailParticle(x, y) {
    if (!particles || particles.length > 90) return;
    particles.push({
      x: x + (Math.random() - 0.5) * 16,
      y: y + (Math.random() - 0.5) * 16,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8 - 0.2,
      size: 1.2 + Math.random() * 2.0,
      alpha: 0.9,
      baseAlpha: 0.9,
      pulseSpeed: 0.05,
      isTrail: true,
      life: 1.0
    });
  }

  function renderParticles() {
    if (!particleCtx || !particleCanvas) return;
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.isTrail) {
        p.life -= 0.025;
        p.alpha = Math.max(0, p.life * 0.85);
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
      } else {
        p.alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(Date.now() * p.pulseSpeed * 0.05));
        if (p.y < -10) p.y = 560;
        if (p.x < -10) p.x = 1266;
        if (p.x > 1266) p.x = -10;
      }

      particleCtx.save();
      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      particleCtx.fillStyle = `rgba(245, 207, 123, ${p.alpha.toFixed(2)})`;
      particleCtx.shadowColor = '#e5a93b';
      particleCtx.shadowBlur = 6;
      particleCtx.fill();
      particleCtx.restore();
    }
  }

  let startTime = null;
  let animId = null;

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function updateToTime(elapsed) {
    // 1. Update each stroke mask and letter envelope
    paths.forEach(p => {
      if (!p.el) return;

      if (elapsed < p.start) {
        p.el.style.strokeDashoffset = `${p.len}`;
        if (p.env) p.env.setAttribute('opacity', '0');
      } else if (elapsed >= p.end) {
        p.el.style.strokeDashoffset = '0';
        // Once this letter stroke is completed, unlock the full letter envelope!
        // This guarantees that 100% of letter loops and flourishes are NEVER clipped!
        if (p.env) p.env.setAttribute('opacity', '1');
      } else {
        const progress = Math.min(1, Math.max(0, (elapsed - p.start) / p.dur));
        const eased = easeInOut(progress);
        const currentOffset = p.len * (1 - eased);
        p.el.style.strokeDashoffset = `${currentOffset.toFixed(1)}`;

        // Attach golden spark flare directly to the active writing tip
        if (spark && typeof p.el.getPointAtLength === 'function') {
          try {
            const pt = p.el.getPointAtLength(p.len * eased);
            spark.setAttribute('transform', `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);
            spark.style.opacity = '1';
            // Emit sparkling trail dust
            if (Math.random() > 0.35) {
              emitTrailParticle(pt.x, pt.y);
            }
          } catch (_) {}
        }
      }
    });

    // 2. Swift smooth pen transition between 'Srey' flourish (960, 140) and Capital 'A' (80, 480)
    if (elapsed >= 2.6 && elapsed < 2.7 && spark) {
      const tGlide = (elapsed - 2.6) / 0.1;
      const gx = 960 + (80 - 960) * tGlide;
      const gy = 140 + (480 - 140) * tGlide;
      spark.setAttribute('transform', `translate(${gx.toFixed(1)}, ${gy.toFixed(1)})`);
      spark.style.opacity = (1 - tGlide * 0.35).toFixed(2);
    }

    // 3. Touchdown spark flare at start (0.0s -> 0.1s)
    if (elapsed < 0.1 && spark) {
      spark.setAttribute('transform', 'translate(440, 95)');
      spark.style.opacity = (elapsed / 0.1).toFixed(2);
    }

    // 4. Spark dissolve after underline completion (8.2s -> 8.5s)
    if (elapsed >= 8.2 && elapsed < 8.5 && spark) {
      const fade = (elapsed - 8.2) / 0.3;
      spark.style.opacity = Math.max(0, 1 - fade).toFixed(2);
    }

    // 5. Completion State (8.2s and beyond)
    if (elapsed >= 8.2) {
      if (spark) spark.style.opacity = '0';
      // Unlock all envelopes and remove mask for pristine retina clarity
      paths.forEach(p => {
        if (p.el) p.el.style.strokeDashoffset = '0';
        if (p.env) p.env.setAttribute('opacity', '1');
      });
      sigImg.removeAttribute('mask');

      // Reveal 'CHAIRMAN & FOUNDER' and gold divider right below signature
      if (execTitle) execTitle.classList.add('is-visible');
      if (goldDivider) goldDivider.classList.add('is-visible');
    } else {
      if (!sigImg.hasAttribute('mask')) {
        sigImg.setAttribute('mask', 'url(#sigHandwriteMask)');
      }
      if (execTitle) execTitle.classList.remove('is-visible');
      if (goldDivider) goldDivider.classList.remove('is-visible');
    }

    // Render particle layer
    renderParticles();
  }

  function renderFrame(timestamp) {
    if (!startTime) startTime = timestamp || performance.now() || Date.now();
    const now = timestamp || performance.now() || Date.now();
    const elapsed = (now - startTime) / 1000;

    updateToTime(elapsed);

    // Keep ambient dust floating even after signature finishes
    animId = requestAnimationFrame(renderFrame);
  }

  function playAnimation() {
    if (animId) cancelAnimationFrame(animId);
    startTime = null;
    sigImg.setAttribute('mask', 'url(#sigHandwriteMask)');
    paths.forEach(p => {
      if (p.el) p.el.style.strokeDashoffset = `${p.len}`;
      if (p.env) p.env.setAttribute('opacity', '0');
    });
    if (spark) spark.style.opacity = '0';
    if (execTitle) execTitle.classList.remove('is-visible');
    if (goldDivider) goldDivider.classList.remove('is-visible');

    animId = requestAnimationFrame(renderFrame);
  }

  // Tap-to-replay anywhere on signature container
  if (sigWrap) {
    sigWrap.addEventListener('click', () => {
      playAnimation();
    });
    sigWrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playAnimation();
      }
    });
  }

  // Preview specific time via URL query ?t=2.5 or play initially
  const urlParams = new URLSearchParams(window.location.search);
  const testT = urlParams.get('t');
  if (testT !== null) {
    updateToTime(parseFloat(testT));
  } else {
    playAnimation();
  }
}

/**
 * Configure social icons based on portfolioConfig.social.
 * If a URL is empty, safely notify user via toast rather than navigating nowhere.
 */
function bindSocialLinks() {
  const socialMapping = [
    { key: 'telegram', selector: '.social-link-telegram', label: 'Telegram' },
    { key: 'linkedin', selector: '.social-link-linkedin', label: 'LinkedIn' },
    { key: 'facebook', selector: '.social-link-facebook', label: 'Facebook' },
    { key: 'youtube', selector: '.social-link-youtube', label: 'YouTube' },
    { key: 'email', selector: '.social-link-email', label: 'Official Email' }
  ];

  socialMapping.forEach(({ key, selector, label }) => {
    const links = document.querySelectorAll(selector);
    let url = portfolioConfig.social[key];

    // Normalize telegram handle if format is @username or t.me/username
    if (key === 'telegram' && url) {
      if (url.startsWith('@')) {
        url = `https://t.me/${url.substring(1)}`;
      } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://t.me/${url.replace(/^t\.me\//, '')}`;
      }
    }

    links.forEach(link => {
      if (url && url.trim() !== '') {
        if (key === 'email' && !url.startsWith('mailto:')) {
          link.href = `mailto:${url}`;
        } else {
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
        link.classList.remove('disabled');
        link.removeAttribute('aria-disabled');
        link.title = `Connect on ${label}`;
      } else {
        link.removeAttribute('href');
        link.classList.add('disabled');
        link.setAttribute('aria-disabled', 'true');
        link.setAttribute('role', 'button');
        link.title = `${label} channel available upon direct inquiry`;

        link.addEventListener('click', (e) => {
          e.preventDefault();
          showToast(`Official ${label} channel will be shared upon direct executive inquiry.`);
        });
      }
    });
  });

  // Update modal direct email button
  const modalEmailBtn = document.getElementById('modalEmailBtn');
  if (modalEmailBtn && portfolioConfig.social.email) {
    modalEmailBtn.href = `mailto:${portfolioConfig.social.email}`;
  }
}

/* --------------------------------------------------------------------------
   4. EXECUTIVE OVERLAY MODAL & HAMBURGER CONTROLLER
   -------------------------------------------------------------------------- */
let isModalOpen = false;

function initExecutiveModal() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const modal = document.getElementById('executiveModal');
  const backdrop = document.getElementById('modalBackdrop');
  const closeBtn = document.getElementById('modalCloseBtn');
  const desktopProfileBtn = document.getElementById('btnDesktopProfile');
  const desktopContactBtn = document.getElementById('btnDesktopContact');

  if (!modal) return;

  function openModal() {
    isModalOpen = true;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    if (hamburgerBtn) {
      hamburgerBtn.classList.add('active');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    isModalOpen = false;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (hamburgerBtn) {
      hamburgerBtn.classList.remove('active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isModalOpen) closeModal();
      else openModal();
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  if (desktopProfileBtn) desktopProfileBtn.addEventListener('click', openModal);
  if (desktopContactBtn) {
    desktopContactBtn.addEventListener('click', () => {
      if (portfolioConfig.social.email) {
        window.location.href = `mailto:${portfolioConfig.social.email}`;
      } else {
        openModal();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) {
      closeModal();
    }
  });

  window.executiveModal = { open: openModal, close: closeModal };
}

/* --------------------------------------------------------------------------
   5. PRIMARY ACTION BUTTONS
   -------------------------------------------------------------------------- */
function initActionButtons() {
  const btnJourney = document.getElementById('btnExploreJourney');
  const btnTouch = document.getElementById('btnGetInTouch');

  if (btnJourney) {
    btnJourney.addEventListener('click', (e) => {
      e.preventDefault();
      if (portfolioConfig.journeyUrl && portfolioConfig.journeyUrl.trim() !== '') {
        window.open(portfolioConfig.journeyUrl, '_blank', 'noopener,noreferrer');
      } else if (window.executiveModal) {
        window.executiveModal.open();
      }
    });
  }

  if (btnTouch) {
    btnTouch.addEventListener('click', (e) => {
      e.preventDefault();
      if (portfolioConfig.social.email) {
        window.location.href = `mailto:${portfolioConfig.social.email}`;
      } else if (window.executiveModal) {
        window.executiveModal.open();
      }
    });
  }
}

/* --------------------------------------------------------------------------
   6. VCARD GENERATION & DOWNLOAD
   -------------------------------------------------------------------------- */
function initVCardDownload() {
  const vcardBtns = document.querySelectorAll('.download-vcard-btn');
  vcardBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      downloadExecutiveVCard();
    });
  });
}

function downloadExecutiveVCard() {
  const emailVal = portfolioConfig.social.email || 'office@arunratha.com';
  const vCardContent = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${portfolioConfig.name}`,
    `N:ArunRatha;Srey;;;`,
    `TITLE:${portfolioConfig.position}`,
    `ORG:LBC, Magic Iron, BG, Statesman, Saravan`,
    `EMAIL;TYPE=INTERNET,WORK:${emailVal}`,
    `NOTE:${portfolioConfig.tagline} (${portfolioConfig.office.role} of ${portfolioConfig.office.ventures})`,
    'END:VCARD'
  ].join('\r\n');

  const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.setAttribute('download', `${portfolioConfig.name.replace(/\s+/g, '_')}_Executive.vcf`);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);

  showToast('Executive vCard downloaded.');
}

/* --------------------------------------------------------------------------
   7. TOAST NOTIFICATION UTILITY
   -------------------------------------------------------------------------- */
function showToast(message) {
  let toast = document.getElementById('executiveToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'executiveToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(30px);
      background: rgba(8, 20, 38, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid var(--gold, #e4ac41);
      color: #ffffff;
      padding: 12px 22px;
      border-radius: 9999px;
      font-size: 0.84rem;
      font-family: inherit;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(228, 172, 65, 0.25);
      z-index: 9999;
      opacity: 0;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      text-align: center;
      max-width: 90vw;
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
