import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { AddToCartButton } from '@/components/shop/AddToCartButton';
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
            <Link href={`/shop/${product.category}`} className="back-btn" style={{ marginTop: '2rem', display: 'inline-flex' }}>
                <ChevronLeft size={18} /> {categoryLabels[product.category]}
            </Link>

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

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Na stanie: {product.stock} szt.
                    </p>
                </div>
            </div>
        </div>
    );
}
