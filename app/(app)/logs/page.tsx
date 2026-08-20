import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { EmptyState, PageHeader, StatusPill } from '@/components/dashboard/ui'
import { ProjectPicker } from '@/components/dashboard/ProjectPicker'
import Link from 'next/link'

function formatDiagnostics(value: unknown) {
  if (!value || typeof value !== 'object') return '—'
  const diagnostics = value as Record<string, unknown>
  const pieces = [
    diagnostics.apnsStatus != null ? `APNs ${diagnostics.apnsStatus}` : null,
    typeof diagnostics.apnsReason === 'string' && diagnostics.apnsReason
      ? diagnostics.apnsReason
      : null,
    typeof diagnostics.error === 'string' && diagnostics.error ? diagnostics.error : null,
  ].filter(Boolean)
  return pieces.length > 0 ? pieces.join(' • ') : '—'
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  const { project: projectId } = await searchParams
  const projects = await prisma.project.findMany({
    where: { accountId: session.accountId },
    orderBy: { createdAt: 'desc' },
  })
  const selected = projects.find((p) => p.id === projectId) ?? projects[0]

  if (!selected) {
    return (
      <div>
        <PageHeader title="Logs" />
        <EmptyState
          title="No delivery logs"
          body="Logs appear after you send an update through the API."
        />
      </div>
    )
  }

  const deliveries = await prisma.delivery.findMany({
    where: { projectId: selected.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { activity: true },
  })

  return (
    <div>
      <PageHeader title="Logs" />
      <ProjectPicker projects={projects} selectedId={selected.id} path="/logs" />
      {deliveries.length === 0 ? (
        <EmptyState
          title="No deliveries yet"
          body="When Live Hive talks to APNs, the result shows up here."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
              <tr>
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium">Activity</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">APNs</th>
                <th className="pb-2 font-medium">Diagnostics</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id} className="border-t border-[color:var(--color-line)] align-top">
                  <td className="py-3 font-mono text-[12px] text-[var(--color-muted)]">
                    {d.createdAt.toISOString()}
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/activities/${d.activityId}`}
                      className="font-mono text-[var(--color-ink)] hover:underline"
                    >
                      {d.activity.externalActivityId}
                    </Link>
                  </td>
                  <td className="py-3">{d.type}</td>
                  <td className="py-3">
                    <StatusPill status={d.status} />
                  </td>
                  <td className="py-3 font-mono text-[12px] text-[var(--color-muted)]">
                    {d.apnsStatus ?? '—'} {d.apnsReason ?? ''}
                  </td>
                  <td className="py-3 text-[13px] text-[var(--color-muted)]">
                    <div>{formatDiagnostics(d.diagnostics) ?? '—'}</div>
                    {d.diagnostics && typeof d.diagnostics === 'object' ? (
                      <details className="mt-1 text-[12px] text-[var(--color-faint)]">
                        <summary className="cursor-pointer select-none">View details</summary>
                        <pre className="mt-2 overflow-x-auto rounded-md bg-[color:var(--color-surface-2)] p-2 font-mono text-[11px] leading-5 text-[var(--color-ink)]">
                          {JSON.stringify(d.diagnostics, null, 2)}
                        </pre>
                      </details>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
