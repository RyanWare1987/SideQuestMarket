/**
 * Vendor Logos Carousel
 * Handles automatic rotation, touch/swipe gestures, and accessibility
 */

class VendorCarousel {
  constructor() {
    this.carousel = document.querySelector('.vendor-carousel');
    this.track = document.querySelector('.vendor-carousel-track');
    this.prevBtn = document.querySelector('.carousel-prev');
    this.nextBtn = document.querySelector('.carousel-next');
    this.indicatorsContainer = document.querySelector('.carousel-indicators');

    this.currentIndex = 0;
    this.totalSlides = 0;
    this.slidesPerView = this.getSlidesPerView();
    this.autoRotateInterval = null;
    this.autoRotateDelay = 4000; // 4 seconds
    this.pauseTimeout = null;
    this.pauseDuration = 6000; // 6 seconds pause after user interaction
    this.isUserInteracting = false;
    this.isTransitioning = false;

    // Touch/swipe properties
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.touchStartY = 0;
    this.touchEndY = 0;
    this.minSwipeDistance = 50;
    this.isDragging = false;

    this.vendorLogos = [
      '20sidedGuy.png',
      'Afon_Mel_Mead.png',
      'bad_nancy.png',
      'BlackSheepCurios.png',
      'BugAndBoard.png',
      'Bull_and_Compass.png',
      'ChaosCurios.png',
      'DrizzleDrool.png',
      'FourScore.png',
      'HangedDragon.png',
      'HannahC.png',
      'HestiasJewels.png',
      'Hullabailu.png',
      'KookyCandle.png',
      'LeslieStoweDesign.png',
      'Lizzy_Drippin.png',
      'LuckyLeafTeas.png',
      'MallardMeadow.png',
      'Millie_Edith_Emporium.png',
      'MindclashGames.png',
      'MiniGeekBoutique.png',
      'MiniMiglets.png',
      'PixiePyro.png',
      'PrintIsDead.png',
      'RollMightyLeather.png',
      'RW_TextLogo.png',
      'SB_Party.jpg',
      'SteelKill.png',
      'TheDiceCup.png',
      'TinyHauntsAgency.png',
      'TTE.png',
      'UnrelentingBrush.png',
      'ValkyrieRPG.png',
      'WarlocksWicks.png'
    ];

    // Vendor names array - mapped 1:1 with vendorLogos array
    // You can edit these to be exactly what you want displayed
    this.vendorNames = [
      '20 Sided Guy',
      'Afon Mel Mead',
      'Bad Nancy',
      'Black Sheep Curios',
      'Bug & Board',
      'Bull & Compass',
      'Chaos Curios',
      'Drizzle & Drool',
      'Four Score Woodworking',
      'Hanged Dragon',
      'Hannah Corah',
      'Hestias Jewels',
      'Hullabailu',
      'Kooky Candle Company',
      'Leslie Stowe Design',
      'Lizzy Drippin',
      'Lucky Leaf Teas',
      'Mallard Meadow',
      'Millie Edith Emporium',
      'Mindclash Games',
      'Mini Geek Boutique',
      'Mini Miglets',
      'Pixie Pyro',
      'Print Is Dead',
      'Roll Mighty Leather',
      'Ryan Ware Artist',
      'SB Party Creations',
      'Steel Kill',
      'The Dice Cup',
      'Tiny Haunts Agency',
      'Table Top Events',
      'Unrelenting Brush',
      'Valkyrie RPG',
      'Warlocks & Wicks'
    ];

    this.init();
  }

  async init() {
    if (!this.carousel || !this.track) {
      console.warn('Vendor carousel elements not found');
      return;
    }

    try {
      this.carousel.classList.add('loading');
      await this.loadVendorLogos();
      this.setupEventListeners();
      this.setupTouchEvents();
      this.updateSlidesPerView();

      // Ensure totalSlides is set correctly
      this.totalSlides = Math.ceil(this.vendorLogos.length / this.slidesPerView);
      console.log(`Initialization: vendorLogos=${this.vendorLogos.length}, slidesPerView=${this.slidesPerView}, totalSlides=${this.totalSlides}`);

      this.updateCarousel();
      this.startAutoRotate();
      this.carousel.classList.remove('loading');

      // Handle window resize
      window.addEventListener('resize', this.debounce(() => {
        this.updateSlidesPerView();
        this.updateCarousel();
      }, 250));

    } catch (error) {
      console.error('Error initializing vendor carousel:', error);
      this.carousel.classList.remove('loading');
    }
  }

