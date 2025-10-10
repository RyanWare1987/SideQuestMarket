/**
 * Font Loading Module
 * Handles Aurora font loading with fallbacks and performance optimization
 */

class FontLoader {
  constructor() {
    this.fontName = 'Aurora';
    this.fontUrl = './fonts/Aurora.otf';
    this.loadingClass = 'font-loading';
    this.loadedClass = 'font-loaded';
    this.timeoutDuration = 3000; // 3 seconds timeout
    
    this.init();
  }

  /**
   * Initialize font loading
   */
  init() {
    // Add loading class immediately
    document.documentElement.classList.add(this.loadingClass);
    
    // Check if font is already cached
    if (this.isFontCached()) {
      this.onFontLoaded();
      return;
    }
    
    // Load font with timeout
    this.loadFont();
  }

  /**
   * Check if font is already cached in browser
   */
  isFontCached() {
    // Create a test element to check if font is available
    const testElement = document.createElement('div');
    testElement.style.fontFamily = this.fontName;
    testElement.style.fontSize = '16px';
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.style.top = '-9999px';
    testElement.textContent = 'Test';
    
    document.body.appendChild(testElement);
    
    const initialWidth = testElement.offsetWidth;
    
    // Change to fallback font
    testElement.style.fontFamily = 'Georgia, serif';
    const fallbackWidth = testElement.offsetWidth;
    
    document.body.removeChild(testElement);
    
    // If widths are different, Aurora font is likely loaded
    return initialWidth !== fallbackWidth;
  }

  /**
   * Load font using Font Loading API or fallback method
   */
  loadFont() {
    if ('fonts' in document) {
      // Use Font Loading API if available
      this.loadFontWithAPI();
    } else {
      // Fallback method for older browsers
      this.loadFontWithFallback();
    }
  }

  /**
   * Load font using Font Loading API
   */
  loadFontWithAPI() {
    const font = new FontFace(this.fontName, `url(${this.fontUrl})`);
    
    // Set timeout
    const timeout = setTimeout(() => {
      this.onFontTimeout();
    }, this.timeoutDuration);
    
    font.load()
      .then((loadedFont) => {
        clearTimeout(timeout);
        document.fonts.add(loadedFont);
        this.onFontLoaded();
      })
      .catch((error) => {
        clearTimeout(timeout);
        console.warn('Aurora font failed to load:', error);
        this.onFontError();
      });
  }

  /**
   * Fallback font loading method for older browsers
   */
  loadFontWithFallback() {
    // Create a hidden element to trigger font download
    const fontLoader = document.createElement('div');
    fontLoader.style.fontFamily = this.fontName;
    fontLoader.style.fontSize = '1px';
    fontLoader.style.position = 'absolute';
    fontLoader.style.visibility = 'hidden';
    fontLoader.style.top = '-9999px';
    fontLoader.textContent = 'Loading font...';
    
    document.body.appendChild(fontLoader);
    
    // Set timeout
    const timeout = setTimeout(() => {
      document.body.removeChild(fontLoader);
      this.onFontTimeout();
    }, this.timeoutDuration);
    
    // Check if font loaded by monitoring width changes
    let checkCount = 0;
    const maxChecks = 50; // Check for up to 2.5 seconds (50 * 50ms)
    
    const checkFont = () => {
      checkCount++;
      
      if (this.isFontCached()) {
        clearTimeout(timeout);
        document.body.removeChild(fontLoader);
        this.onFontLoaded();
        return;
      }
      
      if (checkCount < maxChecks) {
        setTimeout(checkFont, 50);
      } else {
        clearTimeout(timeout);
        document.body.removeChild(fontLoader);
        this.onFontTimeout();
      }
    };
    
    // Start checking after a brief delay
    setTimeout(checkFont, 100);
  }

  /**
   * Handle successful font loading
   */
  onFontLoaded() {
    document.documentElement.classList.remove(this.loadingClass);
    document.documentElement.classList.add(this.loadedClass);
    
    // Dispatch custom event for other modules
    document.dispatchEvent(new CustomEvent('fontLoaded', {
      detail: { fontName: this.fontName }
    }));
    
    console.log('Aurora font loaded successfully');
  }

  /**
   * Handle font loading timeout
   */
  onFontTimeout() {
    document.documentElement.classList.remove(this.loadingClass);
    document.documentElement.classList.add('font-timeout');
    
    console.warn('Aurora font loading timed out, using fallback fonts');
    
    // Dispatch timeout event
    document.dispatchEvent(new CustomEvent('fontTimeout', {
      detail: { fontName: this.fontName }
    }));
  }

  /**
   * Handle font loading error
   */
  onFontError() {
    document.documentElement.classList.remove(this.loadingClass);
    document.documentElement.classList.add('font-error');
    
    console.error('Aurora font failed to load, using fallback fonts');
    
    // Dispatch error event
    document.dispatchEvent(new CustomEvent('fontError', {
      detail: { fontName: this.fontName }
    }));
  }
}

/**
 * Preload critical fonts
 */
function preloadFonts() {
  // Create link element for font preloading
  const fontPreload = document.createElement('link');
  fontPreload.rel = 'preload';
  fontPreload.href = './fonts/Aurora.otf';
  fontPreload.as = 'font';
  fontPreload.type = 'font/otf';
  fontPreload.crossOrigin = 'anonymous';
  
  // Insert before first script or in head
  const firstScript = document.querySelector('script');
  if (firstScript) {
    firstScript.parentNode.insertBefore(fontPreload, firstScript);
  } else {
    document.head.appendChild(fontPreload);
  }
}

/**
 * Initialize font loading when DOM is ready
 */
function initFontLoader() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new FontLoader();
    });
  } else {
    new FontLoader();
  }
}

// Auto-initialize if script is loaded directly
if (typeof window !== 'undefined') {
  // Preload fonts immediately
  preloadFonts();
  
  // Initialize font loader
  initFontLoader();
}

// Export for module usage
export { FontLoader, preloadFonts, initFontLoader };/**
 * Image Lazy Loading Module
 * Implements Intersection Observer API for lazy loading images
 * Optimizes image compression and format selection
 * Handles responsive image loading for different screen sizes
 */

class ImageLazyLoader {
  constructor() {
    this.observer = null;
    this.lazyImages = [];
    this.isSupported = 'IntersectionObserver' in window;
    this.rootMargin = '50px 0px'; // Start loading 50px before image enters viewport
    this.threshold = 0.01; // Trigger when 1% of image is visible
  }

