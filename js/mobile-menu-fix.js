/**
 * Mobile Menu Fix - Ensures mobile navigation works properly
 * This is a backup/override for mobile menu functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Mobile Menu Fix Loading...');
    
    // Get mobile menu elements
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    if (!mobileMenuToggle || !mobileNav) {
        console.error('❌ Mobile menu elements not found');
        return;
    }
    
    console.log('✅ Mobile menu elements found');
    
    // Ensure hamburger lines are visible
    const hamburgerLines = mobileMenuToggle.querySelectorAll('.hamburger-line');
    hamburgerLines.forEach((line, index) => {
        line.style.display = 'block';
        line.style.width = '20px';
        line.style.height = '2px';
        line.style.backgroundColor = '#ffffff';
        line.style.margin = '2px 0';
        line.style.borderRadius = '1px';
        line.style.opacity = '1';
        line.style.visibility = 'visible';
        console.log(`✅ Hamburger line ${index + 1} styled`);
    });
    
    // Mobile menu state
    let isMenuOpen = false;
    
    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.mobile-nav-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-nav-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(overlay);
        console.log('✅ Mobile overlay created');
    }
    
    // Toggle mobile menu function - FIXED for proper slide-in
    function toggleMobileMenu() {
        console.log('🔄 Toggling mobile menu, current state:', isMenuOpen);
        
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            // Ensure mobile nav is positioned correctly outside header
            mobileNav.style.position = 'fixed';
            mobileNav.style.top = '0';
            mobileNav.style.right = '0';
            mobileNav.style.width = '280px';
            mobileNav.style.height = '100vh';
            mobileNav.style.zIndex = '9999';
            mobileNav.style.transform = 'translateX(0)';
            
            mobileNav.setAttribute('aria-hidden', 'false');
            mobileMenuToggle.setAttribute('aria-expanded', 'true');
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
            document.body.style.overflow = 'hidden';
            
            // Animate hamburger to X
            if (hamburgerLines.length >= 3) {
                hamburgerLines[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                hamburgerLines[1].style.opacity = '0';
                hamburgerLines[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            }
            
            console.log('✅ Mobile menu opened and positioned correctly');
        } else {
            // Close menu
            mobileNav.style.right = '-100%';
            mobileNav.style.transform = 'translateX(100%)';
            mobileNav.setAttribute('aria-hidden', 'true');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            document.body.style.overflow = '';
            
            // Reset hamburger lines
            if (hamburgerLines.length >= 3) {
                hamburgerLines[0].style.transform = 'none';
                hamburgerLines[1].style.opacity = '1';
                hamburgerLines[2].style.transform = 'none';
            }
            
            console.log('✅ Mobile menu closed');
        }
    }
    
    // Add click event to toggle button
    mobileMenuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🖱️ Mobile menu toggle clicked');
        toggleMobileMenu();
    });
    
    // Add click event to overlay to close menu
    overlay.addEventListener('click', function() {
        console.log('🖱️ Overlay clicked');
        if (isMenuOpen) {
            toggleMobileMenu();
        }
    });
    
    // Add click events to mobile nav links
    mobileNavLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            console.log(`🖱️ Mobile nav link ${index + 1} clicked:`, link.href);
            
            // Get the href attribute
            const href = link.getAttribute('href');
            
            if (href && href.startsWith('#')) {
                // It's an anchor link
                e.preventDefault();
                
                // Close the mobile menu first
                if (isMenuOpen) {
                    toggleMobileMenu();
                }
                
                // Wait for menu to close, then scroll to target
                setTimeout(() => {
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        console.log(`✅ Scrolled to section: ${targetId}`);
                    } else {
                        console.warn(`⚠️ Target element not found: ${targetId}`);
                    }
                }, 300);
            } else {
                // External link, let it work normally
                if (isMenuOpen) {
                    toggleMobileMenu();
                }
            }
        });
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            console.log('⌨️ Escape key pressed');
            toggleMobileMenu();
        }
    });
    
    // Close menu on window resize if it's open
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768 && isMenuOpen) {
            console.log('📱 Window resized to desktop, closing mobile menu');
            toggleMobileMenu();
        }
    });
    
    // Ensure mobile nav has proper initial styles - FIXED for proper slide-in
    mobileNav.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        right: -100% !important;
        width: 280px !important;
        height: 100vh !important;
        background: #1a0d2e !important;
        padding-top: 80px !important;
        padding-left: 2rem !important;
        padding-right: 2rem !important;
        transition: right 0.3s ease !important;
        z-index: 9999 !important;
        overflow-y: auto !important;
        box-shadow: -5px 0 15px rgba(0, 0, 0, 0.3) !important;
        transform: translateX(0) !important;
    `;
    
    // CRITICAL: Ensure the mobile nav is moved to body level to prevent header constraints
    const currentParent = mobileNav.parentElement;
    if (currentParent && (
        currentParent.classList.contains('nav-container') || 
        currentParent.classList.contains('site-header') ||
        currentParent.classList.contains('main-nav')
    )) {
        // Remove from current parent and append to body
        mobileNav.remove();
        document.body.appendChild(mobileNav);
        console.log('✅ Moved mobile nav from', currentParent.className, 'to body');
    }
    
    // Double-check positioning
    setTimeout(() => {
        if (mobileNav.parentElement !== document.body) {
            mobileNav.remove();
            document.body.appendChild(mobileNav);
            console.log('✅ Force-moved mobile nav to body');
        }
    }, 100);
    
    // Set initial ARIA attributes
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    
    console.log('✅ Mobile Menu Fix Complete!');
    console.log('📱 Mobile menu should now be fully functional');
});