/**
 * Judges Carousel Functionality
 * Handles the judges carousel in the competition section
 */

class JudgesCarousel {
    constructor() {
        this.track = document.getElementById('judges-track');
        this.prevBtn = document.querySelector('.judges-carousel-prev');
        this.nextBtn = document.querySelector('.judges-carousel-next');
        this.modal = document.getElementById('judge-modal');
        this.modalImage = document.getElementById('judge-modal-image');
        this.modalClose = document.getElementById('close-judge-modal');
        this.modalOverlay = document.querySelector('.judge-modal-overlay');
        this.currentIndex = 0;
        this.totalItems = 0;
        
        if (this.track) {
            this.init();
        }
    }

    init() {
        this.totalItems = this.track.children.length;
        this.setupEventListeners();
        this.updateButtons();
        this.setupModalEventListeners();
    }

    setupEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.goToPrevious());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.goToNext());
        }

        // Touch/swipe support
        this.setupTouchEvents();
        
        // Image click for modal (mobile only)
        this.setupImageClickEvents();
    }

    setupImageClickEvents() {
        const judgeImages = this.track.querySelectorAll('.judge-image');
        judgeImages.forEach(image => {
            image.addEventListener('click', (e) => {
                // Only open modal on mobile devices
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openModal(image.src, image.alt);
                }
            });
            
            // Add cursor pointer on mobile
            if (window.innerWidth <= 768) {
                image.style.cursor = 'pointer';
            }
        });
    }

    setupModalEventListeners() {
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.closeModal());
        }
        
        if (this.modalOverlay) {
            this.modalOverlay.addEventListener('click', () => this.closeModal());
        }
        
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    openModal(imageSrc, imageAlt) {
        if (this.modal && this.modalImage) {
            this.modalImage.src = imageSrc;
            this.modalImage.alt = imageAlt;
            this.modal.classList.add('active');
            this.modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
            this.modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    setupTouchEvents() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        this.track.addEventListener('touchstart', (e) => {
            // Don't handle swipe if touching an image on mobile (for modal)
            if (e.target.classList.contains('judge-image') && window.innerWidth <= 768) {
                return;
            }
            
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        });

        this.track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            // Don't handle swipe if touching an image on mobile (for modal)
            if (e.target.classList.contains('judge-image') && window.innerWidth <= 768) {
                return;
            }
            
            const diffX = startX - currentX;
            const threshold = 50;

            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    this.goToNext();
                } else {
                    this.goToPrevious();
                }
            }
        });
    }

    goToNext() {
        this.currentIndex = (this.currentIndex + 1) % this.totalItems;
        this.updateCarousel();
    }

    goToPrevious() {
        this.currentIndex = (this.currentIndex - 1 + this.totalItems) % this.totalItems;
        this.updateCarousel();
    }

    updateCarousel() {
        const translateX = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${translateX}%)`;
        this.updateButtons();
    }

    updateButtons() {
        if (this.prevBtn && this.nextBtn) {
            // Always enable and show buttons for circular navigation
            this.prevBtn.disabled = false;
            this.nextBtn.disabled = false;
            this.prevBtn.style.display = 'flex';
            this.nextBtn.style.display = 'flex';
            this.prevBtn.style.visibility = 'visible';
            this.nextBtn.style.visibility = 'visible';
        }
    }
}

// Initialize the judges carousel when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JudgesCarousel();
});

// Handle window resize to update image click behavior
window.addEventListener('resize', () => {
    const judgeImages = document.querySelectorAll('.judge-image');
    judgeImages.forEach(image => {
        if (window.innerWidth <= 768) {
            image.style.cursor = 'pointer';
        } else {
            image.style.cursor = 'default';
        }
    });
});