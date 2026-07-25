-- ============================================================
-- RAPwUK.com - KOREKTA: ELEKTRONIKA JAKO PODKATEGORIA MUZYCZNA
-- Oraz przywrócenie głównych kategorii (Muzyka, Bilety, Ubrania)
-- Uruchom ten skrypt w Supabase -> SQL Editor
-- ============================================================

-- 1. Jeśli powstały jakieś produkty z kategorią 'elektronika', przenieś je do 'muzyka' z podkategorią 'ELEKTRONIKA'
UPDATE public.products
SET category = 'muzyka', music_category = 'ELEKTRONIKA'
WHERE category = 'elektronika';

-- 2. Usunięcie starych ograniczeń check
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS check_music_subcategory;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS check_product_category;

-- Dynamiczne usunięcie wszelkich innych ograniczeń check na kolumnie category
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT DISTINCT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_schema = 'public'
          AND tc.table_name = 'products' 
          AND ccu.column_name = 'category' 
          AND tc.constraint_type = 'CHECK'
    ) LOOP
        EXECUTE 'ALTER TABLE public.products DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- 3. Dodanie nowego ograniczenia check dla kategorii (Muzyka, Bilety, Ubrania, Filmy)
ALTER TABLE public.products
ADD CONSTRAINT check_product_category 
CHECK (category IN ('muzyka', 'bilety', 'ubrania', 'filmy'));

-- 4. Dodanie nowego ograniczenia check dla podkategorii muzycznych (w tym 'ELEKTRONIKA')
ALTER TABLE public.products
ADD CONSTRAINT check_music_subcategory 
CHECK (category != 'muzyka' OR (music_category IS NOT NULL AND music_category IN ('RAP PL', 'RAP UK', 'RAP USA', 'POLSKI RAP W UK', 'ELEKTRONIKA')));

-- Odświeżenie schematu API Supabase
NOTIFY pgrst, 'reload schema';
