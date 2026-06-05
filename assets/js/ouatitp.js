(function () {
  'use strict';

  const state = {
    ui: false,
    cursor: false,
    sectionScroll: false,
    heroScene: false,
    workScene: false,
    processReveal: false,
    lightbox: false
  };

  const SELECTOR_INTERACTIVE = [
    'a',
    'button',
    '.wp-block-button__link',
    '.oua-work__item',
    '.oua-lightbox__close',
    '.oua-lightbox__nav'
  ].join(',');

  function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function isDesktopScene() {
    return window.matchMedia('(min-width: 1200px)').matches;
  }

  function isTablet() {
    return window.matchMedia('(min-width: 681px) and (max-width: 1024px)').matches;
  }

  function isMobile() {
    return window.matchMedia('(max-width: 680px)').matches;
  }

  function getNavHeight() {
    const nav = document.querySelector('.oua-nav');
    return nav ? nav.offsetHeight : 0;
  }

  function getScrollOffset(target) {
    const navHeight = getNavHeight();
    const targetId = target && target.id ? target.id : '';

    if (isMobile()) {
      const offsets = {
        work: 52,
        process: 52,
        about: 52,
        contact: 52,
        top: 0
      };

      return Object.prototype.hasOwnProperty.call(offsets, targetId)
        ? offsets[targetId]
        : 52;
    }

    if (isTablet()) {
      const offsets = {
        /* Lower value means the target lands closer to the top.
           This keeps Work from showing the tail of the Hero illustration. */
        work: 12,
        process: Math.max(82, navHeight + 20),
        about: Math.max(82, navHeight + 20),
        contact: Math.max(82, navHeight + 20),
        top: 0
      };

      return Object.prototype.hasOwnProperty.call(offsets, targetId)
        ? offsets[targetId]
        : Math.max(82, navHeight + 20);
    }

    return Math.max(88, navHeight + 24);
  }

  function animateScrollTo(targetY, duration) {
    const startY = window.scrollY || window.pageYOffset;
    const distance = targetY - startY;
    const startTime = window.performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  /* =========================
     NAV + CUSTOM CURSOR
  ========================= */
  function initCustomUI() {
    const nav = document.querySelector('.oua-nav');
    const toggle = document.querySelector('.oua-nav__toggle');
    const panel = document.querySelector('.oua-nav__panel');

    if (!nav || !toggle || !panel) return false;
    if (state.ui) return true;

    state.ui = true;
    document.body.classList.add('ui-ready');

    function closeNav() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.blur();
    }

    function updateScrolledState() {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
    }

    toggle.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();

      const isOpen = nav.classList.contains('is-open');
      nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });

    document.addEventListener('click', function (event) {
      if (!nav.contains(event.target)) {
        closeNav();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeNav();
      }
    });

    nav.addEventListener('click', function (event) {
      const link = event.target.closest('.oua-nav__panel a');
      if (link) closeNav();
    });

    window.addEventListener('scroll', updateScrolledState, { passive: true });
    updateScrolledState();

    initCustomCursor();

    return true;
  }

  function initCustomCursor() {
    const cursor = document.querySelector('.oua-cursor');

    if (!cursor || state.cursor || !window.matchMedia('(min-width: 769px)').matches) {
      return false;
    }

    state.cursor = true;

    let cursorReady = false;

    document.addEventListener('mousemove', function (event) {
      cursor.style.left = event.clientX + 'px';
      cursor.style.top = event.clientY + 'px';

      if (!cursorReady) {
        cursor.classList.add('is-ready');
        document.body.classList.add('has-custom-cursor');
        cursorReady = true;
      }
    });

    document.addEventListener('mouseover', function (event) {
      if (event.target.closest(SELECTOR_INTERACTIVE)) {
        cursor.classList.add('is-hover');
      }
    });

    document.addEventListener('mouseout', function (event) {
      if (
        !event.relatedTarget ||
        !event.relatedTarget.closest ||
        !event.relatedTarget.closest(SELECTOR_INTERACTIVE)
      ) {
        cursor.classList.remove('is-hover');
      }
    });

    return true;
  }

  /* =========================
     SMOOTH SECTION SCROLL
  ========================= */
  function initSectionScroll() {
    if (state.sectionScroll) return true;

    state.sectionScroll = true;

    document.addEventListener('click', function (event) {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      let target;

      try {
        target = document.querySelector(href);
      } catch (error) {
        return;
      }

      if (!target) return;

      event.preventDefault();

      const offset = getScrollOffset(target);
      const targetY = target.getBoundingClientRect().top + window.scrollY - offset;

      animateScrollTo(targetY, 1100);
    });

    return true;
  }

  /* =========================
     HERO SCENE
  ========================= */
  function initHeroScene() {
    const heroSection = document.querySelector('.oua-hero');
    const heroContent = document.querySelector('.oua-hero__content');
    const heroContentInner = document.querySelector('.oua-hero__content-inner') || heroContent;
    const heroArtInner = document.querySelector('.oua-hero__art-inner');

    if (!heroSection || !heroContent || !heroContentInner || !heroArtInner) {
      return false;
    }

    function resetHeroScene() {
      heroContentInner.style.opacity = '1';
      heroContentInner.style.transform = 'none';
      heroArtInner.style.opacity = '1';
      heroArtInner.style.transform = 'none';
      heroArtInner.style.filter = 'none';
    }

    function renderHeroScene() {
      if (!isDesktopScene()) {
        resetHeroScene();
        return;
      }

      const rect = heroSection.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const travel = Math.max(heroSection.offsetHeight - viewportH * 0.55, 1);
      const scrolled = clamp(-rect.top, 0, travel);
      const progress = easeOutCubic(scrolled / travel);

      const contentOpacity = 1 - progress;
      const contentY = progress * -400;

      heroContentInner.style.opacity = contentOpacity.toFixed(3);
      heroContentInner.style.transform =
        'translate3d(0, ' + contentY.toFixed(2) + 'px, 0) scale(1)';

      /* Illustration intentionally stays static on desktop now. */
      heroArtInner.style.opacity = '1';
      heroArtInner.style.transform = 'translate3d(-90px, 90px, 0) scale(1.33)';
      heroArtInner.style.filter = 'none';
    }

    let ticking = false;

    function updateHeroScene() {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(function () {
        renderHeroScene();
        ticking = false;
      });
    }

    if (!state.heroScene) {
      state.heroScene = true;
      window.addEventListener('scroll', updateHeroScene, { passive: true });
      window.addEventListener('resize', updateHeroScene);
    }

    updateHeroScene();

    return true;
  }

  /* =========================
     WORK SCENE
  ========================= */
  function initWorkScene() {
    const workIntro = document.querySelector('.oua-work__intro');
    const workIntroInner = document.querySelector('.oua-work__intro-inner') || workIntro;
    const gallery = document.querySelector('.oua-work__gallery');
    const workItems = document.querySelectorAll('.oua-work__item');

    if (!workIntro || !workIntroInner || !gallery || !workItems.length) {
      return false;
    }

    function resetWorkScene() {
      workIntro.style.opacity = '1';
      workIntroInner.style.transform = 'none';

      workItems.forEach(function (item) {
        item.style.transform = 'none';
      });
    }

    function renderWorkScene() {
      if (!isDesktopScene()) {
        resetWorkScene();
        return;
      }

      const galleryRect = gallery.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const travel = Math.max(gallery.offsetHeight - viewportH, 1);
      const scrolled = clamp(-galleryRect.top, 0, travel);
      const progress = easeOutCubic(scrolled / travel);

      const introOpacity = 1 - progress;
      const introScale = 1 - progress * 0.44;
      const introY = progress * -200;

      workIntro.style.opacity = introOpacity.toFixed(3);
      workIntroInner.style.transform =
        'translate3d(0, ' + introY.toFixed(2) + 'px, 0) scale(' + introScale.toFixed(3) + ')';

      workItems.forEach(function (item) {
        let speedY = 0;
        let speedX = 0;

        if (item.classList.contains('oua-work__item--01')) {
          speedY = -28;
          speedX = 5;
        } else if (item.classList.contains('oua-work__item--02')) {
          speedY = -40;
          speedX = -5;
        } else if (item.classList.contains('oua-work__item--03')) {
          speedY = -18;
          speedX = 8;
        } else if (item.classList.contains('oua-work__item--04')) {
          speedY = -32;
          speedX = -7;
        } else if (item.classList.contains('oua-work__item--05')) {
          speedY = -22;
          speedX = 5;
        } else if (item.classList.contains('oua-work__item--06')) {
          speedY = -26;
          speedX = -4;
        }

        const x = progress * speedX;
        const y = progress * speedY;

        item.style.transform =
          'translate3d(' + x.toFixed(2) + 'px, ' + y.toFixed(2) + 'px, 0)';
      });
    }

    let ticking = false;

    function updateWorkScene() {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(function () {
        renderWorkScene();
        ticking = false;
      });
    }

    if (!state.workScene) {
      state.workScene = true;
      window.addEventListener('scroll', updateWorkScene, { passive: true });
      window.addEventListener('resize', updateWorkScene);
    }

    updateWorkScene();

    return true;
  }

  /* =========================
     PROCESS REVEAL
  ========================= */
  function initProcessReveal() {
    const processSection = document.querySelector('.oua-process');
    if (!processSection) return false;

    function updateProcessReveal() {
      const rect = processSection.getBoundingClientRect();
      const viewportH = window.innerHeight;

      processSection.classList.toggle('is-visible', rect.top < viewportH * 0.92);
    }

    if (!state.processReveal) {
      state.processReveal = true;
      window.addEventListener('scroll', updateProcessReveal, { passive: true });
      window.addEventListener('resize', updateProcessReveal);
    }

    updateProcessReveal();

    return true;
  }

  /* =========================
     WORK LIGHTBOX
  ========================= */
  function initWorkLightbox() {
    const lightbox = document.querySelector('.oua-lightbox');
    const lightboxImage = document.querySelector('.oua-lightbox__image');
    const closeBtn = document.querySelector('.oua-lightbox__close');
    const prevBtn = document.querySelector('.oua-lightbox__nav--prev');
    const nextBtn = document.querySelector('.oua-lightbox__nav--next');
    const workItems = document.querySelectorAll('.oua-work__item');

    if (!lightbox || !lightboxImage || !closeBtn || !prevBtn || !nextBtn || !workItems.length) {
      return false;
    }

    if (state.lightbox) return true;
    state.lightbox = true;

    const images = Array.from(workItems)
      .map(function (item) {
        const img = item.querySelector('img');
        if (!img) return null;

        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');

        return {
          src: img.getAttribute('src'),
          alt: img.getAttribute('alt') || ''
        };
      })
      .filter(Boolean);

    if (!images.length) {
      return false;
    }

    let currentIndex = 0;
    let isAnimating = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    function clearTransitionClasses() {
      lightboxImage.classList.remove(
        'is-transitioning-out-next',
        'is-transitioning-out-prev',
        'is-transitioning-in-next',
        'is-transitioning-in-prev'
      );
    }

    function renderImage(index) {
      const image = images[index];
      if (!image) return;

      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
    }

    function openLightbox(index) {
      currentIndex = index;
      renderImage(currentIndex);
      clearTransitionClasses();

      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('oua-lightbox-open');
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('oua-lightbox-open');
      clearTransitionClasses();
      isAnimating = false;

      window.setTimeout(function () {
        if (!lightbox.classList.contains('is-open')) {
          lightboxImage.removeAttribute('src');
          lightboxImage.alt = '';
        }
      }, 220);
    }

    function transitionTo(nextIndex, direction) {
      if (isAnimating || !images[nextIndex]) return;

      isAnimating = true;

      const outClass = direction === 'next'
        ? 'is-transitioning-out-next'
        : 'is-transitioning-out-prev';

      const inClass = direction === 'next'
        ? 'is-transitioning-in-next'
        : 'is-transitioning-in-prev';

      clearTransitionClasses();
      lightboxImage.classList.add(outClass);

      window.setTimeout(function () {
        currentIndex = nextIndex;
        renderImage(currentIndex);

        clearTransitionClasses();
        lightboxImage.classList.add(inClass);

        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            clearTransitionClasses();
          });
        });

        window.setTimeout(function () {
          clearTransitionClasses();
          isAnimating = false;
        }, 230);
      }, 180);
    }

    function showPrev() {
      const nextIndex = (currentIndex - 1 + images.length) % images.length;
      transitionTo(nextIndex, 'prev');
    }

    function showNext() {
      const nextIndex = (currentIndex + 1) % images.length;
      transitionTo(nextIndex, 'next');
    }

    function handleSwipe() {
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX < 40 || absX <= absY) {
        return;
      }

      if (deltaX < 0) {
        showNext();
      } else {
        showPrev();
      }
    }

    workItems.forEach(function (item, index) {
      item.addEventListener('click', function () {
        openLightbox(index);
      });

      item.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(index);
        }
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);

    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (!lightbox.classList.contains('is-open')) return;

      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        showPrev();
      } else if (event.key === 'ArrowRight') {
        showNext();
      }
    });

    lightbox.addEventListener('touchstart', function (event) {
      if (!lightbox.classList.contains('is-open')) return;
      if (!event.touches || !event.touches.length) return;

      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
      touchEndX = touchStartX;
      touchEndY = touchStartY;
    }, { passive: true });

    lightbox.addEventListener('touchmove', function (event) {
      if (!lightbox.classList.contains('is-open')) return;
      if (!event.touches || !event.touches.length) return;

      touchEndX = event.touches[0].clientX;
      touchEndY = event.touches[0].clientY;
    }, { passive: true });

    lightbox.addEventListener('touchend', function () {
      if (!lightbox.classList.contains('is-open')) return;
      handleSwipe();
    }, { passive: true });

    return true;
  }

  /* =========================
     BOOT
  ========================= */
  function boot() {
    initCustomUI();
    initSectionScroll();
    initHeroScene();
    initWorkScene();
    initProcessReveal();
    initWorkLightbox();

    let tries = 0;
    const maxTries = 40;

    const retry = window.setInterval(function () {
      tries += 1;

      const ready = [
        initCustomUI(),
        initSectionScroll(),
        initHeroScene(),
        initWorkScene(),
        initProcessReveal(),
        initWorkLightbox()
      ].every(Boolean);

      if (ready || tries >= maxTries) {
        window.clearInterval(retry);
      }
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();