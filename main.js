/* Dawat Restaurant — mobile menu, counters, reveal, lightbox, nav highlight */
(function () {
  'use strict';

  /* ---- mobile menu (instant toggle, no transition) ---- */
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.hidden;
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  /* ---- animated counters (verified numbers only) ---- */
  var counters = document.querySelectorAll('.count');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (reduced) { el.textContent = target.toFixed(decimals); return; }
    var start = null, dur = 1200;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var val = target * (1 - Math.pow(1 - p, 3));
      el.textContent = val.toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    /* guarantee the final value even if rAF stalls (e.g. virtual-time screenshots) */
    setTimeout(function () { el.textContent = target.toFixed(decimals); }, dur + 100);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---- (scroll-reveal intentionally not used: sections must be visible
     in load-time screenshots; content is never hidden by JS) ---- */

  /* ---- active nav link ---- */
  var navLinks = document.querySelectorAll('.desktop-nav a');
  var sections = ['trout', 'menu', 'river', 'rooftop', 'gatherings', 'visit']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* ---- lightbox gallery ---- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightboxImg');
  var lbCap = document.getElementById('lightboxCaption');
  var lastFocus = null;
  function openLightbox(btn) {
    lastFocus = document.activeElement;
    lbImg.src = btn.getAttribute('data-full');
    lbImg.alt = btn.querySelector('img').alt;
    lbCap.textContent = btn.getAttribute('data-caption') || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('[data-lightbox-close]').focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll('.gallery-tile').forEach(function (btn) {
    btn.addEventListener('click', function () { openLightbox(btn); });
  });
  lightbox.querySelector('[data-lightbox-close]').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
})();
