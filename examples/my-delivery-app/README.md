# My Delivery App (iOS)

Drop-in sources for the Xcode app (`com.iandavis.livehive`, **My Delivery App** / `MyDeliveryApp`).

Start only. First update comes from the **Live Hive dashboard** (Send test update). You do not need My Delivery API for that.

## Replace in your Xcode project

1. Replace `ContentView.swift` with this folder’s `ContentView.swift`.
2. Widget bundle: this folder’s `DeliveryLiveActivity.swift` (`DeliveryLiveActivity()` from the LiveHive package). Do not keep a local `DeliveryAttributes` file — it lives in the package from 0.2.0.
3. Add LiveHive to the **app** and **widget** targets. Module name **MyDeliveryApp**.

## Run

1. Paste `lh_pub_...`, tap **Start**.
2. Dashboard → that activity → **Send test update**. Optional: Drive demo.

`DeliveryAttributes.swift` in this folder is only needed if you are still on SDK 0.1.x. From 0.2.0 the types live in the package.

## Own backend (optional)

`examples/my-delivery-api` still shows HTTP from a separate server. Point the phone at that origin only if you want the server to drive updates instead of the dashboard.
