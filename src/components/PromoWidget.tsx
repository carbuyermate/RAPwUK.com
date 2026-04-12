'use client';

import { useEffect, useState } from 'react';

interface Ad {
    id: string;
    image_url: string;
    link_url: string;
    name: string;
    position: string;
}

const PLACEHOLDER_BOTTOM = {
    id: 'placeholder-bottom',
    image_url: '/banner-placeholder.png',
    link_url: 'https://fb.com/RAPwUK',
    name: 'Placeholder',
    position: 'homepage_bottom',
};

const PLACEHOLDER_SIDEBAR = {
    id: 'placeholder-sidebar',
    image_url: '/banner-placeholder.png',
    link_url: 'https://fb.com/RAPwUK',
    name: 'Placeholder',
    position: 'homepage_sidebar',
};

type AdPosition = 'homepage_bottom' | 'homepage_sidebar';

interface PromoWidgetProps {
    position?: AdPosition;
}

export function PromoWidget({ position = 'homepage_bottom' }: PromoWidgetProps) {
    const isSidebar = position === 'homepage_sidebar';
    const [ad, setAd] = useState<Ad>(isSidebar ? PLACEHOLDER_SIDEBAR : PLACEHOLDER_BOTTOM);

    useEffect(() => {
        // Use our own /api/promo endpoint — avoids ad-blocker blocking Supabase REST /ads or /banners URL
        fetch(`/api/promo?position=${position}`)
            .then(async (res) => {
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.id) setAd(data);
                }
            })
            .catch(() => {});
    }, [position]);

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

    // Horizontal bottom banner
    return (
        <div style={{
            width: '100%',
            margin: '2rem 0',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.02)',
            position: 'relative',
            minHeight: '90px',
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
