'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch (error) {
                        // Ignored
                    }
                },
            },
        }
    );
}

export async function reactToNews(newsId: string, likeDelta: number, dislikeDelta: number) {
    const supabase = await getSupabase();
    const { error } = await supabase.rpc('adjust_news_reactions', {
        p_news_id: newsId,
        p_like_delta: likeDelta,
        p_dislike_delta: dislikeDelta
    });
    if (error) {
        console.error('Error adjusting news reactions:', error);
        throw new Error(error.message);
    }
    return { success: true };
}
