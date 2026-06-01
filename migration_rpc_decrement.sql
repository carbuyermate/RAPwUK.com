-- Funkcja pozwalająca na bezpieczne zmniejszenie stanu magazynowego z poziomu webhooka Stripe
-- Słowo kluczowe SECURITY DEFINER sprawia, że funkcja wykonuje się z uprawnieniami administratora bazy (omija RLS)
CREATE OR REPLACE FUNCTION public.decrement_product_stock(product_id UUID, qty INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products
    SET stock = GREATEST(0, stock - qty)
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
