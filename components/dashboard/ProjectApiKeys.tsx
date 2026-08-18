import { CreateApiKeyForm } from '@/components/dashboard/CreateApiKeyForm'
import { CopyButton } from '@/components/dashboard/CopyButton'
import { revokeApiKeyAction } from '@/app/(app)/actions'

type KeyRow = {
  id: string
  name: string
  type: 'PUBLIC' | 'SECRET'
  keyPrefix: string
  revealedKey: string | null
  lastUsedAt: Date | null
  revokedAt: Date | null
}

function KeyTable({
  projectId,
  keys,
  empty,
  allowReveal,
}: {
  projectId: string
  keys: KeyRow[]
  empty: string
  allowReveal: boolean
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      {keys.length === 0 ? (
        <p className="text-[14px] text-[var(--color-muted)]">{empty}</p>
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
            {keys.map((key) => {
              const revealed = allowReveal && !key.revokedAt ? key.revealedKey : null
              return (
                <tr key={key.id} className="border-t border-[color:var(--color-line)]">
                  <td className="py-3 text-[var(--color-ink)]">{key.name}</td>
                  <td className="py-3 font-mono text-[13px] text-[var(--color-muted)]">
                    {revealed ? (
                      <span className="break-all text-[var(--color-ink)]">{revealed}</span>
                    ) : (
                      <>
                        {key.keyPrefix}…
                        {key.revokedAt ? ' (revoked)' : ''}
                      </>
                    )}
                    {revealed && (
                      <span className="ml-3">
                        <CopyButton value={revealed} />
                      </span>
                    )}
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
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export function ProjectApiKeys({
  projectId,
  keys,
}: {
  projectId: string
  keys: KeyRow[]
}) {
  const publicKeys = keys.filter((key) => key.type === 'PUBLIC')
  const secretKeys = keys.filter((key) => key.type !== 'PUBLIC')

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <section className="surface-card p-6">
        <h2 className="text-[16px] text-[var(--color-ink)]">iOS Public Key</h2>
        <p className="mt-1 text-[13px] text-[var(--color-muted)]">
          Safe to include in your iOS app. Used only to register Live Activity
          push tokens. Never put a server key (<code>lh_live_</code>) here.
        </p>
        <CreateApiKeyForm
          projectId={projectId}
          type="PUBLIC"
          nameDefault="iOS"
          buttonLabel="Create iOS public key"
        />
        <KeyTable
          projectId={projectId}
          keys={publicKeys}
          empty="No iOS public key yet."
          allowReveal
        />
      </section>

      <section className="surface-card p-6">
        <h2 className="text-[16px] text-[var(--color-ink)]">Server API Key</h2>
        <p className="mt-1 text-[13px] text-[var(--color-muted)]">
          Keep this secret. Never put it in your iOS app. Use it from your
          backend to update and end activities — or skip it until after a
          dashboard test update.
        </p>
        <CreateApiKeyForm
          projectId={projectId}
          type="SECRET"
          nameDefault="Production"
          buttonLabel="Create server API key"
        />
        <KeyTable
          projectId={projectId}
          keys={secretKeys}
          empty="No server API key yet."
          allowReveal={false}
        />
      </section>
    </div>
  )
}
