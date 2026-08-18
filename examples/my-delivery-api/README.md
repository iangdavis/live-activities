# My Delivery API

Demo backend for **My Delivery App**. The iOS app only **starts** a Live Activity and registers the token with Live Hive. This server updates at T+10s and ends at T+20s over HTTP with `lh_live_`.

The Live Hive iOS SDK does not update or end.

## Run

```bash
cd examples/my-delivery-api
export LIVEHIVE_API_KEY='lh_live_...'   # Server API Key from the Live Hive project
node server.mjs
```

Default: `http://127.0.0.1:8787`, Live Hive `https://www.livehive.dev/v1`.

Simulator can reach that URL. A physical iPhone cannot — use your Mac’s LAN IP (`http://192.168.x.x:8787`) or a tunnel, and allow HTTP in ATS if needed.

## Check

```bash
curl -sS http://127.0.0.1:8787/health
```

## iOS

After Start, the app POSTs:

```bash
curl -sS -X POST http://127.0.0.1:8787/demo/start \
  -H 'Content-Type: application/json' \
  -d '{"activity_id":"THE-UUID-FROM-START"}'
```

You should get `202` immediately. ~10s later Live Hive logs show **update** `sent`. ~10s after that, **end** `sent`.

Do not use `https://livehive.dev` (no www). Apex 308 breaks POST.

## TestFlight

Set the Live Hive project APNs environment to **production**. Keep bundle ID `com.iandavis.livehive`. Deploy this API to a public HTTPS host and point the app’s API field at that URL.
