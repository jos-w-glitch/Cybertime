#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
GAME="$DIST/cybertime"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

rm -rf "$DIST"
mkdir -p "$GAME/assets" "$GAME/assets/fonts" "$GAME/music"

CSS="$(cat "$SCRIPT_DIR/home.css")"
while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ "$line" == *"<!--STYLES-->"* ]]; then
    printf '%s\n' '  <style>' "$CSS" '  </style>'
  else
    printf '%s\n' "$line"
  fi
done < "$SCRIPT_DIR/home-index.html" > "$DIST/index.html"

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
    "$ROOT/js/share.js" \
    "$ROOT/js/promo.js" \
    "$ROOT/js/ui.js" \
    "$ROOT/js/main.js" > "$GAME/game.bundle.js"

cp "$ROOT/assets/logo.png" "$GAME/assets/"
cp "$ROOT/assets/1.png" "$GAME/assets/"
cp "$ROOT/assets/fonts/"*.ttf "$GAME/assets/fonts/"
if command -v sips >/dev/null 2>&1; then
  sips -z 192 192 "$ROOT/assets/logo.png" --out "$GAME/assets/icon-192.png" >/dev/null
  sips -z 512 512 "$ROOT/assets/logo.png" --out "$GAME/assets/icon-512.png" >/dev/null
else
  cp "$ROOT/assets/logo.png" "$GAME/assets/icon-192.png"
  cp "$ROOT/assets/logo.png" "$GAME/assets/icon-512.png"
fi
cp "$SCRIPT_DIR/manifest.json" "$GAME/manifest.json"
cp "$SCRIPT_DIR/sw.js" "$GAME/sw.js"
cp "$ROOT/music/"*.mp3 "$GAME/music/"

BUILD_ID="$(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo "cybertime $BUILD_ID" > "$GAME/build.txt"

cp "$SCRIPT_DIR/deploy-index.html" "$GAME/index.html"
sed -i '' "s|<!--BUILD_ID-->|$BUILD_ID|g" "$GAME/index.html" 2>/dev/null || sed -i "s|<!--BUILD_ID-->|$BUILD_ID|g" "$GAME/index.html"

(cd "$DIST" && zip -r -q "$ROOT/cybertime-vercel.zip" .)

echo "Built $DIST ($(du -sh "$DIST" | cut -f1))"
echo "Deploy with Vercel, or upload: $ROOT/cybertime-vercel.zip"
