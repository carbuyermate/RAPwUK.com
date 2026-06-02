-- ============================================================
-- RAPwUK.com - DODANIE PARAMETRÓW DLA PŁYT UŻYWANYCH I DVD
-- Uruchom ten skrypt w Supabase -> SQL Editor
-- ============================================================

-- 1. Dodajemy kolumnę media_type (CD, DVD, Kaseta) dla kategorii muzyka
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('CD', 'DVD', 'Kaseta'));

-- 2. Dodajemy kolumny dla stanu nośnika, okładki oraz dodatkowych uwag
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS condition_media TEXT,
ADD COLUMN IF NOT EXISTS condition_cover TEXT,
ADD COLUMN IF NOT EXISTS condition_notes TEXT;

-- Odświeżenie schematu API
NOTIFY pgrst, 'reload schema';
