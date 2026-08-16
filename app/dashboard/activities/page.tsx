import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { EmptyState, PageHeader, StatusPill } from '@/components/dashboard/ui'
import { ProjectPicker } from '@/components/dashboard/ProjectPicker'
import { tokenPreview } from '@/lib/crypto'
import Link from 'next/link'

export default async function ActivitiesPage({
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
        <PageHeader title="Activities" />
        <EmptyState
          title="No activities"
          body="Create a Live Activity with your API key after creating a project."
          actionHref="/docs/getting-started"
          actionLabel="Read the docs"
        />
      </div>
    )
  }

  const activities = await prisma.activity.findMany({
    where: { projectId: selected.id },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  })

  return (
    <div>
      <PageHeader title="Activities" />
      {projects.length > 1 && (
        <ProjectPicker
          projects={projects}
          selectedId={selected.id}
          path="/dashboard/activities"
        />
      )}
      {activities.length === 0 ? (
        <EmptyState
          title="No activities in this project"
          body="POST /api/v1/activities with your API key to create one."
          actionHref="/docs/activities/register"
          actionLabel="Create docs"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
              <tr>
                <th className="pb-2 font-medium">Activity</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Last update</th>
                <th className="pb-2 font-medium">Last delivery</th>
                <th className="pb-2 font-medium">Created</th>
                <th className="pb-2 font-medium">Ended</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-t border-[color:var(--color-line)]">
                  <td className="py-3">
                    <Link
                      href={`/dashboard/activities/${activity.id}`}
                      className="font-mono text-[var(--color-ink)] hover:underline"
                    >
                      {activity.externalActivityId}
                    </Link>
                    <div className="font-mono text-[11px] text-[var(--color-faint)]">
                      token {tokenPreview(activity.pushToken)}
                    </div>
                  </td>
                  <td className="py-3">
                    <StatusPill status={activity.status} />
                  </td>
                  <td className="py-3 text-[var(--color-muted)]">
                    {activity.updatedAt.toISOString()}
                  </td>
                  <td className="py-3">
                    {activity.lastDeliveryStatus ? (
                      <StatusPill status={activity.lastDeliveryStatus} />
                    ) : (
                      <span className="text-[var(--color-faint)]">—</span>
                    )}
                  </td>
                  <td className="py-3 text-[var(--color-muted)]">
                    {activity.createdAt.toISOString()}
                  </td>
                  <td className="py-3 text-[var(--color-muted)]">
                    {activity.endedAt?.toISOString() ?? '—'}
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
