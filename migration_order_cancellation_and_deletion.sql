-- ============================================================
-- RAPwUK.com - AUTOMATYCZNE ZARZĄDZANIE STANEM MAGAZYNOWYM
-- Uruchom ten skrypt w Supabase -> SQL Editor
-- ============================================================

-- 1. Funkcja obsługująca zmiany stanu przy dodaniu/aktualizacji zamówienia
CREATE OR REPLACE FUNCTION public.handle_order_stock_change()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    should_decrement BOOLEAN := FALSE;
    should_increment BOOLEAN := FALSE;
BEGIN
    -- Określamy kierunek zmiany stanu magazynowego
    IF TG_OP = 'INSERT' THEN
        IF NEW.status IN ('paid', 'shipped') THEN
            should_decrement := TRUE;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Przejście z NIEOPŁACONE/ANULOWANE na OPŁACONE/WYSŁANE -> Zmniejszamy stan
        IF (OLD.status IN ('pending', 'cancelled') AND NEW.status IN ('paid', 'shipped')) THEN
            should_decrement := TRUE;
        -- Przejście z OPŁACONE/WYSŁANE na NIEOPŁACONE/ANULOWANE -> Przywracamy stan
        ELSIF (OLD.status IN ('paid', 'shipped') AND NEW.status IN ('pending', 'cancelled')) THEN
            should_increment := TRUE;
        END IF;
    END IF;

    -- Wykonanie operacji na produktach
    IF should_decrement THEN
        FOR item IN SELECT * FROM jsonb_to_recordset(NEW.items) AS x(id UUID, quantity INT) LOOP
            IF item.id IS NOT NULL AND item.quantity > 0 THEN
                UPDATE public.products
                SET stock = GREATEST(0, stock - item.quantity)
                WHERE id = item.id;
            END IF;
        END LOOP;
    ELSIF should_increment THEN
        FOR item IN SELECT * FROM jsonb_to_recordset(NEW.items) AS x(id UUID, quantity INT) LOOP
            IF item.id IS NOT NULL AND item.quantity > 0 THEN
                UPDATE public.products
                SET stock = stock + item.quantity
                WHERE id = item.id;
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usunięcie starego triggera jeśli istnieje
DROP TRIGGER IF EXISTS on_order_stock_change ON public.orders;

-- Utworzenie nowego triggera
CREATE TRIGGER on_order_stock_change
    AFTER INSERT OR UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_order_stock_change();


-- 2. Funkcja przywracająca stan magazynowy przy usuwaniu zamówienia
CREATE OR REPLACE FUNCTION public.handle_order_delete()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    -- Jeśli usuwane zamówienie było opłacone/wysłane, zwracamy produkty do magazynu
    IF OLD.status IN ('paid', 'shipped') THEN
        FOR item IN SELECT * FROM jsonb_to_recordset(OLD.items) AS x(id UUID, quantity INT) LOOP
            IF item.id IS NOT NULL AND item.quantity > 0 THEN
                UPDATE public.products
                SET stock = stock + item.quantity
                WHERE id = item.id;
            END IF;
        END LOOP;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usunięcie starego triggera jeśli istnieje
DROP TRIGGER IF EXISTS on_order_deleted ON public.orders;

-- Utworzenie nowego triggera
CREATE TRIGGER on_order_deleted
    BEFORE DELETE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_order_delete();

-- Odświeżenie schematu API
NOTIFY pgrst, 'reload schema';
