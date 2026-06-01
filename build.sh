#!/usr/bin/env bash
# Build per-browser zips for the stores.
#
# manifest.json is the canonical Chromium (Chrome/Edge) manifest: MV3 with a
# background.service_worker. Firefox doesn't support MV3 service workers, so the
# Firefox zip gets a background.scripts field added; Edge rejects that field, so
# it must NOT be in the Chrome/Edge zip. Hence two separate builds.

set -euo pipefail
cd "$(dirname "$0")"

VERSION=$(jq -r .version manifest.json)
FILES=(manifest.json background.js content.js content.css popup.html popup.css popup.js icons)

CHROME_ZIP="kororin-v${VERSION}-chrome.zip"   # Chrome Web Store + Microsoft Edge Add-ons
FF_ZIP="kororin-v${VERSION}-firefox.zip"      # Firefox AMO

rm -f "$CHROME_ZIP" "$FF_ZIP"

# Chrome / Edge: files as-is.
zip -rq "$CHROME_ZIP" "${FILES[@]}" -x '*.DS_Store'

# Firefox: same files, but with background.scripts added back.
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
cp -r "${FILES[@]}" "$TMP"/
jq '.background.scripts = ["background.js"]' manifest.json > "$TMP/manifest.json"
( cd "$TMP" && zip -rq "$OLDPWD/$FF_ZIP" "${FILES[@]}" -x '*.DS_Store' )

echo "Built:"
echo "  $CHROME_ZIP  -> Chrome Web Store + Edge Add-ons"
echo "  $FF_ZIP  -> Firefox AMO"
