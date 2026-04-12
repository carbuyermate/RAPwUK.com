import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper to call Supabase REST directly with the best available key
function supabaseHeaders(authToken?: string) {
    const key = serviceKey || anonKey;
    return {
        apikey: key,
        Authorization: `Bearer ${authToken || key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
    };
}

// DELETE /api/ads?id=xxx
export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Get user's JWT from Authorization header (sent from client)
    const authToken = req.headers.get('x-supabase-token') || undefined;

    const res = await fetch(`${supabaseUrl}/rest/v1/ads?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
            ...supabaseHeaders(authToken),
            Prefer: 'return=minimal',
        },
    });

    if (!res.ok) {
        const text = await res.text();
        console.error('[DELETE /api/ads]', res.status, text);
        return NextResponse.json({ error: `Supabase: ${res.status} ${text}` }, { status: res.status });
    }

    return NextResponse.json({ success: true });
}

// PATCH /api/ads?id=xxx
export async function PATCH(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const authToken = req.headers.get('x-supabase-token') || undefined;
    const body = await req.json();

    const res = await fetch(`${supabaseUrl}/rest/v1/ads?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
            ...supabaseHeaders(authToken),
            Prefer: 'return=minimal',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error('[PATCH /api/ads]', res.status, text);
        return NextResponse.json({ error: `Supabase: ${res.status} ${text}` }, { status: res.status });
    }

    return NextResponse.json({ success: true });
}

// POST /api/ads
export async function POST(req: NextRequest) {
    const authToken = req.headers.get('x-supabase-token') || undefined;
    const body = await req.json();

    const res = await fetch(`${supabaseUrl}/rest/v1/ads`, {
        method: 'POST',
        headers: {
            ...supabaseHeaders(authToken),
            Prefer: 'return=representation',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error('[POST /api/ads]', res.status, text);
        return NextResponse.json({ error: `Supabase: ${res.status} ${text}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ data: data[0] || data });
}
