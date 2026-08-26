import { stripe } from '@/lib/stripe'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { publicAppUrl } from '@/lib/env'

export async function POST(request: Request) {
  const appUrl = publicAppUrl()
  const session = await getSession()
  if (!session) {
    return Response.redirect(`${appUrl}/login`, 303)
  }

  const account = await prisma.account.findUnique({ where: { id: session.accountId } })
  if (!account) return new Response(JSON.stringify({ error: 'Account not found' }), { status: 404 })

  const price = process.env.STRIPE_PRICE_ID
  if (!price) return new Response(JSON.stringify({ error: 'STRIPE_PRICE_ID not configured' }), { status: 500 })

  try {
    // Create or reuse customer
    let customerId = account.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({ email: session.email || undefined, metadata: { accountId: account.id } })
      customerId = customer.id
      await prisma.account.update({ where: { id: account.id }, data: { stripeCustomerId: customerId } })
    }

    const sessionObj = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price, quantity: 1 }],
      customer: customerId,
      metadata: { accountId: account.id },
      success_url: `${appUrl}/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/settings`,
    })

    if (!sessionObj.url) {
      throw new Error('Stripe checkout session did not include a url')
    }

    return Response.redirect(sessionObj.url, 303)
  } catch (err) {
    console.error('create-checkout-session error', err)
    return new Response(JSON.stringify({ error: 'Could not create checkout session' }), { status: 500 })
  }
}
