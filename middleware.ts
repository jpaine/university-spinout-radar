import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing',
  '/api/stripe/webhook',
])

export default clerkMiddleware(async (auth, req) => {
  // If Clerk is not configured, allow all routes to pass through
  if (!process.env.CLERK_SECRET_KEY) {
    return NextResponse.next()
  }

  if (!isPublicRoute(req)) {
    try {
      const { userId } = await auth()
      if (!userId) {
        const signInUrl = new URL('/sign-in', req.url)
        signInUrl.searchParams.set('redirect_url', req.url)
        return NextResponse.redirect(signInUrl)
      }
    } catch (error) {
      // If auth fails (e.g., Clerk not properly configured), allow request
      console.error('Clerk auth error in middleware:', error)
      return NextResponse.next()
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
