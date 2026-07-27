-- Migracja dodająca kolumny dla biletów w tabeli orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS ticket_password TEXT,
ADD COLUMN IF NOT EXISTS ticket_buyer_name TEXT;
