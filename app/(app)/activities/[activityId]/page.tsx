import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { tokenPreview } from '@/lib/crypto'
import { Notice, PageHeader, StatusPill } from '@/components/dashboard/ui'
import { ActivityDemoControls } from '@/components/dashboard/ActivityDemoControls'
import { CopyButton } from '@/components/dashboard/CopyButton'
import { httpEndCurl, httpUpdateCurl } from '@/lib/xcode-setup'
import { formatDateTime } from '@/lib/format'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const DEMO_OK: Record<string, string> = {
  update: 'Test update sent. Lock the phone — status should become driver_arriving.',
  end: 'End sent. The Live Activity should dismiss.',
  drive: 'Demo started. Another update in ~4s, then end. Stay on this page.',
}

export default async function ActivityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ activityId: string }>
  searchParams: Promise<{ error?: string; demo?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  const { activityId } = await params
  const { error, demo } = await searchParams
  const activity = await prisma.activity.findFirst({
    where: {
      id: activityId,
      project: { accountId: session.accountId },
    },
    include: {
      project: true,
      deliveries: { orderBy: { createdAt: 'desc' }, take: 50 },
    },
  })
  if (!activity) notFound()

  const updateCurl = httpUpdateCurl(activity.externalActivityId)
  const endCurl = httpEndCurl(activity.externalActivityId)
  const ended = activity.status === 'ended'

  return (
    <div>
      <PageHeader title={activity.externalActivityId} />
      <p className="mb-6 text-[14px] text-[var(--color-muted)]">
        Project{' '}
        <Link
          href={`/projects/${activity.projectId}`}
          className="text-[var(--color-ink)] hover:underline"
        >
          {activity.project.name}
        </Link>
      </p>

      <Notice error={error} ok={demo ? DEMO_OK[demo] : undefined} />

      <section className="surface-card p-6">
        <h2 className="text-[16px] text-[var(--color-ink)]">First success</h2>
        <p className="mt-1 text-[13px] text-[var(--color-muted)]">
          Live Hive pushes from here with your APNs key. The phone never sees{' '}
          <code>lh_live_</code>. Uses the delivery template{' '}
          <code>status</code> + <code>eta</code>. Your own backend can take over
          later.
        </p>
        <div className="mt-4">
          <ActivityDemoControls activityId={activity.id} ended={ended} />
        </div>
      </section>

      <section className="surface-card mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <div>
          <div className="text-[12px] text-[var(--color-faint)]">Status</div>
          <div className="mt-1">
            <StatusPill status={activity.status} />
          </div>
        </div>
        <div>
          <div className="text-[12px] text-[var(--color-faint)]">Type</div>
          <div className="mt-1 text-[14px] text-[var(--color-ink)]">
            {activity.type ?? '—'}
          </div>
        </div>
        <div>
          <div className="text-[12px] text-[var(--color-faint)]">Created</div>
          <div className="mt-1 text-[14px] text-[var(--color-ink)]">
            {formatDateTime(activity.createdAt)}
          </div>
        </div>
        <div>
          <div className="text-[12px] text-[var(--color-faint)]">Last updated</div>
          <div className="mt-1 text-[14px] text-[var(--color-ink)]">
            {formatDateTime(activity.updatedAt)}
          </div>
        </div>
        <div>
          <div className="text-[12px] text-[var(--color-faint)]">Push token</div>
          <div className="mt-1 font-mono text-[14px] text-[var(--color-ink)]">
            present {tokenPreview(activity.pushToken)}
          </div>
        </div>
        <div>
          <div className="text-[12px] text-[var(--color-faint)]">Ended</div>
          <div className="mt-1 text-[14px] text-[var(--color-ink)]">
            {formatDateTime(activity.endedAt)}
          </div>
        </div>
      </section>

      <section className="surface-card mt-6 p-6">
        <h2 className="text-[16px] text-[var(--color-ink)]">Your backend later</h2>
        <p className="mt-1 text-[13px] text-[var(--color-muted)]">
          Same JSON Live Hive just sent. Host is www — no trailing slash, UUID
          already in the path. <code>$LIVEHIVE_API_KEY</code> is your server key.
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] text-[var(--color-faint)]">Update</p>
            <CopyButton value={updateCurl} />
          </div>
          <pre className="mt-1 overflow-x-auto rounded-lg bg-black/30 p-3 font-mono text-[12px] text-[var(--color-ink-soft)]">
            {updateCurl}
          </pre>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] text-[var(--color-faint)]">End</p>
            <CopyButton value={endCurl} />
          </div>
          <pre className="mt-1 overflow-x-auto rounded-lg bg-black/30 p-3 font-mono text-[12px] text-[var(--color-ink-soft)]">
            {endCurl}
          </pre>
        </div>
      </section>

      <h2 className="mt-10 text-[16px] text-[var(--color-ink)]">Update log</h2>
      {activity.deliveries.length === 0 ? (
        <p className="mt-3 text-[14px] text-[var(--color-muted)]">No updates yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
              <tr>
                <th className="pb-2 font-medium">Timestamp</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">APNs result</th>
                <th className="pb-2 font-medium">Error</th>
              </tr>
            </thead>
            <tbody>
              {activity.deliveries.map((d) => (
                <tr key={d.id} className="border-t border-[color:var(--color-line)]">
                  <td className="py-3 font-mono text-[12px] text-[var(--color-muted)]">
                    {formatDateTime(d.createdAt)}
                  </td>
                  <td className="py-3">{d.type}</td>
                  <td className="py-3">
                    <StatusPill status={d.status} />
                  </td>
                  <td className="py-3 font-mono text-[12px] text-[var(--color-muted)]">
                    {d.apnsStatus ?? '—'}
                    {d.apnsReason ? ` ${d.apnsReason}` : ''}
                  </td>
                  <td className="py-3 text-[13px] text-red-300">{d.error ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
