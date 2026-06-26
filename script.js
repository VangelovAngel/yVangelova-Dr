(function () {
  'use strict';

  /* ── HEADER SCROLL SHADOW ── */
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── MOBILE MENU ── */
  const toggle = document.querySelector('.menu-toggle');
  const nav    = document.getElementById('main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close when a nav link is clicked
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!header.contains(e.target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── ACTIVE NAV HIGHLIGHT ON SCROLL ── */
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  if (navLinks.length && sections.length) {
    const highlightNav = () => {
      let current = '';
      sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 120) {
          current = section.id;
        }
      });
      navLinks.forEach(link => {
        link.classList.toggle(
          'nav-active',
          link.getAttribute('href') === `#${current}`
        );
      });
    };
    window.addEventListener('scroll', highlightNav, { passive: true });
  }

  /* ── SCROLL REVEAL ── */
  const revealEls = document.querySelectorAll(
    '.qual-card, .aes-card, .congress-card, .cert-card, ' +
    '.mem-org-card, .timeline-item, .contact-item, .about-card-stat'
  );

  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    if (i % 3 === 1) el.classList.add('reveal-delay-1');
    if (i % 3 === 2) el.classList.add('reveal-delay-2');
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── SERVICES ACCORDION ── */
  document.querySelectorAll('.service-item').forEach(item => {
    const btn = item.querySelector('.service-toggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });

  /* ── AUTO-OPEN SERVICE BY URL HASH ── */
  function openServiceByHash() {
    const id = window.location.hash ? window.location.hash.slice(1) : '';
    if (!id) return;
    const item = document.getElementById(id);
    if (!item || !item.classList.contains('service-item')) return;

    item.classList.add('open');
    const btn = item.querySelector('.service-toggle');
    if (btn) btn.setAttribute('aria-expanded', 'true');

    // Flash ring
    item.style.outline = '2px solid rgba(201,151,58,0.4)';
    item.style.outlineOffset = '2px';
    setTimeout(() => {
      item.style.outline = '';
      item.style.outlineOffset = '';
    }, 1200);
  }

  window.addEventListener('hashchange', openServiceByHash);
  window.addEventListener('load', openServiceByHash);

  /* ── SMOOTH SCROLL for same-page anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', href);
        openServiceByHash();
      }
    });
  });

  /* ── IRIS CANVAS ANIMATION ── */
  const canvas = document.getElementById('irisCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, raf, t = 0;

    const resize = () => {
      const size = canvas.offsetWidth;
      canvas.width  = size * window.devicePixelRatio;
      canvas.height = size * window.devicePixelRatio;
      W = canvas.width;
      H = canvas.height;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const draw = () => {
      const w = W / window.devicePixelRatio;
      const h = H / window.devicePixelRatio;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);
      t += 0.004;

      const maxR = w * 0.48;
      const numRings = 14;

      for (let i = numRings; i >= 1; i--) {
        const frac = i / numRings;
        const r = maxR * frac;
        const pulse = 1 + 0.015 * Math.sin(t * 2 + i * 0.6);
        const alpha = 0.08 + 0.18 * (1 - frac);
        const lineWidth = 0.5 + frac * 1.5;

        ctx.beginPath();
        ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201,151,58,${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }

      // Radial spokes (iris fibres)
      const numSpokes = 24;
      for (let i = 0; i < numSpokes; i++) {
        const angle = (i / numSpokes) * Math.PI * 2 + t * 0.3;
        const innerR = maxR * 0.16;
        const outerR = maxR * (0.7 + 0.1 * Math.sin(t + i));
        const alpha  = 0.04 + 0.06 * Math.abs(Math.sin(t * 0.7 + i * 0.4));

        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
        ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
        ctx.strokeStyle = `rgba(201,151,58,${alpha})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }

      // Pupil
      const pupilR = maxR * 0.16;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pupilR);
      grad.addColorStop(0, 'rgba(10,22,40,0.9)');
      grad.addColorStop(1, 'rgba(10,22,40,0.0)');
      ctx.beginPath();
      ctx.arc(cx, cy, pupilR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Pupil ring
      ctx.beginPath();
      ctx.arc(cx, cy, pupilR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(201,151,58,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
  }

})();
