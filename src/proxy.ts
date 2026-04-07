import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options });
                    response = NextResponse.next({ request: { headers: request.headers } });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options });
                    response = NextResponse.next({ request: { headers: request.headers } });
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const pathname = request.nextUrl.pathname;

    // 1. Niezalogowany → /login
    if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Zalogowany → sprawdź rolę
    if (user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const role = profile?.role;

        // Tylko admin i promoter mają dostęp do dashboardu
        if (role !== 'admin' && role !== 'promoter') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        // Panel /admin tylko dla adminów
        if (pathname.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }

    // 3. Zablokuj dostęp do /register — przekieruj na stronę "tylko na zaproszenie"
    // (strona /register sama w sobie pokazuje info, ale możemy też blokować próby API)

    return response;
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*'],
};
