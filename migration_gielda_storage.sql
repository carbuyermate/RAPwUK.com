-- ============================================================
-- RAPwUK.com - ZABEZPIECZENIA I UPRAWNIENIA ZDJĘĆ GIEŁDY (STORAGE)
-- Uruchom ten skrypt w Supabase -> SQL Editor
-- ============================================================

-- 1. Zezwolenie na wgrywanie zdjęć przez anonimowych użytkowników do folderu 'listings/'
DROP POLICY IF EXISTS "Allow anon upload to listings folder" ON storage.objects;
CREATE POLICY "Allow anon upload to listings folder" ON storage.objects
    FOR INSERT TO public, anon
    WITH CHECK (
        bucket_id = 'uploads' AND 
        name LIKE 'listings/%'
    );

-- 2. Zezwolenie na usuwanie zdjęć przez anonimowych użytkowników z folderu 'listings/'
DROP POLICY IF EXISTS "Allow anon delete from listings folder" ON storage.objects;
CREATE POLICY "Allow anon delete from listings folder" ON storage.objects
    FOR DELETE TO public, anon
    USING (
        bucket_id = 'uploads' AND 
        name LIKE 'listings/%'
    );

-- 3. Upewnienie się, że odczyt plików jest publiczny (jeśli bucket nie jest publiczny)
DROP POLICY IF EXISTS "Allow public read of listings folder" ON storage.objects;
CREATE POLICY "Allow public read of listings folder" ON storage.objects
    FOR SELECT TO public, anon
    USING (
        bucket_id = 'uploads' AND 
        name LIKE 'listings/%'
    );
