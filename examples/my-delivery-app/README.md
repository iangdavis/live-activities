# My Delivery App (iOS)

Drop-in sources for the Xcode app (`com.iandavis.livehive`, **My Delivery App** / `MyDeliveryApp`).

Start only. **My Delivery API** is a **separate** Vercel (or local) server. It is not livehive.dev.

## Replace in your Xcode project

1. Replace `ContentView.swift` with this folder’s `ContentView.swift`.
2. Keep the widget. `DeliveryAttributes.swift` in **both** app and widget targets.
3. Module name **MyDeliveryApp**. LiveHive package on the **app** target only.

## Run

1. Deploy or run `examples/my-delivery-api`.
2. In the app, set **My Delivery API** to `http://127.0.0.1:8787` (simulator) or `https://your-app.vercel.app` (device / TestFlight).
3. Paste `lh_pub_...`, tap **Start**. No Update/End buttons.

~10s → `driver_arriving` / 4 min. ~20s → ended (or 3s+3s on Vercel Hobby).
