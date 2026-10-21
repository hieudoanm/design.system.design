
#!/usr/bin/env bash

# Regenerate PNG icons, Apple Touch Icon, and favicon.ico
# from public/icons/icon.svg.
#
# Requirements: librsvg and ImageMagick.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INPUT="$ROOT_DIR/public/icons/icon.svg"
OUTPUT_DIR="$ROOT_DIR/public/icons"

SIZES=(16 32 48 64 96 128 152 167 192 256 384 512)

mkdir -p "$OUTPUT_DIR"

# Check dependencies
for cmd in rsvg-convert magick; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: $cmd is required"
    exit 1
  fi
done

# Check source SVG
if [[ ! -f "$INPUT" ]]; then
  echo "Error: $INPUT not found"
  exit 1
fi

# Generate PNGs
for size in "${SIZES[@]}"; do
  output="$OUTPUT_DIR/icon-${size}.png"

  echo "Generating icon-${size}.png"

  rsvg-convert \
    --width "$size" \
    --height "$size" \
    --keep-aspect-ratio \
    --output "$output" \
    "$INPUT"
done

# Generate Apple Touch Icon
echo "Generating apple-touch-icon.png"

rsvg-convert \
  --width 180 \
  --height 180 \
  --keep-aspect-ratio \
  --output "$OUTPUT_DIR/apple-touch-icon.png" \
  "$INPUT"

# Generate favicon.ico
echo "Generating favicon.ico"

magick \
  "$OUTPUT_DIR/icon-16.png" \
  "$OUTPUT_DIR/icon-32.png" \
  "$OUTPUT_DIR/icon-48.png" \
  "$OUTPUT_DIR/favicon.ico"

echo "All icons generated successfully!"
