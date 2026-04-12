-- ============================================================
-- Napraw polityki RLS dla tabeli `ads`
-- Uruchom to w Supabase → SQL Editor
-- ============================================================

-- 1. Usuń wszystkie stare polityki dla ads
DROP POLICY IF EXISTS "Allow public read access" ON public.ads;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.ads;
DROP POLICY IF EXISTS "Allow anon read active ads" ON public.ads;
DROP POLICY IF EXISTS "Allow auth full access" ON public.ads;

-- 2. Odczyt publiczny — wszyscy mogą czytać aktywne reklamy
CREATE POLICY "anon_read_active_ads" ON public.ads
    FOR SELECT
    TO anon
    USING (is_active = true);

-- 3. Zalogowani użytkownicy — pełny dostęp (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "auth_select_all_ads" ON public.ads
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "auth_insert_ads" ON public.ads
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "auth_update_ads" ON public.ads
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "auth_delete_ads" ON public.ads
    FOR DELETE
    TO authenticated
    USING (true);
