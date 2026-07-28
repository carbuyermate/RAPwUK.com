'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn } from 'lucide-react';

interface ProductImageGalleryProps {
    imageUrl: string;
    alt: string;
    category: string;
}

export function ProductImageGallery({ imageUrl, alt, category }: ProductImageGalleryProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const isTicket = category === 'bilety';

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <>
            {/* Inline image container */}
            <div 
                className="product-detail-image-wrap glass-panel" 
                style={{ cursor: 'zoom-in', position: 'relative' }}
                onClick={() => setIsOpen(true)}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={imageUrl} 
                    alt={alt} 
                    style={{ objectFit: isTicket ? 'contain' : 'cover', width: '100%', height: '100%' }}
                />
                
                {/* Overlay with zoom icon on hover */}
                <div 
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                >
                    <ZoomIn size={48} className="text-white drop-shadow-md" />
                </div>
            </div>

            {/* Modal portal */}
            {mounted && isOpen && createPortal(
                <div 
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        background: 'rgba(0,0,0,0.9)',
                        zIndex: 99999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(10px)',
                        padding: '2rem'
                    }}
                    onClick={() => setIsOpen(false)}
                >
                    <button 
                        style={{
                            position: 'absolute', top: '2rem', right: '2rem',
                            background: 'rgba(255,255,255,0.1)', border: 'none',
                            color: 'white', borderRadius: '50%', width: '50px', height: '50px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', zIndex: 100000,
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    >
                        <X size={32} />
                    </button>
                    
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={imageUrl} 
                        alt={alt} 
                        style={{
                            maxWidth: '100%', maxHeight: '100%',
                            objectFit: 'contain',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            borderRadius: '8px'
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent click from closing when clicking image
                    />
                </div>,
                document.body
            )}
        </>
    );
}
