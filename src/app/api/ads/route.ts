import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

async function getServerSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: () => {},
            },
        }
    );
}

// DELETE /api/ads?id=xxx
export async function DELETE(req: NextRequest) {
    const supabase = await getServerSupabase();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const { error } = await supabase.from('ads').delete().eq('id', id);
    if (error) {
        console.error('[DELETE /api/ads]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}

// PATCH /api/ads?id=xxx
export async function PATCH(req: NextRequest) {
    const supabase = await getServerSupabase();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const body = await req.json();
    const { error } = await supabase.from('ads').update(body).eq('id', id);
    if (error) {
        console.error('[PATCH /api/ads]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}

// POST /api/ads - insert new ad
export async function POST(req: NextRequest) {
    const supabase = await getServerSupabase();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { data, error } = await supabase.from('ads').insert(body).select().single();
    if (error) {
        console.error('[POST /api/ads]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
}
