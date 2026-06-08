#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/crazy-games"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

rm -rf "$OUT"
mkdir -p "$OUT/assets/fonts" "$OUT/music"

echo "Bundling game..."
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
    "$ROOT/js/crazygames-config.js" \
    "$ROOT/js/crazygames.js" \
    "$ROOT/js/crazygames-hooks.js" \
    "$ROOT/js/crazygames-ui.js" \
    "$ROOT/js/promo.js" \
    "$ROOT/js/ui.js" \
    "$ROOT/js/main.js" \
    "$ROOT/js/crazygames-bridge.js" > "$OUT/game.bundle.js"

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

echo "Compressing music for CrazyGames size limits..."
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found — copying music as-is (may exceed 50MB upload limit)"
  cp "$ROOT/music/"*.mp3 "$OUT/music/"
else
  for f in "$ROOT/music/"*.mp3; do
    name="$(basename "$f")"
    if [ "$name" = "menu.mp3" ]; then
      ffmpeg -y -loglevel error -i "$f" -t 90 -b:a 48k -ac 1 "$OUT/music/$name"
    else
      ffmpeg -y -loglevel error -i "$f" -b:a 64k -ac 1 "$OUT/music/$name"
    fi
  done
fi

BUILD_ID="$(date -u +"%Y-%m-%d %H:%M:%S UTC")"
cp "$SCRIPT_DIR/crazygames-index.html" "$OUT/index.html"
sed -i '' "s|<!--BUILD_ID-->|$BUILD_ID|g" "$OUT/index.html" 2>/dev/null || sed -i "s|<!--BUILD_ID-->|$BUILD_ID|g" "$OUT/index.html"
echo "cybertime crazygames $BUILD_ID" > "$OUT/build.txt"

cp "$SCRIPT_DIR/CRAZYGAMES-README.txt" "$OUT/README.txt"

TOTAL_SIZE="$(du -sh "$OUT" | cut -f1)"
FILE_COUNT="$(find "$OUT" -type f | wc -l | tr -d ' ')"
ZIP="$ROOT/cybertime-crazygames.zip"
(cd "$OUT" && zip -r -q "$ZIP" .)
echo "Built $OUT ($TOTAL_SIZE, $FILE_COUNT files)"
echo "ZIP: $ZIP"
echo "Upload crazy-games/ or cybertime-crazygames.zip to CrazyGames Developer Portal."
