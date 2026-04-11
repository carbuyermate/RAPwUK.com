"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
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

            {isLightboxOpen && createPortal((
                <div 
                    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in p-4 md:p-8 cursor-zoom-out"
                    onClick={closeLightbox}
                    style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000
                    }}
                >
                    {images.length > 1 && (
                        <button 
                            className="absolute left-2 md:left-8 z-[10001] p-3 md:p-6 bg-transparent hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-all"
                            onClick={handlePrev}
                        >
                            <ChevronLeft size={48} />
                        </button>
                    )}

                    {/* Framed Image Container */}
                    <div 
                        className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col items-center cursor-default max-w-[85vw] md:max-w-[95vw] max-h-[95vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Action Bar (Top Right) */}
                        <div className="absolute -top-4 -right-4 flex gap-2 z-10">
                            <button 
                                className="p-3 bg-red-600 hover:bg-red-500 rounded-full text-white transition-all border border-red-400 shadow-xl"
                                onClick={closeLightbox}
                                title="Zamknij"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Image */}
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                key={currentIndex}
                                src={images[currentIndex]}
                                alt={`Fullscreen ${currentIndex + 1}`}
                                className="object-contain animate-scale-up"
                                style={{ maxWidth: '100%', maxHeight: 'calc(95vh - 16px)' }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {images.length > 1 && (
                        <button 
                            className="absolute right-2 md:right-8 z-[10001] p-3 md:p-6 bg-transparent hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-all"
                            onClick={handleNext}
                        >
                            <ChevronRight size={48} />
                        </button>
                    )}

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs font-medium tracking-widest uppercase pointer-events-none">
                        {images.length > 1 ? `${currentIndex + 1} / ${images.length}` : 'Kliknij gdziekolwiek aby zamknąć'}
                    </div>
                </div>
            ), document.body)}
        </>
    );
}
