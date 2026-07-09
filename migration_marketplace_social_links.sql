-- ============================================================
-- RAPwUK.com - DODANIE DANYCH SPOŁECZNOŚCIOWYCH DO GIEŁDY
-- Uruchom ten skrypt w Supabase -> SQL Editor
-- ============================================================

-- 1. Dodanie kolumn dla numeru telefonu, linku Facebook i Instagram
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- 2. Zmiana wymagalności starej kolumny contact_info (DROP NOT NULL)
ALTER TABLE public.listings 
ALTER COLUMN contact_info DROP NOT NULL;

-- 3. Przepisanie istniejących danych (migracja wsteczna dla starych ogłoszeń)
UPDATE public.listings 
SET phone = contact_info 
WHERE phone IS NULL AND contact_info IS NOT NULL;
