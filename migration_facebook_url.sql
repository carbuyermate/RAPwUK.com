-- Dodanie pola na link do filmu/reelsa z FB do tabeli news
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS facebook_url TEXT;

NOTIFY pgrst, 'reload schema';
