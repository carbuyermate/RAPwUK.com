import React from 'react';

interface PromoWidgetProps {
    position?: 'homepage_bottom' | 'homepage_sidebar' | 'homepage_top';
}

const PLACEHOLDER_BOTTOM = {
    image_url: '/banner-placeholder.png',
    link_url: 'https://fb.com/RAPwUK',
};

const PLACEHOLDER_SIDEBAR = {
    image_url: '/banner-placeholder.png',
    link_url: 'https://fb.com/RAPwUK',
};

export async function PromoWidget({ position = 'homepage_bottom' }: PromoWidgetProps) {
    const isSidebar = position === 'homepage_sidebar';
    const isTop = position === 'homepage_top';
    let adData = null;

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const res = await fetch(
            `${supabaseUrl}/rest/v1/ads?position=eq.${position}&is_active=eq.true&order=created_at.desc&limit=1&select=*`,
            {
                headers: {
                    apikey: serviceKey,
                    Authorization: `Bearer ${serviceKey}`,
                    Accept: 'application/vnd.pgrst.object+json',
                },
                // Next.js: disable cache to always get the latest active banner
                cache: 'no-store',
            }
        );

        if (res.ok && res.status !== 406 && res.status !== 404) {
            adData = await res.json();
        }
    } catch (e) {
        console.error('Błąd pobierania baneru', e);
    }

    const ad = adData || (isSidebar ? PLACEHOLDER_SIDEBAR : PLACEHOLDER_BOTTOM);

    if (isSidebar) {
        return (
            <div style={{
                width: '160px',
                flexShrink: 0,
                position: 'relative',
            }}>
                <div style={{
                    position: 'sticky',
                    top: '110px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.02)',
                }}>
                    <div style={{
                        fontSize: '0.55rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: 'rgba(255,255,255,0.25)',
                        textAlign: 'center',
                        padding: '4px 0',
                    }}>
                        Polecamy
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
                            alt="Polecane"
                            style={{
                                width: '160px',
                                height: '600px',
                                objectFit: 'cover',
                                display: 'block',
                            }}
                        />
                    </a>
                </div>
            </div>
        );
    }

    // Horizontal bottom / top banner
    return (
        <div style={{
            width: '100%',
            maxWidth: isTop ? '468px' : 'none',
            margin: isTop ? '0' : '2rem 0',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.02)',
            position: 'relative',
            minHeight: '90px',
            height: isTop ? '90px' : 'auto',
        }}>
            <div style={{
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
            }}>
                Polecamy
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
                    alt="Polecane"
                    style={{
                        width: '100%',
                        height: '100%',
                        minHeight: '90px',
                        maxHeight: isTop ? '90px' : '120px',
                        objectFit: 'cover',
                        display: 'block',
                    }}
                />
            </a>
        </div>
    );
}
