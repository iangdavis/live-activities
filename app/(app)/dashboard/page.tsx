import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { EmptyState, PageHeader, StatusPill } from '@/components/dashboard/ui'

export default async function DashboardHome() {
  const session = await getSession()
  if (!session) redirect('/login')

  const projects = await prisma.project.findMany({
    where: { accountId: session.accountId },
    orderBy: { createdAt: 'desc' },
  })
  const projectIds = projects.map((p) => p.id)
  const activities = projectIds.length
    ? await prisma.activity.findMany({
        where: { projectId: { in: projectIds } },
        orderBy: { updatedAt: 'desc' },
        take: 8,
      })
    : []

  return (
    <div>
      <PageHeader title="Dashboard">
        <Link href="/projects" className="btn-primary">
          New project
        </Link>
      </PageHeader>

      <h2 className="text-[16px] font-semibold text-[var(--color-ink-soft)]">Projects</h2>
      {projects.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No projects yet"
            body="Create a project to get an API key and start sending Live Activities."
            actionHref="/projects"
            actionLabel="Create project"
          />
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="surface-card block p-5 hover:bg-[color:var(--color-surface-2)]"
              >
                <div className="text-[16px] font-semibold text-[var(--color-ink)]">
                  {project.name}
                </div>
                <div className="mt-1 font-mono text-[12px] text-[var(--color-faint)]">
                  {project.publicId}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 text-[16px] font-semibold text-[var(--color-ink-soft)]">
        Recent activity
      </h2>
      {activities.length === 0 ? (
        <p className="mt-3 text-[14px] text-[var(--color-muted)]">
          No activities yet. Follow the{' '}
          <Link href="/docs/getting-started" className="text-[var(--color-accent-soft)]">
            getting started guide
          </Link>
          .
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
              <tr>
                <th className="pb-2 font-medium">Activity</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-t border-[color:var(--color-line)]">
                  <td className="py-3">
                    <Link
                      href={`/activities/${activity.id}`}
                      className="font-mono text-[var(--color-ink)] hover:underline"
                    >
                      {activity.externalActivityId}
                    </Link>
                  </td>
                  <td className="py-3">
                    <StatusPill status={activity.status} />
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
