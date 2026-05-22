(function () {
  let uiInitialized = false;

  function initCustomUI() {
    if (uiInitialized) return;

    const nav = document.querySelector('.oua-nav');
    const toggle = document.querySelector('.oua-nav__toggle');
    const panel = document.querySelector('.oua-nav__panel');
    const links = document.querySelectorAll('.oua-nav__panel a');
    const cursor = document.querySelector('.oua-cursor');

    if (!nav || !toggle || !panel) return;

    uiInitialized = true;

    /* -------------------------
       NAV
    ------------------------- */
    document.body.classList.add('ui-ready');

    function closeNav() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.blur();
    }

    function updateScrolledState() {
      if (window.scrollY > 24) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }
    }

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      nav.classList.toggle('is-open');
      toggle.setAttribute(
        'aria-expanded',
        nav.classList.contains('is-open') ? 'true' : 'false'
      );
    });

    links.forEach(link => {
      link.addEventListener('click', function () {
        closeNav();
      });
    });

    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) {
        closeNav();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeNav();
      }
    });

    window.addEventListener('scroll', updateScrolledState, { passive: true });
    updateScrolledState();

    /* -------------------------
       CURSOR
    ------------------------- */
    if (cursor && window.matchMedia('(min-width: 769px)').matches) {
      let cursorReady = false;
      const targets = document.querySelectorAll('a, button, .wp-block-button__link');

      document.addEventListener('mousemove', function (e) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        if (!cursorReady) {
          cursor.classList.add('is-ready');
          document.body.classList.add('has-custom-cursor');
          cursorReady = true;
        }
      });

      targets.forEach(target => {
        target.addEventListener('mouseenter', function () {
          cursor.classList.add('is-hover');
        });

        target.addEventListener('mouseleave', function () {
          cursor.classList.remove('is-hover');
        });
      });
    }
  }

  function boot() {
    if (initCustomUI()) return;

    let tries = 0;
    const maxTries = 40;
    const retry = setInterval(function () {
      tries += 1;
      initCustomUI();

      if (uiInitialized || tries >= maxTries) {
        clearInterval(retry);
      }
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();