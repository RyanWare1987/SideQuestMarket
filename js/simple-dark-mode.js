/**
 * Simple Dark Mode Toggle
 * Basic implementation that definitely works
 */

// Simple dark mode functionality
function initDarkMode() {
  console.log('Initializing simple dark mode...');
  
  const toggleButton = document.querySelector('.dark-mode-toggle');
  const icon = document.querySelector('.dark-mode-icon');
  
  if (!toggleButton || !icon) {
    console.log('Dark mode elements not found');
    return;
  }
  
  console.log('Dark mode elements found');
  
  // Set initial state (always start in light mode)
  document.body.classList.remove('dark-mode');
  icon.textContent = '🌙';
  
  // Load saved preference
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode === 'true') {
    enableDarkMode();
  }
  
  // Add click handler
  toggleButton.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('Dark mode button clicked');
    toggleDarkMode();
  });
  
  console.log('Dark mode initialized successfully');
}

function toggleDarkMode() {
  const isDark = document.body.classList.contains('dark-mode');
  console.log('Current mode:', isDark ? 'dark' : 'light');
  
  if (isDark) {
    disableDarkMode();
  } else {
    enableDarkMode();
  }
}

function enableDarkMode() {
  console.log('Enabling dark mode');
  document.body.classList.add('dark-mode');
  
  const icon = document.querySelector('.dark-mode-icon');
  if (icon) {
    icon.textContent = '☀️';
  }
  
  localStorage.setItem('darkMode', 'true');
}

function disableDarkMode() {
  console.log('Disabling dark mode');
  document.body.classList.remove('dark-mode');
  
  const icon = document.querySelector('.dark-mode-icon');
  if (icon) {
    icon.textContent = '🌙';
  }
  
  localStorage.setItem('darkMode', 'false');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDarkMode);
} else {
  initDarkMode();
}

// Global functions for testing
window.testDarkMode = function() {
  toggleDarkMode();
};

window.forceLightMode = function() {
  disableDarkMode();
};

window.forceDarkMode = function() {
  enableDarkMode();
};