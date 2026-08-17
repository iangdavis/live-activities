# Developer first-run (live notes)

Walkthrough: a new iOS developer integrating Live Hive for the first time (Ian, Aug 2026). Append as we go. This is what actually happened, not polished docs.

**Status:** mid-scaffold. Local ActivityKit app + widget in Xcode. Not on a device yet. Live Hive SDK not added.

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
14. App Info: `NSSupportsLiveActivities` = YES.
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

## Not done yet

- [ ] Register phone UDID; widget App ID; signing succeeds.
- [ ] Local Start → lock phone → Update / End changes the Lock Screen (no Live Hive).
- [ ] Add package `https://github.com/iangdavis/livehive-ios` from `0.1.0` to the **app** target.
- [ ] `pushType: .token`, `LiveHive.configure(publicKey:)`, `LiveHive.register(activity)`.
- [ ] Push Notifications capability on the **app** target.
- [ ] Copy `activity.id`; wait a few seconds; POST update/end with `lh_live_` to `https://api.livehive.dev/v1`.
- [ ] Confirm dashboard delivery / APNs errors (`BadDeviceToken` = sandbox vs production mismatch).

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
