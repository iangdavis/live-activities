import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

export default async function ApiKeysRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  const { project: projectId } = await searchParams
  if (projectId) redirect(`/projects/${projectId}`)
  const first = await prisma.project.findFirst({
    where: { accountId: session.accountId },
    orderBy: { createdAt: 'desc' },
  })
  if (first) redirect(`/projects/${first.id}`)
  redirect('/setup?create=1')
}
