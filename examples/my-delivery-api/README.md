# My Delivery API

Customer-style backend for **My Delivery App**. Separate from Live Hive.

iOS only **starts** and registers with Live Hive (`lh_pub_`). This API stores `lh_live_` and POSTs update (T+10s) then end (T+20s) to `https://www.livehive.dev/v1`.

## Deploy on Vercel (own project)

Do **not** add this to the livehive.dev Vercel project. New project, same GitHub repo:

1. [vercel.com/new](https://vercel.com/new) → import `iangdavis/live-activities`
2. **Root Directory:** `examples/my-delivery-api`
3. Framework Preset: Other
4. Environment variables (Production):
   - `LIVEHIVE_API_KEY` = Server API Key (`lh_live_...`) from the Live Hive project
   - optional `LIVEHIVE_API_BASE` = `https://www.livehive.dev/v1`
   - optional `DEMO_STEP_MS` = `10000`
5. Deploy

You get a URL like `https://my-delivery-api-….vercel.app`.

```bash
curl -sS https://YOUR-APP.vercel.app/health
```

`key_configured` should be `true`. In My Delivery App, set the API field to that origin (no path). Start POSTs `/demo/start`.

**Hobby** functions stop at 10 seconds. 10s+10s will not finish. Use Pro, or set `DEMO_STEP_MS=3000`.

If you already set `LIVEHIVE_DEMO_API_KEY` on **livehive.dev**, remove it. That was the same-app experiment.

## Local

```bash
cd examples/my-delivery-api
export LIVEHIVE_API_KEY='lh_live_...'
node server.mjs
```

Simulator: `http://127.0.0.1:8787`. A physical iPhone cannot use localhost.

## TestFlight

Live Hive APNs environment = **production**. Bundle ID `com.iandavis.livehive`. Point the app at the Vercel URL, not livehive.dev.
