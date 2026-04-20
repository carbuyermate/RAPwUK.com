-- Dodanie dodatkowych pól na linki YouTube do tabeli news
ALTER TABLE public.news ADD COLUMN youtube_url_2 TEXT;
ALTER TABLE public.news ADD COLUMN youtube_url_3 TEXT;
