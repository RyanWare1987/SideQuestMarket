/**
 * Main JavaScript Module
 * Coordinates initialization of all site modules
 */

class SiteManager {
  constructor() {
    this.init();
  }

  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeModules();
      });
    } else {
      this.initializeModules();
    }
  }

  initializeModules() {
    // Initialize performance optimizations
    this.initializePerformance();
    
    // Log successful initialization
    console.log('Side Quest Market site initialized successfully');
  }

  initializePerformance() {
    // Add loading class to body for CSS transitions
    document.body.classList.add('loaded');
    
    // Preload critical images
    this.preloadCriticalImages();
  }

  preloadCriticalImages() {
    // Critical images are now handled by the lazy loading module
    // Add critical-bg class to hero image section for immediate loading
    const heroImageSection = document.getElementById('hero');
    if (heroImageSection) {
      heroImageSection.classList.add('critical-bg');
    }
    
    // Add critical-dice class to above-the-fold dice decorations
    const criticalDice = document.querySelectorAll('#event-info .dice-decoration');
    criticalDice.forEach(dice => {
      dice.classList.add('critical-dice');
    });
    
    // Preload the actual brand logo files
    const logoImages = [
      'assets/Full logo/Logo transparent-03.png',
      'assets/Full logo/Logo transparent-02.png',
      'assets/Full logo/Logo transparent-01.png'
    ];
    
    logoImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }
}

// Initialize site manager
new SiteManager();