-- Add purchase_price to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(10, 2) DEFAULT 0.00 NOT NULL;

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    price_sold NUMERIC(10, 2) NOT NULL,
    purchase_price NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DROP POLICY IF EXISTS "Allow public insert" ON public.order_items;
CREATE POLICY "Allow public insert" ON public.order_items
    FOR INSERT TO public, anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated full access" ON public.order_items;
CREATE POLICY "Allow authenticated full access" ON public.order_items
    TO authenticated USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_created_at ON public.order_items(created_at);

-- Populate historical order_items from existing orders.items JSONB column
INSERT INTO public.order_items (order_id, product_id, product_name, price_sold, purchase_price, quantity, created_at)
SELECT 
    o.id AS order_id,
    (item->>'id')::UUID AS product_id,
    item->>'title' AS product_name,
    (item->>'price')::NUMERIC AS price_sold,
    COALESCE(p.purchase_price, 0.00) AS purchase_price,
    (item->>'quantity')::INTEGER AS quantity,
    o.created_at
FROM public.orders o
CROSS JOIN LATERAL jsonb_array_elements(o.items) AS item
LEFT JOIN public.products p ON p.id = (item->>'id')::UUID
ON CONFLICT DO NOTHING;
