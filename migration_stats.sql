-- Tabela do zapisywania ruchu po dniach
CREATE TABLE IF NOT EXISTS public.daily_page_views (
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    page_name TEXT NOT NULL,
    views INTEGER DEFAULT 1,
    PRIMARY KEY (date, page_name)
);

ALTER TABLE public.daily_page_views ENABLE ROW LEVEL SECURITY;

-- Wszyscy moga dodawac swoj ruch (przez API, ale pozwolimy by robilo to bezpiecznie z boku, choc dla czytelności zrobimy policies)
CREATE POLICY "Allow public insert" ON public.daily_page_views
    FOR INSERT TO public, anon
    WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.daily_page_views
    FOR UPDATE TO public, anon
    USING (true);

CREATE POLICY "Allow authenticated read" ON public.daily_page_views
    FOR SELECT TO authenticated
    USING (true);

-- Bezpieczna fukcja do wywolania przez API aby na pewno robic UPSERT (INSERT or UPDATE)
CREATE OR REPLACE FUNCTION increment_page_view(p_page_name TEXT) 
RETURNS void AS $$
BEGIN
    INSERT INTO public.daily_page_views (date, page_name, views)
    VALUES (CURRENT_DATE, p_page_name, 1)
    ON CONFLICT (date, page_name)
    DO UPDATE SET views = public.daily_page_views.views + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Upewnijmy sie ze schemat pgrst zostal odświeżony aby widziało nowe tabele i funkcje
NOTIFY pgrst, 'reload schema';
