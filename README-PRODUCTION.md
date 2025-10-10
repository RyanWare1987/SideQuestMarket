# Side Quest Market - Production Build Guide

## Overview

This document describes the production optimization and build process for the Side Quest Market landing page.

## Performance Optimizations Implemented

### 1. Image Lazy Loading
- **Intersection Observer API** for efficient lazy loading
- **Responsive image loading** with different sizes for different screen densities
- **Critical images** loaded immediately (hero background, logo)
- **Fallback support** for browsers without IntersectionObserver
- **Loading animations** and error handling

### 2. CSS Optimization
- **Minified CSS** - Combined and compressed all CSS files
- **Critical CSS** - Inline above-the-fold styles for faster initial render
- **Non-critical CSS** - Loaded asynchronously with preload
- **CSS Custom Properties** - Efficient theming system
- **Modern layout** - CSS Grid and Flexbox for better performance

### 3. JavaScript Optimization
- **Minified JavaScript** - Combined and compressed all JS files
- **Modular architecture** - ES6 modules for better maintainability
- **Lazy loading module** - Efficient image loading system
- **Event delegation** - Optimized event handling
- **Debounced events** - Scroll and resize optimization

### 4. Caching and Headers
- **Long-term caching** - 1 year cache for static assets
- **Compression** - Gzip compression for text files
- **Security headers** - XSS protection, content type sniffing prevention
- **DNS prefetch** - Preconnect to external domains
- **Resource hints** - Preload critical resources

## Build Process

### Prerequisites
- Unix-like system (macOS, Linux)
- Basic shell commands (cat, sed, tr)

### Running the Build

```bash
# Make build script executable
chmod +x build.sh

# Run production build
./build.sh

# Or use npm script
npm run build
```

### Build Output

The build creates a `dist/` directory with:

```
dist/
├── index.html              # Optimized HTML with inline critical CSS
├── .htaccess              # Apache caching and security rules
├── css/
│   ├── styles.min.css     # Minified combined CSS
│   └── critical.min.css   # Critical above-the-fold CSS
├── js/
│   └── scripts.min.js     # Minified combined JavaScript
├── assets/                # Copied asset files
└── fonts/                 # Copied font files
```

### File Size Comparison

| File Type | Original | Minified | Reduction |
|-----------|----------|----------|-----------|
| CSS       | 85.8 KB  | 78.4 KB  | 8.6%      |
| JavaScript| 64.5 KB  | 54.6 KB  | 15.3%     |
| **Total** | **150.3 KB** | **133.0 KB** | **11.5%** |

## Performance Features

### Critical CSS Strategy
- **Inline critical CSS** for immediate rendering
- **Async non-critical CSS** to prevent render blocking
- **Font preloading** for custom fonts
- **Resource hints** for external domains

### Image Optimization
- **Lazy loading** for all non-critical images
- **Responsive images** with multiple sizes
- **WebP support** with JPEG fallbacks
- **Preload hints** for critical images

### JavaScript Performance
- **Module bundling** for reduced HTTP requests
- **Code splitting** for critical vs non-critical code
- **Event optimization** with debouncing
- **Intersection Observer** for efficient scroll handling

## Cross-Browser Compatibility

### Supported Browsers
- **Chrome** 60+ (full support)
- **Firefox** 55+ (full support)
- **Safari** 12+ (full support)
- **Edge** 79+ (full support)

### Fallbacks Implemented
- **IntersectionObserver** - Graceful degradation to immediate loading
- **CSS Grid** - Flexbox fallbacks where needed
- **Custom Properties** - Static values for older browsers
- **ES6 Features** - Transpiled for broader compatibility

### Testing
Use the included `test-compatibility.html` file to test browser support:

```bash
# Serve the test file
python3 -m http.server 8000
# Open http://localhost:8000/test-compatibility.html
```

## Deployment

### Apache Server (.htaccess)
The build includes an `.htaccess` file with:
- Gzip compression
- Long-term caching headers
- Security headers
- HTTPS redirect (commented out)

### Nginx Configuration
For Nginx servers, add these directives:

```nginx
# Compression
gzip on;
gzip_types text/css application/javascript image/svg+xml;

# Caching
location ~* \.(css|js|png|jpg|jpeg|gif|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Security headers
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
```

### CDN Deployment
For CDN deployment:
1. Upload `dist/` contents to CDN
2. Update asset URLs in HTML if needed
3. Configure CDN caching rules
4. Enable compression at CDN level

## Performance Monitoring

### Core Web Vitals
Monitor these metrics:
- **LCP (Largest Contentful Paint)** - Target: < 2.5s
- **FID (First Input Delay)** - Target: < 100ms
- **CLS (Cumulative Layout Shift)** - Target: < 0.1

### Tools for Testing
- **Lighthouse** - Built into Chrome DevTools
- **PageSpeed Insights** - Google's web performance tool
- **WebPageTest** - Detailed performance analysis
- **GTmetrix** - Performance and optimization recommendations

### Performance Budget
- **Total page size** - Target: < 500KB
- **JavaScript bundle** - Target: < 100KB
- **CSS bundle** - Target: < 50KB
- **Images** - Optimized and lazy-loaded

## Maintenance

### Updating Assets
1. Replace files in source directories
2. Run build script
3. Test in staging environment
4. Deploy to production

### Adding New Features
1. Add source files to appropriate directories
2. Update build script if needed
3. Test cross-browser compatibility
4. Update this documentation

### Performance Monitoring
- Regular Lighthouse audits
- Monitor Core Web Vitals
- Check for new optimization opportunities
- Update dependencies and build tools

## Security Considerations

### Content Security Policy
The `.htaccess` includes a basic CSP. For stricter security:

```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://cdn.emailjs.com; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data:; 
  font-src 'self'; 
  connect-src 'self' https://api.emailjs.com
```

### Regular Updates
- Monitor for security vulnerabilities
- Update EmailJS SDK regularly
- Review and update CSP as needed
- Test security headers with tools like securityheaders.com

## Troubleshooting

### Common Issues
1. **Images not loading** - Check asset paths in production
2. **CSS not applying** - Verify critical CSS extraction
3. **JavaScript errors** - Check minification didn't break code
4. **Slow loading** - Verify caching headers are working

### Debug Mode
For debugging, use the development version:
```bash
# Serve development version
python3 -m http.server 8000
# Open http://localhost:8000
```

### Performance Issues
1. Check network tab in DevTools
2. Run Lighthouse audit
3. Verify compression is working
4. Check for render-blocking resources