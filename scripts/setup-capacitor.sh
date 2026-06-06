#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

bash scripts/build-deploy.sh
npm install

if [ ! -d android ]; then
  npx cap add android
fi

npx cap sync android
echo ""
echo "Android project ready. Open in Android Studio:"
echo "  npm run cap:android"
echo ""
echo "Build APK: Android Studio → Build → Build Bundle(s) / APK(s)"
