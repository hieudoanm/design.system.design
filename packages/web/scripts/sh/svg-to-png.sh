#!/usr/bin/env bash

# Convert every SVG under src/**/svg/ into a PNG under the sibling images/ dir.

set -euo pipefail

# Ensure Homebrew tools are on PATH
export PATH="/opt/homebrew/bin:$PATH"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC_DIR="$ROOT_DIR/src"

# Check dependencies
if ! command -v rsvg-convert &>/dev/null; then
  echo "Error: rsvg-convert is required"
  exit 1
fi

# Find all SVGs
while IFS= read -r -d '' svg; do
  dir="$(dirname "$svg")"
  parent="$(dirname "$dir")"
  name="$(basename "$svg" .svg)"
  out_dir="$parent/images"
  mkdir -p "$out_dir"
  echo "Generating $out_dir/$name.png"
  rsvg-convert --width 512 --height 512 --keep-aspect-ratio --output "$out_dir/$name.png" "$svg"
done < <(find "$SRC_DIR" -type f -path '*/svg/*.svg' -print0)

echo "All SVGs converted successfully!"
