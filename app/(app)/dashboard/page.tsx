import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { EmptyState, PageHeader } from '@/components/dashboard/ui'

function percent(value: number) {
  return `${Math.round(value * 10) / 10}%`
}

export default async function DashboardHome() {
  const session = await getSession()
  if (!session) redirect('/login')

  const projects = await prisma.project.findMany({
    where: { accountId: session.accountId },
    orderBy: { createdAt: 'desc' },
  })

  if (projects.length === 0) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <EmptyState
          title="No projects yet"
          body="Hit New project to create your first project and start seeing delivery health and activity metrics here."
          actionHref="/setup"
          actionLabel="New project"
        />
      </div>
    )
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const projectsWithStats = await Promise.all(
    projects.map(async (project) => {
      const [activeActivities, createdLast7d, deliveriesLast7d, sentLast7d, failedLast7d, latestActivity] =
        await Promise.all([
          prisma.activity.count({ where: { projectId: project.id, status: 'active' } }),
          prisma.activity.count({ where: { projectId: project.id, createdAt: { gte: sevenDaysAgo } } }),
          prisma.delivery.count({ where: { projectId: project.id, createdAt: { gte: sevenDaysAgo } } }),
          prisma.delivery.count({ where: { projectId: project.id, createdAt: { gte: sevenDaysAgo }, status: 'sent' } }),
          prisma.delivery.count({ where: { projectId: project.id, createdAt: { gte: sevenDaysAgo }, status: 'failed' } }),
          prisma.activity.findFirst({
            where: { projectId: project.id },
            orderBy: { createdAt: 'desc' },
            select: { id: true },
          }),
        ])

      return {
        project,
        activeActivities,
        createdLast7d,
        deliveriesLast7d,
        sentLast7d,
        failedLast7d,
        latestActivity,
        successRateLast7d: deliveriesLast7d > 0 ? (sentLast7d / deliveriesLast7d) * 100 : 0,
      }
    }),
  )

  return (
    <div>
      <PageHeader title="Dashboard">
        <Link href="/setup" className="btn-primary">
          New project
        </Link>
      </PageHeader>

      <div className="space-y-8">
        {projectsWithStats.map(({ project, activeActivities, createdLast7d, deliveriesLast7d, sentLast7d, failedLast7d, latestActivity, successRateLast7d }) => (
          <section key={project.id} className="surface-card p-6">
            <h2 className="text-[22px] font-semibold text-[var(--color-ink)]">{project.name}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="surface-card p-5">
                <div className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
                  Active activities
                </div>
                <div className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">{activeActivities}</div>
              </div>
              <div className="surface-card p-5">
                <div className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
                  Success rate, 7d
                </div>
                <div className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">
                  {percent(successRateLast7d)}
                </div>
              </div>
              <div className="surface-card p-5">
                <div className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
                  Deliveries, 7d
                </div>
                <div className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">{deliveriesLast7d}</div>
                <div className="mt-1 text-[12px] text-[var(--color-muted)]">
                  {sentLast7d} sent, {failedLast7d} failed
                </div>
              </div>
              <div className="surface-card p-5">
                <div className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
                  Created, 7d
                </div>
                <div className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">{createdLast7d}</div>
                <div className="mt-1 text-[12px] text-[var(--color-muted)]">
                  Latest activity shown below if present
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section className="surface-card p-6">
                <h3 className="text-[16px] text-[var(--color-ink)]">Latest activity</h3>
                {latestActivity ? (
                  <div className="mt-3 font-mono text-[13px] text-[var(--color-muted)]">
                    <Link href={`/activities/${latestActivity.id}`} className="hover:underline">
                      View latest activity
                    </Link>
                  </div>
                ) : (
                  <p className="mt-3 text-[13px] text-[var(--color-muted)]">
                    No activity started yet.
                  </p>
                )}
              </section>

              <section className="surface-card p-6">
                <h3 className="text-[16px] text-[var(--color-ink)]">Health note</h3>
                <p className="mt-3 text-[13px] text-[var(--color-muted)]">
                  Use this section to watch delivery health for the selected project. APNs and key
                  setup live on the project page.
                </p>
              </section>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
