-- Dodanie dodatkowych pól na linki Spotify, SoundCloud i Instagram do tabeli news
ALTER TABLE public.news ADD COLUMN spotify_url TEXT;
ALTER TABLE public.news ADD COLUMN soundcloud_url TEXT;
ALTER TABLE public.news ADD COLUMN instagram_url TEXT;
