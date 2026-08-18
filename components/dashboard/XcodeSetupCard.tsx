import { CopyButton } from '@/components/dashboard/CopyButton'
import {
  appStartSnippet,
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
  const widgetSnippet = widgetBundleSnippet()

  return (
    <section className="surface-card mt-6 p-6">
      <h2 className="text-[16px] text-[var(--color-ink)]">Xcode</h2>
      <p className="mt-1 text-[13px] text-[var(--color-muted)]">
        New iOS App (not multiplatform). File → Add Package Dependencies — paste
        the URL, do not search “Live Hive”. Add the LiveHive library to the{' '}
        <strong>app</strong> and the <strong>widget</strong> targets. Do not
        name the app module LiveHive or livehive.
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

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] text-[var(--color-faint)]">App (Start)</p>
            <CopyButton value={startSnippet} />
          </div>
          <pre className="mt-1 overflow-x-auto rounded-lg bg-black/30 p-3 font-mono text-[12px] text-[var(--color-ink-soft)]">
            {startSnippet}
          </pre>
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] text-[var(--color-faint)]">
              Widget bundle
            </p>
            <CopyButton value={widgetSnippet} />
          </div>
          <pre className="mt-1 overflow-x-auto rounded-lg bg-black/30 p-3 font-mono text-[12px] text-[var(--color-ink-soft)]">
            {widgetSnippet}
          </pre>
        </div>
      </div>

      <ul className="mt-4 list-disc space-y-1 pl-5 text-[13px] text-[var(--color-muted)]">
        <li>
          Widget Extension → Include Live Activity. App target:{' '}
          <code>NSSupportsLiveActivities</code> = YES (Build Settings if the
          Info tab looks like macOS).
        </li>
        <li>Push Notifications capability on the app, not the widget.</li>
        <li>
          After Start, this project’s Activities list gets a row. Open it and
          tap Send test update — no backend yet.
        </li>
      </ul>
    </section>
  )
}