  async loadVendorLogos() {
    const logoElements = this.vendorLogos.map((logo, index) => {
      const logoDiv = document.createElement('div');
      logoDiv.className = 'vendor-logo';
      logoDiv.setAttribute('role', 'img');
      logoDiv.setAttribute('aria-label', `${this.vendorNames[index]} logo`);

      // Create logo container for image
      const logoContainer = document.createElement('div');
      logoContainer.className = 'vendor-logo-container';

      const img = document.createElement('img');
      img.src = `assets/VendorLogos/${logo}`;
      img.alt = `${this.vendorNames[index]} logo`;
      img.loading = 'lazy';
      img.onerror = () => {
        console.warn(`Failed to load vendor logo: ${logo}`);
        logoDiv.style.display = 'none';
      };

      logoContainer.appendChild(img);

      // Create vendor name text
      const nameDiv = document.createElement('div');
      nameDiv.className = 'vendor-name';
      nameDiv.textContent = this.vendorNames[index];
      nameDiv.setAttribute('aria-hidden', 'true'); // Already in aria-label above

      logoDiv.appendChild(logoContainer);
      logoDiv.appendChild(nameDiv);
      return logoDiv;
    });

    // Clear existing content and add new logos
    this.track.innerHTML = '';
    logoElements.forEach(logo => this.track.appendChild(logo));
  }

  getVendorName(index) {
    // Get vendor name from array by index
    return this.vendorNames[index] || 'Unknown Vendor';
  }

  getSlidesPerView() {
    const width = window.innerWidth;
    if (width >= 1024) return 3; // Desktop: 3 logos
    return 1; // Mobile/Tablet: 1 logo
  }

  updateSlidesPerView() {
    const newSlidesPerView = this.getSlidesPerView();
    if (newSlidesPerView !== this.slidesPerView) {
      this.slidesPerView = newSlidesPerView;
      this.totalSlides = Math.ceil(this.vendorLogos.length / this.slidesPerView);
      this.currentIndex = Math.min(this.currentIndex, this.totalSlides - 1);
    }
  }

