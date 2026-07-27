'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { TicketRulesModal } from './TicketRulesModal';

export function TicketRulesButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="btn-shipping-info"
                style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.2)' }}
            >
                <Info size={16} />
                <span>Zasady Kupowania Biletów</span>
            </button>
            <TicketRulesModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
