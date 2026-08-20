'use client';

import Link from 'next/link';
import { ChevronLeft, Trash2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useState } from 'react';
import { ShippingInfoButton } from '@/components/shop/ShippingInfoButton';
import '../shop.css';

const VisaIcon = () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/visa.svg" alt="Visa" style={{ width: '36px', height: '24px', flexShrink: 0, borderRadius: '4px' }} />
);

const MastercardIcon = () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/mastercard.svg" alt="Mastercard" style={{ width: '36px', height: '24px', flexShrink: 0, borderRadius: '4px' }} />
);

const ApplePayIcon = () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/apple-pay.svg" alt="Apple Pay" style={{ width: '36px', height: '24px', flexShrink: 0, borderRadius: '4px' }} />
);

const StripeIcon = () => (
    <div style={{
        width: '36px',
        height: '24px',
        background: '#635BFF',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    }}>
        <svg viewBox="0 0 24 24" width="12" height="12" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
        </svg>
    </div>
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
                    {items.map((item) => {
                        const cartKey = item.ticket_tier_id ? `${item.id}::${item.ticket_tier_id}` : item.id;
                        return (
                        <div key={cartKey} className="cart-item">
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
                                {item.ticket_tier_name && (
                                    <div style={{
                                        display: 'inline-block',
                                        marginTop: '4px',
                                        padding: '2px 8px',
                                        borderRadius: '99px',
                                        background: 'rgba(245,158,11,0.15)',
                                        border: '1px solid rgba(245,158,11,0.3)',
                                        color: '#f59e0b',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.03em',
                                    }}>
                                        🎟️ {item.ticket_tier_name}
                                    </div>
                                )}
                                <div className="cart-item-qty">
                                    <button className="qty-btn" onClick={() => updateQuantity(cartKey, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                                    <span className="qty-value">{item.quantity}</span>
                                    <button 
                                        className="qty-btn" 
                                        onClick={() => updateQuantity(cartKey, item.quantity + 1)}
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
                            <button className="cart-item-remove" onClick={() => removeItem(cartKey)} title="Usuń">
                                <Trash2 size={18} />
                            </button>
                        </div>
                        );
                    })}

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
