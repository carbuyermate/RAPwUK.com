-- Tabele dla projektu RAPwUK.com

-- 1. Profile użytkowników (rozszerzenie Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'promoter', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Włączenie RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Katalog Raperów
CREATE TABLE IF NOT EXISTS public.rappers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    bio TEXT,
    social_yt TEXT,
    social_fb TEXT,
    social_ig TEXT,
    images TEXT[] DEFAULT '{}', -- Tablica URL-i do zdjęć
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.rappers ENABLE ROW LEVEL SECURITY;

-- 3. Wydarzenia (Timeline)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue TEXT,
    city TEXT,
    ticket_url TEXT,
    image_url TEXT,
    promoter_id UUID REFERENCES public.profiles(id),
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 4. Newsy
CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    image_url TEXT,
    youtube_url TEXT,
    youtube_url_2 TEXT,
    youtube_url_3 TEXT,
    social_source_url TEXT,
    is_auto_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Funkcja do automatycznej aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rappers_updated_at BEFORE UPDATE ON public.rappers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Funkcja i trigger do automatycznego tworzenia profilu po rejestracji w Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
-- Uprawnienia dla API
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Allow service_role full access" ON public.events
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Dla uproszczenia testów (opcjonalnie, lepiej użyć service_role)
CREATE POLICY "Allow anon insert for sync" ON public.events
    FOR INSERT TO anon
    WITH CHECK (true);

-- 5. Reklamy (Banery)
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    position TEXT DEFAULT 'homepage_top',
    is_active BOOLEAN DEFAULT true,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Każdy może czytać aktywne reklamy
CREATE POLICY "Allow public read access" ON public.ads
    FOR SELECT USING (is_active = true);

-- Zalogowani użytkownicy mogą wszystko
CREATE POLICY "Allow authenticated full access" ON public.ads
    TO authenticated
    USING (true)
    WITH CHECK (true);

