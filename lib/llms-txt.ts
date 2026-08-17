import { CANONICAL_API_BASE, CANONICAL_API_ORIGIN } from './api-contract'

/**
 * Machine-readable product contract for coding agents.
 * Served at /llms.txt. Keep this the source of truth for the golden path.
 */
export const LLMS_TXT = `# Live Hive

> iOS SDK registers ActivityKit push tokens. Backends update and end activities over HTTP. No server SDK. Any language.

Docs: https://livehive.dev/docs/getting-started
OpenAPI: https://livehive.dev/openapi.json
iOS SDK: https://github.com/iangdavis/live-activities (Swift package, from 0.1.0)
HTML: https://livehive.dev/docs/for-agents

## Golden path

1. Create a project at https://livehive.dev. Add APNs credentials. Copy two keys.
2. iOS: Activity.request(..., pushType: .token), then LiveHive.configure(publicKey:) and LiveHive.register(activity).
3. Backend: POST ${CANONICAL_API_BASE}/activities/{activity_id}/update with lh_live_.
4. Backend: POST ${CANONICAL_API_BASE}/activities/{activity_id}/end with lh_live_.

You still own ActivityKit, a WidgetKit extension, and NSSupportsLiveActivities. The iOS SDK does not create the Live Activity, define ContentState, or send updates.

## Keys

| Key | Prefix | Where | Allowed routes |
|---|---|---|---|
| iOS public | lh_pub_ | iOS app | POST /v1/activities/register only |
| Server secret | lh_live_ | backend env | update, end, GET activity |

They are not interchangeable.

## Canonical API

Base: ${CANONICAL_API_BASE}
Auth: Authorization: Bearer <key>
Content-Type: application/json

Equivalent path on the app host (do not mix in examples): https://livehive.dev/api/v1

activity_id is yours (Activity.id or an order ID). Unique per project. Re-registering the same ID replaces the push token.

content_state is an opaque JSON object. It must match the widget ContentState keys and types. Live Hive does not transform it.

## Routes

POST /v1/activities/register
Authorization: Bearer lh_pub_...
{
  "activity_id": "order-123",
  "push_token": "<hex from ActivityKit>",
  "type": "delivery"
}
201: { "id", "type", "status", "created_at", "updated_at", "expires_at" }
Never returns the push token. Prefer the iOS SDK over calling this yourself.

POST /v1/activities/{activity_id}/update
Authorization: Bearer lh_live_...
{
  "content_state": { "status": "driver_arriving", "eta": 4 }
}
Optional: alert { title, body, sound }, stale_date (unix seconds), relevance_score (0–1).
200: { "id", "activity_id", "status": "sent" | "failed" | "queued" }

POST /v1/activities/{activity_id}/end
Authorization: Bearer lh_live_...
{ "content_state": { "status": "delivered", "eta": 0 } }
Body may be empty. Optional dismissal_date (unix seconds).
200: { "id", "activity_id", "status": "sent" | "failed" | "queued" }

GET /v1/activities/{activity_id} — optional. Secret key. Metadata only, no token.

POST /v1/activities — optional legacy create with a secret key and push_token. Public keys cannot call it. Do not use this in new integrations.

## iOS SDK

Swift package: https://github.com/iangdavis/live-activities.git from 0.1.0
LiveHive.configure(publicKey: "lh_pub_...")
LiveHive.register(activity)
Default origin: ${CANONICAL_API_ORIGIN}
Override baseURL only for local development.
Do not pass lh_live_ to the SDK.

## Errors

{
  "error": { "code": "invalid_api_key", "message": "..." }
}

| HTTP | code |
|---|---|
| 400 | invalid_json, invalid_request, apns_not_configured |
| 401 | unauthorized, invalid_api_key |
| 403 | forbidden, plan_limit |
| 404 | activity_not_found |
| 409 | activity_ended |
| 429 | rate_limited |
| 500 | internal_error |

Delivery can be HTTP 200 with status "failed". Check the dashboard for the APNs reason. Live Hive does not invent a successful delivery.

## Do not

- Do not put lh_live_ in the iOS app or Widget extension.
- Do not build a token-forwarding or token-registration server. The iOS SDK registers the token.
- Do not look for a server SDK or npm package. Backend is HTTP only.
- Do not skip WidgetKit, Activity.request, or pushType: .token.
- Do not send content_state that does not match the widget ContentState.
- Do not use lh_pub_ for update, end, or GET.
- Do not invent extra Live Hive routes.
`

export function llmsTxtResponse(): Response {
  return new Response(LLMS_TXT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
