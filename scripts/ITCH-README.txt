CyberTime — itch.io upload package
===================================

HOW TO UPLOAD
1. Zip everything inside dist/itch/ (index.html at the root of the zip).
   Or use cybertime-itch.zip from the project root.
2. Go to https://itch.io/game/new (or edit your existing game page).
3. Upload the ZIP under "Uploads".
4. Check "This file will be played in the browser".
5. Set viewport: 1280 x 720 (or leave default — game scales automatically).
6. Recommended: enable fullscreen button on the itch.io embed settings.

WHAT IS INCLUDED
- index.html       Entry point (relative paths, no Vercel analytics)
- game.bundle.js   Full game + Creator + community levels
- assets/          Fonts, logo, icons
- music/           Stage music files

ITCH.IO SETTINGS
- Kind: HTML
- Embed options: SharedArrayBuffer not required
- Orientation: Portrait on mobile (game shows rotate hint in landscape)

CONTROLS (for store description)
- Desktop: Left click = hit, Right click = defuse bombs, Middle = purple
- Mobile: Tap targets; double/triple tap for bombs

BUILD AGAIN
From project root:
    npm run build
    npm run build:itch

LOCAL TEST
    npx serve dist/itch