  /**
   * Initialize lazy loading
   */
  init() {
    if (!this.isSupported) {
      console.warn('IntersectionObserver not supported, loading all images immediately');
      this.loadAllImages();
      return;
    }

    this.setupObserver();
    this.findLazyImages();
    this.observeImages();
  }

  /**
   * Set up Intersection Observer
   */
  setupObserver() {
    const options = {
      root: null, // Use viewport as root
      rootMargin: this.rootMargin,
      threshold: this.threshold
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);
  }

  /**
   * Find all images that should be lazy loaded
   */
  findLazyImages() {
    // Find background images with data-bg attribute
    const bgImages = document.querySelectorAll('[data-bg]');
    
    // Find regular img elements with data-src
    const imgElements = document.querySelectorAll('img[data-src]');
    
    // Find responsive images with data-srcset
    const responsiveImages = document.querySelectorAll('[data-srcset]');

    this.lazyImages = [...bgImages, ...imgElements, ...responsiveImages];
  }

  /**
   * Start observing lazy images
   */
  observeImages() {
    this.lazyImages.forEach(image => {
      // Add loading class for CSS transitions
      image.classList.add('lazy-loading');
      this.observer.observe(image);
    });
  }

  /**
   * Load individual image
   */
  loadImage(element) {
    // Handle background images
    if (element.hasAttribute('data-bg')) {
      this.loadBackgroundImage(element);
    }
    
    // Handle regular img elements
    if (element.tagName === 'IMG') {
      this.loadImgElement(element);
    }
    
    // Handle elements with srcset (responsive images)
    if (element.hasAttribute('data-srcset')) {
      this.loadResponsiveImage(element);
    }
  }

  /**
   * Load background image
   */
  loadBackgroundImage(element) {
    const bgImage = element.getAttribute('data-bg');
    const bgImageSet = element.getAttribute('data-bg-set');
    
    if (bgImageSet) {
      // Handle responsive background images
      const sources = this.parseSourceSet(bgImageSet);
      const bestSource = this.selectBestSource(sources);
      element.style.backgroundImage = `url('${bestSource}')`;
    } else if (bgImage) {
      element.style.backgroundImage = `url('${bgImage}')`;
    }
    
    this.onImageLoaded(element);
  }

  /**
   * Load regular img element
   */
  loadImgElement(img) {
    const src = img.getAttribute('data-src');
    const srcset = img.getAttribute('data-srcset');
    
    // Create new image to preload
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      // Set the actual src and srcset
      if (srcset) {
        img.srcset = srcset;
      }
      if (src) {
        img.src = src;
      }
      this.onImageLoaded(img);
    };
    
    imageLoader.onerror = () => {
      this.onImageError(img);
    };
    
    // Start loading
    if (srcset) {
      imageLoader.srcset = srcset;
    }
    if (src) {
      imageLoader.src = src;
    }
  }

  /**
   * Load responsive image with srcset
   */
  loadResponsiveImage(element) {
    const srcset = element.getAttribute('data-srcset');
    const src = element.getAttribute('data-src');
    
    if (element.tagName === 'IMG') {
      this.loadImgElement(element);
    } else {
      // Handle other elements with responsive backgrounds
      const sources = this.parseSourceSet(srcset);
      const bestSource = this.selectBestSource(sources);
      element.style.backgroundImage = `url('${bestSource}')`;
      this.onImageLoaded(element);
    }
  }

  /**
   * Parse srcset string into array of sources
   */
  parseSourceSet(srcset) {
    return srcset.split(',').map(source => {
      const parts = source.trim().split(' ');
      return {
        url: parts[0],
        descriptor: parts[1] || '1x'
      };
    });
  }

  /**
   * Select best source based on device pixel ratio and viewport width
   */
  selectBestSource(sources) {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const viewportWidth = window.innerWidth;
    
    // Sort sources by descriptor value
    const sortedSources = sources.sort((a, b) => {
      const aValue = this.getDescriptorValue(a.descriptor);
      const bValue = this.getDescriptorValue(b.descriptor);
      return aValue - bValue;
    });
    
    // Find best match based on device pixel ratio
    let bestSource = sortedSources[0];
    
    for (const source of sortedSources) {
      const descriptorValue = this.getDescriptorValue(source.descriptor);
      
      if (source.descriptor.endsWith('x')) {
        // Pixel density descriptor
        if (descriptorValue <= devicePixelRatio) {
          bestSource = source;
        }
      } else if (source.descriptor.endsWith('w')) {
        // Width descriptor
        if (descriptorValue <= viewportWidth * devicePixelRatio) {
          bestSource = source;
        }
      }
    }
    
    return bestSource.url;
  }

  /**
   * Get numeric value from descriptor
   */
  getDescriptorValue(descriptor) {
    return parseFloat(descriptor.replace(/[wx]$/, ''));
  }

  /**
   * Handle successful image load
   */
  onImageLoaded(element) {
    element.classList.remove('lazy-loading');
    element.classList.add('lazy-loaded');
    
    // Trigger custom event for other modules
    element.dispatchEvent(new CustomEvent('lazyImageLoaded', {
      bubbles: true,
      detail: { element }
    }));
  }

  /**
   * Handle image load error
   */
  onImageError(element) {
    element.classList.remove('lazy-loading');
    element.classList.add('lazy-error');
    
    // Set fallback image or styling
    if (element.tagName === 'IMG') {
      element.alt = element.alt || 'Image failed to load';
      element.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjQTc4QkZBIi8+CjxwYXRoIGQ9Ik0xNiA4QzEyIDggOCAxMiA4IDE2UzEyIDI0IDE2IDI0UzI0IDIwIDI0IDE2UzIwIDggMTYgOFpNMTYgMjBDMTQgMjAgMTIgMTggMTIgMTZTMTQgMTIgMTYgMTJTMjAgMTQgMjAgMTZTMTggMjAgMTYgMjBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
    } else {
      element.style.backgroundColor = 'var(--color-light-purple, #A78BFA)';
    }
    
    console.warn('Failed to load lazy image:', element);
  }

  /**
   * Fallback for browsers without IntersectionObserver
   */
  loadAllImages() {
    this.findLazyImages();
    this.lazyImages.forEach(image => {
      this.loadImage(image);
    });
  }

  /**
   * Preload critical images that should load immediately
   */
  preloadCriticalImages() {
    const criticalImages = [
      'assets/optimized/logos/logo-48.png',
      'assets/optimized/logos/logo-96.png',
      'assets/optimized/logos/logo-192.png',
      'assets/optimized/backgrounds/hero-bg-768.jpg'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  /**
   * Update images on viewport resize
   */
  handleResize() {
    // Debounce resize events
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      // Re-evaluate responsive images if needed
      const loadedResponsiveImages = document.querySelectorAll('.lazy-loaded[data-srcset]');
      loadedResponsiveImages.forEach(element => {
        if (element.hasAttribute('data-srcset')) {
          const sources = this.parseSourceSet(element.getAttribute('data-srcset'));
          const bestSource = this.selectBestSource(sources);
          
          if (element.tagName === 'IMG') {
            if (element.src !== bestSource) {
              element.src = bestSource;
            }
          } else {
            const currentBg = element.style.backgroundImage;
            const newBg = `url('${bestSource}')`;
            if (currentBg !== newBg) {
              element.style.backgroundImage = newBg;
            }
          }
        }
      });
    }, 250);
  }

  /**
   * Clean up observer
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    window.removeEventListener('resize', this.handleResize.bind(this));
  }
}

// Initialize and export
const imageLazyLoader = new ImageLazyLoader();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    imageLazyLoader.init();
    imageLazyLoader.preloadCriticalImages();
  });
} else {
  imageLazyLoader.init();
  imageLazyLoader.preloadCriticalImages();
}

// Handle resize events
window.addEventListener('resize', imageLazyLoader.handleResize.bind(imageLazyLoader));

export default imageLazyLoader;/**
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
    // Add critical-bg class to hero for immediate loading
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.classList.add('critical-bg');
    }
    
    // Add critical-dice class to above-the-fold dice decorations
    const criticalDice = document.querySelectorAll('#event-info .dice-decoration');
    criticalDice.forEach(dice => {
      dice.classList.add('critical-dice');
    });
  }
}

// Initialize site manager
new SiteManager();/**
 * Navigation Module
 * Handles mobile menu toggle, keyboard navigation, and accessibility
 */

