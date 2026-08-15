import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { listApiKeys } from '@/lib/api-keys'
import { revokeApiKeyAction } from '../actions'
import { CreateApiKeyForm } from '@/components/dashboard/CreateApiKeyForm'
import { EmptyState, PageHeader } from '@/components/dashboard/ui'
import { ProjectPicker } from '@/components/dashboard/ProjectPicker'

export default async function ApiKeysPage({
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
        <PageHeader title="API Keys" />
        <EmptyState
          title="Create a project first"
          body="API keys belong to a project."
          actionHref="/dashboard/projects"
          actionLabel="Create project"
        />
      </div>
    )
  }

  const keys = await listApiKeys(session.accountId, selected.id)

  return (
    <div>
      <PageHeader title="API Keys" />
      {projects.length > 1 && (
        <ProjectPicker
          projects={projects}
          selectedId={selected.id}
          path="/dashboard/api-keys"
        />
      )}

      <CreateApiKeyForm projectId={selected.id} />

      <div className="mt-8 overflow-x-auto">
        {keys.length === 0 ? (
          <p className="text-[14px] text-[var(--color-muted)]">No keys yet.</p>
        ) : (
          <table className="w-full text-left text-[14px]">
            <thead className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
              <tr>
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Key</th>
                <th className="pb-2 font-medium">Last used</th>
                <th className="pb-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-t border-[color:var(--color-line)]">
                  <td className="py-3 text-[var(--color-ink)]">{key.name}</td>
                  <td className="py-3 font-mono text-[13px] text-[var(--color-muted)]">
                    {key.keyPrefix}…
                    {key.revokedAt ? ' (revoked)' : ''}
                  </td>
                  <td className="py-3 text-[var(--color-muted)]">
                    {key.lastUsedAt ? key.lastUsedAt.toISOString() : 'Never'}
                  </td>
                  <td className="py-3 text-right">
                    {!key.revokedAt && (
                      <form action={revokeApiKeyAction}>
                        <input type="hidden" name="projectId" value={selected.id} />
                        <input type="hidden" name="apiKeyId" value={key.id} />
                        <button
                          type="submit"
                          className="text-[13px] text-red-300 hover:underline"
                        >
                          Revoke
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
