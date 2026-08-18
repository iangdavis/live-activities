import Link from 'next/link'

export function SetupChecklist({
  apnsConfigured,
  hasPublicKey,
  hasActivity,
  hasDelivery,
  latestActivityHref,
}: {
  apnsConfigured: boolean
  hasPublicKey: boolean
  hasActivity: boolean
  hasDelivery: boolean
  latestActivityHref?: string
}) {
  const steps = [
    {
      n: '01',
      title: 'Apple credentials',
      done: apnsConfigured,
      body: 'Team ID, Key ID, bundle ID, .p8. Sandbox for Xcode, production for TestFlight.',
    },
    {
      n: '02',
      title: 'iOS public key',
      done: hasPublicKey,
      body: 'lh_pub_ goes in the app. Never paste lh_live_ there.',
    },
    {
      n: '03',
      title: 'Xcode + LiveHive.start()',
      done: hasActivity,
      body: 'Paste the package URL. Widget target + plist flag. Start in the app.',
    },
    {
      n: '04',
      title: 'Test update from Live Hive',
      done: hasDelivery,
      body: latestActivityHref
        ? 'Open the activity and tap Send test update.'
        : 'After Start, the activity appears here. Tap Send test update before writing a backend.',
      href: latestActivityHref,
    },
  ]

  return (
    <ol className="mb-6 grid gap-3 text-[13px] text-[var(--color-muted)] sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step) => (
        <li key={step.n} className="surface-card px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-[var(--color-faint)]">
              {step.n}
            </span>
            <span
              className={`font-mono text-[11px] uppercase tracking-wide ${
                step.done
                  ? 'text-[var(--color-accent-soft)]'
                  : 'text-[var(--color-faint)]'
              }`}
            >
              {step.done ? 'Done' : 'Next'}
            </span>
          </div>
          <p className="mt-1 text-[var(--color-ink)]">{step.title}</p>
          <p className="mt-1 text-[12px] leading-relaxed">{step.body}</p>
          {step.href && (
            <Link
              href={step.href}
              className="mt-2 inline-block text-[12px] text-[var(--color-accent-soft)] hover:underline"
            >
              Open activity
            </Link>
          )}
        </li>
      ))}
    </ol>
  )
}
