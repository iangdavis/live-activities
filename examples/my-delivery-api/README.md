# My Delivery API

Demo backend for **My Delivery App**. iOS **Start** only. Secret `lh_live_` stays on the server. Update at T+10s, end at T+20s.

Production path is the Live Hive Vercel app (not this Node process):

```
POST https://www.livehive.dev/api/demo/delivery/start
{ "activity_id": "<uuid>" }
```

## Vercel (same project as livehive.dev)

1. Vercel → live-activities → **Settings → Environment Variables**
2. Add **`LIVEHIVE_DEMO_API_KEY`** = your project **Server API Key** (`lh_live_...`)
   - Production (and Preview if you want)
3. **Redeploy** (env vars do not apply to the last build until you redeploy)
4. Optional: `LIVEHIVE_DEMO_STEP_MS` = `10000` (Hobby max duration is 10s — if the delayed jobs never run, set this to `3000` or use Pro)

Check:

```bash
curl -sS https://www.livehive.dev/api/demo/delivery/health
```

`key_configured` should be `true`. Then in My Delivery App set the API field to:

`https://www.livehive.dev/api/demo/delivery`

## Local Node (optional)

```bash
cd examples/my-delivery-api
export LIVEHIVE_API_KEY='lh_live_...'
node server.mjs
```

Simulator: `http://127.0.0.1:8787`. A physical iPhone cannot reach localhost.

Do not use `https://livehive.dev` (no www). Apex 308 breaks POST.

## TestFlight

Live Hive project APNs environment = **production**. Bundle ID `com.iandavis.livehive`. Use the Vercel URL above, not localhost.
