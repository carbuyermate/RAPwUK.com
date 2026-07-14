'use client';

import Link from 'next/link';
import { ChevronLeft, Trash2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useState } from 'react';
import { ShippingInfoButton } from '@/components/shop/ShippingInfoButton';
import '../shop.css';

const VisaIcon = () => (
    <svg width="34" height="21" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.9 }}>
        <rect width="38" height="24" rx="4" fill="#1A1F71"/>
        <path d="M14.5 16.5l1.8-8.5h2.9l-1.8 8.5h-2.9zm8.5-8.3c-.6-.2-1.5-.4-2.4-.4-2.6 0-4.4 1.3-4.4 3.2 0 1.4 1.3 2.2 2.3 2.7 1 .5 1.4.8 1.4 1.2 0 .6-.8.9-1.5.9-1 0-1.6-.2-2.4-.6l-.3 1.9c.6.3 1.7.5 2.8.5 2.8 0 4.6-1.3 4.6-3.3 0-1.1-.7-1.9-2.2-2.6-.9-.5-1.5-.8-1.5-1.3 0-.4.5-.9 1.5-.9.8 0 1.4.2 1.9.4l.3-1.8zm6.5 2.2c-.2-.5-.9-2.4-.9-2.4L28.3 14h2.1l.4-1.2h2.5l.2 1.2h1.9L33.7 8.2h-2.2L29.5 16.5h2.1zm-1.8-3.4l.8 2.2h-1.5l.7-2.2zM10.8 8.2L8.2 13.9 7.5 10.3l-.6-3.2L4.5 7.1l-.1-.1 3.5 9.5h3.1L15.3 8.2h-4.5z" fill="#FFF"/>
    </svg>
);

const MastercardIcon = ({ stroke }: { stroke?: string }) => (
    <svg width="34" height="21" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.9 }}>
        <rect width="38" height="24" rx="4" fill="#0A0A0C" stroke={stroke || "rgba(255,255,255,0.12)"}/>
        <circle cx="15.5" cy="12" r="6.5" fill="#EB001B"/>
        <circle cx="22.5" cy="12" r="6.5" fill="#F79E1B" fillOpacity="0.8"/>
    </svg>
);

const ApplePayIcon = ({ stroke }: { stroke?: string }) => (
    <svg width="34" height="21" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.9 }}>
        <rect width="38" height="24" rx="4" fill="#FFFFFF" stroke={stroke || "rgba(0,0,0,0.08)"}/>
        <path d="M12.2 12.1c0-1 .7-1.5.7-1.5s-.4-.6-1.1-.6c-.7 0-1.1.4-1.4.4s-.8-.4-1.4-.4c-.8 0-1.6.5-2 1.2-.8 1.4-.2 3.5.6 4.6.4.5.8 1.1 1.4 1.1.5 0 .7-.3 1.3-.3.6 0 .8.3 1.3.3.6 0 1-.5 1.4-1.1.5-.7.7-1.3.7-1.3s-1.1-.4-1.1-1.6z" fill="#000"/>
        <path d="M11.3 8.8c.3-.4.5-.9.4-1.4-.5 0-1 .3-1.3.7-.3.3-.5.8-.4 1.3.5.1 1-.2 1.3-.6z" fill="#000"/>
        <path d="M16 10h1.8c.8 0 1.4.4 1.4 1.2 0 .8-.6 1.2-1.4 1.2H16v2.6h-1.1V10h1.1zm0 1.6h.6c.4 0 .6-.2.6-.6s-.2-.6-.6-.6h-.6v1.2zm6.2-.2v3.6h-1v-.4c-.3.3-.7.5-1.2.5-.8 0-1.4-.6-1.4-1.5 0-1 .7-1.5 1.8-1.5h.8v-.2c0-.5-.3-.7-.8-.7-.4 0-.8.1-1.1.3l-.3-.7c.4-.3.9-.4 1.5-.4 1.2 0 1.7.6 1.7 1.6zm-1 1.4v-.4h-.7c-.6 0-.9.2-.9.7 0 .4.2.6.6.6.6.1 1-.3 1-1zM28.1 10l-1.9 4.3h-.1L24.2 10h1.2l1.3 3.1 1.2-3.1h1.2z" fill="#000"/>
    </svg>
);

const StripeIcon = () => (
    <svg width="34" height="21" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.9 }}>
        <rect width="38" height="24" rx="4" fill="#635BFF"/>
        <path d="M16.5 14.4c0-1.1 1-1.6 2.5-1.6 1.1 0 2.1.3 2.7.5l.7-2.5c-.9-.4-2.1-.6-3.5-.6-3.3 0-5.4 1.7-5.4 4.6 0 4.5 6.1 3.7 6.1 5.7 0 1.3-1.1 1.8-2.7 1.8-1.4 0-2.5-.4-3.3-.8l-.7 2.6c1 .5 2.5.8 4.1.8 3.5 0 5.7-1.6 5.7-4.6 0-4.8-6.2-3.9-6.2-5.9z" fill="white"/>
    </svg>
);

