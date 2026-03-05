import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Create an initial response
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Validate environment variables before attempting to create the client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing. Skipping Supabase middleware authentication.'
    )
    // Return the response directly without processing authentication
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (
      !user &&
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/auth')
    ) {
      // no user, potentially redirect to login page
      // for this app we might want to allow anonymous access or handle it differently
      // user asked for anonymous session handling via server actions
    }
  } catch (error) {
    console.error('Middleware Supabase error:', error)
    // On error, we still return the response to allow the app to function (e.g. show 500 page or just continue)
    // preventing a hard crash loop in middleware
  }

  return supabaseResponse
}
