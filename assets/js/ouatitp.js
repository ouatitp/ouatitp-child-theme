(function () {
  let uiInitialized = false;
  let workSceneBound = false;

  function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

  function initCustomUI() {
    if (uiInitialized) return true;

    const nav = document.querySelector('.oua-nav');
    const toggle = document.querySelector('.oua-nav__toggle');
    const panel = document.querySelector('.oua-nav__panel');
    const links = document.querySelectorAll('.oua-nav__panel a');
    const cursor = document.querySelector('.oua-cursor');

    if (!nav || !toggle || !panel) return false;

    uiInitialized = true;

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

      const isOpen = nav.classList.contains('is-open');
      nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });

    links.forEach(function (link) {
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

      targets.forEach(function (target) {
        target.addEventListener('mouseenter', function () {
          cursor.classList.add('is-hover');
        });

        target.addEventListener('mouseleave', function () {
          cursor.classList.remove('is-hover');
        });
      });
    }

    return true;
  }

  function initWorkScene() {
  const workSection = document.querySelector('.oua-work');
  const workIntro = document.querySelector('.oua-work__intro');
  const workIntroInner = document.querySelector('.oua-work__intro-inner') || workIntro;
  const gallery = document.querySelector('.oua-work__gallery');
  const workItems = document.querySelectorAll('.oua-work__item');

  if (!workSection || !workIntro || !gallery || !workItems.length) {
    return false;
  }

  function isDesktop() {
    return window.matchMedia('(min-width: 1025px)').matches;
  }

  function resetWorkScene() {
    workIntro.style.opacity = '';
    workIntroInner.style.transform = '';

    workItems.forEach(function (item) {
      item.style.transform = '';
    });
  }

  function updateWorkScene() {
    if (!isDesktop()) {
      resetWorkScene();
      return;
    }

    const galleryRect = gallery.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const travel = Math.max(gallery.offsetHeight - viewportH, 1);

    const scrolled = Math.max(0, Math.min(-galleryRect.top, travel));
    const progress = scrolled / travel;

    /* intro fades + scales down */
    const introOpacity = 1 - progress * 1;
    const introScale = 1 - progress * 0.44;
    const introY = progress * -200

    workIntro.style.opacity = introOpacity.toFixed(3);
    workIntroInner.style.transform = `translateY(${introY.toFixed(2)}px) scale(${introScale.toFixed(3)})`;

    /* floating images drift upward */
    workItems.forEach(function (item) {
      let speedY = 0;
      let speedX = 0;

      if (item.classList.contains('oua-work__item--01')) {
        speedY = -28;
        speedX = 5;
      }

      if (item.classList.contains('oua-work__item--02')) {
        speedY = -40;
        speedX = -5;
      }

      if (item.classList.contains('oua-work__item--03')) {
        speedY = -18;
        speedX = 8;
      }

      if (item.classList.contains('oua-work__item--04')) {
        speedY = -32;
        speedX = -7;
      }

      if (item.classList.contains('oua-work__item--05')) {
        speedY = -22;
        speedX = 5;
      }

      if (item.classList.contains('oua-work__item--06')) {
        speedY = -26;
        speedX = -4;
      }

      const x = progress * speedX;
      const y = progress * speedY;

      item.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }

  if (!workSceneBound) {
    window.addEventListener('scroll', updateWorkScene, { passive: true });
    window.addEventListener('resize', updateWorkScene);
    workSceneBound = true;
  }

  updateWorkScene();
  return true;
}

function initHeroScene() {
  const heroSection = document.querySelector('.oua-hero');
  const heroContent = document.querySelector('.oua-hero__content');
  const heroContentInner = document.querySelector('.oua-hero__content-inner') || heroContent;
  const heroArt = document.querySelector('.oua-hero__art');
  const heroArtInner = document.querySelector('.oua-hero__art-inner');

  if (!heroSection || !heroContent || !heroArt || !heroArtInner) {
    return false;
  }

  function isDesktop() {
    return window.matchMedia('(min-width: 1025px)').matches;
  }

  function resetHeroScene() {
    heroContentInner.style.opacity = '';
    heroContentInner.style.transform = '';
    heroArtInner.style.opacity = '';
    heroArtInner.style.transform = '';
    heroArtInner.style.filter = '';
  }

  function renderHeroScene() {
    if (!isDesktop()) {
      resetHeroScene();
      return;
    }

    const rect = heroSection.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const travel = Math.max(heroSection.offsetHeight - viewportH * 0.55, 1);

    const scrolled = Math.max(0, Math.min(-rect.top, travel));
    const rawProgress = scrolled / travel;
    const progress = easeOutCubic(rawProgress);

    /* tekst */
    const contentOpacity = 1 - progress * 1;
    const contentScale = 1 - progress * 0;
    const contentY = progress * -400;

    heroContentInner.style.opacity = contentOpacity.toFixed(3);
    heroContentInner.style.transform =
      `translateY(${contentY.toFixed(2)}px) scale(${contentScale.toFixed(3)})`;

    /* ilustracja */
    const artBaseX = -90;
    const artBaseY = 110;
    
    const artScale = 1.33 + progress * 2;
    const artX = artBaseX + progress * -600;
    const artY = artBaseY + progress * 800;
    const artOpacity = 1 - progress * 0.88;
    const artBlur = progress * 11;

    heroArtInner.style.transform =
      `translate3d(${artX.toFixed(2)}px, ${artY.toFixed(2)}px, 0) scale(${artScale.toFixed(3)})`;
    heroArtInner.style.opacity = Math.max(0, artOpacity).toFixed(3);
    heroArtInner.style.filter = `blur(${artBlur.toFixed(2)}px)`;
  }

  function updateHeroScene() {
    requestAnimationFrame(renderHeroScene);
  }

  if (!window.heroSceneBound) {
    window.addEventListener('scroll', updateHeroScene, { passive: true });
    window.addEventListener('resize', updateHeroScene);
    window.heroSceneBound = true;
  }

  updateHeroScene();
  return true;
}

  function boot() {
    initCustomUI();
    initHeroScene();
    initWorkScene();

    let tries = 0;
    const maxTries = 40;

    const retry = setInterval(function () {
      tries += 1;

      const uiReady = initCustomUI();
      const heroReady = initHeroScene();
      const workReady = initWorkScene();

      if ((uiReady && heroReady && workReady) || tries >= maxTries) {
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