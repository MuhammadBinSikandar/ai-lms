import { updateSession } from './lib/supabase/middleware'

export async function middleware(request) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Only match specific routes to reduce middleware overhead
    '/dashboard/:path*',
    '/auth/((?!callback|profile-setup).*)',
    '/admin/:path*',
    // Exclude API routes from middleware processing to avoid Edge Runtime issues
    // API routes handle their own auth
  ],
};