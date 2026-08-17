# Live Hive

Live Activities, without the backend headache.

Live Hive is an HTTP API, dashboard, and iOS SDK for Live Activities.
The iOS app registers the ActivityKit push token directly with Live Hive. Your
backend updates and ends activities with a secret API key. Live Hive talks to
APNs and records whether Apple accepted the push.

This repository is a single [Next.js](https://nextjs.org/) application
(marketing, docs, dashboard, and `/api/v1`) plus the iOS SDK in `sdks/ios`.

## Product flow

```
iOS app  →  Live Hive register  →  stored push token
Your backend  →  Live Hive update/end  →  APNs  →  iPhone
```

No token-registration server is required. Do not put `lh_live_...` in the iOS app.

Public API:

```
POST /v1/activities/register          # iOS public key (lh_pub_...)
POST /v1/activities/:id/update       # server API key (lh_live_...)
POST /v1/activities/:id/end          # server API key
```

Also served at `/api/v1/*`. `api.livehive.dev/v1/*` rewrites to the same routes.

`POST /v1/activities` remains available as a secret-key create endpoint for
existing backends.

## Local development

```bash
cp .env.example .env
# Generate secrets:
#   openssl rand -base64 32   # AUTH_SECRET and CRON_SECRET
#   openssl rand -hex 32      # ENCRYPTION_KEY

docker compose up -d db
npm install
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional delivery worker (only needed for leftover queued jobs; API routes
deliver to APNs during the request):

```bash
npm run worker
```

## Tests

```bash
npm test
```

Integration tests that hit Postgres run when `CI=true` or `RUN_DB_TESTS=1`.

```bash
docker compose up -d db
DATABASE_URL=postgresql://livehive:livehive@localhost:5432/livehive \
  DIRECT_URL=postgresql://livehive:livehive@localhost:5432/livehive \
  RUN_DB_TESTS=1 npm test
```

## Environment variables

See `.env.example` for every variable.

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled Postgres URL |
| `DIRECT_URL` | Direct Postgres URL for migrations |
| `AUTH_SECRET` | Signs session cookies |
| `APP_URL` | Canonical origin (`https://livehive.dev`) |
| `ENCRYPTION_KEY` | 32-byte hex key that encrypts APNs `.p8` material |
| `CRON_SECRET` | Bearer token for `/api/cron/deliver` and activation metrics |

Never commit `.p8` files, API keys, or `.env`.

## Production (Vercel)

1. Create a Vercel project from this repo.
2. Provision managed Postgres (Vercel Postgres, Neon, or similar).
3. Set the environment variables above.
4. Attach domains:
   - `livehive.dev` → the Next.js deployment
   - `api.livehive.dev` → the same deployment (`/v1/*` rewrites to `/api/v1/*`)
5. Deploy. `postinstall` runs `prisma generate`. Run `prisma migrate deploy`
   against production (Vercel build command can be
   `prisma migrate deploy && prisma generate && next build`).

APNs delivery happens in the API request (HTTP/2 to Apple, a few hundred
milliseconds). `/api/cron/deliver` can retry leftover `queued` rows if you
call it with `Authorization: Bearer $CRON_SECRET`. Vercel Hobby does not
support cron, so that schedule is not configured. On Pro you can add it in
the dashboard, or run `npm run worker` as a small Node process.

## Apple / APNs

Each project needs:

- Team ID
- Key ID
- `.p8` private key
- Bundle ID
- Sandbox or production

Documented at `/docs/apns`. Live Hive does not fake successful delivery.

## iOS SDK

`sdks/ios` — `LiveHive.configure` + `LiveHive.register(activity)`

Your backend updates and ends activities with HTTP (`POST /v1/activities/:id/update` and `/end`). Docs include Node.js, Python, Go, and Ruby examples.

## What this MVP does not include

Design Studio, Android, SSO, team permissions, billing automation,
Kubernetes, or extra notification providers.
