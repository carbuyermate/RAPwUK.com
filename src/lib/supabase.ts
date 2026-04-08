import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Brak konfiguracji Supabase. Sprawdź plik .env.local');
}

// createBrowserClient automatycznie zarządza sesją w ciasteczkach (Cookies)
// co rozwiązuje problemy z synchronizacją sesji po przeładowaniu strony.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
