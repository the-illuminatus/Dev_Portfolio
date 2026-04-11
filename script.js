document.addEventListener('DOMContentLoaded', function () {

  /* ──────────────────────────────────────────────
     1. HAMBURGER MENU
  ────────────────────────────────────────────── */
  const hamburgerMenu      = document.querySelector('.hamburger-menu');
  const navLinksContainer  = document.querySelector('#desktop-nav .nav-links-container');

  hamburgerMenu.addEventListener('click', function () {
    hamburgerMenu.classList.toggle('active');
    navLinksContainer.classList.toggle('active');
  });

  // Close mobile menu when clicking a nav link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function () {
      hamburgerMenu.classList.remove('active');
      navLinksContainer.classList.remove('active');
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', function (e) {
    if (
      !hamburgerMenu.contains(e.target) &&
      !navLinksContainer.contains(e.target)
    ) {
      hamburgerMenu.classList.remove('active');
      navLinksContainer.classList.remove('active');
    }
  });

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

    function typeChar() {
      const currentText = fullName.substring(0, charIndex);
      typewriterEl.textContent = currentText;

      let delay = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && charIndex === fullName.length) {
        delay = pauseEnd;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        delay = pauseStart;
      }

      if (isDeleting) charIndex--;
      else charIndex++;

      setTimeout(typeChar, delay);
    }

    setTimeout(typeChar, startDelay);
  }
  /* ── Dynamic Typewriter for Section Titles ────── */
  const sectionTitles = document.querySelectorAll('h1.title');
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
    
    // Reconstruct with span and exact styling
    const textSpan = document.createElement('span');
    textSpan.className = 'dynamic-text';
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'typewriter-cursor';
    
    title.appendChild(textSpan);
    title.appendChild(cursorSpan);
    
    titleObserver.observe(title);
  });

});