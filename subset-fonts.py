#!/usr/bin/env python3
"""
Font subsetting tool for Pebble-style watchface.
Reduces font file sizes by keeping only required glyphs.

Usage:
    python3 subset-fonts.py [fonts_dir] [output_dir]
    
Example:
    python3 subset-fonts.py assets/bip6/fonts assets/bip6/fonts-subsetted
"""

import sys
import os
from pathlib import Path

try:
    from fontTools import subset # pyright: ignore[reportMissingImports]
except ImportError:
    print("Error: fonttools not installed", file=sys.stderr)
    print("Install with: pip3 install fonttools", file=sys.stderr)
    sys.exit(1)


def get_file_size(path):
    """Get human-readable file size."""
    size = os.path.getsize(path)
    for unit in ['B', 'KB', 'MB']:
        if size < 1024:
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} GB"


def subset_font(input_path, output_path, unicodes, font_name):
    """Subset a font file to include only specified unicode ranges."""
    print(f"Subsetting {font_name}...")
    
    # Create subsetter options
    options = subset.Options()
    options.layout_features = ['*']
    options.no_hinting = True
    options.desubroutinize = True
    options.drop_tables = ['DSIG']
    
    # Create subsetter
    font = subset.load_font(str(input_path), options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=unicodes)
    subsetter.subset(font)
    
    # Save subsetted font
    subset.save_font(font, str(output_path), options)


def main():
    # Parse arguments
    fonts_dir = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
    output_dir = Path(sys.argv[2] if len(sys.argv) > 2 else './subsetted')
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Define font files and their unicode requirements
    fonts = {
        'Optima-Bold.ttf': {
            'unicodes': list(range(0x61, 0x7B)),  # a-z
            'description': 'a-z (26 glyphs)'
        },
        'Optima-Regular.ttf': {
            'unicodes': (
                [0x0020]  # space
                + [0x0027]  # apostrophe
                + [0x002C]  # comma
                + list(range(0x30, 0x3A))  # 0-9
                + list(range(0x61, 0x7B))  # a-z
            ),
            'description': 'a-z, 0-9, space, comma, apostrophe (39 glyphs)'
        }
    }
    
    print(f"Input directory:  {fonts_dir.absolute()}")
    print(f"Output directory: {output_dir.absolute()}")
    print()
    
    results = []
    
    for font_file, config in fonts.items():
        input_path = fonts_dir / font_file
        output_path = output_dir / font_file
        
        if not input_path.exists():
            print(f"Warning: {input_path} not found, skipping...")
            continue
        
        original_size = get_file_size(input_path)
        
        subset_font(input_path, output_path, config['unicodes'], font_file)
        
        new_size = get_file_size(output_path)
        reduction = (1 - os.path.getsize(output_path) / os.path.getsize(input_path)) * 100
        
        results.append({
            'name': font_file,
            'original': original_size,
            'new': new_size,
            'reduction': reduction,
            'description': config['description']
        })
        
        print(f"  {original_size} → {new_size} ({reduction:.1f}% reduction)")
        print(f"  Glyphs: {config['description']}")
        print()
    
    if results:
        print("Summary:")
        print("-" * 70)
        for r in results:
            print(f"{r['name']:20s} {r['original']:>8s} → {r['new']:>8s}  ({r['reduction']:>5.1f}% smaller)")
        print()
        print(f"Subsetted fonts saved to: {output_dir.absolute()}")
    else:
        print("Error: No font files found")
        sys.exit(1)


if __name__ == '__main__':
    main()