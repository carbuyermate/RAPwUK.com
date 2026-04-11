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
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in p-4 md:p-8 cursor-zoom-out"
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
            {/* Framed Poster Container */}
            <div 
                className="relative bg-[#050505] flex flex-col items-center cursor-default max-w-[85vw] md:max-w-[95vw] max-h-[95vh] rounded-xl"
                style={{
                    padding: '8px',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 0 0 10px #151515, 0 0 0 11px rgba(255,255,255,0.15), 0 30px 60px rgba(0,0,0,0.9)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Action Bar (Top Right) */}
                <div className="absolute -top-4 -right-4 flex gap-2 z-10">
                    <button 
                        className="p-3 bg-black/80 hover:bg-black rounded-full text-white transition-all border border-white/20 shadow-xl"
                        onClick={handleDownload}
                        title="Pobierz plakat"
                    >
                        <Download size={20} />
                    </button>
                    <button 
                        className="p-3 bg-red-600 hover:bg-red-500 rounded-full text-white transition-all border border-red-400 shadow-xl"
                        onClick={() => setIsOpen(false)}
                        title="Zamknij"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Poster Image */}
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={src} 
                        alt={alt} 
                        className="object-contain animate-scale-up"
                        style={{ maxWidth: '100%', maxHeight: 'calc(95vh - 16px)' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>

            {/* Hint (Bottom) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs font-medium tracking-widest uppercase pointer-events-none">
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
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                        <Maximize2 size={28} className="text-white" />
                    </div>
                </div>
            </div>

            {mounted && isOpen ? createPortal(modalContent, document.body) : null}
        </>
    );
}
