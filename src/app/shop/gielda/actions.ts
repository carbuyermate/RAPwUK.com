'use server';

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Admin client to bypass RLS when necessary (e.g. uploading without auth, deleting with token)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Helper for cookies-based supabase client (used for admin validation)
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
                        // Ignored in Server Actions
                    }
                },
            },
        }
    );
}

interface CreateListingData {
    title: string;
    description: string;
    price: number;
    category: 'muzyka' | 'ubrania' | 'bilety' | 'inne';
    item_condition: 'Nowa w folii' | 'Nowa' | 'Używana';
    contact_info?: string | null;
    phone: string;
    facebook_url?: string;
    instagram_url?: string;
    image_base64?: string;
    image_name?: string;
}

/**
 * Tworzy nowe ogłoszenie na Giełdzie (anonimowo)
 */
export async function createListing(data: CreateListingData) {
    try {
        let image_url: string | null = null;

        // Obsługa uploadu zdjęcia
        if (data.image_base64) {
            const base64Data = data.image_base64.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const fileExt = data.image_name ? data.image_name.split('.').pop() : 'webp';
            const fileName = `listings/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from('uploads')
                .upload(fileName, buffer, {
                    contentType: `image/${fileExt === 'webp' ? 'webp' : fileExt === 'png' ? 'png' : 'jpeg'}`,
                    upsert: false
                });

            if (uploadError) {
                console.error('[Storage Upload Error]', uploadError);
                throw new Error(`Błąd wysyłania pliku: ${uploadError.message}`);
            }

            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('uploads')
                .getPublicUrl(fileName);

            image_url = publicUrl;
        }

        // Wstawienie rekordu do tabeli
        const { data: inserted, error: insertError } = await supabaseAdmin
            .from('listings')
            .insert([{
                title: data.title,
                description: data.description,
                price: Number(data.price),
                category: data.category,
                item_condition: data.item_condition,
                phone: data.phone,
                facebook_url: data.facebook_url || null,
                instagram_url: data.instagram_url || null,
                image_url: image_url,
                is_active: true
            }])
            .select('id, delete_token')
            .single();

        if (insertError) {
            console.error('[Database Insert Error]', insertError);
            throw new Error(`Błąd zapisu w bazie danych: ${insertError.message}`);
        }

        revalidatePath('/shop/gielda');
        return { success: true, listing: inserted };
    } catch (err: any) {
        console.error('[createListing Error]', err);
        return { success: false, error: err.message };
    }
}

/**
 * Usuwa ogłoszenie przy użyciu jednorazowego delete_token
 */
export async function deleteListingWithToken(id: string, token: string) {
    try {
        // 1. Sprawdzamy czy ogłoszenie istnieje i token pasuje
        const { data: listing, error: fetchError } = await supabaseAdmin
            .from('listings')
            .select('image_url, delete_token')
            .eq('id', id)
            .maybeSingle();

        if (fetchError) throw fetchError;
        if (!listing) throw new Error('Ogłoszenie nie istnieje');
        if (listing.delete_token !== token) throw new Error('Nieprawidłowy token usuwania');

        // 2. Jeśli ogłoszenie ma zdjęcie, usuwamy je ze storage
        if (listing.image_url) {
            const parts = listing.image_url.split('/uploads/');
            if (parts.length > 1) {
                const filePath = parts[1];
                await supabaseAdmin.storage.from('uploads').remove([filePath]);
            }
        }

        // 3. Usuwamy rekord z bazy
        const { error: deleteError } = await supabaseAdmin
            .from('listings')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        revalidatePath('/shop/gielda');
        return { success: true };
    } catch (err: any) {
        console.error('[deleteListingWithToken Error]', err);
        return { success: false, error: err.message };
    }
}

/**
 * Usunięcie ogłoszenia przez administratora z panelu moderacji
 */
export async function adminDeleteListing(id: string) {
    try {
        const supabase = await getSupabase();

        // Walidacja administratora
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Brak zalogowanego użytkownika');

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            throw new Error('Brak uprawnień administratora');
        }

        // Pobranie danych ogłoszenia przed skasowaniem (żeby usunąć zdjęcie)
        const { data: listing } = await supabaseAdmin
            .from('listings')
            .select('image_url')
            .eq('id', id)
            .maybeSingle();

        if (listing?.image_url) {
            const parts = listing.image_url.split('/uploads/');
            if (parts.length > 1) {
                const filePath = parts[1];
                await supabaseAdmin.storage.from('uploads').remove([filePath]);
            }
        }

        // Usunięcie rekordu
        const { error: deleteError } = await supabaseAdmin
            .from('listings')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        revalidatePath('/shop/gielda');
        revalidatePath('/dashboard/gielda');
        return { success: true };
    } catch (err: any) {
        console.error('[adminDeleteListing Error]', err);
        return { success: false, error: err.message };
    }
}
