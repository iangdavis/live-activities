import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { EmptyState, PageHeader } from '@/components/dashboard/ui'

export default async function DashboardHome() {
  const session = await getSession()
  if (!session) redirect('/login')

  const projects = await prisma.project.findMany({
    where: { accountId: session.accountId },
    orderBy: { createdAt: 'desc' },
  })

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
    </div>
  )
}
