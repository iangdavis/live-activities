import { stripe } from '@/lib/stripe'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return new Response(JSON.stringify({ error: 'Not signed in' }), { status: 401 })

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
      success_url: `${process.env.NEXT_PUBLIC_APP_ORIGIN || ''}/settings/payments?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_ORIGIN || ''}/settings/payments`,
    })

    return new Response(JSON.stringify({ url: sessionObj.url }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('create-checkout-session error', err)
    return new Response(JSON.stringify({ error: 'Could not create checkout session' }), { status: 500 })
  }
}
