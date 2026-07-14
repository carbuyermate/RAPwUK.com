'use client';

import Link from 'next/link';
import { ChevronLeft, Trash2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useState } from 'react';
import { ShippingInfoButton } from '@/components/shop/ShippingInfoButton';
import '../shop.css';

const VisaIcon = () => (
    <svg width="34" height="21" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
        <rect width="38" height="24" rx="4" fill="#1A1F71"/>
        <path d="M15.2 7.5L13.1 16.5H10.7L8.6 7.5H11L12.4 13.9L13.8 7.5H15.2ZM21.9 11.2C21.9 9.1 18.9 9 18.9 8.2C18.9 7.9 19.2 7.6 19.8 7.6C20.1 7.6 20.9 7.7 21.5 8L21.9 6.2C21.2 5.9 20.4 5.8 19.6 5.8C18 5.8 16.8 6.7 16.8 8.1C16.8 10.3 19.8 10.4 19.8 11.3C19.8 11.6 19.4 11.9 18.8 11.9C18.1 11.9 17.3 11.6 16.8 11.3L16.4 13.1C17.1 13.5 18 13.7 18.9 13.7C20.6 13.7 21.9 12.7 21.9 11.2ZM26.4 12.3L27.2 7.5H25.3L23.4 12.3H26.4ZM27.8 7.5L25.8 16.5H23.5L21.7 7.5H23.9L24.8 13.7L25.7 7.5H27.8ZM7.6 7.5L5 13.8L4.3 9.4L3.8 7.5H1L3.9 16.5H6.2L9.8 7.5H7.6Z" fill="white"/>
    </svg>
);

const MastercardIcon = ({ stroke }: { stroke?: string }) => (
    <svg width="34" height="21" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
        <rect width="38" height="24" rx="4" fill="#0A0A0C" stroke={stroke || "rgba(255,255,255,0.08)"}/>
        <circle cx="14" cy="12" r="7" fill="#EB001B"/>
        <circle cx="24" cy="12" r="7" fill="#F79E1B" fillOpacity="0.8"/>
    </svg>
);

const ApplePayIcon = ({ stroke }: { stroke?: string }) => (
    <svg width="34" height="21" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
        <rect width="38" height="24" rx="4" fill="#0A0A0C" stroke={stroke || "rgba(255,255,255,0.08)"}/>
        <path d="M12.8 11.4C12.8 10 13.8 9.3 13.8 9.3C13.2 8.4 12.2 8.3 11.9 8.3C11 8.2 10.1 8.8 9.6 8.8C9.1 8.8 8.4 8.3 7.7 8.3C6.7 8.3 5.8 8.9 5.3 9.8C4.2 11.7 5 14.5 6 16C6.5 16.7 7.1 17.5 7.9 17.5C8.6 17.5 8.9 17 9.8 17C10.6 17 10.9 17.5 11.7 17.5C12.5 17.5 13 16.8 13.5 16.1C14.1 15.3 14.3 14.5 14.3 14.4C14.3 14.4 12.8 13.8 12.8 11.4Z" fill="white"/>
        <path d="M11.5 6.9C11.9 6.4 12.2 5.7 12.1 5C11.5 5 10.7 5.4 10.3 6C9.9 6.4 9.6 7.1 9.7 7.8C10.4 7.8 11.1 7.4 11.5 6.9Z" fill="white"/>
        <text x="16" y="15.5" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="8" fill="white">Pay</text>
    </svg>
);

const StripeIcon = () => (
    <svg width="34" height="21" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
        <rect width="38" height="24" rx="4" fill="#635BFF"/>
        <path d="M10 14.453c0-1.782 1.488-2.613 3.936-2.613 1.748 0 3.37.412 4.316.879l1.077-4.06c-1.402-.61-3.377-.953-5.526-.953-5.318 0-8.662 2.693-8.662 7.362 0 7.142 9.816 5.979 9.816 9.05 0 2.083-1.83 2.87-4.263 2.87-2.169 0-4.056-.592-5.263-1.266l-1.127 4.14c1.654.81 4.056 1.268 6.49 1.268 5.553 0 9.102-2.58 9.102-7.31 0-7.737-9.923-6.242-9.923-9.377z" fill="white" transform="scale(0.65) translate(10, 6)"/>
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
