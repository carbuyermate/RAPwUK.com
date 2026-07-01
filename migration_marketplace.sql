-- ============================================================
-- RAPwUK.com - DODANIE TABELI DLA DARMOWEJ GIEŁDY OGŁOSZENIOWEJ
-- Uruchom ten skrypt w Supabase -> SQL Editor
-- ============================================================

-- 1. Tworzenie tabeli listings (Ogłoszenia)
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    item_condition TEXT NOT NULL CHECK (item_condition IN ('Nowa w folii', 'Nowa', 'Używana')),
    category TEXT NOT NULL CHECK (category IN ('muzyka', 'ubrania', 'bilety', 'inne')),
    image_url TEXT,
    contact_info TEXT NOT NULL,
    delete_token UUID DEFAULT gen_random_uuid() NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Włączenie Row Level Security (RLS)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Usuwamy stare polityki jeśli istnieją
DROP POLICY IF EXISTS "Allow public select active listings" ON public.listings;
DROP POLICY IF EXISTS "Allow public insert listings" ON public.listings;
DROP POLICY IF EXISTS "Allow admins to delete listings" ON public.listings;
DROP POLICY IF EXISTS "Allow admins to update listings" ON public.listings;

-- 2. Polityka odczytu: Każdy (nawet niezalogowany) może przeglądać aktywne ogłoszenia
CREATE POLICY "Allow public select active listings" ON public.listings
    FOR SELECT TO public, anon, authenticated
    USING (is_active = true);

-- 3. Polityka dodawania: Każdy może dodać ogłoszenie (bez logowania)
CREATE POLICY "Allow public insert listings" ON public.listings
    FOR INSERT TO public, anon, authenticated
    WITH CHECK (true);

-- 4. Polityka usuwania dla adminów
CREATE POLICY "Allow admins to delete listings" ON public.listings
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 5. Polityka edycji dla adminów
CREATE POLICY "Allow admins to update listings" ON public.listings
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Odświeżenie schematu bazy danych
NOTIFY pgrst, 'reload schema';
