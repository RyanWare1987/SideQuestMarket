/**
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
});