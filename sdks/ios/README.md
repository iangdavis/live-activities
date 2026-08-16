# Live Hive iOS SDK

Minimal Swift package that registers ActivityKit push tokens with Live Hive.

The SDK does **not** create Live Activities, define `ActivityAttributes`, or send updates. ActivityKit and WidgetKit remain your responsibility.

## Install

Add the package to your Xcode project (File → Add Package Dependencies) once it is published, or add a local package path to `sdks/ios`.

```swift
dependencies: [
    .package(url: "https://github.com/your-org/livehive-ios.git", from: "0.1.0")
]
```

Until the package is published, point Swift Package Manager at this directory:

```text
sdks/ios
```

## Usage

```swift
import ActivityKit
import LiveHive

try? LiveHive.configure(
    publicKey: "lh_pub_..."
    // baseURL: URL(string: "http://localhost:3000") // optional, for development
)

let activity = try Activity.request(
    attributes: MyAttributes(),
    content: ...,
    pushType: .token
)

LiveHive.register(activity)
```

`configure` requires a public key (`lh_pub_...`). Do not pass a server API key (`lh_live_...`).

`register` observes `activity.pushTokenUpdates`, converts each token to lowercase hex, and POSTs it to:

```text
POST https://api.livehive.dev/v1/activities/register
Authorization: Bearer lh_pub_...
```

Token rotation is handled automatically. Transient HTTP failures (429, 5xx) are retried.

## Publishing

1. Move or mirror `sdks/ios` into its own git repository.
2. Tag a release (`0.1.0`).
3. Add the repository URL in Xcode as a Swift Package.

No secret credentials belong in this package.
