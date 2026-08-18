import { CANONICAL_API_BASE, CANONICAL_API_ORIGIN, IOS_SDK_VERSION } from './api-contract'

/**
 * Machine-readable product contract for coding agents.
 * Served at /llms.txt. Keep this the source of truth for the golden path.
 */
export const LLMS_TXT = `# Live Hive

> iOS SDK starts a Live Activity and registers its push token. First update can come from the dashboard. Backends update and end over HTTP. No server SDK. Any language.

Docs: https://livehive.dev/docs/getting-started
OpenAPI: https://livehive.dev/openapi.json
iOS SDK: https://github.com/iangdavis/livehive-ios (Swift package, from ${IOS_SDK_VERSION})
HTML: https://livehive.dev/docs/for-agents

## Golden path

1. Existing iOS app. In Apple Developer, enable Push Notifications and Live Activities on the App ID. Create an APNs key (.p8).
2. Live Hive project: paste Team ID, Key ID, .p8, app bundle ID. Copy lh_pub_ for the app, lh_live_ for the API.
3. Xcode: Widget Extension (Include Live Activity). NSSupportsLiveActivities on the app. Paste https://github.com/iangdavis/livehive-ios. LiveHive on the app target.
4. Stock snippets in the app: DeliveryAttributes (shared with the widget), DeliveryLiveActivity UI, LiveHive.start(attributes:contentState:). Customize the SwiftUI later; keep content_state keys in sync.
5. Dashboard activity page: Send test update. Sample content_state is { status, eta }.
6. Backend: POST ${CANONICAL_API_BASE}/activities/{activity_id}/update and /end with lh_live_.

You add the Widget Extension and call start() on device. The SDK registers the token. It does not update or end. Dashboard test updates use session auth, not a public HTTP route.

## Keys

| Key | Prefix | Where | Allowed routes |
|---|---|---|---|
| iOS public | lh_pub_ | iOS app | POST /v1/activities/register only |
| Server secret | lh_live_ | backend env | update, end, GET activity |

They are not interchangeable. Dashboard owners can push a test update without exposing lh_live_ to the browser.

## Canonical API

Base: ${CANONICAL_API_BASE}
Auth: Authorization: Bearer <key>
Content-Type: application/json

Equivalent path on the app host (do not mix in examples): https://livehive.dev/api/v1
Do not POST to the apex livehive.dev (308). No trailing slash. activity_id must be in the path.

activity_id is yours (Activity.id from start(), or an order ID). Unique per project. Re-registering the same ID replaces the push token.

content_state is an opaque JSON object. The getting-started sample uses status (string) and eta (int). Live Hive does not transform it.

## Routes

POST /v1/activities/register
Authorization: Bearer lh_pub_...
{
  "activity_id": "order-123",
  "push_token": "<hex from ActivityKit>",
  "type": "delivery"
}
201: { "id", "type", "status", "created_at", "updated_at", "expires_at" }
Never returns the push token. Prefer LiveHive.start() over calling this yourself.

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

Empty activity_id returns 400 JSON (invalid_request), not a redirect.

## iOS SDK

Swift package: https://github.com/iangdavis/livehive-ios.git from ${IOS_SDK_VERSION}
LiveHive.configure(publicKey: "lh_pub_...")
let activity = try LiveHive.start(attributes:contentState:)
Getting started has stock DeliveryAttributes + widget UI in the app (customizable).
Default origin: ${CANONICAL_API_ORIGIN}
Override baseURL only for local development.
configure takes lh_pub_. start() throws if NSSupportsLiveActivities is missing.

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
- Do not skip WidgetKit or NSSupportsLiveActivities. LiveHive.start() sets pushType: .token.
- Do not send content_state that does not match the widget ContentState.
- Do not use lh_pub_ for update, end, or GET.
- Do not invent extra Live Hive HTTP routes. Dashboard test update is session-only.
- Do not search Xcode’s Apple package list for Live Hive. Paste the git URL.
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
