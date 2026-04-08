import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    
    // Rozpoznawanie prawdziwej domeny z nagłówków proxy Rendera:
    const host = request.headers.get('x-forwarded-host') || requestUrl.host
    const protocol = request.headers.get('x-forwarded-proto') || requestUrl.protocol
    const externalOrigin = `${protocol}://${host}`

    const code = requestUrl.searchParams.get('code')
    const token_hash = requestUrl.searchParams.get('token_hash')
    const type = requestUrl.searchParams.get('type')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'
    const error_description = requestUrl.searchParams.get('error_description')

    if (error_description) {
        return NextResponse.redirect(`${externalOrigin}/login?error=${encodeURIComponent(error_description)}`)
    }

    if (code || (token_hash && type)) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch (error) {
                            // Ignored
                        }
                    },
                },
            }
        )

        let error = null;
        
        if (token_hash && type) {
            const result = await supabase.auth.verifyOtp({
                type: type as any,
                token_hash,
            })
            error = result.error
        } else if (code) {
            const result = await supabase.auth.exchangeCodeForSession(code)
            error = result.error
        }
        
        if (!error) {
            return NextResponse.redirect(`${externalOrigin}${next}`)
        }
    }

    // Zwróć błąd logowania używając wyciągniętej prawdziwej domeny (zamiast localhost port 10000)
    return NextResponse.redirect(`${externalOrigin}/login?error=Invalid_link`)
}
