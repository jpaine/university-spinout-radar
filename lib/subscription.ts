import { prisma } from './prisma'

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired'

export async function getUserSubscription(userId: string) {
  return await prisma.subscription.findUnique({
    where: { userId },
  })
}

export async function isProUser(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return subscription?.status === 'active' && (subscription.plan === 'pro_monthly' || subscription.plan === 'pro_annual')
}

export async function updateSubscriptionFromStripe(
  userId: string,
  stripeCustomerId: string | null,
  stripeSubscriptionId: string | null,
  status: SubscriptionStatus,
  plan: string | null,
  currentPeriodEnd: Date | null
) {
  return await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      status,
      plan,
      currentPeriodEnd,
    },
    update: {
      stripeCustomerId,
      stripeSubscriptionId,
      status,
      plan,
      currentPeriodEnd,
    },
  })
}
