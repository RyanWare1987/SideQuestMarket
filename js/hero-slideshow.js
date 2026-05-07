/**
 * Hero Banner Slideshow
 * Auto-rotating image slideshow for desktop and mobile hero sections.
 * Desktop (>=768px): 6 landscape banners
 * Mobile (<768px): 9 portrait banners
 */

/**
 * Advances the slideshow to the next slide within the given container.
 * Finds the currently active slide, removes the active class, and adds
 * the active class to the next sibling slide (wraps to first if at end).
 * @param {HTMLElement} container - The slideshow container element
 */
function advanceSlide(container) {
  var activeSlide = container.querySelector('.slideshow-slide.active');
  if (!activeSlide) return;

  activeSlide.classList.remove('active');

  var nextSlide = activeSlide.nextElementSibling;
  if (!nextSlide || !nextSlide.classList.contains('slideshow-slide')) {
    nextSlide = container.querySelector('.slideshow-slide');
  }

  nextSlide.classList.add('active');
}

/**
 * Returns the currently visible slideshow container based on viewport width.
 * Desktop (>=768px) returns the desktop-slideshow container.
 * Mobile (<768px) returns the mobile-slideshow container.
 * @returns {HTMLElement|null} The active slideshow container
 */
function getActiveSlideshow() {
  if (window.innerWidth >= 768) {
    return document.getElementById('desktop-slideshow');
  }
  return document.getElementById('mobile-slideshow');
}

/**
 * Initializes the slideshow auto-rotation.
 * Sets up a 5-second interval that advances the currently visible slideshow.
 */
function initSlideshow() {
  setInterval(function () {
    var activeContainer = getActiveSlideshow();
    if (activeContainer) {
      advanceSlide(activeContainer);
    }
  }, 5000);
}

document.addEventListener('DOMContentLoaded', initSlideshow);
