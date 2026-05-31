'use client';

import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import { ShippingModal } from './ShippingModal';

interface ShippingInfoButtonProps {
    variant?: 'button' | 'link';
    className?: string;
    label?: string;
}

export function ShippingInfoButton({ variant = 'button', className = '', label }: ShippingInfoButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (variant === 'link') {
        return (
            <>
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className={`shipping-info-link ${className}`}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#f59e0b',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        textDecoration: 'underline',
                    }}
                >
                    {label || 'zobacz warunki wysyłki'}
                </button>
                <ShippingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
            </>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={`btn-shipping-info ${className}`}
            >
                <Truck size={16} />
                <span>{label || 'Warunki wysyłki InPost'}</span>
            </button>
            <ShippingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
