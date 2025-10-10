#!/usr/bin/env python3
"""
Pad PNG images to 16-pixel boundaries (right and down).
This ensures ZeppOS build tools won't resize them.
"""

import sys
import math
from pathlib import Path
from PIL import Image


def pad_to_16(input_path, output_path=None):
    """
    Pad an image to the next 16-pixel boundary in both dimensions.
    Padding is added to the right and bottom (top-left corner stays at 0,0).
    
    Args:
        input_path: Path to input PNG file
        output_path: Path to output PNG file (defaults to overwriting input)
    
    Returns:
        tuple: (original_dimensions, new_dimensions)
    """
    # Open the image
    img = Image.open(input_path)
    orig_w, orig_h = img.size
    
    # Calculate new dimensions (next multiple of 16)
    new_w = math.ceil(orig_w / 16) * 16
    new_h = math.ceil(orig_h / 16) * 16
    
    # If already aligned, no need to pad
    if new_w == orig_w and new_h == orig_h:
        print(f"✓ {input_path.name}: Already aligned ({orig_w}×{orig_h})")
        return (orig_w, orig_h), (new_w, new_h)
    
    # Create new transparent image
    padded = Image.new('RGBA', (new_w, new_h), (0, 0, 0, 0))
    
    # Paste original at top-left (0, 0)
    padded.paste(img, (0, 0))
    
    # Save the padded image
    output = output_path or input_path
    padded.save(output, 'PNG')
    
    print(f"✓ {input_path.name}: {orig_w}×{orig_h} → {new_w}×{new_h} (added {new_w-orig_w}px right, {new_h-orig_h}px bottom)")
    
    return (orig_w, orig_h), (new_w, new_h)


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 pad_images.py <image1.png> [image2.png] ...")
        print("   or: python3 pad_images.py <directory>")
        print("\nPads images to 16-pixel boundaries (right and down).")
        sys.exit(1)
    
    paths = [Path(p) for p in sys.argv[1:]]
    
    # Collect all PNG files
    png_files = []
    for path in paths:
        if path.is_dir():
            png_files.extend(path.glob('*.png'))
        elif path.suffix.lower() == '.png':
            png_files.append(path)
        else:
            print(f"⚠ Skipping non-PNG file: {path}")
    
    if not png_files:
        print("No PNG files found.")
        sys.exit(1)
    
    print(f"\nPadding {len(png_files)} image(s) to 16-pixel boundaries...\n")
    
    for png_file in png_files:
        try:
            pad_to_16(png_file)
        except Exception as e:
            print(f"✗ {png_file.name}: Error - {e}")
    
    print("\nDone!")


if __name__ == '__main__':
    main()