-- ============================================================
-- RAPwUK.com - DODANIE PODKATEGORII MUZYCZNYCH (PL, UK, USA, RAP W UK)
-- Uruchom ten skrypt w Supabase -> SQL Editor
-- ============================================================

-- 1. Dodajemy kolumnę music_category dla produktów muzycznych
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS music_category TEXT;

-- 2. Dodajemy ograniczenie (CHECK constraint) gwarantujące poprawne wartości
-- Jeśli kategoria to 'muzyka', podkategoria musi być wybrana i należeć do zdefiniowanej listy.
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS check_music_subcategory;

ALTER TABLE public.products
ADD CONSTRAINT check_music_subcategory 
CHECK (category != 'muzyka' OR (music_category IS NOT NULL AND music_category IN ('PL', 'UK', 'USA', 'RAP W UK')));

-- Odświeżenie schematu API
NOTIFY pgrst, 'reload schema';
