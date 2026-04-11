"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import "./gallery.css";

interface RapperGalleryProps {
    images: string[];
}

const FRAME_SHADOW = `
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
`;

export function RapperGallery({ images }: RapperGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    if (!images || images.length === 0) return null;

    const handleNext = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const openLightbox = () => setIsLightboxOpen(true);
    const closeLightbox = () => setIsLightboxOpen(false);

    return (
        <>
            <div className="gallery-container" onClick={openLightbox}>
                <img
                    src={images[currentIndex]}
                    alt={`Gallery image ${currentIndex + 1}`}
                    className="gallery-image"
                />

                {images.length > 1 && (
                    <div className="gallery-controls">
                        <button className="gallery-nav-btn" onClick={handlePrev} aria-label="Poprzednie zdjęcie">
                            <ChevronLeft size={20} />
                        </button>
                        <button className="gallery-nav-btn" onClick={handleNext} aria-label="Następne zdjęcie">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                <div className="gallery-maximize">
                    <Maximize2 size={16} />
                </div>

                <div className="gallery-indicators">
                    {images.map((_, i) => (
                        <span key={i} className={`indicator ${i === currentIndex ? 'active' : ''}`} />
                    ))}
                </div>
            </div>

            {isLightboxOpen && createPortal((
                <div
                    onClick={closeLightbox}
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
                    {/* Left nav arrow */}
                    {images.length > 1 && (
                        <button
                            onClick={handlePrev}
                            style={{
                                position: 'absolute', left: '1.5rem',
                                zIndex: 10001,
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                padding: '1rem',
                                borderRadius: '50%',
                                transition: 'all 0.2s',
                            }}
                        >
                            <ChevronLeft size={48} />
                        </button>
                    )}

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
                            boxShadow: FRAME_SHADOW,
                        }}
                    >
                        {/* Image */}
                        <div style={{ borderRadius: '8px', overflow: 'hidden', lineHeight: 0 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                key={currentIndex}
                                src={images[currentIndex]}
                                alt={`Fullscreen ${currentIndex + 1}`}
                                style={{ maxWidth: '100%', maxHeight: 'calc(92vh - 60px)', objectFit: 'contain', display: 'block' }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Right nav arrow */}
                    {images.length > 1 && (
                        <button
                            onClick={handleNext}
                            style={{
                                position: 'absolute', right: '1.5rem',
                                zIndex: 10001,
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                padding: '1rem',
                                borderRadius: '50%',
                                transition: 'all 0.2s',
                            }}
                        >
                            <ChevronRight size={48} />
                        </button>
                    )}

                    {/* Counter / hint */}
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
                        {images.length > 1 ? `${currentIndex + 1} / ${images.length}` : 'Kliknij gdziekolwiek aby zamknąć'}
                    </div>
                </div>
            ), document.body)}
        </>
    );
}
