import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

function getStripe(): Stripe | null {
  // Skip during build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null
  }
  
  // Runtime: only initialize if key is available
  if (!process.env.STRIPE_SECRET_KEY) {
    return null
  }
  
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true,
    })
  }
  return stripeInstance
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

// Lazy initialization - returns null if Stripe is not configured
export const stripe = new Proxy({} as Stripe | null, {
  get(_target, prop) {
    const instance = getStripe()
    if (!instance) {
      return undefined
    }
    const value = instance[prop as keyof Stripe]
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  },
}) as Stripe | null
