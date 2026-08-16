# Live Hive Node.js SDK

Thin `fetch` wrapper around the Live Hive REST API. Use this from your **backend** with a secret `lh_live_...` key.

The iOS app registers push tokens itself. This SDK updates and ends activities.

## Install

Until the package is published to npm:

```bash
npm install ./sdks/node
```

or copy `sdks/node/src/index.ts` into your backend.

## Usage

```ts
import { LiveHive } from 'livehive'

const livehive = new LiveHive({
  apiKey: process.env.LIVEHIVE_API_KEY!, // lh_live_...
  // baseUrl: 'http://localhost:3000/api/v1', // optional
})

await livehive.activities.update('abc123', {
  status: 'driver_arriving',
  eta: 4,
})

await livehive.activities.end('abc123', {
  status: 'delivered',
  eta: 0,
})
```

`update` and `end` send the object you pass as `content_state`. That object must match your widget `ContentState`.

## Publishing

1. Add a build step that emits `dist/` (`tsc --outDir dist`).
2. Point `main` / `exports` at the compiled files.
3. `npm publish --access public`.

Do not publish or accept `lh_pub_...` keys in this package. Public keys are for the iOS SDK only.
