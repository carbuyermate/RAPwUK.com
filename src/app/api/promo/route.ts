import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function headers(token?: string | null) {
    const key = serviceKey || anonKey;
    return {
        apikey: key,
        Authorization: `Bearer ${token || key}`,
        'Content-Type': 'application/json',
    };
}

// GET /api/banners?position=homepage_bottom  — used by BannerAd component
export async function GET(req: NextRequest) {
    const position = req.nextUrl.searchParams.get('position') || 'homepage_bottom';

    const res = await fetch(
        `${supabaseUrl}/rest/v1/ads?position=eq.${position}&is_active=eq.true&order=created_at.desc&limit=1&select=*`,
        {
            headers: {
                ...headers(),
                Accept: 'application/vnd.pgrst.object+json',
            },
            // cache: 'no-store' so fresh data every time
            cache: 'no-store',
        }
    );

    if (res.status === 406 || res.status === 404) {
        // no rows
        return NextResponse.json(null);
    }
    if (!res.ok) {
        return NextResponse.json(null);
    }
    const data = await res.json().catch(() => null);
    return NextResponse.json(data);
}

// DELETE /api/banners?id=xxx
export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const token = req.headers.get('x-token');

    const res = await fetch(`${supabaseUrl}/rest/v1/ads?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
            ...headers(token),
            Prefer: 'return=minimal',
        },
    });

    if (!res.ok) {
        const text = await res.text();
        console.error('[DELETE /api/banners]', res.status, text);
        return NextResponse.json({ error: text || res.statusText }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
}

// PATCH /api/banners?id=xxx
export async function PATCH(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const token = req.headers.get('x-token');
    const body = await req.json();

    const res = await fetch(`${supabaseUrl}/rest/v1/ads?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
            ...headers(token),
            Prefer: 'return=minimal',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text();
        return NextResponse.json({ error: text || res.statusText }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
}

// POST /api/banners
export async function POST(req: NextRequest) {
    const token = req.headers.get('x-token');
    const body = await req.json();

    const res = await fetch(`${supabaseUrl}/rest/v1/ads`, {
        method: 'POST',
        headers: {
            ...headers(token),
            Prefer: 'return=representation',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text();
        return NextResponse.json({ error: text || res.statusText }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json({ ok: true, data: Array.isArray(data) ? data[0] : data });
}
