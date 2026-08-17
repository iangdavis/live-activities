# Live Hive iOS demo

Minimal app to prove Live Hive: start a Live Activity on the phone, register the push token, then update it from your computer.

Your home Mac (Monterey) cannot install this on a current iPhone. Use a **MacinCloud** hourly Mac for an afternoon. That Mac is in a data center, so you cannot plug your phone into it. You install the app with **TestFlight** instead.

## Before the cloud Mac (on any computer)

1. Paid [Apple Developer](https://developer.apple.com/programs/) account ($99/year). Required for TestFlight.
2. Live Hive project:
   - Bundle ID you will use in Xcode (this demo defaults to `dev.livehive.demo` — change it to something your team owns, e.g. `com.yourname.livehivedemo`).
   - APNs: Team ID, Key ID, `.p8`, that same Bundle ID, environment **Production** (TestFlight is production, not sandbox).
   - Copy the **iOS Public Key** (`lh_pub_...`).
   - Copy the **Server API Key** (`lh_live_...`) and keep it on your computer only.
3. Enable Live Activities on the iPhone: Settings → Face ID & Passcode → Live Activities (or Search → Live Activities).

## Afternoon on MacinCloud (~$1/hour)

1. Rent a **Pay as You Go** Mac with a current Xcode at [macincloud.com](https://www.macincloud.com/pages/payg.html).
2. Sign in to that Mac’s screen in the browser. Open Terminal:

```bash
git clone https://github.com/iangdavis/live-activities.git
open live-activities/examples/LiveHiveDemo/LiveHiveDemo.xcodeproj
```

3. In Xcode, select the **LiveHiveDemo** target → Signing & Capabilities:
   - Team = your Apple Developer team
   - Change the bundle ID if Xcode says it is taken. Use the same ID on the widget (`….widget`) and kit (`….kit`) targets, and in the Live Hive APNs Bundle ID field.
   - Confirm **Push Notifications** is present (the entitlements file already asks for it).
4. Product → Archive. In the Organizer: Distribute App → App Store Connect → Upload.
5. On [App Store Connect](https://appstoreconnect.apple.com): create the app if needed, wait until the build is processed, add yourself as a TestFlight tester, install TestFlight on the iPhone, install **Live Hive**.

## On the iPhone

1. Open the app.
2. Paste `lh_pub_...`.
3. Tap **Start Live Activity**.
4. Copy the activity ID.
5. Lock the phone. You should see “preparing” and “12 min”.

## On your computer (not the cloud Mac)

Wait ~10 seconds after Start so the token can register, then:

```bash
export LIVEHIVE_API_KEY='lh_live_...'
export ACTIVITY_ID='paste-from-the-phone'

curl -sS -X POST "https://api.livehive.dev/v1/activities/${ACTIVITY_ID}/update" \
  -H "Authorization: Bearer ${LIVEHIVE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"content_state":{"status":"driver_arriving","eta":4}}'
```

The Lock Screen should change to “driver_arriving” and 4 min. If the dashboard shows `BadDeviceToken`, the Live Hive APNs environment is still Sandbox — switch that project to **Production** and try again.

End it:

```bash
curl -sS -X POST "https://api.livehive.dev/v1/activities/${ACTIVITY_ID}/end" \
  -H "Authorization: Bearer ${LIVEHIVE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"content_state":{"status":"delivered","eta":0}}'
```

If that update lands, Live Hive works.
