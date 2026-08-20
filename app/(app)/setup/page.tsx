import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { listProjects, getOwnedProject } from '@/lib/projects'
import { createProjectAction, updateApnsAction } from '../actions'
import { EmptyState, Notice, PageHeader } from '@/components/dashboard/ui'
import { ProjectPicker } from '@/components/dashboard/ProjectPicker'
import { listApiKeys } from '@/lib/api-keys'
import { encryptionKeyStatus } from '@/lib/env'
import { ProjectApiKeys } from '@/components/dashboard/ProjectApiKeys'
import { XcodeSetupCard } from '@/components/dashboard/XcodeSetupCard'
import { CopyButton } from '@/components/dashboard/CopyButton'

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; project?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  const { error, saved, project: projectId } = await searchParams
  const projects = await listProjects(session.accountId)
  const selected = projectId ? projects.find((p) => p.id === projectId) ?? projects[0] : projects[0]

  if (!selected) {
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
        <EmptyState
          title="Nothing here yet"
          body="Create a project first, then use the selector to manage credentials and snippets."
        />
      </div>
    )
  }

  const project = await getOwnedProject(session.accountId, selected.id)
  const keys = await listApiKeys(session.accountId, project.id)
  const apnsConfigured = Boolean(project.apnsKeyEncrypted)
  const encryption = encryptionKeyStatus()
  const publicKeys = keys.filter((key) => key.type === 'PUBLIC' && !key.revokedAt)
  const revealedPublicKey = publicKeys.find((key) => key.revealedKey)?.revealedKey ?? null
  const supportInfo = `Project: ${project.name}\nProject ID: ${project.publicId}\nInternal ID: ${project.id}`

  return (
    <div>
      <PageHeader title="Setup" />
      <Notice error={error || (!encryption.ok ? encryption.message : undefined)} saved={saved === '1'} />
      <ProjectPicker projects={projects} selectedId={project.id} path="/setup" />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card p-6">
          <h2 className="text-[16px] text-[var(--color-ink)]">Project support info</h2>
          <p className="mt-2 text-[13px] text-[var(--color-muted)]">
            Only use this if you need to paste identifiers into support or bug reports.
          </p>
          <div className="mt-4 rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-surface-2)] p-4">
            <pre className="overflow-x-auto font-mono text-[12px] leading-5 text-[var(--color-ink)]">
              {supportInfo}
            </pre>
          </div>
          <div className="mt-3">
            <CopyButton value={supportInfo} label="Copy support info" />
          </div>
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

      <XcodeSetupCard bundleId={project.bundleId} publicKey={revealedPublicKey} />

      <ProjectApiKeys projectId={project.id} keys={keys} />
    </div>
  )
}
