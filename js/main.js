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
   3.1. SIGNATURE HANDWRITING MOTION CONTROLLER (SINGLE-PLAY + TAP-TO-REPLAY)
   Full cross-browser letter-by-letter reveal synchronized with the golden
   lens flare spark, following the exact motion choreography of the video.
   -------------------------------------------------------------------------- */
function initSignatureAnimation() {
  const svg = document.getElementById('heroSignatureSvg');
  const sigImg = document.getElementById('heroSignatureImg');
  const spark = document.getElementById('sparkFlareGroup');
  const sigWrap = document.getElementById('signatureWrap');
  if (!svg || !sigImg) return;

  const maskSequence = [
    { id: 'sigMask1', start: 0.1, end: 1.3, dur: 1.2 }, // S
    { id: 'sigMask2', start: 1.3, end: 2.6, dur: 1.3 }, // rey + flourish
    { id: 'sigMask3', start: 2.7, end: 3.9, dur: 1.2 }, // A (full loop + apex + descender)
    { id: 'sigMask4', start: 3.9, end: 5.1, dur: 1.2 }, // A crossbar + run + R stem
    { id: 'sigMask5', start: 5.1, end: 6.1, dur: 1.0 }, // R bowl & kicking leg + a
    { id: 'sigMask6', start: 6.1, end: 7.1, dur: 1.0 }, // t stem + h + a
    { id: 'sigMask7', start: 7.1, end: 8.2, dur: 1.1 }  // Underline flourish + crossbar
  ];

  // Pre-calculate path lengths and cache elements
  const paths = maskSequence.map(item => {
    const el = document.getElementById(item.id);
    let len = 1200;
    if (el && typeof el.getTotalLength === 'function') {
      try { len = el.getTotalLength(); } catch (_) {}
    }
    if (el) {
      el.style.strokeDasharray = `${len} ${len}`;
      el.style.strokeDashoffset = `${len}`;
    }
    return { ...item, el, len };
  });

  let startTime = null;
  let animId = null;

  // Smooth quadratic ease-in-out
  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function updateToTime(elapsed) {
    // Update each handwriting stroke mask
    paths.forEach(p => {
      if (!p.el) return;
      if (elapsed < p.start) {
        p.el.style.strokeDashoffset = `${p.len}`;
      } else if (elapsed >= p.end) {
        p.el.style.strokeDashoffset = '0';
      } else {
        const progress = Math.min(1, Math.max(0, (elapsed - p.start) / p.dur));
        const eased = easeInOut(progress);
        const currentOffset = p.len * (1 - eased);
        p.el.style.strokeDashoffset = `${currentOffset.toFixed(1)}`;

        // Attach golden spark flare directly to the active pen writing tip
        if (spark && typeof p.el.getPointAtLength === 'function') {
          try {
            const pt = p.el.getPointAtLength(p.len * eased);
            spark.setAttribute('transform', `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);
            spark.style.opacity = '1';
          } catch (_) {}
        }
      }
    });

    // Swift smooth transition between flourish tip of 'Srey' (945, 145) and start of 'ArunRatha' (40, 300)
    if (elapsed >= 2.6 && elapsed < 2.7 && spark) {
      const tGlide = (elapsed - 2.6) / 0.1;
      const gx = 945 + (40 - 945) * tGlide;
      const gy = 145 + (300 - 145) * tGlide;
      spark.setAttribute('transform', `translate(${gx.toFixed(1)}, ${gy.toFixed(1)})`);
      spark.style.opacity = (1 - tGlide * 0.35).toFixed(2);
    }

    // Touchdown flare at start (0.0s -> 0.1s)
    if (elapsed < 0.1 && spark) {
      const p1 = paths[0];
      if (p1 && p1.el && typeof p1.el.getPointAtLength === 'function') {
        try {
          const pt = p1.el.getPointAtLength(0);
          spark.setAttribute('transform', `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);
        } catch (_) {}
      }
      spark.style.opacity = (elapsed / 0.1).toFixed(2);
    }

    // Gentle spark dissolve after underline finish (8.2s -> 8.5s)
    if (elapsed >= 8.2 && elapsed < 8.5 && spark) {
      const fade = (elapsed - 8.2) / 0.3;
      spark.style.opacity = Math.max(0, 1 - fade).toFixed(2);
    }

    // Invalidate WebKit mask cache every frame to guarantee 60fps on iOS Safari
    svg.setAttribute('data-frame-tick', Math.floor(elapsed * 15).toString());

    if (elapsed >= 8.5) {
      // 100% Crisp Retina Clarity Permanent Freeze
      if (spark) spark.style.opacity = '0';
      paths.forEach(p => { if (p.el) p.el.style.strokeDashoffset = '0'; });
      // Remove mask attribute entirely to render 100% unmasked full retina crispness
      sigImg.removeAttribute('mask');
      sigImg.style.opacity = '1';
    } else {
      if (!sigImg.hasAttribute('mask')) {
        sigImg.setAttribute('mask', 'url(#sigHandwriteMask)');
      }
    }
  }

  // Expose global controller hook for verification and automated timelines
  window.setSignatureProgress = updateToTime;

  function renderFrame(timestamp) {
    if (!startTime) startTime = timestamp || performance.now() || Date.now();
    const now = timestamp || performance.now() || Date.now();
    const elapsed = (now - startTime) / 1000; // in seconds

    updateToTime(elapsed);

    if (elapsed < 8.5) {
      animId = requestAnimationFrame(renderFrame);
    }
  }

  function playAnimation() {
    if (animId) cancelAnimationFrame(animId);
    startTime = null;
    sigImg.setAttribute('mask', 'url(#sigHandwriteMask)');
    paths.forEach(p => {
      if (p.el) p.el.style.strokeDashoffset = `${p.len}`;
    });
    if (spark) spark.style.opacity = '0';

    // Also restart SMIL animations for declarative synchronization
    try {
      const anims = svg.querySelectorAll('animate, animateMotion');
      if (anims && anims.length > 0) {
        anims.forEach(a => {
          if (typeof a.beginElement === 'function') {
            try { a.beginElement(); } catch (_) {}
          }
        });
      }
      if (typeof svg.setCurrentTime === 'function') {
        svg.setCurrentTime(0);
      }
    } catch (_) {}

    animId = requestAnimationFrame(renderFrame);
  }

  // Tap-to-replay
  if (sigWrap) {
    sigWrap.addEventListener('click', () => {
      playAnimation();
    });
  }

  // Check if previewing a specific time via URL query ?t=4.5
  const urlParams = new URLSearchParams(window.location.search);
  const testT = urlParams.get('t');
  if (testT !== null) {
    updateToTime(parseFloat(testT));
  } else {
    // Trigger initial play
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