class Navigation {
  constructor() {
    this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    this.mobileNav = document.querySelector('.mobile-nav');
    this.navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    this.header = document.querySelector('.site-header');
    this.isMenuOpen = false;
    this.keyboardNavigation = false;
    this.focusableElements = [];
    this.lastFocusedElement = null;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.createMobileOverlay();
    this.setupKeyboardDetection();
    this.setupFocusManagement();
  }

  bindEvents() {
    // Mobile menu toggle
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMobileMenu();
      });

      // Enhanced keyboard support for menu toggle
      this.mobileMenuToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleMobileMenu();
        }
      });
    }

    // Close mobile menu when clicking nav links
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isMenuOpen) {
          this.closeMobileMenu();
        }
      });

      // Enhanced keyboard support for nav links
      link.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          // Let the default behavior handle the navigation
          if (this.isMenuOpen) {
            this.closeMobileMenu();
          }
        }
      });
    });

    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });

    // Close mobile menu on window resize if open
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });

    // Prevent body scroll when mobile menu is open
    this.preventBodyScroll();

    // Handle focus events for accessibility
    document.addEventListener('focusin', (e) => {
      this.handleFocusIn(e);
    });

    document.addEventListener('focusout', (e) => {
      this.handleFocusOut(e);
    });
  }

  createMobileOverlay() {
    // Create overlay element for mobile menu
    this.overlay = document.createElement('div');
    this.overlay.className = 'mobile-nav-overlay';
    document.body.appendChild(this.overlay);

    // Close menu when clicking overlay
    this.overlay.addEventListener('click', () => {
      this.closeMobileMenu();
    });
  }

  toggleMobileMenu() {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    this.isMenuOpen = true;
    
    // Update ARIA attributes
    this.mobileMenuToggle.setAttribute('aria-expanded', 'true');
    this.mobileNav.setAttribute('aria-hidden', 'false');
    
    // Add active classes
    this.overlay.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus first menu item for accessibility
    const firstMenuItem = this.mobileNav.querySelector('.mobile-nav-link');
    if (firstMenuItem) {
      setTimeout(() => firstMenuItem.focus(), 300);
    }
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    
    // Update ARIA attributes
    this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
    this.mobileNav.setAttribute('aria-hidden', 'true');
    
    // Remove active classes
    this.overlay.classList.remove('active');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to toggle button
    this.mobileMenuToggle.focus();
  }

  handleKeyboardNavigation(e) {
    // Close mobile menu with Escape key
    if (e.key === 'Escape' && this.isMenuOpen) {
      this.closeMobileMenu();
      return;
    }

    // Handle Tab navigation within mobile menu
    if (e.key === 'Tab' && this.isMenuOpen) {
      this.handleTabNavigation(e);
    }
  }

  handleTabNavigation(e) {
    const focusableElements = this.mobileNav.querySelectorAll(
      'a[href], button, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab (backward)
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab (forward)
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  preventBodyScroll() {
    // Store original body overflow
    this.originalBodyOverflow = document.body.style.overflow;
  }

  setupKeyboardDetection() {
    // Detect when user is navigating with keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.keyboardNavigation = true;
        document.body.classList.add('keyboard-navigation');
      }
    });

    // Detect when user switches to mouse
    document.addEventListener('mousedown', () => {
      this.keyboardNavigation = false;
      document.body.classList.remove('keyboard-navigation');
    });
  }

  setupFocusManagement() {
    // Get all focusable elements
    this.updateFocusableElements();
    
    // Update focusable elements when DOM changes
    const observer = new MutationObserver(() => {
      this.updateFocusableElements();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['tabindex', 'disabled', 'aria-hidden']
    });
  }

  updateFocusableElements() {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    this.focusableElements = Array.from(document.querySelectorAll(focusableSelectors))
      .filter(el => {
        // Filter out hidden elements
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               el.getAttribute('aria-hidden') !== 'true';
      });
  }

  handleFocusIn(e) {
    // Store the last focused element for restoration
    this.lastFocusedElement = e.target;

    // If mobile menu is open and focus moves outside, close it
    if (this.isMenuOpen && !this.mobileNav.contains(e.target) && e.target !== this.mobileMenuToggle) {
      // Allow focus to move to overlay for closing
      if (!e.target.classList.contains('mobile-nav-overlay')) {
        this.closeMobileMenu();
      }
    }
  }

  handleFocusOut(e) {
    // Handle focus leaving elements
    if (this.keyboardNavigation) {
      // Add any specific focus-out handling here
    }
  }

  trapFocus(container) {
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    container.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });

    return { firstElement, lastElement };
  }

  // Enhanced mobile menu methods
  openMobileMenu() {
    this.isMenuOpen = true;
    
    // Store the element that triggered the menu
    this.lastFocusedElement = document.activeElement;
    
    // Update ARIA attributes
    this.mobileMenuToggle.setAttribute('aria-expanded', 'true');
    this.mobileNav.setAttribute('aria-hidden', 'false');
    
    // Add active classes
    this.overlay.classList.add('active');
    document.body.classList.add('modal-open');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Set up focus trap
    this.trapFocus(this.mobileNav);
    
    // Focus first menu item for accessibility
    const firstMenuItem = this.mobileNav.querySelector('.mobile-nav-link');
    if (firstMenuItem) {
      setTimeout(() => {
        firstMenuItem.focus();
      }, 100);
    }
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    
    // Update ARIA attributes
    this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
    this.mobileNav.setAttribute('aria-hidden', 'true');
    
    // Remove active classes
    this.overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to the element that opened the menu
    if (this.lastFocusedElement && this.lastFocusedElement.focus) {
      this.lastFocusedElement.focus();
    } else {
      this.mobileMenuToggle.focus();
    }
  }

  // Enhanced keyboard navigation handler
  handleKeyboardNavigation(e) {
    // Close mobile menu with Escape key
    if (e.key === 'Escape') {
      if (this.isMenuOpen) {
        e.preventDefault();
        this.closeMobileMenu();
        return;
      }
    }

    // Handle Tab navigation within mobile menu
    if (e.key === 'Tab' && this.isMenuOpen) {
      this.handleTabNavigation(e);
    }

    // Handle arrow key navigation in desktop menu
    if (!this.isMenuOpen && window.innerWidth >= 768) {
      this.handleArrowNavigation(e);
    }

    // Handle Enter and Space for interactive elements
    if (e.key === 'Enter' || e.key === ' ') {
      this.handleActivation(e);
    }
  }

  handleArrowNavigation(e) {
    const desktopNavLinks = document.querySelectorAll('.nav-link');
    const currentIndex = Array.from(desktopNavLinks).indexOf(document.activeElement);
    
    if (currentIndex === -1) return;

    let nextIndex;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : desktopNavLinks.length - 1;
        desktopNavLinks[nextIndex].focus();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = currentIndex < desktopNavLinks.length - 1 ? currentIndex + 1 : 0;
        desktopNavLinks[nextIndex].focus();
        break;
      case 'Home':
        e.preventDefault();
        desktopNavLinks[0].focus();
        break;
      case 'End':
        e.preventDefault();
        desktopNavLinks[desktopNavLinks.length - 1].focus();
        break;
    }
  }

  handleActivation(e) {
    const target = e.target;
    
    // Handle space key for buttons (Enter is handled by default)
    if (e.key === ' ' && target.tagName === 'BUTTON') {
      e.preventDefault();
      target.click();
    }
    
    // Handle Enter and Space for elements with role="button"
    if ((e.key === 'Enter' || e.key === ' ') && target.getAttribute('role') === 'button') {
      e.preventDefault();
      target.click();
    }
  }

  // Public method to update active navigation link
  updateActiveLink(targetId) {
    // Remove active class from all links
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });

    // Add active class to current section links
    const activeLinks = document.querySelectorAll(`[href="#${targetId}"]`);
    activeLinks.forEach(link => {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    });
  }

  // Public method to focus on specific element
  focusElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.focus();
      return true;
    }
    return false;
  }

  // Public method to get current focus
  getCurrentFocus() {
    return document.activeElement;
  }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.navigation = new Navigation();
});/**
 * Keyboard Navigation Enhancement Module
 * Provides comprehensive keyboard navigation support and accessibility features
 */

