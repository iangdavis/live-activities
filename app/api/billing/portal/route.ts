import { stripe } from '@/lib/stripe'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function POST() {
  const session = await getSession()
  if (!session) {
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_ORIGIN || ''}/login`, 303)
  }

  const account = await prisma.account.findUnique({ where: { id: session.accountId } })
  if (!account) {
    return new Response(JSON.stringify({ error: 'Account not found' }), { status: 404 })
  }

  try {
    let customerId = account.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.email || undefined,
        metadata: { accountId: account.id },
      })
      customerId = customer.id
      await prisma.account.update({
        where: { id: account.id },
        data: { stripeCustomerId: customerId },
      })
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_ORIGIN || ''}/settings`,
    })
    return Response.redirect(portal.url, 303)
  } catch (err) {
    console.error('billing portal error', err)
    return new Response(JSON.stringify({ error: 'Could not create billing portal session' }), { status: 500 })
  }
}
