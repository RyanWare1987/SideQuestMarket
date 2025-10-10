/**
 * Accessibility Testing and Validation Module
 * Provides automated accessibility checks and reporting
 * This module is for development/testing purposes
 */

class AccessibilityTester {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passes = [];
    this.testResults = {
      headingHierarchy: false,
      altText: false,
      ariaLabels: false,
      keyboardNavigation: false,
      colorContrast: false,
      focusManagement: false
    };
    
    this.init();
  }

  init() {
    // Only run in development mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      this.runAccessibilityTests();
    }
  }

  runAccessibilityTests() {
    console.group('🔍 Accessibility Test Results');
    
    this.testHeadingHierarchy();
    this.testAltText();
    this.testAriaLabels();
    this.testKeyboardNavigation();
    this.testColorContrast();
    this.testFocusManagement();
    this.testFormAccessibility();
    this.testLandmarks();
    
    this.reportResults();
    console.groupEnd();
  }

  testHeadingHierarchy() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    let hierarchyValid = true;
    
    headings.forEach((heading, index) => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      
      if (index === 0 && currentLevel !== 1) {
        this.addIssue('First heading should be h1', heading);
        hierarchyValid = false;
      }
      
      if (currentLevel > previousLevel + 1) {
        this.addIssue(`Heading level jumps from h${previousLevel} to h${currentLevel}`, heading);
        hierarchyValid = false;
      }
      
      if (!heading.textContent.trim()) {
        this.addIssue('Empty heading found', heading);
        hierarchyValid = false;
      }
      
      previousLevel = currentLevel;
    });
    
    this.testResults.headingHierarchy = hierarchyValid;
    
    if (hierarchyValid) {
      this.addPass(`Heading hierarchy is correct (${headings.length} headings)`);
    }
  }

  testAltText() {
    const images = document.querySelectorAll('img');
    const decorativeImages = document.querySelectorAll('[role="img"]');
    let altTextValid = true;
    
    // Test regular img elements
    images.forEach(img => {
      if (!img.hasAttribute('alt')) {
        this.addIssue('Image missing alt attribute', img);
        altTextValid = false;
      } else if (img.alt === '' && !img.hasAttribute('aria-hidden')) {
        this.addWarning('Empty alt text - ensure image is decorative', img);
      }
    });
    
    // Test decorative images with role="img"
    decorativeImages.forEach(img => {
      if (!img.hasAttribute('aria-label') && !img.hasAttribute('aria-labelledby')) {
        this.addIssue('Element with role="img" missing aria-label', img);
        altTextValid = false;
      }
    });
    
    this.testResults.altText = altTextValid;
    
    if (altTextValid) {
      this.addPass(`Alt text implementation is correct (${images.length + decorativeImages.length} images checked)`);
    }
  }

  testAriaLabels() {
    const interactiveElements = document.querySelectorAll('button, a, input, textarea, select, [role="button"], [role="link"]');
    let ariaValid = true;
    
    interactiveElements.forEach(element => {
      const hasLabel = element.hasAttribute('aria-label') || 
                      element.hasAttribute('aria-labelledby') ||
                      element.textContent.trim() ||
                      (element.tagName === 'INPUT' && element.labels && element.labels.length > 0);
      
      if (!hasLabel) {
        this.addIssue('Interactive element missing accessible name', element);
        ariaValid = false;
      }
      
      // Check for proper ARIA attributes
      if (element.hasAttribute('aria-expanded') && !['true', 'false'].includes(element.getAttribute('aria-expanded'))) {
        this.addIssue('Invalid aria-expanded value', element);
        ariaValid = false;
      }
      
      if (element.hasAttribute('aria-hidden') && element.getAttribute('aria-hidden') === 'true' && element.tabIndex >= 0) {
        this.addIssue('Focusable element should not have aria-hidden="true"', element);
        ariaValid = false;
      }
    });
    
    this.testResults.ariaLabels = ariaValid;
    
    if (ariaValid) {
      this.addPass(`ARIA labels are properly implemented (${interactiveElements.length} elements checked)`);
    }
  }

  testKeyboardNavigation() {
    const focusableElements = document.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    let keyboardValid = true;
    
    focusableElements.forEach(element => {
      // Check if element is visible
      const style = window.getComputedStyle(element);
      const isVisible = style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       element.offsetParent !== null;
      
      if (isVisible && element.tabIndex < 0 && !element.hasAttribute('aria-hidden')) {
        this.addWarning('Visible interactive element not in tab order', element);
      }
      
      // Check for skip links
      const skipLinks = document.querySelectorAll('.skip-link');
      if (skipLinks.length === 0) {
        this.addIssue('No skip links found');
        keyboardValid = false;
      }
    });
    
    this.testResults.keyboardNavigation = keyboardValid;
    
    if (keyboardValid) {
      this.addPass(`Keyboard navigation is properly implemented (${focusableElements.length} focusable elements)`);
    }
  }

  testColorContrast() {
    // This is a simplified contrast test - in production, use tools like axe-core
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, label, span');
    let contrastValid = true;
    
    textElements.forEach(element => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      // Check for transparent or same color text (simplified check)
      if (color === backgroundColor) {
        this.addIssue('Text color same as background color', element);
        contrastValid = false;
      }
    });
    
    this.testResults.colorContrast = contrastValid;
    
    if (contrastValid) {
      this.addPass('Basic color contrast checks passed');
    }
  }

  testFocusManagement() {
    let focusValid = true;
    
    // Check for focus indicators
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select');
    
    focusableElements.forEach(element => {
      // Simulate focus to check for focus indicators
      element.focus();
      const style = window.getComputedStyle(element, ':focus');
      
      // Check if element has focus styles (outline or box-shadow)
      if (style.outline === 'none' && !style.boxShadow.includes('rgb')) {
        this.addWarning('Element may lack visible focus indicator', element);
      }
    });
    
    // Check for focus traps in modals
    const modals = document.querySelectorAll('[role="dialog"], .modal, .mobile-nav');
    modals.forEach(modal => {
      const focusableInModal = modal.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
      if (focusableInModal.length === 0) {
        this.addWarning('Modal/overlay contains no focusable elements', modal);
      }
    });
    
    this.testResults.focusManagement = focusValid;
    
    if (focusValid) {
      this.addPass('Focus management appears to be implemented correctly');
    }
  }

  testFormAccessibility() {
    const forms = document.querySelectorAll('form');
    let formValid = true;
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        // Check for labels
        const hasLabel = input.labels && input.labels.length > 0 ||
                        input.hasAttribute('aria-label') ||
                        input.hasAttribute('aria-labelledby');
        
        if (!hasLabel) {
          this.addIssue('Form input missing label', input);
          formValid = false;
        }
        
        // Check for error message association
        if (input.hasAttribute('aria-describedby')) {
          const describedBy = input.getAttribute('aria-describedby');
          const errorElement = document.getElementById(describedBy);
          if (!errorElement) {
            this.addIssue('aria-describedby references non-existent element', input);
            formValid = false;
          }
        }
        
        // Check required fields
        if (input.hasAttribute('required') && !input.hasAttribute('aria-required')) {
          this.addWarning('Required field should have aria-required="true"', input);
        }
      });
    });
    
    if (formValid) {
      this.addPass(`Form accessibility is properly implemented (${forms.length} forms checked)`);
    }
  }

  testLandmarks() {
    const landmarks = {
      banner: document.querySelectorAll('[role="banner"], header'),
      main: document.querySelectorAll('[role="main"], main'),
      contentinfo: document.querySelectorAll('[role="contentinfo"], footer'),
      navigation: document.querySelectorAll('[role="navigation"], nav')
    };
    
    let landmarksValid = true;
    
    // Check for required landmarks
    if (landmarks.banner.length === 0) {
      this.addIssue('Missing banner landmark');
      landmarksValid = false;
    }
    
    if (landmarks.main.length === 0) {
      this.addIssue('Missing main landmark');
      landmarksValid = false;
    }
    
    if (landmarks.contentinfo.length === 0) {
      this.addIssue('Missing contentinfo landmark');
      landmarksValid = false;
    }
    
    // Check for multiple main landmarks
    if (landmarks.main.length > 1) {
      this.addIssue('Multiple main landmarks found');
      landmarksValid = false;
    }
    
    if (landmarksValid) {
      this.addPass('Page landmarks are properly implemented');
    }
  }

  addIssue(message, element = null) {
    this.issues.push({ message, element });
    console.error('❌', message, element);
  }

  addWarning(message, element = null) {
    this.warnings.push({ message, element });
    console.warn('⚠️', message, element);
  }

  addPass(message) {
    this.passes.push(message);
    console.log('✅', message);
  }

  reportResults() {
    console.log('\n📊 Accessibility Test Summary:');
    console.log(`✅ Passes: ${this.passes.length}`);
    console.log(`⚠️ Warnings: ${this.warnings.length}`);
    console.log(`❌ Issues: ${this.issues.length}`);
    
    const totalTests = Object.keys(this.testResults).length;
    const passedTests = Object.values(this.testResults).filter(result => result === true).length;
    const score = Math.round((passedTests / totalTests) * 100);
    
    console.log(`\n🎯 Accessibility Score: ${score}%`);
    
    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('🎉 All accessibility tests passed!');
    } else if (this.issues.length === 0) {
      console.log('✨ No critical accessibility issues found. Review warnings for improvements.');
    } else {
      console.log('🔧 Please address the accessibility issues found above.');
    }
    
    // Store results for external access
    window.accessibilityTestResults = {
      issues: this.issues,
      warnings: this.warnings,
      passes: this.passes,
      score: score,
      testResults: this.testResults
    };
  }

  // Public method to run tests manually
  runTests() {
    this.issues = [];
    this.warnings = [];
    this.passes = [];
    this.runAccessibilityTests();
  }

  // Public method to get current results
  getResults() {
    return {
      issues: this.issues,
      warnings: this.warnings,
      passes: this.passes,
      testResults: this.testResults
    };
  }
}

// Initialize accessibility tester when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for other scripts to initialize
  setTimeout(() => {
    window.accessibilityTester = new AccessibilityTester();
  }, 1000);
});

// Export for manual testing
window.runAccessibilityTests = () => {
  if (window.accessibilityTester) {
    window.accessibilityTester.runTests();
  } else {
    console.log('Accessibility tester not initialized yet. Please wait and try again.');
  }
};