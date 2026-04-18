'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download } from 'lucide-react';

interface EventPosterProps {
    src: string;
    alt: string;
}

export function EventPoster({ src, alt }: EventPosterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = src;
        link.download = `plakat-${alt.replace(/\s+/g, '-').toLowerCase()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const modalContent = isOpen && (
        <div
            onClick={() => setIsOpen(false)}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                width: '100vw', height: '100vh',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10000,
                background: 'rgba(0,0,0,0.97)',
                backdropFilter: 'blur(8px)',
                cursor: 'zoom-out',
                padding: '2rem',
            }}
        >
            {/* 3D Frame Container */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'relative',
                    cursor: 'default',
                    maxWidth: '85vw',
                    maxHeight: '92vh',
                    borderRadius: '14px',
                    padding: '10px',
                    background: '#0a0a0a',
                    /* Layered box-shadows create the 3D frame effect */
                    boxShadow: `
                        inset 0 2px 2px rgba(255,255,255,0.12),
                        inset 0 -2px 4px rgba(0,0,0,0.8),
                        0 0 0 1px rgba(255,255,255,0.08),
                        0 0 0 12px #111,
                        0 0 0 13px rgba(255,255,255,0.2),
                        0 0 0 14px rgba(255,255,255,0.06),
                        0 0 0 26px #0a0a0a,
                        0 0 0 27px rgba(255,255,255,0.08),
                        0 50px 100px rgba(0,0,0,0.95),
                        0 20px 40px rgba(0,0,0,0.8)
                    `,
                }}
            >
                {/* Download button — top right corner of frame */}
                <button
                    onClick={handleDownload}
                    title="Pobierz plakat"
                    style={{
                        position: 'absolute',
                        top: '-18px',
                        right: '-18px',
                        zIndex: 10,
                        width: '40px', height: '40px',
                        borderRadius: '50%',
                        background: '#1a1a1a',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.8)',
                        transition: 'background 0.2s',
                    }}
                >
                    <Download size={16} />
                </button>

                {/* Poster Image */}
                <div style={{ borderRadius: '8px', overflow: 'hidden', lineHeight: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={src}
                        alt={alt}
                        style={{ maxWidth: '100%', maxHeight: 'calc(92vh - 60px)', objectFit: 'contain', display: 'block' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>

            {/* Hint */}
            <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
            }}>
                Kliknij gdziekolwiek aby zamknąć
            </div>
        </div>
    );

    return (
        <>
            <div
                className="event-poster-container group cursor-pointer relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] transition-transform hover:scale-[1.02]"
                onClick={() => setIsOpen(true)}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-auto block object-cover"
                />
            </div>

            {mounted && isOpen ? createPortal(modalContent, document.body) : null}
        </>
    );
}
