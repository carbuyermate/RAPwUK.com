'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { ConditionGuideModal } from './ConditionGuideModal';

interface ConditionGuideButtonProps {
    className?: string;
    label?: string;
}

export function ConditionGuideButton({ className = '', label }: ConditionGuideButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

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
                <HelpCircle size={14} />
                {label || 'Jak oceniamy stan płyt?'}
            </button>
            <ConditionGuideModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
