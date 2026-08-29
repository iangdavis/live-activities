import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { listProjects } from '@/lib/projects'
import { createProjectAction } from '../actions'
import Link from 'next/link'
import { Notice } from '@/components/dashboard/ui'

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; create?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { error, create } = await searchParams
  const projects = await listProjects(session.accountId)
  const shouldCreate = create === '1'

  if (projects.length > 0 && !shouldCreate) {
    redirect(`/projects/${projects[0].id}`)
  }

  return (
    <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
      <div className="w-full max-w-xl rounded-[28px] border border-[color:var(--color-line)] bg-[var(--color-panel)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] uppercase tracking-[0.22em] text-[var(--color-faint)]">
              New project
            </p>
            <h1 className="mt-3 text-[30px] font-semibold tracking-tight text-[var(--color-ink)] sm:text-[36px]">
              Create a project
            </h1>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-[var(--color-muted)]">
              Add your first project to connect APNs, generate keys, and send Live Activity updates.
            </p>
          </div>
          {projects.length > 0 ? (
            <Link href={`/projects/${projects[0].id}`} className="text-[14px] text-[var(--color-muted)] hover:text-[var(--color-ink)]">
              Close
            </Link>
          ) : null}
        </div>

        <Notice error={error} />

        <form action={createProjectAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-[13px] text-[var(--color-muted)]">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              className="field"
              placeholder="My Delivery App"
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" className="btn-primary">
              Create project
            </button>
            {projects.length > 0 ? (
              <Link href={`/projects/${projects[0].id}`} className="btn-ghost">
                Cancel
              </Link>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  )
}
