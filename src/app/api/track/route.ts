import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const VALID_TABLES = ['news', 'events', 'rappers', 'ads'] as const;
type ValidTable = typeof VALID_TABLES[number];

const COLUMN_MAP: Record<ValidTable, string> = {
    news: 'views',
    events: 'views',
    rappers: 'views',
    ads: 'clicks',
};

export async function POST(request: NextRequest) {
    try {
        const { type, id } = await request.json();

        if (!VALID_TABLES.includes(type as ValidTable) || !id) {
            return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll: () => cookieStore.getAll(),
                    setAll: () => {},
                },
            }
        );

        const column = COLUMN_MAP[type as ValidTable];

        // Use RPC to atomically increment
        const { error } = await supabase.rpc('increment_counter', {
            p_table: type,
            p_id: id,
            p_column: column,
        });

        if (error) {
            // Fallback: read + write (less atomic but works without RPC)
            const { data: row } = await supabase
                .from(type)
                .select(column)
                .eq('id', id)
                .single();

            if (row) {
                await supabase
                    .from(type)
                    .update({ [column]: (row[column] || 0) + 1 })
                    .eq('id', id);
            }
        }

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
