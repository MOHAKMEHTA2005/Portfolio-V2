/**
 * ============================================================================
 * MOHAK MEHTA PORTFOLIO — MAIN INTERACTIVITY & ANIMATIONS SCRIPT
 * - Typewriter tagline animation
 * - Sticky navbar hide on scroll down / show on scroll up
 * - Active section navigation highlight
 * - Scroll reveals via IntersectionObserver
 * - 3D project cards tilt on hover with dynamic glare
 * - Experience timeline progress connector drawing on scroll
 * - Skills category filter tabs
 * - Custom trailing cursor glow on desktop
 * - Dark / Light theme toggle with local persistence
 * - Copy to clipboard & toast alerts
 * ============================================================================
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. THEME TOGGLE (Dark / Light)
  // ---------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const htmlRoot = document.documentElement;

  // Retrieve saved theme or system preference
  const savedTheme = localStorage.getItem('mohak_portfolio_theme') || 'dark';
  htmlRoot.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlRoot.setAttribute('data-theme', nextTheme);
      localStorage.setItem('mohak_portfolio_theme', nextTheme);

      // Notify Three.js to recompute materials from updated CSS variables
      if (typeof window.update3DThemeColors === 'function') {
        setTimeout(window.update3DThemeColors, 100);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 2. HERO TYPEWRITER ANIMATION (Under 12 Words Tagline)
  // ---------------------------------------------------------------------------
  const typewriterElement = document.getElementById('heroTypewriter');
  const taglinePhrases = [
    "Building Python-first systems, ML backends, and autonomous AI workflows end to end.",
    "FastAPI & Flask REST APIs • Dense Vector Search on Elasticsearch.",
    "4x National Hackathon Finalist • ISRO Presentation at IIT Delhi.",
    "Automating multi-turn LLM agent workflows with n8n & Gemini."
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 50;

  function typeTagline() {
    if (!typewriterElement) return;

    const currentPhrase = taglinePhrases[phraseIndex];

    if (isDeleting) {
      typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 25;
    } else {
      typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 55;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      // Pause at full phrase
      typingSpeed = 2600;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % taglinePhrases.length;
      typingSpeed = 400;
    }

    setTimeout(typeTagline, typingSpeed);
  }

  // Start typewriter on load
  setTimeout(typeTagline, 500);

  // ---------------------------------------------------------------------------
  // 3. STICKY NAVBAR (Hide on scroll down, show on scroll up, active section)
  // ---------------------------------------------------------------------------
  const siteHeader = document.getElementById('siteHeader');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const sections = document.querySelectorAll('section[id]');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Header background blur on scroll
    if (currentScrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }

    // Hide on scroll down, show on scroll up
    if (currentScrollY > 180 && currentScrollY > lastScrollY) {
      siteHeader.classList.add('nav-hidden');
    } else {
      siteHeader.classList.remove('nav-hidden');
    }
    lastScrollY = currentScrollY;

    // Active Section Tracking
    let activeId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (currentScrollY >= sectionTop && currentScrollY < sectionTop + sectionHeight) {
        activeId = section.getAttribute('id');
      }
    });

    if (activeId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${activeId}`) {
          link.classList.add('active');
        }
      });
    }

    // Timeline Line Progress Drawing
    updateTimelineProgress();
  }, { passive: true });

  // ---------------------------------------------------------------------------
  // 4. TIMELINE CONNECTOR LINE PROGRESS DRAWING
  // ---------------------------------------------------------------------------
  const timelineWrapper = document.getElementById('timelineWrapper');
  const timelineProgress = document.getElementById('timelineProgress');

  function updateTimelineProgress() {
    if (!timelineWrapper || !timelineProgress) return;

    const rect = timelineWrapper.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top <= windowHeight * 0.75 && rect.bottom >= 0) {
      const totalHeight = rect.height;
      const scrolledPast = (windowHeight * 0.75) - rect.top;
      const percentage = Math.min(Math.max((scrolledPast / totalHeight) * 100, 0), 100);
      timelineProgress.style.height = `${percentage}%`;
    } else if (rect.top > windowHeight * 0.75) {
      timelineProgress.style.height = '0%';
    } else if (rect.bottom < 0) {
      timelineProgress.style.height = '100%';
    }
  }

  // ---------------------------------------------------------------------------
  // 5. SCROLL REVEALS (IntersectionObserver)
  // ---------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.scroll-reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Once revealed, keep in view
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ---------------------------------------------------------------------------
  // 6. 3D PROJECT CARDS TILT EFFECT ON HOVER
  // ---------------------------------------------------------------------------
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = -((y - centerY) / centerY) * 7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      // Set CSS variables for the specular glare gradient
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${percentX}%`);
      card.style.setProperty('--mouse-y', `${percentY}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  // ---------------------------------------------------------------------------
  // 7. SKILLS CATEGORY FILTERING TABS
  // ---------------------------------------------------------------------------
  const skillTabs = document.querySelectorAll('.skill-tab');
  const skillCards = document.querySelectorAll('.skill-badge-card');

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Toggle active tab class
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 8. CUSTOM DESKTOP CURSOR GLOW & LERP
  // ---------------------------------------------------------------------------
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
    let mousePos = { x: -100, y: -100 };
    let ringPos = { x: -100, y: -100 };

    window.addEventListener('mousemove', (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;

      cursorDot.style.left = `${mousePos.x}px`;
      cursorDot.style.top = `${mousePos.y}px`;
    }, { passive: true });

    function renderCursor() {
      // Smooth lerp for ring follower
      ringPos.x += (mousePos.x - ringPos.x) * 0.18;
      ringPos.y += (mousePos.y - ringPos.y) * 0.18;

      cursorRing.style.left = `${ringPos.x}px`;
      cursorRing.style.top = `${ringPos.y}px`;

      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Expand cursor ring on clickable elements
    const hoverTargets = document.querySelectorAll('a, button, [data-tilt], .skill-tab, .social-pill');
    hoverTargets.forEach(target => {
      target.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-hover'));
      target.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-hover'));
    });
  }

  // ---------------------------------------------------------------------------
  // 9. COPY TO CLIPBOARD & TOAST NOTIFICATION
  // ---------------------------------------------------------------------------
  const copyButtons = document.querySelectorAll('[data-copy], #copyEmailBtn');
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimeout;

  function showToast(text) {
    if (!toastNotification || !toastMessage) return;
    toastMessage.textContent = text;
    toastNotification.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2800);
  }

  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy') || btn.getAttribute('data-email') || 'mohakmehta.2005@gmail.com';

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied "${textToCopy}" to clipboard!`);
        }).catch(() => {
          showToast(`Copied: ${textToCopy}`);
        });
      } else {
        showToast(`Copied: ${textToCopy}`);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 10. MOBILE MENU TOGGLE
  // ---------------------------------------------------------------------------
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (menuToggleBtn && mobileDrawer) {
    menuToggleBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      menuToggleBtn.setAttribute('aria-expanded', isOpen);
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        menuToggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

})();