class KeyboardNavigation {
  constructor() {
    this.focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])',
      '[role="menuitem"]:not([disabled])'
    ].join(', ');

    this.skipLinks = [];
    this.focusHistory = [];
    this.maxFocusHistory = 10;

    this.init();
  }

  init() {
    this.setupSkipLinks();
    this.setupKeyboardShortcuts();
    this.setupFocusManagement();
    this.setupAccessibilityAnnouncements();
    this.enhanceFormNavigation();
  }

  setupSkipLinks() {
    // Create additional skip links for better navigation
    this.createSkipLink('Skip to main content', '#main-content');
    this.createSkipLink('Skip to navigation', '.main-nav');
    this.createSkipLink('Skip to footer', '.site-footer');
  }

  createSkipLink(text, target) {
    const skipLink = document.createElement('a');
    skipLink.href = target;
    skipLink.className = 'skip-link sr-only-focusable';
    skipLink.textContent = text;
    skipLink.setAttribute('aria-label', text);
    
    // Add to the beginning of the body
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Handle skip link activation
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.skipToTarget(target);
    });

    skipLink.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.skipToTarget(target);
      }
    });

    this.skipLinks.push(skipLink);
  }

  skipToTarget(target) {
    const targetElement = document.querySelector(target);
    if (targetElement) {
      // Make target focusable if it isn't already
      if (!targetElement.hasAttribute('tabindex')) {
        targetElement.setAttribute('tabindex', '-1');
      }
      
      // Focus the target
      targetElement.focus();
      
      // Scroll to target smoothly
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });

      // Announce to screen readers
      this.announceToScreenReader(`Skipped to ${target.replace('#', '').replace('.', '').replace('-', ' ')}`);
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt + M: Focus main navigation
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        this.focusMainNavigation();
      }

      // Alt + C: Focus main content
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        this.focusMainContent();
      }

      // Alt + F: Focus footer
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        this.focusFooter();
      }

      // Alt + S: Focus search/contact form
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        this.focusContactForm();
      }

      // Escape: Close any open modals/menus
      if (e.key === 'Escape') {
        this.handleEscapeKey();
      }

      // F6: Cycle through main page regions
      if (e.key === 'F6') {
        e.preventDefault();
        this.cyclePageRegions(e.shiftKey);
      }
    });
  }

  focusMainNavigation() {
    const nav = document.querySelector('.main-nav a, .nav-link');
    if (nav) {
      nav.focus();
      this.announceToScreenReader('Focused main navigation');
    }
  }

  focusMainContent() {
    const main = document.querySelector('#main-content, main');
    if (main) {
      if (!main.hasAttribute('tabindex')) {
        main.setAttribute('tabindex', '-1');
      }
      main.focus();
      this.announceToScreenReader('Focused main content');
    }
  }

  focusFooter() {
    const footer = document.querySelector('.site-footer, footer');
    if (footer) {
      const firstLink = footer.querySelector('a, button');
      if (firstLink) {
        firstLink.focus();
      } else {
        if (!footer.hasAttribute('tabindex')) {
          footer.setAttribute('tabindex', '-1');
        }
        footer.focus();
      }
      this.announceToScreenReader('Focused footer');
    }
  }

  focusContactForm() {
    const form = document.querySelector('.contact-form input, .contact-form textarea');
    if (form) {
      form.focus();
      this.announceToScreenReader('Focused contact form');
    }
  }

  handleEscapeKey() {
    // Close mobile menu if open
    if (window.navigation && window.navigation.isMenuOpen) {
      window.navigation.closeMobileMenu();
      return;
    }

    // Return focus to body if no specific action needed
    document.body.focus();
  }

  cyclePageRegions(reverse = false) {
    const regions = [
      '.site-header',
      '#main-content',
      '.site-footer'
    ];

    const currentRegion = this.getCurrentRegion();
    let currentIndex = regions.indexOf(currentRegion);
    
    if (currentIndex === -1) currentIndex = 0;

    let nextIndex;
    if (reverse) {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : regions.length - 1;
    } else {
      nextIndex = currentIndex < regions.length - 1 ? currentIndex + 1 : 0;
    }

    const nextRegion = document.querySelector(regions[nextIndex]);
    if (nextRegion) {
      const focusableElement = nextRegion.querySelector(this.focusableSelectors);
      if (focusableElement) {
        focusableElement.focus();
      } else {
        if (!nextRegion.hasAttribute('tabindex')) {
          nextRegion.setAttribute('tabindex', '-1');
        }
        nextRegion.focus();
      }
      
      const regionName = regions[nextIndex].replace('#', '').replace('.', '').replace('-', ' ');
      this.announceToScreenReader(`Moved to ${regionName}`);
    }
  }

  getCurrentRegion() {
    const activeElement = document.activeElement;
    const regions = ['.site-header', '#main-content', '.site-footer'];
    
    for (const region of regions) {
      const regionElement = document.querySelector(region);
      if (regionElement && regionElement.contains(activeElement)) {
        return region;
      }
    }
    
    return null;
  }

  setupFocusManagement() {
    // Track focus history
    document.addEventListener('focusin', (e) => {
      this.addToFocusHistory(e.target);
    });

    // Enhanced focus indicators
    document.addEventListener('focusin', (e) => {
      this.enhanceFocusIndicator(e.target);
    });

    document.addEventListener('focusout', (e) => {
      this.removeFocusIndicator(e.target);
    });
  }

  addToFocusHistory(element) {
    // Remove element if it already exists in history
    const existingIndex = this.focusHistory.indexOf(element);
    if (existingIndex > -1) {
      this.focusHistory.splice(existingIndex, 1);
    }

    // Add to beginning of history
    this.focusHistory.unshift(element);

    // Limit history size
    if (this.focusHistory.length > this.maxFocusHistory) {
      this.focusHistory = this.focusHistory.slice(0, this.maxFocusHistory);
    }
  }

  enhanceFocusIndicator(element) {
    // Add enhanced focus class for additional styling
    element.classList.add('enhanced-focus');
    
    // Add focus announcement for screen readers
    const label = this.getElementLabel(element);
    if (label) {
      this.announceToScreenReader(`Focused ${label}`, 'polite');
    }
  }

  removeFocusIndicator(element) {
    element.classList.remove('enhanced-focus');
  }

  getElementLabel(element) {
    // Get accessible name for element
    return element.getAttribute('aria-label') ||
           element.getAttribute('aria-labelledby') ||
           element.getAttribute('title') ||
           element.textContent?.trim() ||
           element.getAttribute('alt') ||
           element.getAttribute('placeholder') ||
           element.tagName.toLowerCase();
  }

  setupAccessibilityAnnouncements() {
    // Create live region for announcements
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    this.liveRegion.id = 'accessibility-announcements';
    document.body.appendChild(this.liveRegion);

    // Create assertive live region for urgent announcements
    this.assertiveLiveRegion = document.createElement('div');
    this.assertiveLiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveLiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveLiveRegion.className = 'sr-only';
    this.assertiveLiveRegion.id = 'accessibility-announcements-assertive';
    document.body.appendChild(this.assertiveLiveRegion);
  }

  announceToScreenReader(message, priority = 'polite') {
    const region = priority === 'assertive' ? this.assertiveLiveRegion : this.liveRegion;
    
    // Clear previous message
    region.textContent = '';
    
    // Add new message after a brief delay to ensure it's announced
    setTimeout(() => {
      region.textContent = message;
    }, 100);

    // Clear message after announcement
    setTimeout(() => {
      region.textContent = '';
    }, 1000);
  }

  enhanceFormNavigation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      this.setupFormKeyboardNavigation(form);
    });
  }

  setupFormKeyboardNavigation(form) {
    const formElements = form.querySelectorAll('input, textarea, select, button');
    
    formElements.forEach((element, index) => {
      element.addEventListener('keydown', (e) => {
        // Ctrl + Enter: Submit form from any field
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault();
          const submitButton = form.querySelector('[type="submit"], button:not([type="button"])');
          if (submitButton) {
            submitButton.click();
          }
        }

        // Enhanced arrow key navigation in forms
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          // Only for non-textarea elements
          if (element.tagName !== 'TEXTAREA') {
            e.preventDefault();
            const direction = e.key === 'ArrowDown' ? 1 : -1;
            const nextIndex = index + direction;
            
            if (nextIndex >= 0 && nextIndex < formElements.length) {
              formElements[nextIndex].focus();
            }
          }
        }
      });

      // Enhanced error handling
      element.addEventListener('invalid', (e) => {
        const errorMessage = this.getValidationMessage(element);
        this.announceToScreenReader(`Error: ${errorMessage}`, 'assertive');
      });
    });
  }

  getValidationMessage(element) {
    return element.validationMessage || 
           element.getAttribute('data-error') || 
           'Invalid input';
  }

  // Public methods for external use
  focusElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.focus();
      return true;
    }
    return false;
  }

  getFocusableElements(container = document) {
    return Array.from(container.querySelectorAll(this.focusableSelectors))
      .filter(el => this.isElementVisible(el) && !el.disabled);
  }

  isElementVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.getAttribute('aria-hidden') !== 'true' &&
           element.offsetParent !== null;
  }

  getFirstFocusableElement(container = document) {
    const focusableElements = this.getFocusableElements(container);
    return focusableElements[0] || null;
  }

  getLastFocusableElement(container = document) {
    const focusableElements = this.getFocusableElements(container);
    return focusableElements[focusableElements.length - 1] || null;
  }

  createFocusTrap(container) {
    const firstElement = this.getFirstFocusableElement(container);
    const lastElement = this.getLastFocusableElement(container);

    if (!firstElement || !lastElement) return null;

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return {
      activate: () => {
        firstElement.focus();
      },
      deactivate: () => {
        container.removeEventListener('keydown', handleTabKey);
      }
    };
  }
}

