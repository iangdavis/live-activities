import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { tokenPreview } from '@/lib/crypto'
import { PageHeader, StatusPill } from '@/components/dashboard/ui'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ activityId: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  const { activityId } = await params
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

      <section className="surface-card grid gap-4 p-6 sm:grid-cols-2">
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
            {activity.createdAt.toISOString()}
          </div>
        </div>
        <div>
          <div className="text-[12px] text-[var(--color-faint)]">Last updated</div>
          <div className="mt-1 text-[14px] text-[var(--color-ink)]">
            {activity.updatedAt.toISOString()}
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
            {activity.endedAt?.toISOString() ?? '—'}
          </div>
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
                    {d.createdAt.toISOString()}
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
