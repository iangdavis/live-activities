import { CreateApiKeyForm } from '@/components/dashboard/CreateApiKeyForm'
import { revokeApiKeyAction } from '@/app/(app)/actions'

export function ProjectApiKeys({
  projectId,
  keys,
}: {
  projectId: string
  keys: Array<{
    id: string
    name: string
    keyPrefix: string
    lastUsedAt: Date | null
    revokedAt: Date | null
  }>
}) {
  return (
    <section className="surface-card mt-6 p-6">
      <h2 className="text-[16px] text-[var(--color-ink)]">API keys</h2>
      <p className="mt-1 text-[13px] text-[var(--color-muted)]">
        Scoped to this project. The full key is shown only once.
      </p>
      <CreateApiKeyForm projectId={projectId} />

      <div className="mt-6 overflow-x-auto">
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
                        <input type="hidden" name="projectId" value={projectId} />
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
    </section>
  )
}
