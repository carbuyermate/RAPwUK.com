-- ============================================================
-- RAPwUK.com - AKTUALIZACJA ZABEZPIECZEŃ BAZY DANYCH
-- Uruchom ten skrypt w Supabase -> SQL Editor
-- ============================================================

-- KROK 1: Zabezpieczenie tabeli orders (Zamówienia)
-- Włączamy z powrotem RLS (Row Level Security) aby zablokować publiczny odczyt i usuwanie zamówień!
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Usuwamy ewentualnie zbyt permisywne polityki
DROP POLICY IF EXISTS "Allow public insert" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.orders;

-- Nowa polityka: Każdy (nawet niezalogowany klient) może utworzyć zamówienie podczas checkoutu
CREATE POLICY "Allow public insert" ON public.orders
    FOR INSERT TO public, anon
    WITH CHECK (true);

-- Nowa polityka: Tylko zalogowany administrator (authenticated) może czytać, modyfikować i usuwać zamówienia
CREATE POLICY "Allow authenticated full access" ON public.orders
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- KROK 2: Bezpieczna funkcja (RPC) do oznaczania zamówienia jako opłacone
-- Umożliwi webhookowi Stripe aktualizację statusu zamówienia i adresu bez wyłączania RLS
CREATE OR REPLACE FUNCTION public.update_order_to_paid(order_id UUID, email TEXT, address JSONB)
RETURNS VOID AS $$
BEGIN
    UPDATE public.orders
    SET status = 'paid',
        customer_email = email,
        shipping_address = address,
        updated_at = now()
    WHERE id = order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- KROK 3: Zabezpieczenie tabeli ads (Reklamy)
-- Włączamy RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Usuwamy stare polityki
DROP POLICY IF EXISTS "anon_read_active_ads" ON public.ads;
DROP POLICY IF EXISTS "auth_select_all_ads" ON public.ads;
DROP POLICY IF EXISTS "auth_insert_ads" ON public.ads;
DROP POLICY IF EXISTS "auth_update_ads" ON public.ads;
DROP POLICY IF EXISTS "auth_delete_ads" ON public.ads;

-- Polityki dla ads:
-- 1. Odczyt: Wszyscy mogą widzieć tylko AKTYWNE reklamy
CREATE POLICY "anon_read_active_ads" ON public.ads
    FOR SELECT TO public, anon
    USING (is_active = true);

-- 2. Pełny dostęp dla admina
CREATE POLICY "auth_full_access_ads" ON public.ads
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- KROK 4: Zabezpieczenie tabeli events (Wydarzenia)
-- Usuwamy politykę pozwalającą anonimowym użytkownikom na dodawanie wydarzeń
DROP POLICY IF EXISTS "Allow anon insert for sync" ON public.events;

-- Odświeżenie schematu
NOTIFY pgrst, 'reload schema';
