-- Migracja dodająca kolumnę ticket_tiers do tabeli products
-- ticket_tiers to tablica JSONB z wariantami/pulami biletów
-- Przykład: [{ "id": "early-bird", "name": "Early Bird", "price": 20.00, "description": "Pierwsza pula – ograniczona liczba miejsc!" }]
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS ticket_tiers JSONB DEFAULT '[]'::jsonb;
