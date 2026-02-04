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
  // Check if Clerk is configured
  if (!process.env.CLERK_SECRET_KEY) {
    // If Clerk is not configured, allow all routes (for development)
    // In production, you should configure Clerk
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
      // If auth fails, allow the request to proceed (graceful degradation)
      console.error('Middleware auth error:', error)
      return NextResponse.next()
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
