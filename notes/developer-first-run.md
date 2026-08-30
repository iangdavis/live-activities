# Developer first-run (live notes)

Walkthrough: a new iOS developer integrating Live Hive for the first time (Ian, Aug 2026). Append as we go. This is what actually happened, not polished docs.

**Status:** Golden path complete in Simulator. HTTP update **and** end `sent`. Live Hive dashboard shows the activity. Dynamic Island opens My Delivery App. Phone lock screen still nicer-to-have, not required to prove the API.

The product assumes the developer already has a Live Activity. Live Hive does not create it.

---

## Already in place (before Xcode)

These existed from creating the Live Hive project and Apple credentials:

1. Paid Apple Developer Program.
2. App ID **`com.iandavis.livehive`** (Identifiers) with Push Notifications and Live Activities.
3. APNs key (`.p8`), Team ID, Key ID.
4. Live Hive account + project.
5. Same bundle ID pasted into the Live Hive project APNs field — **app id only**, not the widget.
6. APNs environment chosen (sandbox for Xcode debug, production for TestFlight).
7. **iOS Public Key** `lh_pub_...` and **Server API Key** `lh_live_...`.

---

## Create the Xcode app

8. New iOS App (not multiplatform / not Mac).
9. **Organization Identifier** is the prefix of the existing App ID. **Product Name** is the last segment.
   - Org `com.iandavis` + product `livehive` → `com.iandavis.livehive`.
   - If Xcode capitalizes the last segment, set Bundle Identifier back to the exact App ID.
10. That bundle ID must match Apple Developer **and** the Live Hive APNs field.

---

## Phase before Live Hive (local ActivityKit)

A reasonable app before adding the SDK: attributes, widget, Start / Update / End on the UI. No package, no `lh_pub_`, `pushType: nil`.

11. Shared `DeliveryAttributes` (`status: String`, `eta: Int`) — same shape Getting Started will send as `content_state`.
12. `DeliveryAttributes` must compile into **both** targets. Either one file with both Target Membership boxes checked, or two identical copies (one per target). Not both — that is `invalid redeclaration`. The Live Activity `.swift` file stays widget-only.
13. App UI: Start (`Activity.request`), Update (`activity.update`), End (`activity.end`).
14. App target (not the widget) must set **`NSSupportsLiveActivities` = YES**. Without it, Start fails: `target does not include NSSupportsLiveActivities`. If the Info tab only shows **Custom macOS Application Target Properties**, the target is Mac/multiplatform — Live Activities will not work until **iPhone** is a destination. Fastest fix: app target → **Build Settings** → `INFOPLIST_KEY_NSSupportsLiveActivities` = `YES`. Xcode also shows **Supports frequent updates of Live Activities** (`NSSupportsLiveActivitiesFrequentUpdates`) — optional; YES is fine for a delivery-style activity. Key spelling: `NSSupportsLiveActivities`.
15. Run destination: **iPhone** (simulator or device), never **My Mac**. ActivityKit is iOS-only (`no such module ActivityKit` = compiling for Mac).
16. If no iPhone destination: Xcode → Settings → Platforms → download **iOS**.

---

## Add the widget extension

17. File → New → Target… → **Widget Extension**.
18. Check **Include Live Activity**. Uncheck Configuration App Intent if you only want a Live Activity.
19. Bundle ID’s last segment **is the product name**. To stay under the app id:
    - Organization Identifier `com.iandavis.livehive` + product `widget` → `com.iandavis.livehive.widget`, or
    - Create it, then edit the widget target Bundle Identifier.
