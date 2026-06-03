-- ============================================================
-- RAPwUK.com - DODANIE STANU OGÓLNEGO (Nowa w folii, Nowa, Używana)
-- Uruchom ten skrypt w Supabase -> SQL Editor
-- ============================================================

-- 1. Dodajemy kolumnę item_condition dla produktów
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS item_condition TEXT;

-- 2. Ustawiamy wartość domyślną dla istniejących płyt na 'Używana' (lub 'Nowa' zależnie od preferencji)
-- Aby zachować zgodność wsteczną przed nałożeniem ograniczenia.
UPDATE public.products
SET item_condition = 'Używana'
WHERE category = 'muzyka' AND item_condition IS NULL;

-- 3. Dodajemy ograniczenie CHECK constraint dla dopuszczalnych stanów
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS check_item_condition;

ALTER TABLE public.products
ADD CONSTRAINT check_item_condition 
CHECK (category != 'muzyka' OR (item_condition IS NOT NULL AND item_condition IN ('Nowa w folii', 'Nowa', 'Używana')));

-- Odświeżenie schematu API
NOTIFY pgrst, 'reload schema';
