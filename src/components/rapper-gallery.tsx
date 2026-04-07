"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import "./gallery.css";

interface RapperGalleryProps {
    images: string[];
}

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

            {isLightboxOpen && (
                <div className="lightbox-overlay" onClick={closeLightbox}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={closeLightbox}>
                            <X size={32} />
                        </button>
                        <button className="lightbox-nav left" onClick={handlePrev}>
                            <ChevronLeft size={48} />
                        </button>

                        <img
                            src={images[currentIndex]}
                            alt={`Fullscreen ${currentIndex + 1}`}
                            className="lightbox-image"
                        />

                        <button className="lightbox-nav right" onClick={handleNext}>
                            <ChevronRight size={48} />
                        </button>
                        <div className="lightbox-counter">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
