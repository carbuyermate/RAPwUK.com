import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const PLACEHOLDER_AD = {
    id: 'placeholder',
    image_url: '/banner-placeholder.png',
    link_url: 'https://fb.com/RAPwUK',
    name: 'Placeholder',
};

interface BannerAdProps {
    position?: string;
}

export async function BannerAd({ position = 'homepage_top' }: BannerAdProps) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: () => {},
            },
        }
    );

    const { data } = await supabase
        .from('ads')
        .select('*')
        .eq('position', position)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    const ad = data || PLACEHOLDER_AD;

    return (
        <div
            style={{
                width: '100%',
                margin: '1.5rem 0',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.02)',
                position: 'relative',
            }}
        >
            {/* Ad label */}
            <div
                style={{
                    position: 'absolute',
                    top: '6px',
                    right: '8px',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'rgba(255,255,255,0.25)',
                    zIndex: 2,
                    pointerEvents: 'none',
                }}
            >
                Reklama
            </div>
            <a
                href={ad.link_url || '#'}
                target="_blank"
                rel="noopener noreferrer nofollow"
                style={{ display: 'block', lineHeight: 0 }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={ad.image_url}
                    alt="Reklama"
                    style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '120px',
                        objectFit: 'cover',
                        display: 'block',
                    }}
                />
            </a>
        </div>
    );
}
