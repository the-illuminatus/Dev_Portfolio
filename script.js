document.addEventListener('DOMContentLoaded', function () {

  /* ══════════════════════════════════════════════
     TEMPORARY DIAGNOSTIC LOGGING — Hero animation runtime trace
     Remove once the mobile-vs-desktop divergence is identified.
  ══════════════════════════════════════════════ */
  const __heroT0 = performance.now();
  function heroLog(label, data) {
    const t = (performance.now() - __heroT0).toFixed(0);
    console.log('[HeroAnim +' + t + 'ms] ' + label, data !== undefined ? data : '');
  }
  heroLog('DOMContentLoaded fired', {
    readyState: document.readyState,
    viewportWidth: window.innerWidth,
    devicePixelRatio: window.devicePixelRatio
  });

  window.addEventListener('load', function () {
    heroLog('window.load fired', {
      fontsStatus: document.fonts ? document.fonts.status : 'Font Loading API unsupported',
      viewportWidth: window.innerWidth
    });
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      heroLog('document.fonts.ready resolved', { fontsStatus: document.fonts.status });
    });
  } else {
    heroLog('Font Loading API (document.fonts) unsupported on this browser');
  }

  /* ──────────────────────────────────────────────
     1. HAMBURGER MENU
  ────────────────────────────────────────────── */
  const hamburgerMenu      = document.querySelector('.hamburger-menu');
  const navLinksContainer  = document.querySelector('#desktop-nav .nav-links-container');

  function setMenuOpen(isOpen) {
    hamburgerMenu.classList.toggle('active', isOpen);
    navLinksContainer.classList.toggle('active', isOpen);
    hamburgerMenu.setAttribute('aria-expanded', String(isOpen));
  }

  hamburgerMenu.addEventListener('click', function () {
    setMenuOpen(!hamburgerMenu.classList.contains('active'));
  });

  // Close mobile menu when clicking a nav link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function () {
      setMenuOpen(false);
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', function (e) {
    if (
      !hamburgerMenu.contains(e.target) &&
      !navLinksContainer.contains(e.target)
    ) {
      setMenuOpen(false);
    }
  });

  // Close mobile menu gracefully when user scrolls down
  window.addEventListener('scroll', function () {
    if (hamburgerMenu.classList.contains('active')) {
      setMenuOpen(false);
    }
  }, { passive: true });

  /* ──────────────────────────────────────────────
     2. SMOOTH SCROLL for nav links
  ────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const target   = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = document.querySelector('nav').offsetHeight;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ──────────────────────────────────────────────
     3. STICKY NAV — add .scrolled class on scroll
  ────────────────────────────────────────────── */
  const nav = document.querySelector('nav');

  function handleNavScroll() {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run on load

  /* ──────────────────────────────────────────────
     4. ACTIVE NAV LINK on scroll (IntersectionObserver)
  ────────────────────────────────────────────── */
  const navLinks = document.querySelectorAll('#desktop-nav .nav-links a');
  const sections = document.querySelectorAll('section[id]');

  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.remove('active'));
          const activeLink = document.querySelector(
            `#desktop-nav .nav-links a[href="#${entry.target.id}"]`
          );
          if (activeLink) activeLink.classList.add('active');
        }
      });
    },
    {
      root: null,
      rootMargin: `-${nav.offsetHeight}px 0px -55% 0px`,
      threshold: 0,
    }
  );

  sections.forEach(section => sectionObserver.observe(section));

  /* ──────────────────────────────────────────────
     5. SCROLL-REVEAL with stagger
  ────────────────────────────────────────────── */
  const revealTargets = [
    ...document.querySelectorAll('section'),
    ...document.querySelectorAll('.details-container'),
    ...document.querySelectorAll('.color-container'),
    ...document.querySelectorAll('.text-container'),
    ...document.querySelectorAll('.contact-info-container'),
  ];

  // Deduplicate (in case sections contain cards)
  const seen = new Set();
  const uniqueTargets = revealTargets.filter(el => {
    if (seen.has(el)) return false;
    seen.add(el);
    return true;
  });

  uniqueTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger children of a parent group
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, Number(delay));
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  // Add staggered delays to card groups
  document.querySelectorAll('.about-containers').forEach(group => {
    Array.from(group.children).forEach((child, idx) => {
      child.dataset.delay = idx * 80;
    });
  });

  uniqueTargets.forEach(el => revealObserver.observe(el));

  /* ──────────────────────────────────────────────
     6. PROFILE SECTION — hero entrance + typewriter
  ────────────────────────────────────────────── */
  const heroImg  = document.querySelector('.section__pic-container');
  const heroText = document.querySelector('.section__text');

  [heroImg, heroText].forEach((el, i) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = i === 0 ? 'translateX(-30px)' : 'translateX(30px)';
    el.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }, 150 + i * 150);
  });

  /* ── Typewriter effect ──────────────────────── */
  const typewriterEl = document.getElementById('typewriter-text');
  if (typewriterEl) {
    const fullName = 'Sujit Bhalekar';
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 150;      // slower typing
    const deletingSpeed = 75;     // faster backspacing
    const pauseEnd = 2000;        // wait 2s before deleting
    const pauseStart = 500;       // wait 0.5s before typing again
    const startDelay = 600;       // initial wait for hero fade-in

    // Lock the wrapper's width to the fully-typed name so text-align: center
    // (active on mobile) never has to reposition mid-animation, and keep the
    // absolutely-positioned cursor glued to the end of the currently-typed
    // text. Width is measured via the real DOM layout (briefly setting the
    // full name and reading getBoundingClientRect, then restoring — a single
    // synchronous swap, so nothing is ever painted mid-measurement) rather
    // than an off-screen canvas: canvas text metrics and true browser text
    // layout don't always agree pixel-for-pixel, and any such discrepancy
    // becomes visible the moment text-align: center centers the wrapper box
    // around a width that doesn't exactly match the real rendered text. No
    // hidden/duplicate text is added to the DOM, and the cursor never
    // contributes to the wrapper's own width/centering since it's out of
    // normal flow.
    const heroTypewriterEl = typewriterEl.closest('.hero-typewriter');
    const cursorEl = heroTypewriterEl ? heroTypewriterEl.querySelector('.typewriter-cursor') : null;

    heroLog('Hero typewriter setup start', {
      heroTypewriterElFound: !!heroTypewriterEl,
      cursorElFound: !!cursorEl,
      rect: typewriterEl.closest('.title') ? typewriterEl.closest('.title').getBoundingClientRect() : null
    });

    function measureFullNameWidth() {
      const original = typewriterEl.textContent;
      typewriterEl.textContent = fullName;
      const width = typewriterEl.getBoundingClientRect().width;
      typewriterEl.textContent = original;
      heroLog('measureFullNameWidth() (DOM layout, not canvas)', { width: width });
      return width;
    }

    function positionCursor() {
      if (!cursorEl) return;
      const left = Math.ceil(typewriterEl.getBoundingClientRect().width);
      cursorEl.style.left = left + 'px';
      heroLog('positionCursor()', { currentText: typewriterEl.textContent, left: left });
    }

    function lockHeroNameWidth(source) {
      if (!heroTypewriterEl) return;
      const minWidth = Math.ceil(measureFullNameWidth());
      heroTypewriterEl.style.minWidth = minWidth + 'px';
      heroLog('lockHeroNameWidth() called', {
        source: source || 'initial',
        minWidth: minWidth,
        viewportWidth: window.innerWidth,
        charIndexAtCallTime: charIndex
      });
      positionCursor();
    }

    lockHeroNameWidth('initial-setup');
    window.addEventListener('resize', function () {
      heroLog('window resize event fired', {
        newViewportWidth: window.innerWidth,
        newViewportHeight: window.innerHeight,
        scrollY: window.scrollY
      });
      lockHeroNameWidth('resize-event');
    }, { passive: true });

    heroLog('Typewriter scheduled to start', { startDelay: startDelay });

    function typeChar() {
      const scheduledAt = performance.now();
      const currentText = fullName.substring(0, charIndex);
      typewriterEl.textContent = currentText;
      positionCursor();

      if (!isDeleting && charIndex === 1) {
        heroLog('FIRST character typed', { currentText: currentText });
      }

      let delay = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && charIndex === fullName.length) {
        heroLog('LAST character typed -> pause start (full name held)', { pauseMs: pauseEnd });
        delay = pauseEnd;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        heroLog('Delete complete -> pause start (empty) -> loop will restart', { pauseMs: pauseStart });
        isDeleting = false;
        delay = pauseStart;
      }

      if (isDeleting) charIndex--;
      else charIndex++;

      setTimeout(function () {
        const actualElapsed = performance.now() - scheduledAt;
        if (Math.abs(actualElapsed - delay) > 50) {
          heroLog('TIMER DRIFT DETECTED', { scheduledDelay: delay, actualElapsed: actualElapsed.toFixed(1) });
        }
        typeChar();
      }, delay);
    }

    setTimeout(typeChar, startDelay);
  }
  /* ── Dynamic Typewriter for Section Titles & Logo ────── */
  const sectionTitles = document.querySelectorAll('.title, .logo');
  const titleObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const titleEl = entry.target;
        const fullText = titleEl.dataset.originalText;
        if (!fullText) return;
        
        let charIdx = 0;
        let isDeleting = false;
        const textSpan = titleEl.querySelector('.dynamic-text');
        
        function typeNext() {
          const currentText = fullText.substring(0, charIdx);
          textSpan.textContent = currentText;
          
          let delay = isDeleting ? 75 : 150; // Slower typing speed
          
          if (!isDeleting && charIdx === fullText.length) {
            delay = 2000; // Pause at the end before clearing
            isDeleting = true;
          } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            delay = 500; // Pause at start before re-typing
          }
          
          if (isDeleting) charIdx--;
          else charIdx++;
          
          setTimeout(typeNext, delay);
        }
        
        setTimeout(typeNext, 300); // Wait a tiny bit when scrolled into view
        observer.unobserve(titleEl); 
      }
    });
  }, { threshold: 0.8, rootMargin: "0px 0px -50px 0px" });

  sectionTitles.forEach(title => {
    // Skip if it contains spans already (like the hero name)
    if (title.querySelector('span')) return;
    
    // Store original text
    const text = title.textContent.trim();
    if (!text) return;
    
    title.dataset.originalText = text;
    title.textContent = '';

    // Real text stays in the DOM for screen readers; the animated chars are decorative
    const srSpan = document.createElement('span');
    srSpan.className = 'sr-only';
    srSpan.textContent = text;

    // Reconstruct with span and exact styling
    const textSpan = document.createElement('span');
    textSpan.className = 'dynamic-text';
    textSpan.setAttribute('aria-hidden', 'true');
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'typewriter-cursor';
    cursorSpan.setAttribute('aria-hidden', 'true');

    title.appendChild(srSpan);
    title.appendChild(textSpan);
    title.appendChild(cursorSpan);

    titleObserver.observe(title);
  });

  /* ──────────────────────────────────────────────
     7. PANEL ACCORDION (Explore Project + nested sub-sections)
     setTriggerPanelOpen is the one shared primitive for any
     trigger+panel pair wired via aria-controls. Project-level
     "Explore Project" layers card-level state (grid span,
     one-open-per-section) on top of it; nested sub-toggles like
     "System Architecture" call it directly with no extra logic —
     same mechanism, same transitions, same chevron, no duplicate
     accordion implementation.
  ────────────────────────────────────────────── */
  function setTriggerPanelOpen(trigger, isOpen) {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    trigger.setAttribute('aria-expanded', String(isOpen));
    panel.classList.toggle('is-open', isOpen);
    panel.setAttribute('aria-hidden', String(!isOpen));
  }

  function openProjectCard(card) {
    card.classList.add('is-open');
    setTriggerPanelOpen(card.querySelector('.project-card__expand-btn'), true);
  }

  function closeProjectCard(card) {
    card.classList.remove('is-open');
    setTriggerPanelOpen(card.querySelector('.project-card__expand-btn'), false);
  }

  document.querySelectorAll('.project-card__expand-btn').forEach(trigger => {
    trigger.addEventListener('click', function () {
      const card = trigger.closest('.project-card');
      const group = card.closest('.about-containers');
      const wasOpen = card.classList.contains('is-open');

      // Accordion: only one case study open per section at a time
      if (group) {
        group.querySelectorAll('.project-card.is-open').forEach(openCard => {
          if (openCard !== card) closeProjectCard(openCard);
        });
      }

      wasOpen ? closeProjectCard(card) : openProjectCard(card);
    });
  });

  document.querySelectorAll('.project-card__collapse-btn').forEach(closeBtn => {
    closeBtn.addEventListener('click', function () {
      const card = closeBtn.closest('.project-card');
      closeProjectCard(card);
      // Bring the collapsed card back into view for anyone scrolled deep into the case study
      const offset = nav.offsetHeight;
      const top = card.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Nested sub-section toggles (e.g. "System Architecture") — standalone,
  // not part of the card-level accordion group, but same open/close primitive
  document.querySelectorAll('.project-card__subtoggle').forEach(trigger => {
    trigger.addEventListener('click', function () {
      setTriggerPanelOpen(trigger, trigger.getAttribute('aria-expanded') !== 'true');
    });
  });

  // Certifications (#achievement): only relevant at the mobile breakpoint,
  // where CSS switches the cards into a compact accordion — desktop keeps
  // every card fully expanded regardless of this state. Same shared
  // setTriggerPanelOpen primitive as above, plus one-open-per-section
  // accordion behavior mirroring the Projects card-level accordion.
  document.querySelectorAll('.achievement-card__toggle').forEach(trigger => {
    trigger.addEventListener('click', function () {
      const group = trigger.closest('.about-containers');
      const wasOpen = trigger.getAttribute('aria-expanded') === 'true';

      if (group) {
        group.querySelectorAll('.achievement-card__toggle[aria-expanded="true"]').forEach(openTrigger => {
          if (openTrigger !== trigger) setTriggerPanelOpen(openTrigger, false);
        });
      }

      setTriggerPanelOpen(trigger, !wasOpen);
    });
  });

});