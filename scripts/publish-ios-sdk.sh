#!/usr/bin/env bash
# Publish sdks/ios to https://github.com/iangdavis/livehive-ios and tag VERSION.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="${1:-0.1.0}"
REMOTE="${LIVEHIVE_IOS_REMOTE:-https://github.com/iangdavis/livehive-ios.git}"
STAGE="$(mktemp -d)"
cleanup() { rm -rf "$STAGE"; }
trap cleanup EXIT

cp -a "$ROOT/sdks/ios/." "$STAGE/"
rm -rf "$STAGE/.build" "$STAGE/.swiftpm" "$STAGE/.git"

git -C "$STAGE" init -b main
git -C "$STAGE" add -A
git -C "$STAGE" commit -m "Live Hive iOS SDK ${VERSION}"
git -C "$STAGE" tag -a "$VERSION" -m "Live Hive iOS SDK ${VERSION}"
git -C "$STAGE" remote add origin "$REMOTE"
git -C "$STAGE" push -u origin main --force
git -C "$STAGE" push origin "$VERSION" --force

echo "Published ${VERSION} to ${REMOTE}"