20. Widget can be `com.iandavis.livehive.widget` or `com.iandavis.livehive.DeliveryWidget`. Either is fine.
21. Create a **second App ID** for that widget bundle ID. No Push capability on the widget.
22. Live Hive APNs bundle ID stays **`com.iandavis.livehive`**.
23. Widget **bundle** (`@main` `WidgetBundle`) must instantiate the **exact struct names** that exist. Xcode generates `YourProduct()` (home screen) and `YourProductLiveActivity.swift` — there is no file named `DeliveryLiveActivity` unless you add one. Open `*LiveActivity.swift`, copy the `struct … : Widget` name into the bundle (`Foo()`). Guessing `widgetLiveActivity()` still fails if the struct is `deliverywidgetLiveActivity`. The Live Activity file must be in the **widget** target.
24. If install fails with **missing its bundle executable** (`….appex` has no binary): the widget target did not produce an executable. Usual cause: Compile Sources empty, or the `@main` `WidgetBundle` file is not in the **widget** target (or the target failed to compile after the rename). The app still embeds an empty `.appex`.

---

## Signing (actual blocker)

25. Automatic signing needs **at least one device** on the team. Zero devices → `Communication with Apple failed` / no development profile.
26. Also: `No profiles for 'com.iandavis.livehive.widget'` until the widget App ID exists.
27. UDID is **not** in iPhone Settings.
    - Mac you can plug into: Finder → iPhone → click Serial until **UDID** (or Xcode → Devices and Simulators → Identifier).
    - Cloud / rented Mac cannot USB. Get UDID elsewhere, add it at [Devices](https://developer.apple.com/account/resources/devices/list).
28. Then both targets: Team + Automatically manage signing. Destination = a simulator or that registered phone, not Any iOS Device.

---

## Done (Simulator golden path)

- [x] Register phone UDID; widget App ID; signing succeeds (simulator path did not need the phone).
- [x] Local Start in Simulator shows `activity.id` (UUID). That is the HTTP `activity_id` later.
- [x] Ignore Xcode `Failed to show Widget '….widget'` / `Failed to get descriptors for extensionBundleID` in Simulator if Start still returned an id. Xcode is trying to open a Home Screen widget on SpringBoard; a Live Activity–only extension has no widget descriptor. Run the **app** scheme, not the widget scheme.
- [x] Local Update / End works in Simulator UI (lock screen on a phone still unproven).
- [x] Add package `https://github.com/iangdavis/livehive-ios` from `0.1.0` / `0.1.1` to the **app** target. Paste the GitHub URL — typing “Live Hive” in Add Package does not find it.
  - Do not name the app module `livehive` / `LiveHive` — `cannot load module 'livehive' as 'LiveHive'`. Display name **My Delivery App**, Product Module Name **`MyDeliveryApp`**. Bundle ID stays `com.iandavis.livehive`.
  - `unable to open dependencies file`: Build Settings **All** (not Basic); user-defined `SWIFT_ENABLE_EXPLICIT_MODULES` = `NO` on app and widget; wipe DerivedData; build once.
  - After a DerivedData wipe, `missing package product LiveHive` means Resolve Packages / confirm LiveHive is in the app’s Frameworks list.
- [x] `pushType: .token`, `LiveHive.configure(publicKey:)`, `LiveHive.register(activity)`. Start/Update/End still work locally in Simulator.
- [x] Push Notifications capability on the **app** target.
- [x] HTTP POST update with `lh_live_` to `https://www.livehive.dev/v1/activities/{id}/update` returned `"status":"sent"`. Host must be **www**, no trailing slash, activity UUID in the path (empty id → `Redirecting...`). Apex `livehive.dev` 308s. `api.livehive.dev` is NXDOMAIN; 0.1.0 needs `baseURL: https://www.livehive.dev`.
- [x] Confirm dashboard + Live Activity UI (Dynamic Island opens My Delivery App).
- [x] HTTP **end** with the same host/key/id. Update and end both visible in Live Hive logs.

## Later (phone / TestFlight)

- [ ] Lock screen on a real phone.
- [ ] Tag / Update Packages so Xcode is not stuck on SDK `0.1.0`.
- [ ] Archive → TestFlight. APNs **production**. Phone talks to the My Delivery Vercel origin, not localhost.

---

## Friction log (do not bury)

| What they hit | Cause |
|---|---|
| What is Organization Identifier? | Xcode prefix; must match an App ID they already created for APNs. |
| Widget bundle id ends with product name | Expected. Edit it or set org to the app id. |
| `no such module ActivityKit` | Building for Mac, or iOS runtime not installed. |
| No iPhone destination | iOS platform not downloaded in Xcode. |
| No provisioning profile / no devices | Team has no UDID; widget App ID missing. |
| How do I get UDID? | Not in Settings. Finder/Xcode on a USB Mac. |
| `cannot find … in scope` in WidgetBundle | Bundle still calls Xcode’s generated `Widget()` / `*LiveActivity()` after you renamed or deleted those structs. |
| `.appex` missing bundle executable | Widget target built no binary: empty Compile Sources or `@main` not in the widget target. |
| Start: target does not include `NSSupportsLiveActivities` | Missing on the **app**. Info tab may only show macOS properties; set `INFOPLIST_KEY_NSSupportsLiveActivities` = YES in Build Settings, and confirm iPhone is a destination. |
| Xcode: Failed to show Widget / get descriptors for extensionBundleID | Simulator + debugger trying to preview a Home Screen widget. Live Activity–only bundle has no descriptor. Harmless if `activity.id` appeared. |
| `could not resolve host: api.livehive.dev` | Hostname is **NXDOMAIN**. API is on `www.livehive.dev` (`/api/v1` and `/v1`). Docs and SDK default are ahead of DNS. |
| curl body is `Redirecting...` | Apex `livehive.dev` 308s POST; trailing slash; `http://`; empty `{activity_id}` in the path. Use `https://www.livehive.dev/v1/...`, no slash, UUID inline. |
| Type “Live Hive” in Add Package | Apple’s Swift Packages list is Apple-only. GitHub search needs a GitHub account in Xcode plus repo description/topics (and/or Swift Package Index). Install path is still paste `https://github.com/iangdavis/livehive-ios`. |
| Xcode stuck on SDK `0.1.0` | `0.1.1` lives on `live-activities` until it is tagged on `livehive-ios`. Override `baseURL` or Update packages after the tag. |
| `unable to open dependencies file` | Xcode 16 incremental SPM flake. Wipe DerivedData; `SWIFT_ENABLE_EXPLICIT_MODULES` = `NO` (Build Settings **All**). |
| `missing package product LiveHive` | After a DerivedData wipe, Resolve Packages; LiveHive must be in the **app** Frameworks list. |
| `cannot load module 'livehive' as 'LiveHive'` | App module name collides with the package. Product Module Name `MyDeliveryApp`. Display name can still be My Delivery App. Bundle ID stays the App ID. |

---

## Product scratchpad (kill this friction)

Not a roadmap. Ideas for Live Hive so the next person never hits the table above.

- **Send a test update from the dashboard** the moment an activity registers. First wow with no backend.
- **Copy Swift with their `lh_pub_` already in it** — configure + register + a one-file Live Activity. Stop sending people to File → New → Target.
- **Open this Xcode sample**, don’t File → New. Bundle ID field on the project page = the string they paste in Xcode.
- **Setup checklist** on the project: APNs → plist flag → paste SPM url (not search) → register → test push. Gray out later steps.
- **`api.livehive.dev` for real** and never 308 a POST. Dashboard curl always has www/api + a real activity id.
- **Don’t name the app LiveHive.** Say that next to the public key. Same screen: org identifier is everything before the last dot of the bundle id they already pasted.
- **Swift Package Index + GitHub description/topics** so Xcode search isn’t a dead end. Until then, a giant “paste this URL” — never “search Live Hive”.
- **SDK screams** if `NSSupportsLiveActivities` is missing, or if they paste `lh_live_` into the app.
- **TestFlight callout** when they flip to production: APNs env + phone URL is not localhost.
- **Optional hosted demo drive** (“we’ll update this activity for 20s”) so they can delay writing HTTP until after they believe it.
