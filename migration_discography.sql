ALTER TABLE public.rappers 
ADD COLUMN IF NOT EXISTS discography JSONB DEFAULT '[]';

COMMENT ON COLUMN public.rappers.discography IS 'Array of objects [{ "year": "2024", "title": "Album Name" }]';

NOTIFY pgrst, 'reload schema';
