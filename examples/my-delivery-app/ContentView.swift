import ActivityKit
import LiveHive
import SwiftUI

struct ContentView: View {
    @AppStorage("livehive.publicKey") private var publicKey = ""
    @AppStorage("mydelivery.apiBase") private var apiBase = "http://127.0.0.1:8787"
    @State private var activityId = ""
    @State private var message = "Start. The server updates in 10s and ends in 20s."

    var body: some View {
        NavigationStack {
            Form {
                Section("Live Hive") {
                    TextField("lh_pub_...", text: $publicKey)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .font(.system(.body, design: .monospaced))
                }
                Section("My Delivery API") {
                    TextField("https://your-delivery-api.vercel.app", text: $apiBase)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .font(.system(.footnote, design: .monospaced))
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
        LiveHive.configure(
            publicKey: key,
            baseURL: URL(string: "https://www.livehive.dev")!
        )

        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            message = "Enable Live Activities in Settings."
            return
        }

        do {
            let activity = try Activity.request(
                attributes: DeliveryAttributes(),
                content: .init(state: .init(status: "preparing", eta: 12), staleDate: nil),
                pushType: .token
            )
            activityId = activity.id
            LiveHive.register(activity)
            message = "Started. Telling the server…"
            Task { await notifyServer(activityId: activity.id) }
        } catch {
            message = error.localizedDescription
        }
    }

    private func notifyServer(activityId: String) async {
        let root = apiBase
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        guard let url = URL(string: "\(root)/demo/start") else {
            message = "Bad My Delivery API URL."
            return
        }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONSerialization.data(
            withJSONObject: ["activity_id": activityId]
        )
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            let status = (response as? HTTPURLResponse)?.statusCode ?? 0
            let body = String(data: data, encoding: .utf8) ?? ""
            if status == 202 {
                message = "Server accepted. Update in 10s, end in 20s. Lock the phone."
            } else {
                message = "Server \(status): \(body)"
            }
        } catch {
            message = error.localizedDescription
        }
    }
}
