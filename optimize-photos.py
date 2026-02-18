#!/usr/bin/env python3
"""
Photo Optimization Script for Side Quest Market
Resizes and compresses photos for web use while maintaining quality
"""

import os
from PIL import Image, ImageOps
import sys

def optimize_photo(input_path, output_path, max_width=1200, quality=85):
    """
    Optimize a photo for web use
    
    Args:
        input_path: Path to original photo
        output_path: Path for optimized photo
        max_width: Maximum width in pixels (default 1200px)
        quality: JPEG quality 1-100 (default 85)
    """
    try:
        # Open and auto-rotate image based on EXIF data
        with Image.open(input_path) as img:
            # Auto-rotate based on EXIF orientation
            img = ImageOps.exif_transpose(img)
            
            # Convert to RGB if necessary (handles RGBA, etc.)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Calculate new dimensions maintaining aspect ratio
            width, height = img.size
            if width > max_width:
                ratio = max_width / width
                new_width = max_width
                new_height = int(height * ratio)
                
                # Resize with high-quality resampling
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Save with optimization
            img.save(output_path, 'JPEG', quality=quality, optimize=True, progressive=True)
            
            # Get file sizes for comparison
            original_size = os.path.getsize(input_path) / (1024 * 1024)  # MB
            new_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
            reduction = ((original_size - new_size) / original_size) * 100
            
            print(f"✓ {os.path.basename(input_path)}: {original_size:.1f}MB → {new_size:.1f}MB ({reduction:.1f}% reduction)")
            
    except Exception as e:
        print(f"✗ Error processing {input_path}: {e}")

def main():
    # Paths
    input_dir = "assets/MarketPhotos_2025"
    output_dir = "assets/MarketPhotos_2025_optimized"
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Check if PIL is available
    try:
        from PIL import Image, ImageOps
    except ImportError:
        print("Error: Pillow library not found. Install with: pip install Pillow")
        sys.exit(1)
    
    # Get all JPG files
    if not os.path.exists(input_dir):
        print(f"Error: Directory {input_dir} not found")
        sys.exit(1)
    
    jpg_files = [f for f in os.listdir(input_dir) if f.lower().endswith(('.jpg', '.jpeg'))]
    
    if not jpg_files:
        print(f"No JPG files found in {input_dir}")
        sys.exit(1)
    
    print(f"Optimizing {len(jpg_files)} photos...")
    print("Settings: Max width 1200px, Quality 85%, Progressive JPEG")
    print("-" * 60)
    
    total_original = 0
    total_optimized = 0
    
    # Process each photo
    for filename in sorted(jpg_files):
        input_path = os.path.join(input_dir, filename)
        output_path = os.path.join(output_dir, filename)
        
        # Track sizes
        original_size = os.path.getsize(input_path) / (1024 * 1024)
        total_original += original_size
        
        optimize_photo(input_path, output_path)
        
        if os.path.exists(output_path):
            optimized_size = os.path.getsize(output_path) / (1024 * 1024)
            total_optimized += optimized_size
    
    # Summary
    print("-" * 60)
    print(f"Total original size: {total_original:.1f}MB")
    print(f"Total optimized size: {total_optimized:.1f}MB")
    print(f"Total reduction: {((total_original - total_optimized) / total_original) * 100:.1f}%")
    print(f"\nOptimized photos saved to: {output_dir}")

if __name__ == "__main__":
    main()