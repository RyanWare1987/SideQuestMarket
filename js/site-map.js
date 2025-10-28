/**
 * Site Map Interactive Modal
 * Handles modal display, zoom, pan, and touch gestures
 */

class SiteMapModal {
  constructor() {
    this.modal = document.getElementById('site-map-modal');
    this.modalImage = document.getElementById('modal-site-map-image');
    this.zoomContainer = document.getElementById('zoom-container');
    this.siteMapImage = document.getElementById('site-map-image');
    this.closeBtn = document.getElementById('close-modal');
    this.zoomInBtn = document.getElementById('zoom-in');
    this.zoomOutBtn = document.getElementById('zoom-out');
    this.zoomResetBtn = document.getElementById('zoom-reset');
    
    this.currentZoom = 1;
    this.minZoom = 0.5;
    this.maxZoom = 3;
    this.zoomStep = 0.25;
    
    // Pan variables
    this.isPanning = false;
    this.startX = 0;
    this.startY = 0;
    this.scrollLeft = 0;
    this.scrollTop = 0;
    
    // Touch variables for mobile
    this.initialDistance = 0;
    this.initialZoom = 1;
    this.touches = [];
    
    this.init();
  }
  
  init() {
    if (!this.modal || !this.modalImage || !this.siteMapImage) {
      console.warn('Site map elements not found');
      return;
    }
    
    this.setupEventListeners();
    this.setupTouchGestures();
    this.setupKeyboardNavigation();
  }
  
