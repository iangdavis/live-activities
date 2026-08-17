import ActivityKit
import LiveHiveDemoKit
import SwiftUI
import WidgetKit

@main
struct LiveHiveDemoWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DeliveryAttributes.self) { context in
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Live Hive")
                        .font(.caption.weight(.semibold))
                    Text(context.state.status)
                        .font(.headline)
                }
                Spacer()
                Text("\(context.state.eta) min")
                    .font(.title2.monospacedDigit().weight(.semibold))
            }
            .padding()
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text("Live Hive")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(context.state.eta) min")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.state.status)
                        .font(.headline)
                }
            } compactLeading: {
                Text("LH")
            } compactTrailing: {
                Text("\(context.state.eta)m")
            } minimal: {
                Text("\(context.state.eta)")
            }
        }
    }
}
