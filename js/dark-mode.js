/**
 * Dark Mode Toggle Module
 * Handles switching between light and dark themes
 * Persists user preference in localStorage
 */

class DarkModeToggle {
  constructor() {
    this.toggleButton = null;
    this.darkModeClass = 'dark-mode';
    this.storageKey = 'side-quest-dark-mode';
    this.prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  }

  /**
   * Initialize dark mode functionality
   */
  init() {
    this.createToggleButton();
    this.loadUserPreference();
    this.setupEventListeners();
    this.updateToggleIcon();
  }

  /**
   * Create or find the dark mode toggle button
   */
  createToggleButton() {
    this.toggleButton = document.querySelector('.dark-mode-toggle');
    
    if (!this.toggleButton) {
      console.warn('Dark mode toggle button not found');
      return;
    }

    // Ensure proper accessibility attributes
    this.toggleButton.setAttribute('role', 'switch');
    this.toggleButton.setAttribute('aria-checked', 'false');
  }

  /**
   * Load user's dark mode preference
   */
  loadUserPreference() {
    const savedPreference = localStorage.getItem(this.storageKey);
    let shouldEnableDarkMode = false;

    if (savedPreference !== null) {
      // Use saved preference
      shouldEnableDarkMode = savedPreference === 'true';
    } else {
      // Use system preference
      shouldEnableDarkMode = this.prefersDarkScheme.matches;
    }

    if (shouldEnableDarkMode) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => {
        this.toggleDarkMode();
      });

      // Handle keyboard activation
      this.toggleButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleDarkMode();
        }
      });
    }

    // Listen for system theme changes
    this.prefersDarkScheme.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't set a manual preference
      const savedPreference = localStorage.getItem(this.storageKey);
      if (savedPreference === null) {
        if (e.matches) {
          this.enableDarkMode();
        } else {
          this.disableDarkMode();
        }
      }
    });
  }

  /**
   * Toggle between light and dark modes
   */
  toggleDarkMode() {
    const isDarkMode = document.body.classList.contains(this.darkModeClass);
    
    if (isDarkMode) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }

    // Save user preference
    localStorage.setItem(this.storageKey, (!isDarkMode).toString());
    
    // Announce change to screen readers
    this.announceChange(!isDarkMode);
  }

  /**
   * Enable dark mode
   */
  enableDarkMode() {
    document.body.classList.add(this.darkModeClass);
    this.updateToggleIcon(true);
    
    if (this.toggleButton) {
      this.toggleButton.setAttribute('aria-checked', 'true');
      this.toggleButton.setAttribute('aria-label', 'Switch to light mode');
    }

    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('darkModeEnabled', {
      bubbles: true,
      detail: { darkMode: true }
    }));
  }

  /**
   * Disable dark mode
   */
  disableDarkMode() {
    document.body.classList.remove(this.darkModeClass);
    this.updateToggleIcon(false);
    
    if (this.toggleButton) {
      this.toggleButton.setAttribute('aria-checked', 'false');
      this.toggleButton.setAttribute('aria-label', 'Switch to dark mode');
    }

    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('darkModeDisabled', {
      bubbles: true,
      detail: { darkMode: false }
    }));
  }

  /**
   * Update the toggle button icon
   */
  updateToggleIcon(isDarkMode = null) {
    if (!this.toggleButton) return;

    const icon = this.toggleButton.querySelector('.dark-mode-icon');
    if (!icon) return;

    if (isDarkMode === null) {
      isDarkMode = document.body.classList.contains(this.darkModeClass);
    }

    // Update icon
    icon.textContent = isDarkMode ? '☀️' : '🌙';
    
    // Update tooltip
    const description = this.toggleButton.querySelector('.sr-only');
    if (description) {
      description.textContent = isDarkMode 
        ? 'Switch to light theme' 
        : 'Switch to dark theme';
    }
    
    // Update button aria-label
    this.toggleButton.setAttribute('aria-label', isDarkMode 
      ? 'Switch to light mode' 
      : 'Switch to dark mode');
  }

  /**
   * Announce theme change to screen readers
   */
  announceChange(isDarkMode) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = isDarkMode 
      ? 'Dark mode enabled' 
      : 'Light mode enabled';
    
    document.body.appendChild(announcement);
    
    // Remove announcement after screen readers have processed it
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Get current dark mode state
   */
  isDarkMode() {
    return document.body.classList.contains(this.darkModeClass);
  }

  /**
   * Programmatically set dark mode state
   */
  setDarkMode(enabled) {
    if (enabled) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
    
    // Save preference
    localStorage.setItem(this.storageKey, enabled.toString());
  }

  /**
   * Reset to system preference
   */
  resetToSystemPreference() {
    localStorage.removeItem(this.storageKey);
    
    if (this.prefersDarkScheme.matches) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
  }
}

// Initialize and export
const darkModeToggle = new DarkModeToggle();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    darkModeToggle.init();
  });
} else {
  darkModeToggle.init();
}

// Simple test function to verify dark mode is working
window.testDarkMode = function() {
  document.body.classList.toggle('dark-mode');
  console.log('Dark mode toggled manually');
};

export default darkModeToggle;