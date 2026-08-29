import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { getOwnedProject } from '@/lib/projects'
import { listApiKeys } from '@/lib/api-keys'
import { encryptionKeyStatus } from '@/lib/env'
import { prisma } from '@/lib/db'
import { updateApnsAction } from '../../actions'
import { Notice, PageHeader } from '@/components/dashboard/ui'
import { ProjectApiKeys } from '@/components/dashboard/ProjectApiKeys'
import { XcodeSetupCard } from '@/components/dashboard/XcodeSetupCard'

function percent(value: number) {
  return `${Math.round(value * 10) / 10}%`
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>
  searchParams: Promise<{ error?: string; saved?: string; ok?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  const { projectId } = await params
  const { error, saved, ok } = await searchParams
  const project = await getOwnedProject(session.accountId, projectId)
  const keys = await listApiKeys(session.accountId, project.id)
  const apnsConfigured = Boolean(project.apnsKeyEncrypted)
  const encryption = encryptionKeyStatus()
  const publicKeys = keys.filter((key) => key.type === 'PUBLIC' && !key.revokedAt)
  const revealedPublicKey = publicKeys.find((key) => key.revealedKey)?.revealedKey ?? null

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const [activeActivities, createdLast7d, deliveriesLast7d, sentLast7d, failedLast7d, latestActivity] =
    await Promise.all([
      prisma.activity.count({ where: { projectId: project.id, status: 'active' } }),
      prisma.activity.count({ where: { projectId: project.id, createdAt: { gte: sevenDaysAgo } } }),
      prisma.delivery.count({ where: { projectId: project.id, createdAt: { gte: sevenDaysAgo } } }),
      prisma.delivery.count({ where: { projectId: project.id, createdAt: { gte: sevenDaysAgo }, status: 'sent' } }),
      prisma.delivery.count({ where: { projectId: project.id, createdAt: { gte: sevenDaysAgo }, status: 'failed' } }),
      prisma.activity.findFirst({
        where: { projectId: project.id },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      }),
    ])

  const successRateLast7d = deliveriesLast7d > 0 ? (sentLast7d / deliveriesLast7d) * 100 : 0

  return (
    <div>
      <PageHeader title={project.name} />
      <Notice
        error={error || (!encryption.ok ? encryption.message : undefined)}
        saved={saved === '1'}
        ok={ok}
      />

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

      <div>
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
            Saving runs an APNs credential check before Live Hive accepts the settings.{' '}
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

      <XcodeSetupCard
        bundleId={project.bundleId}
        publicKey={revealedPublicKey}
      />

      <ProjectApiKeys projectId={project.id} keys={keys} />
    </div>
  )
}