export default function CartPage() {
    const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const total = getTotal();
    const physicalItems = items.filter((item) => item.category !== 'bilety');
    const physicalQty = physicalItems.reduce((sum, item) => sum + item.quantity, 0);
    const shipping = physicalQty > 0 ? (3.00 + (physicalQty - 1) * 1.00) : 0;
    const grandTotal = total + shipping;

    const handleCheckout = async () => {
        if (items.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Błąd płatności');
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="container cart-page">
                <Link href="/shop" className="back-btn"><ChevronLeft size={18} /> Sklep</Link>
                <div className="shop-empty">
                    <div className="shop-empty-icon"><ShoppingCart size={64} strokeWidth={1} /></div>
                    <h2 className="shop-empty-title">Koszyk jest pusty</h2>
                    <p>Dodaj produkty, aby przejść do kasy.</p>
                    <Link href="/shop" className="btn-primary" style={{ display: 'inline-flex', marginTop: '2rem', padding: '12px 28px' }}>
                        Wróć do sklepu
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container cart-page animate-fade-in">
            <Link href="/shop" className="back-btn"><ChevronLeft size={18} /> Sklep</Link>

            <header className="page-header">
                <h1 className="page-header-title"><ShoppingCart size={28} /> Koszyk</h1>
            </header>

            <div className="cart-grid">
                {/* Items */}
                <div className="cart-items-list">
                    {items.map((item) => (
                        <div key={item.id} className="cart-item">
                            <div className="cart-item-image">
                                {item.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={item.image_url} alt={item.title} />
                                ) : (
                                    <span>{item.category === 'muzyka' ? '🎵' : item.category === 'bilety' ? '🎟️' : '👕'}</span>
                                )}
                            </div>
                            <div className="cart-item-info">
                                <div className="cart-item-category">{item.category}</div>
                                <div className="cart-item-title">{item.title}</div>
                                <div className="cart-item-qty">
                                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                                    <span className="qty-value">{item.quantity}</span>
                                    <button 
                                        className="qty-btn" 
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        disabled={item.quantity >= item.stock}
                                    >+</button>
                                    {item.quantity >= item.stock && (
                                        <span style={{ fontSize: '0.7rem', color: '#fbbf24', marginLeft: '8px' }}>
                                            Max na stanie
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="cart-item-price">£{(item.price * item.quantity).toFixed(2)}</div>
                            <button className="cart-item-remove" onClick={() => removeItem(item.id)} title="Usuń">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="cart-summary glass-panel">
                    <div className="cart-summary-title">Podsumowanie</div>
                    <div className="cart-summary-row">
                        <span>Produkty ({items.reduce((a, i) => a + i.quantity, 0)})</span>
                        <span>£{total.toFixed(2)}</span>
                    </div>
                    <div className="cart-summary-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px', borderBottom: 'none', paddingBottom: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <span>Wysyłka (InPost UK)</span>
                            <span style={{ fontWeight: 700 }}>£{shipping.toFixed(2)}</span>
                        </div>
                        <ShippingInfoButton variant="link" label="Zobacz cennik wysyłki" />
                    </div>
                    <div className="cart-summary-total">
                        <span>Razem</span>
                        <span>£{grandTotal.toFixed(2)}</span>
                    </div>

                    {/* Zgoda na regulamin i politykę prywatności */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '0.5rem', fontSize: '0.8rem', lineHeight: '1.45', color: 'var(--text-secondary)' }}>
                        <input
                            type="checkbox"
                            id="accept-terms"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            style={{ marginTop: '3px', cursor: 'pointer', flexShrink: 0 }}
                        />
                        <label htmlFor="accept-terms" style={{ cursor: 'pointer' }}>
                            Akceptuję <Link href="/regulamin" target="_blank" style={{ color: 'var(--text-primary)', textDecoration: 'underline', fontWeight: 600 }}>regulamin sklepu</Link> oraz <Link href="/polityka-prywatnosci" target="_blank" style={{ color: 'var(--text-primary)', textDecoration: 'underline', fontWeight: 600 }}>politykę prywatności</Link> (wymagane).
                        </label>
                    </div>

                    {error && (
                        <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>
                    )}

                    <button
                        className="btn-checkout"
                        onClick={handleCheckout}
                        disabled={loading || !termsAccepted}
                        style={{
                            opacity: (loading || !termsAccepted) ? 0.5 : 1,
                            cursor: (loading || !termsAccepted) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Przekierowuję...' : '🔒 Przejdź do płatności'}
                    </button>

                    {/* Bezpieczeństwo i certyfikat */}
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <VisaIcon />
                            <MastercardIcon stroke="rgba(255,255,255,0.08)"/>
                            <ApplePayIcon stroke="rgba(255,255,255,0.08)"/>
                            <StripeIcon />
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            Bezpieczne szyfrowanie SSL. Płatność obsługiwana przez Stripe.
                        </div>
                    </div>

                    <Link href="/shop" style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        ← Kontynuuj zakupy
                    </Link>
                </div>
            </div>
        </div>
    );
}
