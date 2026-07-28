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
            >
                <Info size={16} />
                <span>Zasady Kupowania Biletów</span>
            </button>
            <TicketRulesModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
