#!/bin/bash

# Production Build Script for Side Quest Market Landing Page
# Minifies CSS and JavaScript files for production deployment

echo "🚀 Starting production build..."

# Create output directory structure
mkdir -p dist/css dist/js dist/assets dist/fonts

# Combine and minify CSS files
echo "📦 Processing CSS files..."

# Combine all CSS files
cat css/main.css css/components.css css/responsive.css css/accessibility.css css/typography.css css/images.css > dist/css/combined.css

# Simple CSS minification using sed
sed -e 's/\/\*[^*]*\*\///g' \
    -e 's/^[[:space:]]*//g' \
    -e 's/[[:space:]]*$//g' \
    -e '/^$/d' \
    -e 's/[[:space:]]*{[[:space:]]*/{/g' \
    -e 's/[[:space:]]*}[[:space:]]*/}/g' \
    -e 's/[[:space:]]*:[[:space:]]*/:/g' \
    -e 's/[[:space:]]*;[[:space:]]*/;/g' \
    -e 's/[[:space:]]*,[[:space:]]*/,/g' \
    dist/css/combined.css > dist/css/styles.min.css

# Extract critical CSS (above-the-fold styles)
echo "🎯 Extracting critical CSS..."

# Create critical CSS with essential styles
cat > dist/css/critical.min.css << 'EOF'
:root{--color-primary-black:#000000;--color-primary-purple:#6B46C1;--color-pure-white:#FFFFFF;--color-dark-purple:#4C1D95;--color-light-purple:#A78BFA;--font-size-base:1rem;--font-size-lg:1.125rem;--font-size-xl:1.25rem;--font-size-2xl:1.5rem;--font-size-3xl:1.875rem;--font-size-4xl:2.25rem;--space-1:0.5rem;--space-2:1rem;--space-3:1.5rem;--space-4:2rem;--space-6:3rem;--space-8:4rem;--radius-sm:0.5rem;--radius-md:0.75rem;--shadow-md:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)}
*,::before,::after{box-sizing:border-box}
html{line-height:1.15;-webkit-text-size-adjust:100%}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-size:var(--font-size-base);line-height:1.5;color:var(--color-primary-black);background-color:var(--color-pure-white)}
.skip-link{position:absolute;top:-40px;left:6px;background:var(--color-primary-purple);color:var(--color-pure-white);padding:8px;text-decoration:none;border-radius:var(--radius-sm);z-index:1000}
.skip-link:focus{top:6px}
.site-header{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(0,0,0,0.9);backdrop-filter:blur(10px);transition:background-color 0.3s ease}
.main-nav{width:100%;max-width:1200px;margin:0 auto;padding:0 var(--space-3)}
.nav-container{display:flex;align-items:center;justify-content:space-between;height:64px}
.logo{width:auto;height:48px;background-size:contain;background-repeat:no-repeat;background-position:center}
.nav-menu{display:none;list-style:none;margin:0;padding:0}
@media(min-width:768px){.nav-menu{display:flex;gap:var(--space-4)}}
.nav-link{color:var(--color-pure-white);text-decoration:none;font-weight:500;transition:color 0.3s ease}
.nav-link:hover,.nav-link:focus{color:var(--color-light-purple)}
.hero-section{min-height:100vh;display:flex;align-items:center;justify-content:center;background-size:cover;background-position:center;background-repeat:no-repeat;background-color:var(--color-primary-black);position:relative}
.hero-container{text-align:center;padding:var(--space-8) var(--space-3);max-width:800px}
.event-title{font-size:var(--font-size-4xl);font-weight:bold;color:var(--color-pure-white);margin:0 0 var(--space-3) 0;text-shadow:2px 2px 4px rgba(0,0,0,0.8)}
.hero-subtitle{font-size:var(--font-size-xl);color:var(--color-pure-white);margin:0 0 var(--space-2) 0}
.hero-date{font-size:var(--font-size-lg);color:var(--color-light-purple);margin:0 0 var(--space-6) 0;font-weight:600}
.cta-button{display:inline-block;background:var(--color-primary-purple);color:var(--color-pure-white);padding:var(--space-3) var(--space-6);text-decoration:none;border-radius:var(--radius-md);font-weight:600;font-size:var(--font-size-lg);transition:all 0.3s ease;box-shadow:var(--shadow-md)}
.cta-button:hover,.cta-button:focus{background:var(--color-dark-purple);transform:translateY(-2px)}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
EOF

