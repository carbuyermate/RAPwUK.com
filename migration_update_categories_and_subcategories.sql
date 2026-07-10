-- ============================================================
-- RAPwUK.com - AKTUALIZACJA KATEGORII (DODANIE ELEKTRONIKA)
-- ORAZ PODKATEGORII MUZYCZNYCH (RAP PL, RAP UK, RAP USA, POLSKI RAP W UK)
-- Uruchom ten skrypt w Supabase -> SQL Editor
-- ============================================================

-- 1. Usunięcie starego ograniczenia check dla podkategorii muzycznych
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS check_music_subcategory;

-- 2. Dynamiczne usunięcie starych ograniczeń check dla kolumny category
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

-- 3. Aktualizacja istniejących produktów muzycznych do nowych podkategorii
-- (Robimy to po usunięciu ograniczenia, dzięki czemu baza nie zgłosi błędu check_music_subcategory)
UPDATE public.products
SET music_category = CASE 
    WHEN music_category = 'PL' THEN 'RAP PL'
    WHEN music_category = 'UK' THEN 'RAP UK'
    WHEN music_category = 'USA' THEN 'RAP USA'
    WHEN music_category = 'RAP W UK' THEN 'POLSKI RAP W UK'
    ELSE music_category
END
WHERE category = 'muzyka';

-- 4. Dodanie nowego ograniczenia check dla kategorii (w tym 'elektronika')
ALTER TABLE public.products
ADD CONSTRAINT check_product_category 
CHECK (category IN ('muzyka', 'bilety', 'ubrania', 'elektronika'));

-- 5. Dodanie nowego ograniczenia check dla podkategorii muzycznych
ALTER TABLE public.products
ADD CONSTRAINT check_music_subcategory 
CHECK (category != 'muzyka' OR (music_category IS NOT NULL AND music_category IN ('RAP PL', 'RAP UK', 'RAP USA', 'POLSKI RAP W UK')));

-- Odświeżenie schematu API Supabase
NOTIFY pgrst, 'reload schema';
