import ActivityKit
import LiveHive
import SwiftUI

struct ContentView: View {
    @AppStorage("livehive.publicKey") private var publicKey = ""
    @State private var activityId = ""
    @State private var message = "Start, then Send test update on the Live Hive activity page."

    var body: some View {
        NavigationStack {
            Form {
                Section("Live Hive") {
                    TextField("lh_pub_...", text: $publicKey)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .font(.system(.body, design: .monospaced))
                }
                Section("Activity") {
                    Button("Start") { start() }
                        .disabled(publicKey.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    if !activityId.isEmpty {
                        Text(activityId)
                            .font(.system(.footnote, design: .monospaced))
                            .textSelection(.enabled)
                    }
                    Text(message)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("My Delivery App")
        }
    }

    private func start() {
        let key = publicKey.trimmingCharacters(in: .whitespacesAndNewlines)
        LiveHive.configure(publicKey: key)

        do {
            let activity = try LiveHive.start()
            activityId = activity.id
            message = "Started. Open this activity in Live Hive and tap Send test update."
        } catch {
            message = error.localizedDescription
        }
    }
}
