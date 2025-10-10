#!/usr/bin/env node

/**
 * Production Build Script
 * Minifies CSS and JavaScript files for production deployment
 * Implements critical CSS extraction for above-the-fold content
 */

const fs = require('fs');
const path = require('path');

class ProductionBuilder {
  constructor() {
    this.cssFiles = [
      'css/main.css',
      'css/components.css', 
      'css/responsive.css',
      'css/accessibility.css',
      'css/typography.css',
      'css/images.css'
    ];
    
    this.jsFiles = [
      'js/font-loader.js',
      'js/image-lazy-loading.js',
      'js/main.js',
      'js/navigation.js',
      'js/keyboard-navigation.js',
      'js/contact-form.js',
      'js/smooth-scroll.js'
    ];
    
    this.outputDir = 'dist';
  }

  /**
   * Run the complete build process
   */
  async build() {
    console.log('🚀 Starting production build...');
    
    try {
      this.createOutputDirectory();
      await this.minifyCSS();
      await this.minifyJavaScript();
      await this.extractCriticalCSS();
      this.copyAssets();
      this.updateHTMLForProduction();
      
      console.log('✅ Production build completed successfully!');
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Create output directory structure
   */
  createOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    ['css', 'js', 'assets', 'fonts'].forEach(dir => {
      const dirPath = path.join(this.outputDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  /**
   * Minify CSS files
   */
  async minifyCSS() {
    console.log('📦 Minifying CSS files...');
    
    // Combine all CSS files
    let combinedCSS = '';
    
    for (const cssFile of this.cssFiles) {
      if (fs.existsSync(cssFile)) {
        const content = fs.readFileSync(cssFile, 'utf8');
        combinedCSS += `/* ${cssFile} */\n${content}\n\n`;
      }
    }
    
    // Simple CSS minification
    const minifiedCSS = this.minifyCSSContent(combinedCSS);
    
    // Write minified CSS
    fs.writeFileSync(path.join(this.outputDir, 'css', 'styles.min.css'), minifiedCSS);
    
    console.log('✅ CSS minification completed');
  }

  /**
   * Simple CSS minification
   */
  minifyCSSContent(css) {
    return css
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove whitespace around specific characters
      .replace(/\s*([{}:;,>+~])\s*/g, '$1')
      // Remove trailing semicolons before closing braces
      .replace(/;}/g, '}')
      // Remove leading/trailing whitespace
      .trim();
  }

  /**
   * Minify JavaScript files
   */
  async minifyJavaScript() {
    console.log('📦 Minifying JavaScript files...');
    
    // Combine all JS files
    let combinedJS = '';
    
    for (const jsFile of this.jsFiles) {
      if (fs.existsSync(jsFile)) {
        const content = fs.readFileSync(jsFile, 'utf8');
        combinedJS += `/* ${jsFile} */\n${content}\n\n`;
      }
    }
    
    // Simple JS minification
    const minifiedJS = this.minifyJSContent(combinedJS);
    
    // Write minified JS
    fs.writeFileSync(path.join(this.outputDir, 'js', 'scripts.min.js'), minifiedJS);
    
    console.log('✅ JavaScript minification completed');
  }

  /**
   * Simple JavaScript minification
   */
  minifyJSContent(js) {
    return js
      // Remove single-line comments (but preserve URLs)
      .replace(/\/\/(?![^\n]*https?:)[^\n]*/g, '')
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove whitespace around operators and punctuation
      .replace(/\s*([{}();,=+\-*/<>!&|])\s*/g, '$1')
      // Remove leading/trailing whitespace
      .trim();
  }

  /**
   * Extract critical CSS for above-the-fold content
   */
  async extractCriticalCSS() {
    console.log('🎯 Extracting critical CSS...');
    
    // Define critical CSS selectors (above-the-fold content)
    const criticalSelectors = [
      // CSS Custom Properties
      ':root',
      // Base styles
      'html', 'body',
      // Header and navigation
      '.site-header', '.main-nav', '.nav-container', '.logo', '.nav-menu', '.nav-link',
      '.mobile-menu-toggle', '.hamburger-line',
      // Hero section (above the fold)
      '.hero-section', '.hero-container', '.event-title', '.hero-subtitle', '.hero-date',
      '.cta-button', '.scroll-indicator', '.scroll-arrow',
      // Skip link for accessibility
      '.skip-link',
      // Screen reader utilities
      '.sr-only',
      // Critical utility classes
      '.text-center', '.text-white', '.bg-purple', '.font-bold'
    ];
    
    // Read the full CSS
    const fullCSS = fs.readFileSync(path.join(this.outputDir, 'css', 'styles.min.css'), 'utf8');
    
    // Extract critical CSS rules
    let criticalCSS = '';
    
    // Add CSS custom properties first
    const customPropsMatch = fullCSS.match(/:root\s*{[^}]*}/g);
    if (customPropsMatch) {
      criticalCSS += customPropsMatch.join('');
    }
    
    // Extract rules for critical selectors
    criticalSelectors.forEach(selector => {
      const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`${escapedSelector}\\s*{[^}]*}`, 'g');
      const matches = fullCSS.match(regex);
      if (matches) {
        criticalCSS += matches.join('');
      }
    });
    
    // Write critical CSS
    fs.writeFileSync(path.join(this.outputDir, 'css', 'critical.min.css'), criticalCSS);
    
    console.log('✅ Critical CSS extraction completed');
  }

  /**
   * Copy assets to output directory
   */
  copyAssets() {
    console.log('📁 Copying assets...');
    
    // Copy assets directory
    if (fs.existsSync('assets')) {
      this.copyDirectory('assets', path.join(this.outputDir, 'assets'));
    }
    
    // Copy fonts directory
    if (fs.existsSync('fonts')) {
      this.copyDirectory('fonts', path.join(this.outputDir, 'fonts'));
    }
    
    console.log('✅ Assets copied successfully');
  }

  /**
   * Recursively copy directory
   */
  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const items = fs.readdirSync(src);
    
    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      
      if (fs.statSync(srcPath).isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }

  /**
   * Update HTML for production
   */
  updateHTMLForProduction() {
    console.log('📝 Updating HTML for production...');
    
    let html = fs.readFileSync('index.html', 'utf8');
    
    // Replace individual CSS files with minified version
    html = html.replace(
      /<link rel="stylesheet" href="css\/[^"]+\.css">/g,
      ''
    );
    
    // Add critical CSS inline
    const criticalCSS = fs.readFileSync(path.join(this.outputDir, 'css', 'critical.min.css'), 'utf8');
    html = html.replace(
      '</head>',
      `    <style>${criticalCSS}</style>\n</head>`
    );
    
    // Add non-critical CSS with preload
    html = html.replace(
      '</head>',
      `    <link rel="preload" href="css/styles.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">\n    <noscript><link rel="stylesheet" href="css/styles.min.css"></noscript>\n</head>`
    );
    
    // Replace individual JS files with minified version
    html = html.replace(
      /    <script src="js\/[^"]+\.js"><\/script>\n/g,
      ''
    );
    
    // Add minified JS before closing body tag
    html = html.replace(
      '</body>',
      `    <script src="js/scripts.min.js"></script>\n</body>`
    );
    
    // Add caching and performance meta tags
    html = html.replace(
      '<meta name="author" content="Side Quest Market">',
      `<meta name="author" content="Side Quest Market">
    
    <!-- Performance and caching meta tags -->
    <meta http-equiv="Cache-Control" content="public, max-age=31536000">
    <meta http-equiv="Expires" content="Thu, 31 Dec 2025 23:59:59 GMT">
    <link rel="dns-prefetch" href="//cdn.emailjs.com">
    <link rel="dns-prefetch" href="//www.eventbrite.com">`
    );
    
    // Write production HTML
    fs.writeFileSync(path.join(this.outputDir, 'index.html'), html);
    
    console.log('✅ Production HTML created');
  }
}

// Run build if called directly
if (require.main === module) {
  const builder = new ProductionBuilder();
  builder.build();
}

module.exports = ProductionBuilder;