'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Ticket, Users, Key, Mail, ShieldAlert } from 'lucide-react';

interface TicketRulesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TicketRulesModal({ isOpen, onClose }: TicketRulesModalProps) {
    const [mounted, setMounted] = useState(false);

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

    if (!isOpen || !mounted) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return createPortal(
        <div className="shipping-modal-overlay animate-fade-in" onClick={handleBackdropClick} style={{ zIndex: 9999 }}>
            <div className="shipping-modal-content glass-panel animate-scale-up" style={{ maxWidth: '600px' }}>
                <header className="shipping-modal-header">
                    <div className="flex items-center gap-3">
                        <Ticket size={24} className="text-secondary" style={{ color: '#f59e0b' }} />
                        <h2 className="shipping-modal-title">Zasady Kupowania Biletu</h2>
                    </div>
                    <button onClick={onClose} className="shipping-modal-close-btn" aria-label="Zamknij">
                        <X size={20} />
                    </button>
                </header>

                <div className="shipping-modal-body">
                    {/* Sekcja 1: Odpowiedzialność i dane */}
                    <div className="shipping-modal-section">
                        <div className="section-icon-wrapper" style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.1)' }}>
                            <Users size={18} />
                        </div>
                        <div className="section-details">
                            <h3>Jedna osoba odpowiedzialna</h3>
                            <p>Podczas składania zamówienia na bilety, prosimy o wpisanie <strong>Imienia i Nazwiska osoby, która faktycznie pojawi się na wydarzeniu.</strong></p>
                            <p>Jeżeli kupujesz 3 bilety dla grupy (np. dla siebie i 2 znajomych) w jednym zamówieniu, <strong>wystarczy podać dane jednej, odpowiedzialnej za te bilety osoby.</strong> Ta osoba (oraz jej goście wchodzący razem z nią) zgłasza się na bramce przed wejściem.</p>
                        </div>
                    </div>

                    {/* Sekcja 2: Hasło */}
                    <div className="shipping-modal-section">
                        <div className="section-icon-wrapper" style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.1)' }}>
                            <Key size={18} />
                        </div>
                        <div className="section-details">
                            <h3>Hasło bezpieczeństwa</h3>
                            <p>Podczas finalizacji transakcji w kasie poprosimy Cię o wpisanie wymyślonego przez Ciebie <strong>tajnego hasła.</strong></p>
                            <p>Przy wejściu na wydarzenie, organizator na bramce zapyta o Twoje Imię, Nazwisko oraz podane hasło. Jest to niezbędne by zweryfikować Twoją tożsamość z <strong>Listą Gości</strong>. W przypadku zamówienia grupowego, to hasło wpuszcza całą grupę!</p>
                        </div>
                    </div>

                    {/* Sekcja 3: Brak biletów fizycznych */}
                    <div className="shipping-modal-section">
                        <div className="section-icon-wrapper" style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)' }}>
                            <Mail size={18} />
                        </div>
                        <div className="section-details">
                            <h3>Brak biletów fizycznych (E-bilet)</h3>
                            <p>W trosce o środowisko i wygodę, nie wysyłamy fizycznych biletów ani plików PDF.</p>
                            <p className="highlight-text" style={{ background: 'rgba(16,185,129,0.05)', color: '#10b981', borderLeft: '3px solid #10b981' }}>
                                Po opłaceniu zamówienia, dostaniesz wiadomość e-mail ze standardowym potwierdzeniem (tzw. Receipt). W tym mailu zapisane będzie podane przez Ciebie Imię, Nazwisko oraz Twoje Hasło. Jesteś automatycznie na Liście Gości.
                            </p>
                        </div>
                    </div>

                    {/* Sekcja 4: Zwroty */}
                    <div className="shipping-modal-section" style={{ borderBottom: 'none' }}>
                        <div className="section-icon-wrapper" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}>
                            <ShieldAlert size={18} />
                        </div>
                        <div className="section-details">
                            <h3>Zasady Zwrotów</h3>
                            <p>Zakupione bilety na wydarzenia kulturalne, rozrywkowe lub sportowe co do zasady nie podlegają zwrotom (zgodnie z prawem odstąpienia od umowy w EU/UK). Zwrot pełnej kwoty gwarantowany jest wyłącznie w przypadku <strong>odwołania lub przełożenia wydarzenia przez organizatora</strong>.</p>
                        </div>
                    </div>

                </div>

                <footer className="shipping-modal-footer">
                    <button onClick={onClose} className="btn-primary w-full py-3">
                        Rozumiem
                    </button>
                </footer>
            </div>
        </div>,
        document.body
    );
}
