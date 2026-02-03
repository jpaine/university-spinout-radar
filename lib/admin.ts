import { currentUser } from '@clerk/nextjs/server'

export async function isAdmin(): Promise<boolean> {
  const user = await currentUser()
  if (!user) return false
  
  // Check if user has admin role in Clerk metadata
  const role = user.publicMetadata?.role as string | undefined
  return role === 'admin'
}
