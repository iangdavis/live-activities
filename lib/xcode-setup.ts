import {
  CANONICAL_API_BASE,
  IOS_SDK_PACKAGE_URL,
  IOS_SDK_VERSION,
} from './api-contract'

/** Git URL to paste in Xcode. Do not search the Apple package list for “Live Hive”. */
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

export function appStartSnippet(publicKey: string | null | undefined) {
  const key = publicKey?.trim() || 'lh_pub_...'
  return `import LiveHive

LiveHive.configure(publicKey: "${key}")

let activity = try LiveHive.start()
print(activity.id)`
}

export function widgetBundleSnippet() {
  return `import LiveHive
import SwiftUI
import WidgetKit

@main
struct DeliveryWidgetBundle: WidgetBundle {
  var body: some Widget {
    DeliveryLiveActivity()
  }
}`
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
