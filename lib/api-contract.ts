/** Canonical public API origin. iOS SDK and HTTP examples must use this host. */
export const CANONICAL_API_ORIGIN = 'https://api.livehive.dev'

/** Versioned HTTP API base. All backend calls go here. */
export const CANONICAL_API_BASE = `${CANONICAL_API_ORIGIN}/v1`

export const PUBLIC_KEY_PREFIX = 'lh_pub_'
export const SECRET_KEY_PREFIX = 'lh_live_'

/** Swift package URL. Package.swift at the repo root points at sdks/ios. */
export const IOS_SDK_PACKAGE_URL = 'https://github.com/iangdavis/live-activities.git'
export const IOS_SDK_VERSION = '0.1.0'
