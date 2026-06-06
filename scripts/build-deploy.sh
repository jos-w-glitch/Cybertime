#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

rm -rf "$DIST"
mkdir -p "$DIST/assets" "$DIST/assets/fonts" "$DIST/music"

cat "$ROOT/js/config.js" \
    "$ROOT/js/supabase-config.js" \
    "$ROOT/js/supabase.js" \
    "$ROOT/js/auth.js" \
    "$ROOT/js/storage.js" \
    "$ROOT/js/input.js" \
    "$ROOT/js/mobile.js" \
    "$ROOT/js/pwa.js" \
    "$ROOT/js/draw.js" \
    "$ROOT/js/entities.js" \
    "$ROOT/js/audio.js" \
    "$ROOT/js/game.js" \
    "$ROOT/js/ui.js" \
    "$ROOT/js/main.js" > "$DIST/game.bundle.js"

cp "$SCRIPT_DIR/deploy-index.html" "$DIST/index.html"
cp "$SCRIPT_DIR/_redirects" "$DIST/_redirects"
cp "$SCRIPT_DIR/netlify.toml" "$DIST/netlify.toml"
cp "$ROOT/assets/logo.png" "$DIST/assets/"
cp "$ROOT/assets/1.png" "$DIST/assets/"
cp "$ROOT/assets/2.png" "$DIST/assets/"
cp "$ROOT/assets/fonts/"*.ttf "$DIST/assets/fonts/"
if command -v sips >/dev/null 2>&1; then
  sips -z 192 192 "$ROOT/assets/logo.png" --out "$DIST/assets/icon-192.png" >/dev/null
  sips -z 512 512 "$ROOT/assets/logo.png" --out "$DIST/assets/icon-512.png" >/dev/null
else
  cp "$ROOT/assets/logo.png" "$DIST/assets/icon-192.png"
  cp "$ROOT/assets/logo.png" "$DIST/assets/icon-512.png"
fi
cp "$SCRIPT_DIR/manifest.json" "$DIST/manifest.json"
cp "$SCRIPT_DIR/sw.js" "$DIST/sw.js"
cp "$ROOT/music/"*.mp3 "$DIST/music/"

BUILD_ID="$(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo "cybertime $BUILD_ID" > "$DIST/build.txt"

(cd "$DIST" && zip -r -q "$ROOT/cybertime-netlify.zip" .)

echo "Built $DIST ($(du -sh "$DIST" | cut -f1))"
echo "Upload: $ROOT/cybertime-netlify.zip"
echo "Or drag folder: $DIST"
