import ActivityKit
import LiveHiveDemoKit
import SwiftUI
import UIKit

struct ContentView: View {
    @AppStorage("livehive.publicKey") private var publicKey = ""
    @State private var activityId = ""
    @State private var status = "Paste your iOS public key, then start."
    @State private var activity: Activity<DeliveryAttributes>?

    var body: some View {
        NavigationView {
            Form {
                Section("Live Hive") {
                    TextField("lh_pub_...", text: $publicKey)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .font(.system(.body, design: .monospaced))
                }

                Section("Activity") {
                    Button("Start Live Activity") {
                        start()
                    }
                    .disabled(publicKey.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)

                    if !activityId.isEmpty {
                        Text(activityId)
                            .font(.system(.footnote, design: .monospaced))
                            .textSelection(.enabled)
                        Button("Copy activity ID") {
                            UIPasteboard.general.string = activityId
                            status = "Copied activity ID. Use it in the update curl."
                        }
                    }

                    Text(status)
                        .font(.footnote)
                        .foregroundColor(.secondary)
                }

                Section("Next") {
                    Text("Leave this app, lock the phone, then send an update from your computer with the server API key. The Lock Screen should change.")
                        .font(.footnote)
                        .foregroundColor(.secondary)
                }
            }
            .navigationTitle("Live Hive Demo")
        }
        .navigationViewStyle(.stack)
    }

    private func start() {
        let key = publicKey.trimmingCharacters(in: .whitespacesAndNewlines)
        LiveHive.configure(publicKey: key)

        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            status = "Live Activities are disabled. Settings → Face ID & Passcode / Live Activities."
            return
        }

        do {
            let activity = try Activity.request(
                attributes: DeliveryAttributes(),
                content: .init(
                    state: .init(status: "preparing", eta: 12),
                    staleDate: nil
                ),
                pushType: .token
            )
            self.activity = activity
            activityId = activity.id
            LiveHive.register(activity, type: "delivery")
            status = "Started. Wait a few seconds for the token to register, then update from your computer."
        } catch {
            status = error.localizedDescription
        }
    }
}
