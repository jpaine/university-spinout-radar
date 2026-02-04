import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import { updateSubscriptionFromStripe } from '@/lib/subscription'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    )
  }

  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const userId = session.metadata?.userId

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription
          )
          const priceId = subscription.items.data[0]?.price.id
          const plan =
            priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID
              ? 'pro_monthly'
              : priceId === process.env.STRIPE_PRO_ANNUAL_PRICE_ID
              ? 'pro_annual'
              : null

          await updateSubscriptionFromStripe(
            userId,
            session.customer as string,
            subscription.id,
            subscription.status as any,
            plan,
            new Date(subscription.current_period_end * 1000)
          )
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        const userId = (customer as any).metadata?.clerkUserId

        if (userId) {
          const priceId = subscription.items.data[0]?.price.id
          const plan =
            priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID
              ? 'pro_monthly'
              : priceId === process.env.STRIPE_PRO_ANNUAL_PRICE_ID
              ? 'pro_annual'
              : null

          await updateSubscriptionFromStripe(
            userId,
            subscription.customer as string,
            subscription.id,
            subscription.status,
            plan,
            new Date(subscription.current_period_end * 1000)
          )
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        const userId = (customer as any).metadata?.clerkUserId

        if (userId) {
          await updateSubscriptionFromStripe(
            userId,
            subscription.customer as string,
            subscription.id,
            'canceled',
            null,
            null
          )
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
