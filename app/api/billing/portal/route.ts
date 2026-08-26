import { stripe } from '@/lib/stripe'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function POST() {
  const session = await getSession()
  if (!session) return new Response(JSON.stringify({ error: 'Not signed in' }), { status: 401 })
  const account = await prisma.account.findUnique({ where: { id: session.accountId } })
  if (!account || !account.stripeCustomerId) return new Response(JSON.stringify({ error: 'No customer' }), { status: 400 })
  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: account.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_ORIGIN || ''}/settings`,
    })
    return new Response(JSON.stringify({ url: portal.url }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('billing portal error', err)
    return new Response(JSON.stringify({ error: 'Could not create billing portal session' }), { status: 500 })
  }
}
