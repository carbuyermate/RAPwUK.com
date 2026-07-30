import React from 'react';

interface PromoWidgetProps {
    position?: 'homepage_bottom' | 'homepage_sidebar' | 'homepage_top';
}

const PLACEHOLDER_BOTTOM = {
    image_url: '/banner-cardiffornia.png',
    link_url: 'https://rapwuk.com/shop/product/hip-hop-cardiffornia-cardiff',
};

const PLACEHOLDER_SIDEBAR = {
    image_url: '/banner-placeholder.png',
    link_url: 'https://fb.com/RAPwUK',
};

const PLACEHOLDER_TOP = {
    image_url: '/banner-shop.png',
    link_url: '/shop',
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

    const isOldPlaceholder = adData && !isSidebar && !isTop && (
        adData.image_url?.includes('banner-placeholder') ||
        adData.image_url?.includes('promo/1775996623902')
    );
    const ad = (adData && !isOldPlaceholder) ? adData : (isSidebar ? PLACEHOLDER_SIDEBAR : isTop ? PLACEHOLDER_TOP : PLACEHOLDER_BOTTOM);

    if (isTop && !adData) {
        return (
            <a
                href="/shop"
                style={{
                    display: 'block',
                    textDecoration: 'none',
                    width: '100%',
                    maxWidth: '360px',
                    height: '180px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: '#0B0B0C',
                    position: 'relative',
                    boxSizing: 'border-box',
                }}
                className="group animated-shop-banner"
            >
                <style>{`
                    @keyframes pulseGlow {
                        0% { opacity: 0.3; }
                        50% { opacity: 0.6; }
                        100% { opacity: 0.3; }
                    }
                    @keyframes rotateVinyl {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    @keyframes pulseScale {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                        100% { transform: scale(1); }
                    }
                    .banner-vinyl {
                        animation: rotateVinyl 12s linear infinite;
                    }
                    .banner-button-pulse {
                        animation: pulseScale 2s ease-in-out infinite;
                    }
                    .animated-shop-banner:hover {
                        border-color: rgba(255, 255, 255, 0.2) !important;
                    }
                `}</style>
                {/* Background animation details */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'radial-gradient(circle at 75% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 70%)',
                    zIndex: 1,
                }} />
                
                {/* Polecamy tag */}
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '10px',
                    fontSize: '0.55rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'rgba(255, 255, 255, 0.3)',
                    zIndex: 2,
                }}>
                    Polecamy
                </div>

                <div style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    position: 'relative',
                    zIndex: 2,
                }}>
                    {/* Left: Rotating CD/Vinyl icon */}
                    <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                        {/* Outer Vinyl ring */}
                        <div className="banner-vinyl" style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, #1a1a1a 20%, #0c0c0c 25%, #1f1f1f 40%, #0d0d0d 45%, #2a2a2a 60%, #151515 65%, #3a3a3a 80%)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.6), inset 0 0 10px rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}>
                            {/* Inner Vinyl label */}
                            <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: '#FFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1.5px dashed #000',
                            }}>
                                {/* Logo mark inside vinyl */}
                                <div style={{ fontSize: '0.38rem', fontWeight: 900, color: '#000', letterSpacing: '-0.5px' }}>RAP</div>
                            </div>
                        </div>
                    </div>

                    {/* Middle: Brand info */}
                    <div style={{
                        flex: 1,
                        marginLeft: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                    }}>
                        <span style={{
                            fontSize: '1.25rem',
                            fontWeight: 900,
                            color: '#FFF',
                            fontFamily: 'Outfit, sans-serif',
                            letterSpacing: '-0.5px',
                            textTransform: 'uppercase',
                            lineHeight: 1.1,
                        }}>
                            RAPwUK SHOP
                        </span>
                        <span style={{
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            color: 'rgba(255, 255, 255, 0.5)',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            marginTop: '4px',
                            lineHeight: 1.2,
                        }}>
                            Polski Sklep Muzyczny w UK
                        </span>
                        
                        {/* Button wrapper with pulse animation */}
                        <div className="banner-button-pulse" style={{ marginTop: '14px' }}>
                            <div style={{
                                padding: '6px 14px',
                                background: '#FFF',
                                color: '#000',
                                borderRadius: '6px',
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(255,255,255,0.1)',
                            }}>
                                KUP TERAZ
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        );
    }

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
            maxWidth: isTop ? '360px' : 'none',
            margin: isTop ? '0' : '2rem 0',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.02)',
            position: 'relative',
            minHeight: isTop ? '180px' : '90px',
            height: isTop ? '180px' : 'auto',
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
                        height: isTop ? '100%' : 'auto',
                        minHeight: isTop ? '180px' : undefined,
                        maxHeight: isTop ? '180px' : undefined,
                        objectFit: isTop ? 'cover' : 'contain',
                        display: 'block',
                    }}
                />
            </a>
        </div>
    );
}
