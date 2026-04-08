'use server';

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache';

async function getSupabase() {
    const cookieStore = await cookies()
    return createServerClient(
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
}

export async function deleteNews(id: string) {
    const supabase = await getSupabase();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/dashboard/news');
    revalidatePath('/news');
    revalidatePath('/');
    return { success: true };
}

export async function deleteEvent(id: string) {
    const supabase = await getSupabase();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/dashboard/events');
    revalidatePath('/events');
    revalidatePath('/');
    return { success: true };
}

export async function deleteRapper(id: string) {
    const supabase = await getSupabase();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase.from('rappers').delete().eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/dashboard/rappers');
    revalidatePath('/rappers');
    return { success: true };
}
