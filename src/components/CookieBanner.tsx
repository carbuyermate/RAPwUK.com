'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Info, ShieldAlert, X } from 'lucide-react';

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Sprawdzamy stan zgody w localStorage
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Pokazujemy baner po krótkim opóźnieniu dla ładniejszego efektu wizualnego
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <>
            <style>{`
                .cookie-banner-wrap {
                    position: fixed;
                    bottom: 20px;
                    left: 16px;
                    right: 16px;
                    z-index: 9999;
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    border: 1px solid var(--glass-border);
                    background: var(--glass-bg);
                    box-shadow: var(--glass-shadow);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-radius: 16px;
                }
                @media (min-width: 640px) {
                    .cookie-banner-wrap {
                        left: 50%;
                        right: auto;
                        transform: translateX(-50%);
                        width: 90%;
                        max-width: 600px;
                    }
                }
            `}</style>
            <div className="cookie-banner-wrap glass-panel animate-fade-in">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <ShieldAlert size={20} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                    <p style={{ margin: 0, fontWeight: 600, marginBottom: '4px' }}>Polityka prywatności i pliki cookies</p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                        Ta strona korzysta z plików cookie w celu optymalizacji i analizy ruchu. Wybierając „Akceptuję”, wyrażasz zgodę na używanie przez nas plików cookie. Szczegóły znajdziesz w naszej {' '}
                        <Link href="/polityka-prywatnosci#cookies" style={{ color: '#f59e0b', textDecoration: 'underline', fontWeight: 600 }}>Polityce Prywatności</Link>.
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                <button
                    onClick={handleDecline}
                    style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.borderColor = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                >
                    Odrzucam
                </button>
                <button
                    onClick={handleAccept}
                    style={{
                        padding: '8px 20px',
                        background: 'var(--text-primary)',
                        color: 'var(--bg-primary)',
                        border: '1px solid var(--text-primary)',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    Akceptuję
                </button>
            </div>
        </div>
        </>
    );
}
