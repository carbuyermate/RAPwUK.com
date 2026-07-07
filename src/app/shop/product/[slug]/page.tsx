import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/shop/BackButton';
import { AddToCartButton } from '@/components/shop/AddToCartButton';
import { ShippingInfoButton } from '@/components/shop/ShippingInfoButton';
import { ConditionGuideButton } from '@/components/shop/ConditionGuideButton';
import type { Product } from '@/app/shop/page';
import '../../shop.css';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const { data } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

    if (!data) return notFound();
    const product = data as Product;

    const categoryLabels: Record<string, string> = { muzyka: 'Muzyka', bilety: 'Bilety', ubrania: 'Ubrania' };
    const categoryEmoji: Record<string, string> = { muzyka: '🎵', bilety: '🎟️', ubrania: '👕' };

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '5rem' }}>
            <BackButton 
                fallbackUrl={`/shop/${product.category}`} 
                label={categoryLabels[product.category]} 
            />

            <div className="product-detail-grid">
                {/* Image */}
                <div className="product-detail-image-wrap glass-panel">
                    {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image_url} alt={product.title} />
                    ) : (
                        <span>{categoryEmoji[product.category]}</span>
                    )}
                </div>

                {/* Info */}
                <div className="product-detail-info">
                    <span className="product-card-category" style={{ fontSize: '0.8rem' }}>
                        {categoryLabels[product.category]}
                    </span>
                    <h1 style={{
                        fontFamily: 'var(--font-outfit, Outfit)',
                        fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                        fontWeight: 900,
                        lineHeight: 1.1,
                        letterSpacing: '-1px',
                        margin: 0,
                    }}>
                        {product.title}
                    </h1>

                    <div className="product-detail-price">£{product.price.toFixed(2)}</div>

                    {product.description && (
                        <p className="product-detail-desc">{product.description}</p>
                    )}

                    {product.category === 'muzyka' && (product.media_type || product.condition_media || product.condition_cover || product.condition_notes || product.item_condition) && (
                        <div style={{
                            margin: '1.5rem 0',
                            padding: '1.25rem',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.06)',
                            fontSize: '0.9rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                    Szczegóły wydania & stan przedmiotu:
                                </h3>
                                <ConditionGuideButton />
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {product.item_condition && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Stan ogólny:</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>
                                            {product.item_condition}
                                        </strong>
                                    </li>
                                )}
                                {product.media_type && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Nośnik:</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>
                                            {product.media_type === 'CD' ? '💿 CD' : product.media_type === 'DVD' ? '📀 DVD' : '📼 Kaseta'}
                                        </strong>
                                    </li>
                                )}
                                {product.condition_media && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Stan nośnika:</span>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.condition_media}</span>
                                    </li>
                                )}
                                {product.condition_cover && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Stan okładki:</span>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.condition_cover}</span>
                                    </li>
                                )}
                                {product.condition_notes && (
                                    <li style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingTop: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Uwagi:</span>
                                        <div style={{
                                            padding: '8px 12px',
                                            background: 'rgba(245,158,11,0.05)',
                                            border: '1px solid rgba(245,158,11,0.15)',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            color: '#f59e0b',
                                            lineHeight: '1.4'
                                        }}>
                                            {product.condition_notes}
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}

                    {product.stock === 0 ? (
                        <div style={{
                            padding: '14px 24px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 12,
                            textAlign: 'center',
                            fontWeight: 700,
                            color: 'var(--text-secondary)',
                        }}>
                            Brak w magazynie
                        </div>
                    ) : (
                        <AddToCartButton product={product} />
                    )}

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Na stanie: {product.stock} szt.
                    </p>

                    <div>
                        <ShippingInfoButton />
                    </div>
                </div>
            </div>
        </div>
    );
}
