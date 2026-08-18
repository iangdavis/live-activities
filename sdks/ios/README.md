# Live Hive iOS SDK

Start a Live Activity, register its push token with Live Hive. The SDK does **not** update or end activities — do that from the Live Hive dashboard (test update) or over HTTP with `lh_live_`. There is no server SDK.

Canonical API: `https://www.livehive.dev/v1`

## Install

In Xcode: File → Add Package Dependencies. **Paste** this URL. Do not search “Live Hive” in the Apple package list.

```text
https://github.com/iangdavis/livehive-ios
```

Choose version **0.2.0** or later. Add the `LiveHive` library to the **app** and the **widget** targets. Do not name your app module `LiveHive` or `livehive`.

```swift
dependencies: [
    .package(url: "https://github.com/iangdavis/livehive-ios.git", from: "0.2.0")
]
```

This folder is also the source copy inside the Live Hive app repo (`sdks/ios`). Add Local still works for development.

## Golden path

App target (`NSSupportsLiveActivities` = YES, Push Notifications capability):

```swift
import LiveHive

LiveHive.configure(publicKey: "lh_pub_...")

let activity = try LiveHive.start()
print(activity.id)
```

`start()` is `Activity.request(..., pushType: .token)` plus token registration.

Widget extension (`WidgetBundle` — you still create the target):

```swift
import LiveHive
import SwiftUI
import WidgetKit

@main
struct DeliveryWidgetBundle: WidgetBundle {
    var body: some Widget {
        DeliveryLiveActivity()
    }
}
```

Open the activity in the Live Hive dashboard and tap **Send test update**. Your backend can POST later:

```text
POST https://www.livehive.dev/v1/activities/{activity.id}/update
Authorization: Bearer lh_live_...
```

Token rotation is handled automatically. Transient HTTP failures (429, 5xx) are retried.

Override `baseURL` only for local development.

## Do not

- Do not pass a server key (`lh_live_...`) to `configure`.
- Do not use this SDK to update or end activities.
- Do not skip the Widget Extension, `NSSupportsLiveActivities`, or `pushType: .token`.

See https://livehive.dev/llms.txt and https://livehive.dev/openapi.json.
