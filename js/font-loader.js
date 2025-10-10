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
export { FontLoader, preloadFonts, initFontLoader };