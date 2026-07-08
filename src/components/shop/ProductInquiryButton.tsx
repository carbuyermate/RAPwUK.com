'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/app/shop/page';

interface ProductInquiryButtonProps {
    product: Product;
}

export function ProductInquiryButton({ product }: ProductInquiryButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    const closeModal = () => {
        setIsOpen(false);
        setError(null);
    };

    const openModal = () => {
        setIsOpen(true);
        setSubmitted(false);
        setMessage('');
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const emailSubject = `[Zapytaj o produkt] ${product.title}`;
        const emailMessage = `Wiadomość od klienta:\n${message}\n\nDotyczy produktu: ${product.title}\nCena: £${product.price.toFixed(2)}\nKategoria: ${product.category}\nLink do produktu: ${window.location.origin}/shop/product/${product.slug}`;

        try {
            const { error: insertError } = await supabase
                .from('contact_messages')
                .insert([
                    {
                        email,
                        subject: emailSubject,
                        message: emailMessage,
                    }
                ]);

            if (insertError) throw insertError;
            setSubmitted(true);
        } catch (err: any) {
            console.error('Błąd podczas wysyłania zapytania:', err);
            setError(err.message || 'Wystąpił błąd podczas wysyłania zapytania. Spróbuj ponownie później.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={openModal}
                className="btn-shipping-info"
                style={{ 
                    marginTop: '0.75rem', 
                    width: '100%', 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}
            >
                <HelpCircle size={16} />
                <span>Zapytaj o produkt</span>
            </button>

            {isOpen && mounted && createPortal(
                <div className="shipping-modal-overlay animate-fade-in" onClick={handleBackdropClick}>
                    <div className="shipping-modal-content glass-panel animate-scale-up" style={{ maxWidth: '500px' }}>
                        <header className="shipping-modal-header">
                            <div className="flex items-center gap-3">
                                <HelpCircle size={24} style={{ color: '#f59e0b' }} />
                                <h2 className="shipping-modal-title">Zapytaj o produkt</h2>
                            </div>
                            <button onClick={closeModal} className="shipping-modal-close-btn" aria-label="Zamknij">
                                <X size={20} />
                            </button>
                        </header>

                        <div className="shipping-modal-body" style={{ padding: '1.5rem' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                                Masz pytania dotyczące stanu, wysyłki lub szczegółów produktu <strong>{product.title}</strong>? Napisz do nas bezpośrednio przez poniższy formularz!
                            </p>

                            {submitted ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <CheckCircle2 size={54} color="#4ade80" style={{ margin: '0 auto 1rem' }} />
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Wiadomość wysłana!</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                        Odpowiemy na podany adres e-mail najszybciej jak to możliwe (zazwyczaj w ciągu 24 godzin).
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {error && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem' }}>
                                            <AlertCircle size={16} />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <div className="gielda-form-group">
                                        <label className="gielda-form-label" htmlFor="inquiry-email" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>
                                            Twój adres e-mail
                                        </label>
                                        <input
                                            type="email"
                                            id="inquiry-email"
                                            className="gielda-form-input"
                                            placeholder="np. jan.kowalski@gmail.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem' }}
                                        />
                                    </div>

                                    <div className="gielda-form-group">
                                        <label className="gielda-form-label" htmlFor="inquiry-message" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>
                                            Treść pytania
                                        </label>
                                        <textarea
                                            id="inquiry-message"
                                            className="gielda-form-input"
                                            rows={5}
                                            placeholder={`Zadaj pytanie dotyczące produktu: ${product.title}...`}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            required
                                            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', resize: 'vertical' }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={loading}
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            gap: '8px',
                                            padding: '12px 24px',
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            height: '44px',
                                            borderRadius: '8px',
                                            width: '100%',
                                            marginTop: '0.5rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {loading ? 'Wysyłanie...' : (
                                            <>
                                                Wyślij zapytanie <Send size={16} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        <footer className="shipping-modal-footer">
                            <button type="button" onClick={closeModal} className="btn-secondary w-full py-2">
                                Zamknij
                            </button>
                        </footer>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
