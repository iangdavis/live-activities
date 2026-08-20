import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { listProjects } from '@/lib/projects'
import { createProjectAction } from '../actions'
import { EmptyState, Notice, PageHeader } from '@/components/dashboard/ui'
import Link from 'next/link'

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  const { error } = await searchParams
  const projects = await listProjects(session.accountId)

  return (
    <div>
      <PageHeader title="Setup" />
      <Notice error={error} />

      <form action={createProjectAction} className="surface-card mb-8 max-w-lg p-5">
        <h2 className="text-[16px] text-[var(--color-ink)]">Create a project</h2>
        <label htmlFor="name" className="mt-3 mb-1.5 block text-[13px] text-[var(--color-muted)]">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          className="field"
          placeholder="My Delivery App"
        />
        <button type="submit" className="btn-primary mt-4">
          Create project
        </button>
      </form>

      {projects.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          body="A project holds your API keys, APNs credentials, and Live Activities."
        />
      ) : (
        <ul className="space-y-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="surface-card flex items-center justify-between p-5 hover:bg-[color:var(--color-surface-2)]"
              >
                <div>
                  <div className="text-[16px] font-semibold text-[var(--color-ink)]">
                    {project.name}
                  </div>
                  <div className="mt-1 font-mono text-[12px] text-[var(--color-faint)]">
                    {project.publicId}
                  </div>
                </div>
                <div className="text-[13px] text-[var(--color-muted)]">
                  {project._count.activities} activities
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
