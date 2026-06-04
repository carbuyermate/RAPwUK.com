-- ============================================================
-- RAPwUK.com - AKTUALIZACJA ZABEZPIECZEŃ ZAMÓWIEŃ (ORDERS)
-- Uruchom ten skrypt w Supabase -> SQL Editor
-- ============================================================

-- 1. Włączamy RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Usuwamy stare polityki
DROP POLICY IF EXISTS "Allow public insert" ON public.orders;
DROP POLICY IF EXISTS "Allow public select pending" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.orders;

-- 3. Zezwalamy na dodawanie (INSERT) nowych zamówień dla każdego (klienta podczas checkoutu)
CREATE POLICY "Allow public insert" ON public.orders
    FOR INSERT 
    WITH CHECK (true);

-- 4. Zezwalamy na odczyt (SELECT) zamówień TYLKO jeśli ich status to 'pending' (oczekujące)
-- Nowo utworzone zamówienia mają status 'pending' i nie zawierają jeszcze żadnych danych osobowych ani adresu.
-- Gdy zamówienie zostanie opłacone, webhook zmienia status na 'paid' i dodaje adres, przez co zamówienie staje się natychmiast NIEWIDOCZNE dla publicznego odczytu.
CREATE POLICY "Allow public select pending" ON public.orders
    FOR SELECT 
    USING (status = 'pending');

-- 5. Pełny dostęp do wszystkich zamówień dla zalogowanych administratorów
CREATE POLICY "Allow authenticated full access" ON public.orders
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Odświeżenie schematu
NOTIFY pgrst, 'reload schema';
