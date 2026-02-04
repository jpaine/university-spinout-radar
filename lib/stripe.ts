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
// For backward compatibility, create a proxy that handles null gracefully
const stripeProxy = new Proxy({} as Record<string, any>, {
  get(_target, prop) {
    const instance = getStripe()
    if (!instance) {
      // Return a no-op function for methods, undefined for properties
      return () => {
        throw new Error('Stripe is not configured. Call isStripeConfigured() first.')
      }
    }
    const value = instance[prop as keyof Stripe]
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  },
})

export const stripe = stripeProxy as Stripe
