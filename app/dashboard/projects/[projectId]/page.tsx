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
          <h2 className="text-[16px] text-[var(--color-ink)]">Apple / APNs</h2>
          <p className="mt-2 text-[13px] text-[var(--color-muted)]">
            {apnsConfigured
              ? 'A private key is stored (encrypted). Paste a new key only if you are rotating it.'
              : 'Required before Live Hive can deliver updates. See the APNs docs.'}
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
