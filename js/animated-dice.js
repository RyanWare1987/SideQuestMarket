/**
 * Animated Dice Background
 * Creates subtle falling dice animation in the background
 */

class AnimatedDiceBackground {
  constructor() {
    this.container = null;
    this.diceCount = 12;
    this.isActive = true;
    this.resizeTimeout = null;
  }

  /**
   * Initialize the animated dice background
   */
  init() {
    console.log('Initializing animated dice background...');
    this.createContainer();
    this.generateDice();
    this.setupEventListeners();
    
    // Start after a short delay to let the page load
    setTimeout(() => {
      console.log('Starting dice animation...');
      this.startAnimation();
    }, 1000);
  }

  /**
   * Create the dice background container
   */
  createContainer() {
    console.log('Creating dice container...');
    
    // Remove existing container if it exists
    const existing = document.querySelector('.dice-background');
    if (existing) {
      existing.remove();
    }

    this.container = document.createElement('div');
    this.container.className = 'dice-background';
    this.container.setAttribute('aria-hidden', 'true');
    
    // Insert after the main content to ensure proper z-index
    const main = document.querySelector('main');
    if (main) {
      main.parentNode.insertBefore(this.container, main.nextSibling);
      console.log('Dice container added after main element');
    } else {
      document.body.appendChild(this.container);
      console.log('Dice container added to body');
    }
  }

  /**
   * Generate falling dice elements
   */
  generateDice() {
    if (!this.container) {
      console.log('No container found for dice generation');
      return;
    }

    console.log(`Generating ${this.diceCount} dice...`);

    // Clear existing dice
    this.container.innerHTML = '';

    for (let i = 0; i < this.diceCount; i++) {
      const dice = this.createDice(i);
      this.container.appendChild(dice);
    }
    
    console.log(`Generated ${this.container.children.length} dice elements`);
  }

  /**
   * Create individual dice element
   */
  createDice(index) {
    const dice = document.createElement('div');
    dice.className = 'falling-dice';
    
    // Add size variation
    const sizes = ['small', 'medium', 'large'];
    const sizeClass = sizes[Math.floor(Math.random() * sizes.length)];
    dice.classList.add(sizeClass);
    
    // Add animation variation
    const animations = ['fall-1', 'fall-2', 'fall-3'];
    const animationClass = animations[Math.floor(Math.random() * animations.length)];
    dice.classList.add(animationClass);
    
    // Random horizontal position
    const leftPosition = Math.random() * 100;
    dice.style.left = `${leftPosition}%`;
    
    // Random animation duration (within range)
    const baseDuration = animationClass === 'fall-1' ? 12 : 
                        animationClass === 'fall-2' ? 15 : 18;
    const variation = (Math.random() - 0.5) * 4; // ±2 seconds
    const duration = Math.max(8, baseDuration + variation);
    dice.style.animationDuration = `${duration}s`;
    
    // Random delay
    const delay = Math.random() * 12;
    dice.style.animationDelay = `${delay}s`;
    
    return dice;
  }

  /**
   * Start the animation
   */
  startAnimation() {
    if (this.container) {
      this.container.style.opacity = '1';
      this.isActive = true;
    }
  }

  /**
   * Stop the animation
   */
  stopAnimation() {
    if (this.container) {
      this.container.style.opacity = '0';
      this.isActive = false;
    }
  }

  /**
   * Toggle animation on/off
   */
  toggleAnimation() {
    if (this.isActive) {
      this.stopAnimation();
    } else {
      this.startAnimation();
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Regenerate dice on window resize (debounced)
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.generateDice();
      }, 250);
    });

    // Listen for dark mode changes to adjust opacity
    document.addEventListener('darkModeEnabled', () => {
      this.updateDiceForDarkMode(true);
    });

    document.addEventListener('darkModeDisabled', () => {
      this.updateDiceForDarkMode(false);
    });

    // Pause animation when page is not visible (performance)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopAnimation();
      } else {
        this.startAnimation();
      }
    });
  }

  /**
   * Update dice styling for dark mode
   */
  updateDiceForDarkMode(isDarkMode) {
    const dice = document.querySelectorAll('.falling-dice');
    dice.forEach(die => {
      // Force a reflow to update the styling
      die.style.opacity = isDarkMode ? '0.12' : '0.08';
      setTimeout(() => {
        die.style.opacity = '';
      }, 100);
    });
  }

  /**
   * Adjust dice count based on screen size
   */
  getOptimalDiceCount() {
    const width = window.innerWidth;
    if (width < 768) {
      return 8; // Fewer dice on mobile
    } else if (width < 1024) {
      return 10; // Medium amount on tablet
    } else {
      return 12; // Full amount on desktop
    }
  }

  /**
   * Update dice count for current screen size
   */
  updateDiceCount() {
    const newCount = this.getOptimalDiceCount();
    if (newCount !== this.diceCount) {
      this.diceCount = newCount;
      this.generateDice();
    }
  }

  /**
   * Destroy the dice background
   */
  destroy() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}

// Initialize the animated dice background
const animatedDice = new AnimatedDiceBackground();

// Initialize the animated dice background
const animatedDice = new AnimatedDiceBackground();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing dice...');
    setTimeout(function() {
      animatedDice.init();
    }, 1000);
  });
} else {
  console.log('DOM already loaded, initializing dice...');
  setTimeout(function() {
    animatedDice.init();
  }, 1000);
}

// Global functions for testing/control
window.toggleDiceAnimation = function() {
  animatedDice.toggleAnimation();
};

window.regenerateDice = function() {
  animatedDice.generateDice();
};

window.testDice = function() {
  console.log('Testing dice visibility...');
  
  // Create a highly visible test dice
  const testDice = document.createElement('div');
  testDice.style.cssText = 'position: fixed; top: 100px; left: 50%; width: 64px; height: 64px; background-image: url("assets/Dice/Dice-white.png"); background-size: contain; background-repeat: no-repeat; background-position: center; opacity: 0.8; z-index: 1000; border: 2px solid red; animation: fallAndRotate 5s linear infinite;';
  
  document.body.appendChild(testDice);
  
  setTimeout(function() {
    if (document.body.contains(testDice)) {
      document.body.removeChild(testDice);
    }
  }, 5000);
  
  console.log('Test dice created for 5 seconds');
};

// Simple test to create dice immediately
window.createTestDiceNow = function() {
  const container = document.createElement('div');
  container.className = 'dice-background';
  container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1000;';
  
  for (let i = 0; i < 5; i++) {
    const dice = document.createElement('div');
    dice.style.cssText = `
      position: absolute;
      width: 32px;
      height: 32px;
      background-image: url('assets/Dice/Dice-white.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      opacity: 0.8;
      left: ${20 + i * 15}%;
      top: 100px;
      animation: fallAndRotate 8s linear infinite;
      animation-delay: ${i * 0.5}s;
      border: 1px solid blue;
    `;
    container.appendChild(dice);
  }
  
  document.body.appendChild(container);
  console.log('Test dice container created');
};