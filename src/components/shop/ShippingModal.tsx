'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Truck, Coins, ShieldCheck, Clock, Info } from 'lucide-react';

interface ShippingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ShippingModal({ isOpen, onClose }: ShippingModalProps) {
    const [mounted, setMounted] = useState(false);

    // Zapobiega przewijaniu tła, gdy modal jest otwarty
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

    // Zamknięcie modala przy kliknięciu w tło (backdrop)
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return createPortal(
        <div className="shipping-modal-overlay animate-fade-in" onClick={handleBackdropClick}>
            <div className="shipping-modal-content glass-panel animate-scale-up">
                <header className="shipping-modal-header">
                    <div className="flex items-center gap-3">
                        <Truck size={24} className="text-secondary" style={{ color: '#f59e0b' }} />
                        <h2 className="shipping-modal-title">Zasady i Koszty Wysyłki</h2>
                    </div>
                    <button onClick={onClose} className="shipping-modal-close-btn" aria-label="Zamknij">
                        <X size={20} />
                    </button>
                </header>

                <div className="shipping-modal-body">
                    {/* Sekcja 1: Dostawca i obszar */}
                    <div className="shipping-modal-section">
                        <div className="section-icon-wrapper">
                            <Truck size={18} />
                        </div>
                        <div className="section-details">
                            <h3>Obszar i Metoda Dostawy</h3>
                            <p>Przesyłki realizujemy za pośrednictwem kuriera <strong>InPost</strong>.</p>
                            <p className="highlight-text">⚠️ Wysyłka wyłącznie na terenie Wielkiej Brytanii (UK Only).</p>
                            <ul>
                                <li>Dostawa pod wskazany adres domowy (Home Delivery)</li>
                                <li>Odbiór w wybranym Paczkomacie InPost (Locker)</li>
                            </ul>
                        </div>
                    </div>

                    {/* Sekcja 2: Cennik */}
                    <div className="shipping-modal-section">
                        <div className="section-icon-wrapper">
                            <Coins size={18} />
                        </div>
                        <div className="section-details">
                            <h3>Cennik Dostawy (Płyty CD)</h3>
                            <p>Koszt przesyłki zależy od liczby zamówionych płyt:</p>
                            <div className="pricing-table">
                                <div className="pricing-row">
                                    <span>1 płyta CD</span>
                                    <strong>£3.00</strong>
                                </div>
                                <div className="pricing-row">
                                    <span>Każda kolejna płyta CD</span>
                                    <strong>+ £1.00</strong>
                                </div>
                            </div>
                            <span className="info-subtext">(np. 2 płyty = £4.00, 3 płyty = £5.00 itd.)</span>
                        </div>
                    </div>

                    {/* Sekcja 3: Ubezpieczenie */}
                    <div className="shipping-modal-section">
                        <div className="section-icon-wrapper">
                            <ShieldCheck size={18} />
                        </div>
                        <div className="section-details">
                            <h3>Ubezpieczenie Przesyłki</h3>
                            <p>Wszystkie paczki są automatycznie ubezpieczone do kwoty <strong>£50.00</strong> w cenie podstawowej przesyłki.</p>
                        </div>
                    </div>

                    {/* Sekcja 4: Czas dostawy */}
                    <div className="shipping-modal-section">
                        <div className="section-icon-wrapper">
                            <Clock size={18} />
                        </div>
                        <div className="section-details">
                            <h3>Czas Realizacji i Dostawy</h3>
                            <ul>
                                <li><strong>Czas wysyłki:</strong> paczkę nadajemy w ciągu <strong>3 dni roboczych</strong> od zakupu.</li>
                                <li><strong>Czas transportu:</strong> dostarczenie przez InPost trwa zazwyczaj <strong>4-5 dni roboczych</strong>.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Uwaga */}
                    <div className="shipping-modal-notice">
                        <Info size={16} style={{ flexShrink: 0, color: '#f59e0b' }} />
                        <p>Zasady i koszty dostawy dla ubrań (streetwear) oraz biletów na imprezy zostaną zaktualizowane wkrótce.</p>
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
