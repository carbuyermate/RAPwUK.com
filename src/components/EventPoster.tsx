'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Maximize2, Download } from 'lucide-react';

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

    // Prevent scrolling when modal is open
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
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-2 md:p-8 cursor-zoom-out"
            onClick={() => setIsOpen(false)}
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
            {/* Action Bar (Top) */}
            <div className="absolute top-0 left-0 right-0 p-4 md:p-8 flex justify-end items-center gap-4 pointer-events-none">
                <button 
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all pointer-events-auto shadow-xl border border-white/10"
                    onClick={handleDownload}
                    title="Pobierz plakat"
                >
                    <Download size={24} />
                </button>
                <button 
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all pointer-events-auto shadow-xl border border-white/10"
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                >
                    <X size={32} />
                </button>
            </div>

            {/* Poster Image */}
            <div className="relative max-w-full max-h-full flex items-center justify-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={src} 
                    alt={alt} 
                    className="max-w-full max-h-[90vh] object-contain shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-scale-up"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            {/* Hint (Bottom) */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-sm font-medium tracking-widest uppercase pointer-events-none">
                Kliknij aby zamknąć
            </div>
        </div>
    );

    return (
        <>
            <div 
                className="event-poster-container group cursor-zoom-in relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] transition-transform hover:scale-[1.012]"
                onClick={() => setIsOpen(true)}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={src} 
                    alt={alt} 
                    className="w-full h-auto block object-contain"
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20">
                        <Maximize2 size={24} className="text-white" />
                    </div>
                </div>

                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-white/70 uppercase tracking-widest font-bold">
                    Powiększ plakat
                </div>
            </div>

            {mounted && isOpen ? createPortal(modalContent, document.body) : null}
        </>
    );
}
