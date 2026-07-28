-- Dodanie opcjonalnej kolumny dla adresu klubu (dla biletów)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS ticket_venue_address TEXT;
