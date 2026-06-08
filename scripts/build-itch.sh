#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
OUT="$DIST/itch"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GAME="$DIST/cybertime"

rm -rf "$OUT"
mkdir -p "$OUT/assets/fonts" "$OUT/music"

if [ -f "$GAME/game.bundle.js" ]; then
  cp "$GAME/game.bundle.js" "$OUT/game.bundle.js"
else
  cat "$ROOT/js/config.js" \
      "$ROOT/js/supabase-config.js" \
      "$ROOT/js/supabase.js" \
      "$ROOT/js/auth.js" \
      "$ROOT/js/storage.js" \
      "$ROOT/js/input.js" \
      "$ROOT/js/mobile.js" \
      "$ROOT/js/pwa.js" \
      "$ROOT/js/backgrounds.js" \
      "$ROOT/js/draw.js" \
      "$ROOT/js/entities.js" \
      "$ROOT/js/audio.js" \
      "$ROOT/js/game.js" \
      "$ROOT/js/share.js" \
      "$ROOT/js/creator.js" \
      "$ROOT/js/creator-ui.js" \
      "$ROOT/js/ui.js" \
      "$ROOT/js/main.js" > "$OUT/game.bundle.js"
fi

cp "$ROOT/assets/logo.png" "$OUT/assets/"
cp "$ROOT/assets/1.png" "$OUT/assets/"
cp "$ROOT/assets/fonts/"*.ttf "$OUT/assets/fonts/"
if command -v sips >/dev/null 2>&1; then
  sips -z 192 192 "$ROOT/assets/logo.png" --out "$OUT/assets/icon-192.png" >/dev/null
  sips -z 512 512 "$ROOT/assets/logo.png" --out "$OUT/assets/icon-512.png" >/dev/null
else
  cp "$ROOT/assets/logo.png" "$OUT/assets/icon-192.png"
  cp "$ROOT/assets/logo.png" "$OUT/assets/icon-512.png"
fi

if [ -d "$GAME/music" ] && [ "$(ls -A "$GAME/music" 2>/dev/null)" ]; then
  cp "$GAME/music/"*.mp3 "$OUT/music/"
else
  cp "$ROOT/music/"*.mp3 "$OUT/music/"
fi

BUILD_ID="$(date -u +"%Y-%m-%d %H:%M:%S UTC")"
cp "$SCRIPT_DIR/itch-io-index.html" "$OUT/index.html"
sed -i '' "s|<!--BUILD_ID-->|$BUILD_ID|g" "$OUT/index.html" 2>/dev/null || sed -i "s|<!--BUILD_ID-->|$BUILD_ID|g" "$OUT/index.html"
echo "cybertime itch.io $BUILD_ID" > "$OUT/build.txt"
cp "$SCRIPT_DIR/ITCH-README.txt" "$OUT/README.txt"

ZIP="$ROOT/cybertime-itch.zip"
(cd "$OUT" && zip -r -q "$ZIP" .)

TOTAL_SIZE="$(du -sh "$OUT" | cut -f1)"
echo "Built $OUT ($TOTAL_SIZE)"
echo "Upload dist/itch/ or $ZIP to itch.io (HTML game)."
