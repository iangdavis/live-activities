# Live Hive iOS SDK

Start a Live Activity and register its push token with Live Hive. Updates and ends come from the Live Hive dashboard or HTTP with `lh_live_`. There is no server SDK.

Canonical API: `https://www.livehive.dev/v1`

## Install

In Xcode: File → Add Package Dependencies. Paste:

```text
https://github.com/iangdavis/livehive-ios
```

Choose version **0.2.0** or later. Add the `LiveHive` library to the **app** target.

```swift
dependencies: [
    .package(url: "https://github.com/iangdavis/livehive-ios.git", from: "0.2.0")
]
```

This folder is also the source copy inside the Live Hive app repo (`sdks/ios`). Add Local still works for development.

## Golden path

Put `ActivityAttributes` and the Live Activity widget in your project (see [Getting started](https://livehive.dev/docs/getting-started)). Then:

```swift
import LiveHive

LiveHive.configure(publicKey: "lh_pub_...")

let activity = try LiveHive.start(
    attributes: DeliveryAttributes(),
    contentState: .init(status: "preparing", eta: 12)
)
print(activity.id)
```

`start` is `Activity.request(..., pushType: .token)` plus token registration.

Open the activity in the Live Hive dashboard and tap **Send test update**. Your backend can POST later:

```text
POST https://www.livehive.dev/v1/activities/{activity.id}/update
Authorization: Bearer lh_live_...
```

Token rotation is handled automatically. Transient HTTP failures (429, 5xx) are retried.

Override `baseURL` only for local development.

See https://livehive.dev/llms.txt and https://livehive.dev/openapi.json.
