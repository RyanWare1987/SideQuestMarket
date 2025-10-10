/**
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
});