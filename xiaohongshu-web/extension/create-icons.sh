#!/bin/bash

# Create icons using SVG + qlmanage + sips (macOS built-in)

DIST_DIR="$(cd "$(dirname "$0")" && pwd)/dist"

# Red icon SVG
cat > /tmp/icon-red.svg << 'SVGEOF'
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="24" fill="#EF4444"/>
  <rect x="36" y="36" width="56" height="24" rx="4" fill="white"/>
  <rect x="36" y="68" width="56" height="8" rx="4" fill="white"/>
  <rect x="36" y="82" width="40" height="8" rx="4" fill="white"/>
  <rect x="36" y="96" width="48" height="8" rx="4" fill="white"/>
</svg>
SVGEOF

# Green icon SVG (active)
cat > /tmp/icon-green.svg << 'SVGEOF'
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="24" fill="#10B981"/>
  <rect x="36" y="36" width="56" height="24" rx="4" fill="white"/>
  <rect x="36" y="68" width="56" height="8" rx="4" fill="white"/>
  <rect x="36" y="82" width="40" height="8" rx="4" fill="white"/>
  <rect x="36" y="96" width="48" height="8" rx="4" fill="white"/>
  <path d="M48 64L60 76L80 52" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>
SVGEOF

# Generate thumbnails using qlmanage
echo "Generating SVG thumbnails..."
qlmanage -t -s 128 -o /tmp /tmp/icon-red.svg 2>/dev/null > /dev/null
qlmanage -t -s 128 -o /tmp /tmp/icon-green.svg 2>/dev/null > /dev/null

# Resize icons for each size
echo "Creating icons..."
for size in 16 48 128; do
  sips -z $size $size /tmp/icon-red.svg.png --out "$DIST_DIR/icon$size.png" 2>/dev/null > /dev/null
  sips -z $size $size /tmp/icon-green.svg.png --out "$DIST_DIR/icon$size-active.png" 2>/dev/null > /dev/null
  echo "Created icon$size.png and icon$size-active.png"
done

# Cleanup
rm -f /tmp/icon-red.svg /tmp/icon-green.svg /tmp/icon-red.svg.png /tmp/icon-green.svg.png

echo "All icons created successfully!"
