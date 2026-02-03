import { currentUser } from '@clerk/nextjs/server'
import { isProUser } from './subscription'

export async function canAccessProFeatures(): Promise<boolean> {
  const user = await currentUser()
  if (!user) return false
  return await isProUser(user.id)
}
