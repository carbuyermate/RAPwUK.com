'use client';

import { useState, useEffect } from 'react';
import { X, Maximize2, Download } from 'lucide-react';

interface EventPosterProps {
    src: string;
    alt: string;
}

export function EventPoster({ src, alt }: EventPosterProps) {
    const [isOpen, setIsOpen] = useState(false);

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
                    className="w-full h-auto block object-contain max-h-[600px]"
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20">
                        <Maximize2 size={24} className="text-white" />
                    </div>
                </div>

                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-white/70 uppercase tracking-widest font-bold">
                    Kliknij aby powiększyć
                </div>
            </div>

            {/* Lightbox Modal */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in p-4 md:p-10 cursor-zoom-out"
                    onClick={() => setIsOpen(false)}
                >
                    <button 
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    >
                        <X size={28} />
                    </button>

                    <button 
                        className="absolute top-6 right-20 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer flex items-center gap-2 px-4"
                        onClick={handleDownload}
                        title="Pobierz plakat"
                    >
                        <Download size={20} />
                        <span className="text-sm font-medium hidden md:inline">Pobierz plakat</span>
                    </button>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={src} 
                        alt={alt} 
                        className="max-w-full max-h-full object-contain shadow-2xl animate-scale-up"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
