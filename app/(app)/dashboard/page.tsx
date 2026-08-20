import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { EmptyState, PageHeader } from '@/components/dashboard/ui'
import { ProjectPicker } from '@/components/dashboard/ProjectPicker'

function percent(value: number) {
  return `${Math.round(value * 10) / 10}%`
}

export default async function DashboardHome({
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
  const selected = projectId ? projects.find((project) => project.id === projectId) ?? projects[0] : projects[0]

  if (!selected) {
    return (
      <div>
        <PageHeader title="Dashboard">
          <Link href="/setup" className="btn-primary">
            New project
          </Link>
        </PageHeader>
        <EmptyState
          title="No projects yet"
          body="Create a project in Setup to see delivery health and activity metrics here."
          actionHref="/setup"
          actionLabel="Go to setup"
        />
      </div>
    )
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const [activeActivities, createdLast7d, deliveriesLast7d, sentLast7d, failedLast7d, latestActivity] =
    await Promise.all([
      prisma.activity.count({ where: { projectId: selected.id, status: 'active' } }),
      prisma.activity.count({ where: { projectId: selected.id, createdAt: { gte: sevenDaysAgo } } }),
      prisma.delivery.count({ where: { projectId: selected.id, createdAt: { gte: sevenDaysAgo } } }),
      prisma.delivery.count({ where: { projectId: selected.id, createdAt: { gte: sevenDaysAgo }, status: 'sent' } }),
      prisma.delivery.count({ where: { projectId: selected.id, createdAt: { gte: sevenDaysAgo }, status: 'failed' } }),
      prisma.activity.findFirst({
        where: { projectId: selected.id },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      }),
    ])

  const successRateLast7d = deliveriesLast7d > 0 ? (sentLast7d / deliveriesLast7d) * 100 : 0

  return (
    <div>
      <PageHeader title="Dashboard">
        <Link href="/setup" className="btn-primary">
          New project
        </Link>
      </PageHeader>

      <div className="mb-4 text-[13px] text-[var(--color-muted)]">Project health</div>
      <h2 className="text-[22px] font-semibold text-[var(--color-ink)]">{selected.name}</h2>
      <div className="mt-1 font-mono text-[12px] text-[var(--color-faint)]">{selected.publicId}</div>

      <ProjectPicker projects={projects} selectedId={selected.id} path="/dashboard" />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <section className="surface-card p-5">
          <div className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
            Active activities
          </div>
          <div className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">{activeActivities}</div>
        </section>
        <section className="surface-card p-5">
          <div className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
            Success rate, 7d
          </div>
          <div className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">
            {percent(successRateLast7d)}
          </div>
        </section>
        <section className="surface-card p-5">
          <div className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
            Deliveries, 7d
          </div>
          <div className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">{deliveriesLast7d}</div>
          <div className="mt-1 text-[12px] text-[var(--color-muted)]">
            {sentLast7d} sent, {failedLast7d} failed
          </div>
        </section>
        <section className="surface-card p-5">
          <div className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
            Created, 7d
          </div>
          <div className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">{createdLast7d}</div>
          <div className="mt-1 text-[12px] text-[var(--color-muted)]">
            Latest activity shown below if present
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card p-6">
          <h2 className="text-[16px] text-[var(--color-ink)]">Latest activity</h2>
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
          <h2 className="text-[16px] text-[var(--color-ink)]">Health note</h2>
          <p className="mt-3 text-[13px] text-[var(--color-muted)]">
            Use this page to watch delivery health for the selected project. Setup lives in the
            project details screen.
          </p>
        </section>
      </div>
    </div>
  )
}
