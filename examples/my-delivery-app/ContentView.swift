import ActivityKit
import LiveHive
import SwiftUI

struct ContentView: View {
    @AppStorage("livehive.publicKey") private var publicKey = ""
    @AppStorage("mydelivery.apiOrigin") private var apiOrigin = ""
    @State private var activityId = ""
    @State private var message = "Start, then the server (my-delivery-api) will update and end the activity automatically."

    var body: some View {
        NavigationStack {
            Form {
                Section("Live Hive") {
                    TextField("lh_pub_...", text: $publicKey)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .font(.system(.body, design: .monospaced))
                    TextField("My Delivery API origin (https://host)", text: $apiOrigin)
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
            message = "Started. Scheduling server-driven updates..."

            let origin = apiOrigin.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !origin.isEmpty else {
                message = "Started. No API origin set — use the Live Hive dashboard to send a test update."
                return
            }

            // Post activity_id to the customer's my-delivery-api which will run update+end.
            var base = origin
            if base.hasSuffix("/") { base.removeLast() }
            guard let url = URL(string: "\(base)/demo/start") else {
                message = "Started. Invalid API origin"
                return
            }

            struct StartBody: Codable { let activity_id: String }

            var req = URLRequest(url: url)
            req.httpMethod = "POST"
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")

            do {
                req.httpBody = try JSONEncoder().encode(StartBody(activity_id: activity.id))
            } catch {
                message = "Started. Failed to build request body: \(error.localizedDescription)"
                return
            }

            Task {
                do {
                    let (data, resp) = try await URLSession.shared.data(for: req)
                    if let http = resp as? HTTPURLResponse {
                        if http.statusCode == 202 {
                            message = "Started. Server accepted demo start and will update/end the activity."
                        } else {
                            let bodyText = String(data: data, encoding: .utf8) ?? ""
                            message = "Started. Server returned \(http.statusCode): \(bodyText)"
                        }
                    } else {
                        message = "Started. Server response received."
                    }
                } catch {
                    message = "Started. Failed to contact server: \(error.localizedDescription)"
                }
            }
        } catch {
            message = error.localizedDescription
        }
    }
}
