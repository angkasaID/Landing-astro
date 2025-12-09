// public/scripts/app.js — CLEAN + STABLE + OPTIMIZED

document.addEventListener('DOMContentLoaded', () => {
  const card = document.getElementById('floating-info-card');
  const closeButton = document.getElementById('close-floating-card');

  if (card && closeButton) {
    closeButton.addEventListener('click', () => {
      card.removeAttribute('data-aos');
      card.removeAttribute('data-aos-delay');
      card.classList.remove('aos-animate');
      card.classList.add('opacity-0', 'scale-95');
      setTimeout(() => {
        card.classList.add('hidden');
      }, 300);
    });
  }
  // Constant Selectors
  const parallaxImage = document.getElementById('parallax-image');
  const carousel = document.getElementById('gallery-carousel');

  // ============================================================
  // 1. PARALLAX EFFECT (OPTIMIZED)
  // ============================================================
  const handleParallaxScroll = () => {
    if (parallaxImage) {
      const scrollPos = window.scrollY;
      parallaxImage.style.transform = `translateY(${scrollPos * 0.4}px)`;
    }
  };

  // ============================================================
  // 2. CAROUSEL AUTO-SLIDE (CLEAN & CONSISTENT)
  // ============================================================
  const setupCarousel = () => {
    if (!carousel) return;

    const items = carousel.querySelectorAll('.carousel-item');
    const REAL_SLIDES = 3;
    const SLIDE_TIME = 5000;

    if (items.length <= 1) return;

    let currentIndex = 0;
    const slideWidth = () => window.innerWidth;

    const autoScroll = () => {
      const width = slideWidth();
      currentIndex++;
      const target = currentIndex * width;
      const maxPosition = REAL_SLIDES * width;

      // Infinite Loop Logic
      if (currentIndex >= REAL_SLIDES) {
        carousel.scrollTo({ left: target, behavior: 'smooth' });

        setTimeout(() => {
          carousel.style.scrollBehavior = 'auto';
          carousel.scrollLeft = 0;
          requestAnimationFrame(() => {
            carousel.style.scrollBehavior = 'smooth';
          });
        }, 500);

        currentIndex = 0;
        return;
      }

      carousel.scrollTo({ left: target, behavior: 'smooth' });
    };

    // Manual scroll reset
    carousel.addEventListener('scroll', () => {
      const width = slideWidth();
      const resetPoint = REAL_SLIDES * width;

      if (carousel.scrollLeft >= resetPoint) {
        carousel.style.scrollBehavior = 'auto';
        carousel.scrollLeft -= resetPoint;
        currentIndex = 0;

        requestAnimationFrame(() => {
          carousel.style.scrollBehavior = 'smooth';
        });
      }
    });

    // Resize support
    window.addEventListener('resize', () => {
      carousel.style.scrollBehavior = 'auto';
      carousel.scrollLeft = currentIndex * slideWidth();
      requestAnimationFrame(() => {
        carousel.style.scrollBehavior = 'smooth';
      });
    });

    setInterval(autoScroll, SLIDE_TIME);
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================
  window.addEventListener('scroll', handleParallaxScroll);
  handleParallaxScroll();
  setupCarousel();
});
