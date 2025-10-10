/**
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
      'assets/Full logo/Logo transparent-03.png',
      'assets/Banners/Side quest market [facebook banner].jpg'
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

export default imageLazyLoader;