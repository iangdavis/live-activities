import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { getOwnedProject } from '@/lib/projects'
import { listApiKeys } from '@/lib/api-keys'
import { encryptionKeyStatus } from '@/lib/env'
import { updateApnsAction } from '../../actions'
import { Notice, PageHeader } from '@/components/dashboard/ui'
import { ProjectApiKeys } from '@/components/dashboard/ProjectApiKeys'

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>
  searchParams: Promise<{ error?: string; saved?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  const { projectId } = await params
  const { error, saved } = await searchParams
  const project = await getOwnedProject(session.accountId, projectId)
  const keys = await listApiKeys(session.accountId, project.id)
  const apnsConfigured = Boolean(project.apnsKeyEncrypted)
  const encryption = encryptionKeyStatus()

  return (
    <div>
      <PageHeader title={project.name} />
      <Notice
        error={error || (!encryption.ok ? encryption.message : undefined)}
        saved={saved === '1'}
      />

      <ol className="mb-6 grid gap-3 text-[13px] text-[var(--color-muted)] sm:grid-cols-3">
        <li className="surface-card px-4 py-3">
          <span className="font-mono text-[11px] text-[var(--color-faint)]">01</span>
          <p className="mt-1 text-[var(--color-ink)]">Configure Apple credentials</p>
        </li>
        <li className="surface-card px-4 py-3">
          <span className="font-mono text-[11px] text-[var(--color-faint)]">02</span>
          <p className="mt-1 text-[var(--color-ink)]">Copy the iOS public key</p>
        </li>
        <li className="surface-card px-4 py-3">
          <span className="font-mono text-[11px] text-[var(--color-faint)]">03</span>
          <p className="mt-1 text-[var(--color-ink)]">Copy the server API key</p>
        </li>
      </ol>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card p-6">
          <h2 className="text-[16px] text-[var(--color-ink)]">Project credentials</h2>
          <dl className="mt-4 space-y-3 text-[14px]">
            <div>
              <dt className="text-[var(--color-faint)]">Project ID</dt>
              <dd className="mt-1 font-mono text-[var(--color-ink)]">{project.publicId}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-faint)]">Internal ID</dt>
              <dd className="mt-1 font-mono text-[var(--color-ink-soft)]">{project.id}</dd>
            </div>
          </dl>
        </section>

        <section className="surface-card p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[16px] text-[var(--color-ink)]">Apple / APNs</h2>
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide ${
                apnsConfigured
                  ? 'border-[color:var(--color-accent)]/25 bg-[color:var(--color-accent)]/10 text-[var(--color-accent-soft)]'
                  : 'border-white/10 bg-white/[0.03] text-[var(--color-muted)]'
              }`}
            >
              {apnsConfigured ? 'Configured' : 'Required'}
            </span>
          </div>
          <p className="mt-2 text-[13px] text-[var(--color-muted)]">
            {apnsConfigured
              ? 'A private key is stored (encrypted). Paste a new key only if you are rotating it.'
              : 'One-time setup: paste your Apple Team ID, Key ID, Bundle ID, and .p8 key so Live Hive can deliver Live Activity updates.'}{' '}
            <a href="/docs/apns" className="text-[var(--color-accent-soft)] hover:underline">
              APNs docs
            </a>
          </p>
          <form action={updateApnsAction} className="mt-4 space-y-3">
            <input type="hidden" name="projectId" value={project.id} />
            <div>
              <label className="mb-1 block text-[13px] text-[var(--color-muted)]" htmlFor="appleTeamId">
                Team ID
              </label>
              <input
                id="appleTeamId"
                name="appleTeamId"
                className="field"
                defaultValue={project.appleTeamId ?? ''}
                placeholder="ABCD123456"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-[var(--color-muted)]" htmlFor="appleKeyId">
                Key ID
              </label>
              <input
                id="appleKeyId"
                name="appleKeyId"
                className="field"
                defaultValue={project.appleKeyId ?? ''}
                placeholder="XYZ9876543"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-[var(--color-muted)]" htmlFor="bundleId">
                Bundle ID
              </label>
              <input
                id="bundleId"
                name="bundleId"
                className="field"
                defaultValue={project.bundleId ?? ''}
                placeholder="com.example.app"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-[var(--color-muted)]" htmlFor="apnsEnvironment">
                Environment
              </label>
              <select
                id="apnsEnvironment"
                name="apnsEnvironment"
                className="field"
                defaultValue={project.apnsEnvironment}
              >
                <option value="sandbox">Sandbox (development)</option>
                <option value="production">Production</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-[var(--color-muted)]" htmlFor="apnsKeyPem">
                APNs private key (.p8)
              </label>
              <textarea
                id="apnsKeyPem"
                name="apnsKeyPem"
                className="field min-h-28 font-mono text-[13px]"
                placeholder={
                  apnsConfigured
                    ? 'Key on file. Paste a new key to rotate.'
                    : '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----'
                }
              />
            </div>
            <button type="submit" className="btn-primary">
              Save APNs settings
            </button>
          </form>
        </section>
      </div>

      <ProjectApiKeys projectId={project.id} keys={keys} />
    </div>
  )
}