  setupEventListeners() {
    // Open modal when clicking site map image
    this.siteMapImage.addEventListener('click', () => this.openModal());
    this.siteMapImage.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openModal();
      }
    });
    
    // Close modal events
    this.closeBtn.addEventListener('click', () => this.closeModal());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal || e.target.classList.contains('site-map-modal-overlay')) {
        this.closeModal();
      }
    });
    
    // Zoom controls
    this.zoomInBtn.addEventListener('click', () => this.zoomIn());
    this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
    this.zoomResetBtn.addEventListener('click', () => this.resetZoom());
    
    // Mouse wheel zoom
    this.zoomContainer.addEventListener('wheel', (e) => this.handleWheel(e));
    
    // Pan functionality
    this.zoomContainer.addEventListener('mousedown', (e) => this.startPan(e));
    this.zoomContainer.addEventListener('mousemove', (e) => this.handlePan(e));
    this.zoomContainer.addEventListener('mouseup', () => this.endPan());
    this.zoomContainer.addEventListener('mouseleave', () => this.endPan());
    
    // Prevent context menu on right click during pan
    this.zoomContainer.addEventListener('contextmenu', (e) => {
      if (this.isPanning) {
        e.preventDefault();
      }
    });
  }
  
  setupTouchGestures() {
    // Touch events for mobile pinch-to-zoom and pan
    this.zoomContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.zoomContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.zoomContainer.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
  }
  
  setupKeyboardNavigation() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (!this.modal.classList.contains('active')) return;
      
      switch (e.key) {
        case 'Escape':
          this.closeModal();
          break;
        case '+':
        case '=':
          e.preventDefault();
          this.zoomIn();
          break;
        case '-':
          e.preventDefault();
          this.zoomOut();
          break;
        case '0':
          e.preventDefault();
          this.resetZoom();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.zoomContainer.scrollLeft -= 50;
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.zoomContainer.scrollLeft += 50;
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.zoomContainer.scrollTop -= 50;
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.zoomContainer.scrollTop += 50;
          break;
      }
    });
  }
  
  openModal() {
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus the close button for accessibility
    setTimeout(() => {
      this.closeBtn.focus();
    }, 100);
    
    // Reset zoom when opening
    this.resetZoom();
  }
  
  closeModal() {
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Return focus to the original image
    this.siteMapImage.focus();
  }
  
  zoomIn() {
    if (this.currentZoom < this.maxZoom) {
      this.currentZoom = Math.min(this.currentZoom + this.zoomStep, this.maxZoom);
      this.applyZoom();
    }
  }
  
  zoomOut() {
    if (this.currentZoom > this.minZoom) {
      this.currentZoom = Math.max(this.currentZoom - this.zoomStep, this.minZoom);
      this.applyZoom();
    }
  }
  
  resetZoom() {
    this.currentZoom = 1;
    this.applyZoom();
    this.zoomContainer.scrollTop = 0;
    this.zoomContainer.scrollLeft = 0;
  }
  
  applyZoom() {
    this.modalImage.style.transform = `scale(${this.currentZoom})`;
    
    // Update container class for styling
    if (this.currentZoom > 1) {
      this.zoomContainer.classList.add('zoomed');
    } else {
      this.zoomContainer.classList.remove('zoomed');
    }
    
    // Update button states
    this.zoomInBtn.disabled = this.currentZoom >= this.maxZoom;
    this.zoomOutBtn.disabled = this.currentZoom <= this.minZoom;
  }
  
  handleWheel(e) {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.currentZoom + delta));
    
    if (newZoom !== this.currentZoom) {
      this.currentZoom = newZoom;
      this.applyZoom();
    }
  }
  
  startPan(e) {
    if (this.currentZoom <= 1) return;
    
    this.isPanning = true;
    this.startX = e.pageX - this.zoomContainer.offsetLeft;
    this.startY = e.pageY - this.zoomContainer.offsetTop;
    this.scrollLeft = this.zoomContainer.scrollLeft;
    this.scrollTop = this.zoomContainer.scrollTop;
    
    this.zoomContainer.style.cursor = 'grabbing';
    e.preventDefault();
  }
  
  handlePan(e) {
    if (!this.isPanning) return;
    
    e.preventDefault();
    const x = e.pageX - this.zoomContainer.offsetLeft;
    const y = e.pageY - this.zoomContainer.offsetTop;
    const walkX = (x - this.startX) * 2;
    const walkY = (y - this.startY) * 2;
    
    this.zoomContainer.scrollLeft = this.scrollLeft - walkX;
    this.zoomContainer.scrollTop = this.scrollTop - walkY;
  }
  
  endPan() {
    this.isPanning = false;
    this.zoomContainer.style.cursor = this.currentZoom > 1 ? 'grab' : 'default';
  }
  
  handleTouchStart(e) {
    this.touches = Array.from(e.touches);
    
    if (this.touches.length === 2) {
      // Two finger pinch
      e.preventDefault();
      this.initialDistance = this.getDistance(this.touches[0], this.touches[1]);
      this.initialZoom = this.currentZoom;
    } else if (this.touches.length === 1 && this.currentZoom > 1) {
      // Single finger pan (when zoomed)
      this.startX = this.touches[0].pageX;
      this.startY = this.touches[0].pageY;
      this.scrollLeft = this.zoomContainer.scrollLeft;
      this.scrollTop = this.zoomContainer.scrollTop;
      this.isPanning = true;
    }
  }
  
  handleTouchMove(e) {
    this.touches = Array.from(e.touches);
    
    if (this.touches.length === 2) {
      // Pinch to zoom
      e.preventDefault();
      const currentDistance = this.getDistance(this.touches[0], this.touches[1]);
      const scale = currentDistance / this.initialDistance;
      const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.initialZoom * scale));
      
      if (newZoom !== this.currentZoom) {
        this.currentZoom = newZoom;
        this.applyZoom();
      }
    } else if (this.touches.length === 1 && this.isPanning) {
      // Pan with single finger
      e.preventDefault();
      const walkX = (this.startX - this.touches[0].pageX) * 2;
      const walkY = (this.startY - this.touches[0].pageY) * 2;
      
      this.zoomContainer.scrollLeft = this.scrollLeft + walkX;
      this.zoomContainer.scrollTop = this.scrollTop + walkY;
    }
  }
  
  handleTouchEnd(e) {
    this.touches = Array.from(e.touches);
    
    if (this.touches.length < 2) {
      this.initialDistance = 0;
      this.initialZoom = this.currentZoom;
    }
    
    if (this.touches.length === 0) {
      this.isPanning = false;
    }
  }
  
  getDistance(touch1, touch2) {
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  // Public method to open modal (for external use)
  open() {
    this.openModal();
  }
  
  // Public method to close modal (for external use)
  close() {
    this.closeModal();
  }
}

// Initialize site map modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('site-map-modal')) {
    window.siteMapModal = new SiteMapModal();
  }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SiteMapModal;
}