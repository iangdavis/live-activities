import { stripe } from '@/lib/stripe'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { publicAppUrl } from '@/lib/env'

function htmlError(appUrl: string, title: string, message: string, status = 500) {
  const body = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, sans-serif; background: #0b0f17; color: #f5f7fb; display: grid; min-height: 100vh; place-items: center; margin: 0; padding: 24px; }
      main { width: min(100%, 520px); background: #121826; border: 1px solid #273043; border-radius: 16px; padding: 24px; }
      h1 { margin: 0 0 12px; font-size: 24px; }
      p { margin: 0 0 16px; line-height: 1.5; color: #c3ccda; }
      a { color: #f5f7fb; text-decoration: none; display: inline-block; padding: 10px 14px; border-radius: 10px; background: #243247; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${message}</p>
      <a href="${appUrl}/settings">Back to settings</a>
    </main>
  </body>
</html>`

  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

async function handleCheckoutSession() {
  const appUrl = publicAppUrl()
  const session = await getSession()
  if (!session) {
    return Response.redirect(`${appUrl}/login`, 303)
  }

  const account = await prisma.account.findUnique({ where: { id: session.accountId } })
  if (!account) return htmlError(appUrl, 'Checkout unavailable', 'We could not find your account.', 404)

  const price = process.env.STRIPE_PRICE_ID
  if (!price) {
    return htmlError(
      appUrl,
      'Checkout unavailable',
      'Stripe is not fully configured yet. Please try again later.',
    )
  }

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
    return htmlError(
      appUrl,
      'Checkout unavailable',
      'We could not open Stripe checkout right now. Please try again in a moment.',
    )
  }
}

export async function GET() {
  return handleCheckoutSession()
}

export async function POST() {
  return handleCheckoutSession()
}
