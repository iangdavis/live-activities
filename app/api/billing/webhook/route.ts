import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const payload = await request.text()
  const sig = request.headers.get('stripe-signature') || ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) return new Response('Webhook secret not configured', { status: 500 })

  let event: any
  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed.', err)
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const accountId = session.metadata?.accountId
        if (accountId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription, { expand: ['items'] })
          const item = subscription.items.data[0]
          await prisma.account.update({ where: { id: accountId }, data: { stripeCustomerId: session.customer, stripeSubscriptionId: subscription.id, stripeSubscriptionItemId: item.id } })
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        // find account by customer or metadata
        const customerId = subscription.customer
        const acct = await prisma.account.findFirst({ where: { stripeCustomerId: customerId } })
        if (acct) {
          const item = subscription.items?.data?.[0]
          await prisma.account.update({ where: { id: acct.id }, data: { stripeSubscriptionId: subscription.id, stripeSubscriptionItemId: item?.id ?? null } })
        }
        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        // record payment for reconciliation
        const customerId = invoice.customer
        const acct = await prisma.account.findFirst({ where: { stripeCustomerId: customerId } })
        if (acct) {
          await prisma.payment.create({ data: { accountId: acct.id, provider: 'stripe', providerId: invoice.id, amountCents: invoice.amount_paid ?? 0, currency: invoice.currency ?? 'usd', status: 'paid', metadata: invoice as any } })
        }
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        const customerId = invoice.customer
        const acct = await prisma.account.findFirst({ where: { stripeCustomerId: customerId } })
        if (acct) {
          await prisma.payment.create({ data: { accountId: acct.id, provider: 'stripe', providerId: invoice.id, amountCents: invoice.amount_due ?? 0, currency: invoice.currency ?? 'usd', status: 'failed', metadata: invoice as any } })
        }
        break
      }
      default:
        // ignore others
        break
    }
  } catch (err) {
    console.error('Error handling webhook', err)
    return new Response('Webhook handler error', { status: 500 })
  }

  return new Response('ok')
}
