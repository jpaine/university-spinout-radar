import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeInstance) {
    // Skip validation during build phase
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      // Return a placeholder during build - will be reinitialized at runtime
      stripeInstance = new Stripe('sk_test_placeholder', {
        apiVersion: '2023-10-16',
        typescript: true,
      })
    } else {
      // Runtime: validate and initialize properly
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set')
      }
      stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
        typescript: true,
      })
    }
  }
  return stripeInstance
}

// Lazy initialization - only creates instance when accessed
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const instance = getStripe()
    const value = instance[prop as keyof Stripe]
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  },
})
