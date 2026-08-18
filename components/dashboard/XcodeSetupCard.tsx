import { CopyButton } from '@/components/dashboard/CopyButton'
import {
  appStartSnippet,
  attributesSnippet,
  liveActivityWidgetSnippet,
  splitBundleId,
  SPM_PACKAGE_FROM,
  SPM_PACKAGE_URL,
  widgetBundleSnippet,
} from '@/lib/xcode-setup'

export function XcodeSetupCard({
  bundleId,
  publicKey,
}: {
  bundleId: string | null
  publicKey: string | null
}) {
  const parts = splitBundleId(bundleId)
  const startSnippet = appStartSnippet(publicKey)
  const attributes = attributesSnippet()
  const widget = liveActivityWidgetSnippet()
  const bundle = widgetBundleSnippet()

  return (
    <section className="surface-card mt-6 p-6">
      <h2 className="text-[16px] text-[var(--color-ink)]">Xcode</h2>
      <p className="mt-1 text-[13px] text-[var(--color-muted)]">
        You already have the iOS app. Add a Widget Extension (Include Live
        Activity), paste the package URL, put LiveHive on the app target. The
        attributes and widget files below live in your project — customize the
        SwiftUI when you are ready.
      </p>

      <dl className="mt-4 grid gap-3 text-[14px] sm:grid-cols-3">
        <div>
          <dt className="text-[12px] text-[var(--color-faint)]">Bundle ID</dt>
          <dd className="mt-1 font-mono text-[13px] text-[var(--color-ink)]">
            {parts.bundleId ?? 'Save APNs first'}
          </dd>
        </div>
        <div>
          <dt className="text-[12px] text-[var(--color-faint)]">
            Organization Identifier
          </dt>
          <dd className="mt-1 font-mono text-[13px] text-[var(--color-ink)]">
            {parts.orgIdentifier ?? 'everything before the last dot'}
          </dd>
        </div>
        <div>
          <dt className="text-[12px] text-[var(--color-faint)]">Product Name</dt>
          <dd className="mt-1 font-mono text-[13px] text-[var(--color-ink)]">
            {parts.productName ?? 'the last segment of the bundle id'}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] text-[var(--color-faint)]">Package URL</p>
          <CopyButton value={SPM_PACKAGE_URL} />
        </div>
        <pre className="mt-1 overflow-x-auto rounded-lg bg-black/30 p-3 font-mono text-[12px] text-[var(--color-ink-soft)]">
          {SPM_PACKAGE_URL}
        </pre>
        <p className="mt-2 font-mono text-[12px] text-[var(--color-faint)]">
          {SPM_PACKAGE_FROM}
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <Snippet label="Shared attributes (app + widget)" value={attributes} />
        <Snippet label="Live Activity UI (widget)" value={widget} />
        <Snippet label="Widget bundle" value={bundle} />
        <Snippet label="App (SDK)" value={startSnippet} />
      </div>
    </section>
  )
}

function Snippet({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] text-[var(--color-faint)]">{label}</p>
        <CopyButton value={value} />
      </div>
      <pre className="mt-1 overflow-x-auto rounded-lg bg-black/30 p-3 font-mono text-[12px] text-[var(--color-ink-soft)]">
        {value}
      </pre>
    </div>
  )
}
