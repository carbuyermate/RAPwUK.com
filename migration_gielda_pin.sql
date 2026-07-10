-- ============================================================
-- RAPwUK.com - AKTUALIZACJA GIEŁDY: USUNIĘCIE ZA POMOCĄ KODU PIN
-- Uruchom ten skrypt w Supabase -> SQL Editor
-- ============================================================

-- 1. Zmiana typu kolumny delete_token na TEXT i usunięcie generatora UUID
ALTER TABLE public.listings 
ALTER COLUMN delete_token TYPE TEXT,
ALTER COLUMN delete_token DROP DEFAULT;

-- Odświeżenie schematu API Supabase
NOTIFY pgrst, 'reload schema';
