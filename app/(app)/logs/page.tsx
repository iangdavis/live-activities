import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { EmptyState, PageHeader, StatusPill } from '@/components/dashboard/ui'
import { ProjectPicker } from '@/components/dashboard/ProjectPicker'
import { formatDateTime } from '@/lib/format'
import Link from 'next/link'

type LogRow =
  | {
      id: string
      kind: 'delivery'
      createdAt: Date
      activityId: string
      activityName: string
      type: string
      status: 'queued' | 'sent' | 'failed'
      apnsStatus: number | null
      apnsReason: string | null
      error: string | null
      data: unknown
    }
  | {
      id: string
      kind: 'activity'
      createdAt: Date
      activityId: string
      activityName: string
      type: string | null
      status: 'active' | 'ended' | 'expired' | 'failed'
      apnsStatus: null
      apnsReason: null
      error: null
      data: null
    }

function rowSearchText(row: LogRow) {
  return JSON.stringify({
    activityId: row.activityId,
    activityName: row.activityName,
    type: row.type,
    status: row.status,
    apnsStatus: row.apnsStatus,
    apnsReason: row.apnsReason,
    error: row.error,
    data: row.data,
    createdAt: row.createdAt.toISOString(),
    friendlyTime: formatDateTime(row.createdAt),
  }).toLowerCase()
}

function rowMatchesQuery(row: LogRow, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return rowSearchText(row).includes(q)
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; q?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  const { project: projectId, q = '' } = await searchParams
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

  const [deliveries, activities] = await Promise.all([
    prisma.delivery.findMany({
      where: { projectId: selected.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { activity: true },
    }),
    prisma.activity.findMany({
      where: { projectId: selected.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ])

  const rows: LogRow[] = [
    ...deliveries.map((delivery) => ({
      id: delivery.id,
      kind: 'delivery' as const,
      createdAt: delivery.createdAt,
      activityId: delivery.activityId,
      activityName: delivery.activity.externalActivityId,
      type: delivery.type,
      status: delivery.status,
      apnsStatus: delivery.apnsStatus,
      apnsReason: delivery.apnsReason,
      error: delivery.error,
      data: delivery.payload,
    })),
    ...activities.map((activity) => ({
      id: `activity-${activity.id}`,
      kind: 'activity' as const,
      createdAt: activity.createdAt,
      activityId: activity.id,
      activityName: activity.externalActivityId,
      type: activity.type,
      status: activity.status,
      apnsStatus: null,
      apnsReason: null,
      error: null,
      data: null,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const filteredRows = rows.filter((row) => rowMatchesQuery(row, q))

  return (
    <div>
      <PageHeader title="Logs" />
      <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-end">
        <ProjectPicker projects={projects} selectedId={selected.id} path="/logs" />
        <form action="/logs" method="GET" className="surface-card p-4">
          <input type="hidden" name="project" value={selected.id} />
          <label className="mb-1 block text-[13px] text-[var(--color-muted)]" htmlFor="q">
            Search logs
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            className="field"
            placeholder="Search anything in the log"
          />
          <button type="submit" className="btn-primary mt-3">
            Search
          </button>
        </form>
      </div>

      {filteredRows.length === 0 ? (
        <EmptyState
          title="No matching logs"
          body={
            q
              ? `No rows matched "${q}". Try another term or clear the search.`
              : 'When Live Hive talks to APNs, the result shows up here.'
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
              <tr>
                <th className="pb-2 font-medium">Time (EST)</th>
                <th className="pb-2 font-medium">Activity</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">APNs</th>
                <th className="pb-2 font-medium">Data</th>
                <th className="pb-2 font-medium">Error</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-t border-[color:var(--color-line)] align-top">
                  <td className="py-3 font-mono text-[12px] text-[var(--color-muted)]">
                    {formatDateTime(row.createdAt)}
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/activities/${row.activityId}`}
                      className="font-mono text-[var(--color-ink)] hover:underline"
                    >
                      {row.activityName}
                    </Link>
                  </td>
                  <td className="py-3">{row.kind === 'activity' ? 'register' : row.type}</td>
                  <td className="py-3">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="py-3 font-mono text-[12px] text-[var(--color-muted)]">
                    {row.kind === 'delivery' ? `${row.apnsStatus ?? '—'} ${row.apnsReason ?? ''}` : '—'}
                  </td>
                  <td className="py-3 text-[13px] text-[var(--color-muted)]">
                    {row.kind === 'delivery' && row.data ? (
                      <details>
                        <summary className="cursor-pointer select-none">View data</summary>
                        <pre className="mt-2 overflow-x-auto rounded-md bg-[color:var(--color-surface-2)] p-2 font-mono text-[11px] leading-5 text-[var(--color-ink)]">
                          {JSON.stringify(row.data, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 text-[13px] text-red-300">{row.error ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