# Combine and minify JavaScript files
echo "📦 Processing JavaScript files..."

# Combine all JS files
cat js/font-loader.js js/image-lazy-loading.js js/main.js js/navigation.js js/keyboard-navigation.js js/contact-form.js js/smooth-scroll.js > dist/js/combined.js

# Simple JS minification using sed
sed -e 's/\/\/[^"]*$//' \
    -e 's/\/\*[^*]*\*\///g' \
    -e 's/^[[:space:]]*//g' \
    -e 's/[[:space:]]*$//g' \
    -e '/^$/d' \
    dist/js/combined.js > dist/js/scripts.min.js

# Copy assets
echo "📁 Copying assets..."
cp -r assets/* dist/assets/ 2>/dev/null || true
cp -r fonts/* dist/fonts/ 2>/dev/null || true

# Create production HTML
echo "📝 Creating production HTML..."

# Create production index.html with optimizations
cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Side Quest Market - Alternative gaming market featuring board games, card games, and handcrafted items. Sunday 16th November 2025 at Greasley Sports Centre, Eastwood, Nottingham.">
    <meta name="keywords" content="gaming market, board games, card games, alternative gaming, The Side Quest Market, Nottingham, gaming event">
    <meta name="author" content="Side Quest Market">
    
    <!-- Performance and caching meta tags -->
    <meta http-equiv="Cache-Control" content="public, max-age=31536000">
    <meta http-equiv="Expires" content="Thu, 31 Dec 2025 23:59:59 GMT">
    <link rel="dns-prefetch" href="//cdn.emailjs.com">
    <link rel="dns-prefetch" href="//www.eventbrite.com/e/the-side-quest-market-tickets-1415596730929">
    
    <!-- Open Graph meta tags for social sharing -->
    <meta property="og:title" content="Side Quest Market - Alternative Gaming Market">
    <meta property="og:description" content="Join us for an alternative gaming market featuring board games, card games, and handcrafted items. Sunday 16th November 2025.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="">
    <meta property="og:image" content="">
    
    <!-- Twitter Card meta tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Side Quest Market - Alternative Gaming Market">
    <meta name="twitter:description" content="Join us for an alternative gaming market featuring board games, card games, and handcrafted items. Sunday 16th November 2025.">
    
    <title>Side Quest Market - Alternative Gaming Market | Sunday 16th November 2025</title>
    
    <!-- Font preloading for performance -->
    <link rel="preload" href="fonts/Aurora.otf" as="font" type="font/otf" crossorigin="anonymous">
    
    <!-- Preconnect to external domains for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://cdn.emailjs.com">
    
    <!-- Critical CSS inline -->
EOF

# Add critical CSS inline
cat dist/css/critical.min.css >> dist/index.html

cat >> dist/index.html << 'EOF'
    </style>
    
    <!-- Non-critical CSS with preload -->
    <link rel="preload" href="css/styles.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="css/styles.min.css"></noscript>
</head>
EOF

# Copy the body content from original HTML (excluding head and script tags)
sed -n '/<body>/,/<\/body>/p' index.html | \
sed 's/<script src="js\/[^"]*\.js"><\/script>//g' >> dist/index.html

# Add minified JavaScript before closing body tag
sed -i 's|</body>|    <script src="js/scripts.min.js"></script>\n</body>|' dist/index.html

# Create .htaccess for caching (Apache servers)
cat > dist/.htaccess << 'EOF'
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
EOF

echo "✅ Production build completed successfully!"
echo "📁 Files created in 'dist' directory:"
echo "   - index.html (optimized)"
echo "   - css/styles.min.css (minified)"
echo "   - css/critical.min.css (critical CSS)"
echo "   - js/scripts.min.js (minified)"
echo "   - assets/ (copied)"
echo "   - fonts/ (copied)"
echo "   - .htaccess (caching rules)"
echo ""
echo "🚀 To serve the production build:"
echo "   cd dist && python3 -m http.server 8000"
EOF