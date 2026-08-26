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

async function handleBillingPortal() {
  const appUrl = publicAppUrl()
  const session = await getSession()
  if (!session) {
    return Response.redirect(`${appUrl}/login`, 303)
  }

  const account = await prisma.account.findUnique({ where: { id: session.accountId } })
  if (!account) {
    return htmlError(appUrl, 'Billing unavailable', 'We could not find your account.', 404)
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
      return_url: `${appUrl}/settings`,
    })
    return Response.redirect(portal.url, 303)
  } catch (err) {
    console.error('billing portal error', err)
    return htmlError(
      appUrl,
      'Billing unavailable',
      'We could not open Stripe billing right now. Please try again in a moment.',
    )
  }
}

export async function GET() {
  return handleBillingPortal()
}

export async function POST() {
  return handleBillingPortal()
}