// Initialize keyboard navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.keyboardNavigation = new KeyboardNavigation();
});/**
 * Contact Form Module
 * Handles form validation, submission, and user feedback
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create an EmailJS account at https://www.emailjs.com/
 * 2. Create a new service (Gmail integration)
 * 3. Create an email template with the following variables:
 *    - {{from_name}} - Sender's name
 *    - {{from_email}} - Sender's email
 *    - {{message}} - Message content
 *    - {{timestamp}} - Submission timestamp
 *    - {{to_email}} - Your Gmail address
 * 4. Update the emailJSConfig object below with your:
 *    - serviceID (from EmailJS dashboard)
 *    - templateID (from EmailJS dashboard)
 *    - userID (from EmailJS dashboard)
 * 5. Update the to_email in templateParams with your Gmail address
 */

class ContactForm {
  constructor() {
    this.form = document.querySelector('.contact-form');
    this.nameInput = document.getElementById('contact-name');
    this.emailInput = document.getElementById('contact-email');
    this.messageInput = document.getElementById('contact-message');
    this.submitBtn = document.querySelector('.form-submit-btn');
    this.statusDiv = document.querySelector('.form-status');
    
    // EmailJS configuration
    this.emailJSConfig = {
      serviceID: 'service_sidequest', // Replace with your EmailJS service ID
      templateID: 'template_contact', // Replace with your EmailJS template ID
      userID: 'your_emailjs_user_id' // Replace with your EmailJS user ID
    };
    
    this.validationRules = {
      name: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s'-]+$/
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      message: {
        required: true,
        minLength: 10,
        maxLength: 1000
      }
    };
    
    this.init();
  }
  
