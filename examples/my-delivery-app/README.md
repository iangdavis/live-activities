# My Delivery App (iOS)

Drop-in sources for the Xcode app you already have (`com.iandavis.livehive`, display name **My Delivery App**, module **MyDeliveryApp**).

Start only. The server in `../my-delivery-api` updates at 10s and ends at 20s.

## Replace in your Xcode project

1. Replace `ContentView.swift` with this folder’s `ContentView.swift`.
2. Keep your existing widget. If you still need attributes, use `DeliveryAttributes.swift` in **both** the app and widget targets (one file, two checkboxes).
3. Product module name **MyDeliveryApp** (not `livehive` / `LiveHive`).
4. LiveHive package on the **app** target only: `https://github.com/iangdavis/livehive-ios` (0.1.1 if tagged, else 0.1.0 + `baseURL` already in this ContentView).
5. Remove in-app Update / End buttons.

## Run the demo

1. `LIVEHIVE_API_KEY='lh_live_...' node ../my-delivery-api/server.mjs`
2. Simulator: API URL `http://127.0.0.1:8787`
3. Paste `lh_pub_...`, tap **Start**, lock / use Dynamic Island.
4. ~10s → `driver_arriving` / 4 min. ~20s → ended.

Live Hive dashboard logs should show register, then update, then end. The iOS SDK never sends update/end.
