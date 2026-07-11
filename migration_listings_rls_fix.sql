-- ============================================================
-- RAPwUK.com - POPRAWKA RLS DLA EDYCJI I USUWANIA OGŁOSZEŃ
-- Uruchom ten skrypt w Supabase -> SQL Editor
-- ============================================================

-- Zezwolenie na modyfikację (UPDATE) ogłoszeń przez użytkowników anonimowych
-- (bezpieczeństwo kodu PIN jest weryfikowane w naszym kodzie Server Action na serwerze)
DROP POLICY IF EXISTS "Allow public update listings" ON public.listings;
CREATE POLICY "Allow public update listings" ON public.listings
    FOR UPDATE TO public, anon
    USING (true)
    WITH CHECK (true);

-- Zezwolenie na usuwanie (DELETE) ogłoszeń przez użytkowników anonimowych
-- (bezpieczeństwo kodu PIN jest weryfikowane w naszym kodzie Server Action na serwerze)
DROP POLICY IF EXISTS "Allow public delete listings" ON public.listings;
CREATE POLICY "Allow public delete listings" ON public.listings
    FOR DELETE TO public, anon
    USING (true);

-- Odświeżenie schematu
NOTIFY pgrst, 'reload schema';
