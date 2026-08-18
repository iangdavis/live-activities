#!/usr/bin/env bash
# Publish sdks/ios to https://github.com/iangdavis/livehive-ios and tag VERSION.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="${1:-0.2.0}"
REMOTE="${LIVEHIVE_IOS_REMOTE:-https://github.com/iangdavis/livehive-ios.git}"
STAGE="$(mktemp -d)"
cleanup() { rm -rf "$STAGE"; }
trap cleanup EXIT

if [ -n "${LIVEHIVE_IOS_TOKEN:-}" ]; then
  REMOTE="https://x-access-token:${LIVEHIVE_IOS_TOKEN}@github.com/iangdavis/livehive-ios.git"
elif [[ "$REMOTE" != *x-access-token:* ]] && [[ "$REMOTE" != *:@* ]]; then
  ORIGIN_URL="$(git -C "$ROOT" remote get-url origin 2>/dev/null || true)"
  TOKEN="$(printf '%s' "$ORIGIN_URL" | sed -n 's#.*x-access-token:\([^@]*\)@.*#\1#p')"
  if [ -n "$TOKEN" ]; then
    REMOTE="https://x-access-token:${TOKEN}@github.com/iangdavis/livehive-ios.git"
  fi
fi

cp -a "$ROOT/sdks/ios/." "$STAGE/"
rm -rf "$STAGE/.build" "$STAGE/.swiftpm" "$STAGE/.git"

git -C "$STAGE" init -b main
git -C "$STAGE" add -A
git -C "$STAGE" -c user.name="${GIT_AUTHOR_NAME:-Cursor Agent}" \
  -c user.email="${GIT_AUTHOR_EMAIL:-cursoragent@cursor.com}" \
  commit -m "Live Hive iOS SDK ${VERSION}"
git -C "$STAGE" tag -a "$VERSION" -m "Live Hive iOS SDK ${VERSION}"
git -C "$STAGE" remote add origin "$REMOTE"

if ! git -C "$STAGE" push -u origin main --force; then
  echo "Push to livehive-ios failed." >&2
  echo "cursor[bot] cannot write unless that repo is in the Cursor GitHub App, or LIVEHIVE_IOS_TOKEN is a PAT with Contents: write." >&2
  exit 1
fi
git -C "$STAGE" push origin "$VERSION" --force

echo "Published ${VERSION} to https://github.com/iangdavis/livehive-ios"
