-- Dodanie kolumny na adres wysyłki i metodę dostawy
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
