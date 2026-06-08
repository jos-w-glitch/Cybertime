CyberTime — CrazyGames upload package
======================================

HOW TO UPLOAD
1. Zip everything inside this folder (index.html at the root of the zip).
2. Go to https://developer.crazygames.com/
3. Create / open your game submission and upload the ZIP.

WHAT IS INCLUDED
- index.html          Entry point (includes CrazyGames SDK v2)
- game.bundle.js      Full game code
- assets/             Fonts, logo, icons
- music/              Compressed stage music + 90s menu loop

REQUIREMENTS (CrazyGames)
- Initial download should be ≤ 50MB (this build compresses audio for that).
- index.html must stay at the zip root.
- Game uses CrazyGames SDK: loading start/stop + gameplay start/stop.

LOCAL TEST
- Serve this folder with any static server, e.g.:
    npx serve crazy-games
- Open with ?useLocalSdk=true for SDK debug on localhost.

CONTROLS (for store listing)
- Desktop: Left click = hit blue, Right click = defuse bombs, Middle click = purple
- Mobile: Tap targets directly; double/triple tap for bombs

BUILD AGAIN
From project root:
    npm run build:crazygames