  setupEventListeners() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        console.log('Prev button clicked');
        this.handleUserInteraction(() => this.prevSlide());
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        console.log('Next button clicked');
        this.handleUserInteraction(() => this.nextSlide());
      });
    }

    // Keyboard navigation
    this.carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.handleUserInteraction(() => this.prevSlide());
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.handleUserInteraction(() => this.nextSlide());
      }
    });

    // Pause on hover/focus
    this.carousel.addEventListener('mouseenter', () => this.pauseAutoRotate());
    this.carousel.addEventListener('mouseleave', () => this.resumeAutoRotateAfterDelay());
    this.carousel.addEventListener('focusin', () => this.pauseAutoRotate());
    this.carousel.addEventListener('focusout', () => this.resumeAutoRotateAfterDelay());
  }

  setupTouchEvents() {
    // Touch events for swipe functionality
    this.carousel.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    this.carousel.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.carousel.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

    // Mouse events for desktop drag (optional enhancement)
    this.carousel.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.carousel.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.carousel.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.carousel.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
  }

  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
    this.isDragging = true;
    this.carousel.classList.add('swiping');
    this.pauseAutoRotate();
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = Math.abs(touchX - this.touchStartX);
    const deltaY = Math.abs(touchY - this.touchStartY);

    // If horizontal swipe is more significant than vertical, prevent scrolling
    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
    }
  }

  handleTouchEnd(e) {
    if (!this.isDragging) return;

    this.touchEndX = e.changedTouches[0].clientX;
    this.touchEndY = e.changedTouches[0].clientY;
    this.isDragging = false;
    this.carousel.classList.remove('swiping');

    this.handleSwipe();
    this.resumeAutoRotateAfterDelay();
  }

  handleMouseDown(e) {
    if (e.button !== 0) return; // Only left mouse button
    this.touchStartX = e.clientX;
    this.touchStartY = e.clientY;
    this.isDragging = true;
    this.carousel.classList.add('swiping');
    this.pauseAutoRotate();
    e.preventDefault();
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
  }

  handleMouseUp(e) {
    if (!this.isDragging) return;

    this.touchEndX = e.clientX;
    this.touchEndY = e.clientY;
    this.isDragging = false;
    this.carousel.classList.remove('swiping');

    this.handleSwipe();
    this.resumeAutoRotateAfterDelay();
  }

  handleSwipe() {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = Math.abs(this.touchEndY - this.touchStartY);

    // Only process horizontal swipes that are more significant than vertical movement
    if (Math.abs(deltaX) > this.minSwipeDistance && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0) {
        this.prevSlide();
      } else {
        this.nextSlide();
      }
    }
  }

  handleUserInteraction(action) {
    console.log('User interaction started');
    this.isUserInteracting = true;
    this.pauseAutoRotate();
    action();
    this.resumeAutoRotateAfterDelay();
  }

  prevSlide() {
    if (this.isTransitioning) return;
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.totalSlides - 1;
    this.updateCarousel();
  }

  nextSlide() {
    if (this.isTransitioning) return;

    console.log(`NextSlide: Before - currentIndex=${this.currentIndex}, totalSlides=${this.totalSlides}`);

    this.currentIndex = this.currentIndex < this.totalSlides - 1 ? this.currentIndex + 1 : 0;

    console.log(`NextSlide: After - currentIndex=${this.currentIndex}`);

    this.updateCarousel();
  }

  goToSlide(index) {
    if (this.isTransitioning || index === this.currentIndex) return;
    this.currentIndex = Math.max(0, Math.min(index, this.totalSlides - 1));
    this.updateCarousel();
  }

  updateCarousel() {
    if (!this.track) return;

    this.isTransitioning = true;

    // Calculate translation based on slides per view and current index
    // Each "slide" represents a group of logos (1 on mobile, 3 on desktop)
    // We need to move by the number of individual logos in each group
    const logosToMove = this.currentIndex * this.slidesPerView;
    const logoWidth = 100 / this.slidesPerView; // Width of each individual logo
    const translateX = -logosToMove * logoWidth;

    // Debug logging
    console.log(`Carousel Update: currentIndex=${this.currentIndex}, slidesPerView=${this.slidesPerView}, totalSlides=${this.totalSlides}, translateX=${translateX}%`);

    // Update debug info in test page if available
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) {
      debugInfo.innerHTML = `
        Current Index: ${this.currentIndex}<br>
        Slides Per View: ${this.slidesPerView}<br>
        Total Slides: ${this.totalSlides}<br>
        Logos to Move: ${logosToMove}<br>
        Logo Width: ${logoWidth}%<br>
        Translate X: ${translateX}%
      `;
    }

    this.track.style.transform = `translateX(${translateX}%)`;

    this.updateButtons();

    // Reset transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, 600);
  }

  createIndicators() {
    // Indicators removed - no longer needed
  }

  updateIndicators() {
    // Indicators removed - no longer needed
  }

  updateButtons() {
    if (this.prevBtn) {
      this.prevBtn.disabled = false; // Always enabled for infinite loop
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = false; // Always enabled for infinite loop
    }
  }

  startAutoRotate() {
    this.stopAutoRotate();
    this.autoRotateInterval = setInterval(() => {
      if (!this.isUserInteracting && !this.isDragging) {
        this.nextSlide();
      }
    }, this.autoRotateDelay);

    this.carousel.classList.remove('paused');
  }

  stopAutoRotate() {
    if (this.autoRotateInterval) {
      clearInterval(this.autoRotateInterval);
      this.autoRotateInterval = null;
    }
  }

  pauseAutoRotate() {
    this.stopAutoRotate();
    this.carousel.classList.add('paused');

    // Clear any existing pause timeout
    if (this.pauseTimeout) {
      clearTimeout(this.pauseTimeout);
      this.pauseTimeout = null;
    }
  }

  resumeAutoRotateAfterDelay() {
    // Clear any existing pause timeout
    if (this.pauseTimeout) {
      clearTimeout(this.pauseTimeout);
    }

    this.pauseTimeout = setTimeout(() => {
      this.isUserInteracting = false;
      this.startAutoRotate();
    }, this.pauseDuration);
  }

  // Utility function for debouncing
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Public method to destroy the carousel
  destroy() {
    this.stopAutoRotate();
    if (this.pauseTimeout) {
      clearTimeout(this.pauseTimeout);
    }

    // Remove event listeners
    window.removeEventListener('resize', this.updateSlidesPerView);

    // Clear carousel content
    if (this.track) {
      this.track.innerHTML = '';
    }
    if (this.indicatorsContainer) {
      this.indicatorsContainer.innerHTML = '';
    }
  }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if carousel elements exist before initializing
  if (document.querySelector('.vendor-carousel')) {
    window.vendorCarousel = new VendorCarousel();
  }
});

// Handle page visibility changes to pause/resume carousel
document.addEventListener('visibilitychange', () => {
  if (window.vendorCarousel) {
    if (document.hidden) {
      window.vendorCarousel.pauseAutoRotate();
    } else {
      window.vendorCarousel.resumeAutoRotateAfterDelay();
    }
  }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VendorCarousel;
}