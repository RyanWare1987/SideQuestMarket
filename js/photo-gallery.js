/**
 * Photo Gallery Carousel
 * Handles the market photos carousel functionality
 */

class PhotoGallery {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 0;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000; // 5 seconds
        this.isAutoPlaying = true;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.init();
    }

    init() {
        this.loadPhotos();
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.setupTouchNavigation();
        this.startAutoPlay();
    }

    loadPhotos() {
        const photos = [
            '_DSC6576.JPG', '_DSC6594.JPG', '_DSC6613.JPG', '_DSC6616.JPG',
            '_DSC6631.JPG', '_DSC6643.JPG', '_DSC6652.JPG', '_DSC6666.JPG',
            '_DSC6668.JPG', '_DSC6691.JPG', '_DSC6692.JPG', '_DSC6725.JPG',
            '_DSC6761.JPG', '_DSC6775.JPG', '_DSC6778.JPG', '_DSC6785.JPG',
            '_DSC6799.JPG', '_DSC6802.JPG', '_DSC6803.JPG'
        ];

        this.totalSlides = photos.length;
        this.createSlides(photos);
        this.createIndicators();
        this.updateCounter();
    }

    createSlides(photos) {
        const track = document.getElementById('photo-track');
        if (!track) return;

        track.innerHTML = '';

        photos.forEach((photo, index) => {
            const slide = document.createElement('div');
            slide.className = 'photo-slide';
            slide.setAttribute('data-slide', index);

            const img = document.createElement('img');
            img.src = `assets/MarketPhotos_2025_optimized/${photo}`;
            img.alt = `Photo from The Side Quest Market 2025 - Image ${index + 1}`;
            img.loading = index === 0 ? 'eager' : 'lazy';
            img.setAttribute('tabindex', '-1'); // Remove from tab order to prevent focus issues
            img.setAttribute('role', 'img');
            
            // Add loading state
            slide.classList.add('loading');
            
            img.onload = () => {
                slide.classList.remove('loading');
            };
            
            img.onerror = () => {
                slide.classList.remove('loading');
                img.alt = 'Photo could not be loaded';
                img.style.display = 'none';
                
                // Create fallback content
                const fallback = document.createElement('div');
                fallback.textContent = 'Photo unavailable';
                fallback.style.cssText = 'color: var(--text-secondary); font-size: 1.2rem; text-align: center;';
                slide.appendChild(fallback);
            };

            slide.appendChild(img);
            track.appendChild(slide);
        });
    }

    createIndicators() {
        const indicatorsContainer = document.getElementById('photo-indicators');
        if (!indicatorsContainer) return;

        indicatorsContainer.innerHTML = '';

        for (let i = 0; i < this.totalSlides; i++) {
            const indicator = document.createElement('button');
            indicator.className = 'photo-indicator';
            indicator.setAttribute('aria-label', `Go to photo ${i + 1}`);
            indicator.setAttribute('data-slide', i);
            
            if (i === 0) {
                indicator.classList.add('active');
            }

            indicator.addEventListener('click', () => {
                this.goToSlide(i);
                this.pauseAutoPlay();
            });

            indicatorsContainer.appendChild(indicator);
        }
    }

    setupEventListeners() {
        const prevBtn = document.getElementById('photo-prev');
        const nextBtn = document.getElementById('photo-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousSlide();
                this.pauseAutoPlay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextSlide();
                this.pauseAutoPlay();
            });
        }

        // Pause autoplay on hover
        const carousel = document.querySelector('.photo-carousel-wrapper');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => this.pauseAutoPlay());
            carousel.addEventListener('mouseleave', () => this.resumeAutoPlay());
        }

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoPlay();
            } else if (this.isAutoPlaying) {
                this.resumeAutoPlay();
            }
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Only handle keyboard navigation if the gallery is in focus
            const gallery = document.querySelector('.photo-gallery-section');
            if (!gallery || !this.isElementInViewport(gallery)) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousSlide();
                    this.pauseAutoPlay();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    this.pauseAutoPlay();
                    break;
                case ' ':
                case 'Spacebar':
                    e.preventDefault();
                    this.toggleAutoPlay();
                    break;
            }
        });
    }

    setupTouchNavigation() {
        const carousel = document.querySelector('.photo-carousel');
        if (!carousel) return;

        carousel.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                this.nextSlide();
            } else {
                // Swipe right - previous slide
                this.previousSlide();
            }
            this.pauseAutoPlay();
        }
    }

    goToSlide(slideIndex) {
        if (slideIndex < 0 || slideIndex >= this.totalSlides) return;

        this.currentSlide = slideIndex;
        this.updateCarousel();
        this.updateIndicators();
        this.updateCounter();
        this.announceSlideChange();
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(nextIndex);
    }

    previousSlide() {
        const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(prevIndex);
    }

    updateCarousel() {
        const track = document.getElementById('photo-track');
        if (!track) return;

        const translateX = -this.currentSlide * 100;
        track.style.transform = `translateX(${translateX}%)`;
    }

    updateIndicators() {
        const indicators = document.querySelectorAll('.photo-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }

    updateCounter() {
        const counter = document.getElementById('photo-counter');
        if (counter) {
            counter.textContent = `${this.currentSlide + 1} / ${this.totalSlides}`;
        }
    }

    announceSlideChange() {
        // Create announcement for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Showing photo ${this.currentSlide + 1} of ${this.totalSlides}`;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    startAutoPlay() {
        if (this.autoPlayInterval) return;
        
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    resumeAutoPlay() {
        if (this.isAutoPlaying && !this.autoPlayInterval) {
            this.startAutoPlay();
        }
    }

    toggleAutoPlay() {
        this.isAutoPlaying = !this.isAutoPlaying;
        
        if (this.isAutoPlaying) {
            this.resumeAutoPlay();
        } else {
            this.pauseAutoPlay();
        }
    }

    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    destroy() {
        this.pauseAutoPlay();
        
        // Remove event listeners
        const prevBtn = document.getElementById('photo-prev');
        const nextBtn = document.getElementById('photo-next');
        
        if (prevBtn) prevBtn.removeEventListener('click', this.previousSlide);
        if (nextBtn) nextBtn.removeEventListener('click', this.nextSlide);
    }
}

// Initialize photo gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if photo gallery section exists
    const gallerySection = document.querySelector('.photo-gallery-section');
    if (gallerySection) {
        // Small delay to ensure page has fully loaded and positioned correctly
        setTimeout(() => {
            window.photoGallery = new PhotoGallery();
        }, 100);
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.photoGallery) {
        window.photoGallery.destroy();
    }
});