  init() {
    if (!this.form) return;
    
    this.initializeEmailJS();
    this.bindEvents();
    this.setupAccessibility();
  }
  
  initializeEmailJS() {
    // Initialize EmailJS when the library is loaded
    if (typeof emailjs !== 'undefined') {
      emailjs.init(this.emailJSConfig.userID);
    } else {
      // If EmailJS isn't loaded yet, wait for it
      const checkEmailJS = () => {
        if (typeof emailjs !== 'undefined') {
          emailjs.init(this.emailJSConfig.userID);
        } else {
          setTimeout(checkEmailJS, 100);
        }
      };
      checkEmailJS();
    }
  }
  
  bindEvents() {
    // Real-time validation on input
    this.nameInput.addEventListener('input', () => this.validateField('name'));
    this.nameInput.addEventListener('blur', () => this.validateField('name'));
    
    this.emailInput.addEventListener('input', () => this.validateField('email'));
    this.emailInput.addEventListener('blur', () => this.validateField('email'));
    
    this.messageInput.addEventListener('input', () => this.validateField('message'));
    this.messageInput.addEventListener('blur', () => this.validateField('message'));
    
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Prevent form submission on Enter in text inputs (but allow in textarea)
    this.nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.emailInput.focus();
      }
    });
    
    this.emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.messageInput.focus();
      }
    });
    
    // Network status monitoring
    window.addEventListener('online', () => {
      if (this.statusDiv.textContent.includes('internet connection')) {
        this.clearStatus();
      }
    });
    
    window.addEventListener('offline', () => {
      if (this.submitBtn.disabled && this.submitBtn.classList.contains('loading')) {
        this.setLoadingState(false);
        this.showStatus('No internet connection. Please check your connection and try again.', 'error');
      }
    });
  }
  
  setupAccessibility() {
    // Ensure proper ARIA attributes are set
    this.nameInput.setAttribute('aria-required', 'true');
    this.emailInput.setAttribute('aria-required', 'true');
    this.messageInput.setAttribute('aria-required', 'true');
    
    // Set up error message associations (preserve existing describedby)
    const nameDescribedBy = this.nameInput.getAttribute('aria-describedby') || 'name-error';
    const emailDescribedBy = this.emailInput.getAttribute('aria-describedby') || 'email-error';
    const messageDescribedBy = this.messageInput.getAttribute('aria-describedby') || 'message-error';
    
    this.nameInput.setAttribute('aria-describedby', nameDescribedBy);
    this.emailInput.setAttribute('aria-describedby', emailDescribedBy);
    this.messageInput.setAttribute('aria-describedby', messageDescribedBy);
    
    // Announce form purpose to screen readers
    if (window.keyboardNavigation) {
      window.keyboardNavigation.announceToScreenReader('Contact form loaded. All fields are required.', 'polite');
    }
  }
  
  validateField(fieldName) {
    const input = this[`${fieldName}Input`];
    const value = input.value.trim();
    const rules = this.validationRules[fieldName];
    const errorElement = document.getElementById(`${fieldName}-error`);
    const formGroup = input.closest('.form-group');
    
    let isValid = true;
    let errorMessage = '';
    
    // Required validation
    if (rules.required && !value) {
      isValid = false;
      errorMessage = `${this.capitalizeFirst(fieldName)} is required.`;
    }
    // Length validation
    else if (value && rules.minLength && value.length < rules.minLength) {
      isValid = false;
      errorMessage = `${this.capitalizeFirst(fieldName)} must be at least ${rules.minLength} characters.`;
    }
    else if (value && rules.maxLength && value.length > rules.maxLength) {
      isValid = false;
      errorMessage = `${this.capitalizeFirst(fieldName)} must not exceed ${rules.maxLength} characters.`;
    }
    // Pattern validation
    else if (value && rules.pattern && !rules.pattern.test(value)) {
      isValid = false;
      if (fieldName === 'email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (fieldName === 'name') {
        errorMessage = 'Name can only contain letters, spaces, hyphens, and apostrophes.';
      }
    }
    
    // Update UI based on validation result
    this.updateFieldUI(input, formGroup, errorElement, isValid, errorMessage);
    
    // Update form submission state
    this.updateSubmitButton();
    
    return isValid;
  }
  
  updateFieldUI(input, formGroup, errorElement, isValid, errorMessage) {
    // Remove existing classes
    input.classList.remove('error', 'success');
    formGroup.classList.remove('has-error', 'has-success');
    
    if (input.value.trim()) {
      if (isValid) {
        input.classList.add('success');
        formGroup.classList.add('has-success');
        errorElement.textContent = '';
        input.setAttribute('aria-invalid', 'false');
        
        // Announce success to screen readers
        if (window.keyboardNavigation) {
          const fieldName = input.name || input.id.replace('contact-', '');
          window.keyboardNavigation.announceToScreenReader(`${fieldName} is valid`, 'polite');
        }
      } else {
        input.classList.add('error');
        formGroup.classList.add('has-error');
        errorElement.textContent = errorMessage;
        input.setAttribute('aria-invalid', 'true');
        
        // Announce error to screen readers
        if (window.keyboardNavigation) {
          window.keyboardNavigation.announceToScreenReader(`Error: ${errorMessage}`, 'assertive');
        }
      }
    } else {
      // Field is empty - remove validation classes but keep error if it was focused and left empty
      errorElement.textContent = errorMessage;
      if (errorMessage) {
        input.classList.add('error');
        formGroup.classList.add('has-error');
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.setAttribute('aria-invalid', 'false');
      }
    }
  }
  
  validateForm() {
    const nameValid = this.validateField('name');
    const emailValid = this.validateField('email');
    const messageValid = this.validateField('message');
    
    return nameValid && emailValid && messageValid;
  }
  
  updateSubmitButton() {
    const isFormValid = this.isFormValid();
    this.submitBtn.disabled = !isFormValid;
    
    if (isFormValid) {
      this.submitBtn.setAttribute('aria-describedby', '');
    } else {
      this.submitBtn.setAttribute('aria-describedby', 'form-validation-message');
    }
  }
  
  isFormValid() {
    const nameValue = this.nameInput.value.trim();
    const emailValue = this.emailInput.value.trim();
    const messageValue = this.messageInput.value.trim();
    
    const nameValid = nameValue && 
      nameValue.length >= this.validationRules.name.minLength &&
      nameValue.length <= this.validationRules.name.maxLength &&
      this.validationRules.name.pattern.test(nameValue);
      
    const emailValid = emailValue && 
      this.validationRules.email.pattern.test(emailValue);
      
    const messageValid = messageValue && 
      messageValue.length >= this.validationRules.message.minLength &&
      messageValue.length <= this.validationRules.message.maxLength;
    
    return nameValid && emailValid && messageValid;
  }
  
  handleSubmit(e) {
    e.preventDefault();
    
    // Clear any existing status messages
    this.clearStatus();
    
    // Validate entire form
    if (!this.validateForm()) {
      this.showStatus('Please correct the errors above before submitting.', 'error');
      
      // Focus on first invalid field
      const firstError = this.form.querySelector('.error');
      if (firstError) {
        firstError.focus();
      }
      return;
    }
    
    // Show loading state
    this.setLoadingState(true);
    this.showStatus('Sending your message...', 'loading');
    
    // Prepare form data
    const formData = {
      name: this.nameInput.value.trim(),
      email: this.emailInput.value.trim(),
      message: this.messageInput.value.trim(),
      timestamp: new Date().toISOString(),
      source: 'website'
    };
    
    // Submit form via EmailJS
    this.submitViaEmailJS(formData);
  }
  
  async submitViaEmailJS(formData) {
    try {
      // Check if EmailJS is available
      if (typeof emailjs === 'undefined') {
        throw new Error('EmailJS service is not available. Please try again later.');
      }
      
      // Prepare template parameters for EmailJS
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        timestamp: formData.timestamp,
        source: formData.source,
        to_email: 'your-email@gmail.com' // Replace with your Gmail address
      };
      
      // Send email via EmailJS
      const response = await emailjs.send(
        this.emailJSConfig.serviceID,
        this.emailJSConfig.templateID,
        templateParams
      );
      
      // Handle successful submission
      if (response.status === 200) {
        this.setLoadingState(false);
        this.showStatus('Thank you for your message! We\'ll get back to you soon.', 'success');
        this.resetForm();
        
        // Log success for development
        console.log('Email sent successfully:', response);
      } else {
        throw new Error('Failed to send email');
      }
      
    } catch (error) {
      this.handleSubmissionError(error);
    }
  }
  
  handleSubmissionError(error) {
    this.setLoadingState(false);
    
    let errorMessage = 'Sorry, there was a problem sending your message. ';
    
    // Handle specific error types
    if (error.message.includes('EmailJS service is not available')) {
      errorMessage += 'The email service is temporarily unavailable.';
    } else if (error.status === 400) {
      errorMessage += 'Please check your information and try again.';
    } else if (error.status === 403) {
      errorMessage += 'Service access denied. Please contact us directly.';
    } else if (error.status >= 500) {
      errorMessage += 'Server error. Please try again in a few minutes.';
    } else if (!navigator.onLine) {
      errorMessage += 'Please check your internet connection and try again.';
    } else {
      errorMessage += 'Please try again or contact us directly.';
    }
    
    this.showStatus(errorMessage, 'error');
    
    // Add retry button for network errors
    if (!navigator.onLine || error.status >= 500) {
      this.addRetryButton();
    } else {
      // Add fallback contact information for persistent errors
      this.addFallbackContact();
    }
    
    // Log error for development
    console.error('Form submission error:', error);
  }
  
  addRetryButton() {
    // Check if retry button already exists
    if (this.form.querySelector('.retry-button')) return;
    
    const retryButton = document.createElement('button');
    retryButton.type = 'button';
    retryButton.className = 'retry-button';
    retryButton.textContent = 'Try Again';
    retryButton.style.cssText = `
      margin-top: var(--space-3);
      padding: var(--space-2) var(--space-4);
      background-color: var(--color-primary-purple);
      color: var(--color-pure-white);
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    `;
    
    retryButton.addEventListener('click', () => {
      retryButton.remove();
      this.clearStatus();
      
      // Retry form submission
      const formData = {
        name: this.nameInput.value.trim(),
        email: this.emailInput.value.trim(),
        message: this.messageInput.value.trim(),
        timestamp: new Date().toISOString(),
        source: 'website'
      };
      
      this.setLoadingState(true);
      this.showStatus('Sending your message...', 'loading');
      this.submitViaEmailJS(formData);
    });
    
    this.statusDiv.appendChild(retryButton);
  }
  
  addFallbackContact() {
    // Check if fallback info already exists
    if (this.form.querySelector('.fallback-contact')) return;
    
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'fallback-contact';
    fallbackDiv.style.cssText = `
      margin-top: var(--space-3);
      padding: var(--space-3);
      background-color: rgba(107, 70, 193, 0.05);
      border-radius: var(--radius-md);
      border-left: 4px solid var(--color-primary-purple);
      font-size: var(--font-size-sm);
      line-height: var(--line-height-relaxed);
    `;
    
    fallbackDiv.innerHTML = `
      <strong>Alternative Contact:</strong><br>
      You can also reach us directly at:<br>
      <a href="mailto:info@sidequestmarket.com" style="color: var(--color-primary-purple); text-decoration: none;">
        info@sidequestmarket.com
      </a>
    `;
    
    this.statusDiv.appendChild(fallbackDiv);
  }
  
  setLoadingState(isLoading) {
    this.submitBtn.disabled = isLoading;
    
    if (isLoading) {
      this.submitBtn.classList.add('loading');
      this.submitBtn.textContent = 'Sending...';
      this.submitBtn.setAttribute('aria-label', 'Sending message, please wait');
    } else {
      this.submitBtn.classList.remove('loading');
      this.submitBtn.textContent = 'Send Message';
      this.submitBtn.setAttribute('aria-label', 'Send message');
    }
  }
  
  showStatus(message, type) {
    this.statusDiv.textContent = message;
    this.statusDiv.className = `form-status ${type}`;
    
    // Set appropriate ARIA attributes
    if (type === 'error') {
      this.statusDiv.setAttribute('role', 'alert');
    } else {
      this.statusDiv.setAttribute('role', 'status');
    }
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        this.clearStatus();
      }, 5000);
    }
  }
  
  clearStatus() {
    this.statusDiv.textContent = '';
    this.statusDiv.className = 'form-status';
    this.statusDiv.removeAttribute('role');
  }
  
  resetForm() {
    this.form.reset();
    
    // Clear all validation states
    const inputs = [this.nameInput, this.emailInput, this.messageInput];
    inputs.forEach(input => {
      input.classList.remove('error', 'success');
      input.setAttribute('aria-invalid', 'false');
      
      const formGroup = input.closest('.form-group');
      formGroup.classList.remove('has-error', 'has-success');
      
      const errorElement = input.getAttribute('aria-describedby');
      if (errorElement) {
        document.getElementById(errorElement).textContent = '';
      }
    });
    
    this.updateSubmitButton();
  }
  
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Initialize contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ContactForm();
});/**
 * Smooth Scroll Module
 * Handles smooth scrolling to sections, header background transitions,
 * and active section highlighting
 */

