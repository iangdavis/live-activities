import {
  CANONICAL_API_BASE,
  IOS_SDK_PACKAGE_URL,
  IOS_SDK_VERSION,
} from './api-contract'

/** Git URL to paste in Xcode File → Add Package Dependencies. */
export const SPM_PACKAGE_URL = IOS_SDK_PACKAGE_URL.replace(/\.git$/, '')

export function splitBundleId(bundleId: string | null | undefined) {
  const value = bundleId?.trim() ?? ''
  const i = value.lastIndexOf('.')
  if (i <= 0 || i === value.length - 1) {
    return { bundleId: value || null, orgIdentifier: null, productName: null }
  }
  return {
    bundleId: value,
    orgIdentifier: value.slice(0, i),
    productName: value.slice(i + 1),
  }
}

/** Shared by the app and the widget. Change fields here, then match content_state. */
export function attributesSnippet() {
  return `import ActivityKit
import Foundation

struct DeliveryAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var status: String
    var eta: Int
  }
}`
}

/** Lock screen + Dynamic Island. This is the UI they customize. */
export function liveActivityWidgetSnippet() {
  return `import ActivityKit
import SwiftUI
import WidgetKit

struct DeliveryLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: DeliveryAttributes.self) { context in
      HStack {
        Text(context.state.status)
        Spacer()
        Text("\\(context.state.eta) min")
      }
      .padding()
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.bottom) {
          Text(context.state.status)
        }
      } compactLeading: {
        Text("LH")
      } compactTrailing: {
        Text("\\(context.state.eta)m")
      } minimal: {
        Text("\\(context.state.eta)")
      }
    }
  }
}`
}

export function widgetBundleSnippet() {
  return `import SwiftUI
import WidgetKit

@main
struct DeliveryWidgetBundle: WidgetBundle {
  var body: some Widget {
    DeliveryLiveActivity()
  }
}`
}

export function appStartSnippet(publicKey: string | null | undefined) {
  const key = publicKey?.trim() || 'lh_pub_...'
  return `import LiveHive

LiveHive.configure(publicKey: "${key}")

let activity = try LiveHive.start(
  attributes: DeliveryAttributes(),
  contentState: .init(status: "preparing", eta: 12)
)
print(activity.id)`
}

export function httpUpdateCurl(activityId: string) {
  return `curl -sS -X POST "${CANONICAL_API_BASE}/activities/${activityId}/update" \\
  -H "Authorization: Bearer $LIVEHIVE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"content_state":{"status":"driver_arriving","eta":4}}'`
}

export function httpEndCurl(activityId: string) {
  return `curl -sS -X POST "${CANONICAL_API_BASE}/activities/${activityId}/end" \\
  -H "Authorization: Bearer $LIVEHIVE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"content_state":{"status":"delivered","eta":0}}'`
}

export const SPM_PACKAGE_FROM = `.package(url: "${IOS_SDK_PACKAGE_URL}", from: "${IOS_SDK_VERSION}")`
