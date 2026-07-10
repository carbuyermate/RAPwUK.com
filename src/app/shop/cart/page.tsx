'use client';

import Link from 'next/link';
import { ChevronLeft, Trash2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useState } from 'react';
import { ShippingInfoButton } from '@/components/shop/ShippingInfoButton';
import '../shop.css';

export default function CartPage() {
    const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                                    <span>{item.category === 'muzyka' ? '🎵' : item.category === 'bilety' ? '🎟️' : item.category === 'ubrania' ? '👕' : '💻'}</span>
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

                    {error && (
                        <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>
                    )}

                    <button
                        className="btn-checkout"
                        onClick={handleCheckout}
                        disabled={loading}
                    >
                        {loading ? 'Przekierowuję...' : '🔒 Przejdź do płatności'}
                    </button>

                    <Link href="/shop" style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        ← Kontynuuj zakupy
                    </Link>
                </div>
            </div>
        </div>
    );
}
