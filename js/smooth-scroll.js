/**
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