class SmoothScroll {
  constructor() {
    this.header = document.querySelector('.site-header');
    this.navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    this.sections = document.querySelectorAll('section[id]');
    this.scrollOffset = 80; // Account for fixed header height
    this.isScrolling = false;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateActiveSection(); // Set initial active section
  }

  bindEvents() {
    // Smooth scroll for navigation links
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Only handle internal links (starting with #)
        if (href && href.startsWith('#')) {
          e.preventDefault();
          this.scrollToSection(href.substring(1));
        }
      });
    });

    // Scroll indicator click handler
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
      scrollIndicator.addEventListener('click', () => {
        this.scrollToSection('event-info');
      });
      
      // Add keyboard support for scroll indicator
      scrollIndicator.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.scrollToSection('event-info');
        }
      });
      
      // Make scroll indicator focusable for keyboard navigation
      scrollIndicator.setAttribute('tabindex', '0');
      scrollIndicator.setAttribute('role', 'button');
      scrollIndicator.setAttribute('aria-label', 'Scroll to event information');
    }

    // Header background transition on scroll
    window.addEventListener('scroll', () => {
      this.handleScroll();
    });

    // Update active section on scroll (throttled)
    let scrollTimer = null;
    window.addEventListener('scroll', () => {
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
      
      scrollTimer = setTimeout(() => {
        if (!this.isScrolling) {
          this.updateActiveSection();
        }
      }, 100);
    });
  }

  scrollToSection(targetId) {
    const targetSection = document.getElementById(targetId);
    
    if (!targetSection) {
      console.warn(`Section with id "${targetId}" not found`);
      return;
    }

    this.isScrolling = true;
    
    // Calculate scroll position accounting for fixed header
    const targetPosition = targetSection.offsetTop - this.scrollOffset;
    
    // Smooth scroll to target
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    // Update active link immediately for better UX
    if (window.navigation) {
      window.navigation.updateActiveLink(targetId);
    }

    // Reset scrolling flag after animation completes
    setTimeout(() => {
      this.isScrolling = false;
      this.updateActiveSection(); // Ensure correct section is active
    }, 1000);
  }

  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add/remove scrolled class for header background transition
    if (scrollTop > 50) {
      this.header.classList.add('scrolled');
    } else {
      this.header.classList.remove('scrolled');
    }
  }

  updateActiveSection() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPosition = scrollTop + this.scrollOffset + 100; // Add buffer for better detection
    
    let activeSection = null;
    
    // Find the current section based on scroll position
    this.sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        activeSection = section.id;
      }
    });

    // If we're at the very top, make sure hero is active
    if (scrollTop < 100) {
      activeSection = 'hero';
    }

    // If we're near the bottom, make sure the last section is active
    if ((window.innerHeight + scrollTop) >= document.body.offsetHeight - 100) {
      const lastSection = this.sections[this.sections.length - 1];
      if (lastSection) {
        activeSection = lastSection.id;
      }
    }

    // Update active navigation link
    if (activeSection && window.navigation) {
      window.navigation.updateActiveLink(activeSection);
    }
  }

  // Public method to scroll to a specific section (for external use)
  scrollTo(sectionId) {
    this.scrollToSection(sectionId);
  }
}

// Initialize smooth scroll when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.smoothScroll = new SmoothScroll();
});