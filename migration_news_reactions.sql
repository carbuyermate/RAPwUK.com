-- Dodanie kolumn likes i dislikes do tabeli news
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS dislikes INTEGER DEFAULT 0;

-- Zainicjowanie wartości null na 0
UPDATE public.news SET likes = 0 WHERE likes IS NULL;
UPDATE public.news SET dislikes = 0 WHERE dislikes IS NULL;

-- Bezpieczna funkcja do aktualizacji polubień/niepolubień z poziomu klienta bez dawania pełnego dostępu do zapisu tabeli news anonimowym użytkownikom
CREATE OR REPLACE FUNCTION public.adjust_news_reactions(
    p_news_id UUID,
    p_like_delta INT,
    p_dislike_delta INT
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.news
    SET 
        likes = GREATEST(0, COALESCE(likes, 0) + p_like_delta),
        dislikes = GREATEST(0, COALESCE(dislikes, 0) + p_dislike_delta)
    WHERE id = p_news_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Odświeżenie schematu PostgREST
NOTIFY pgrst, 'reload schema';
