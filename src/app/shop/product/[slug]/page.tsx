import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/shop/BackButton';
import { AddToCartButton } from '@/components/shop/AddToCartButton';
import { ShippingInfoButton } from '@/components/shop/ShippingInfoButton';
import { ConditionGuideButton } from '@/components/shop/ConditionGuideButton';
import { ProductInquiryButton } from '@/components/shop/ProductInquiryButton';
import type { Product } from '@/app/shop/page';
import '../../shop.css';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    const { data: product } = await supabase
        .from('products')
        .select('title, description, image_url, slug, price, category')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

    if (!product) {
        return {
            title: 'Produkt nieznaleziony | RAPwUK Shop',
            robots: { index: false, follow: false },
        };
    }

    const title = `${product.title} | RAPwUK Shop`;
    const descriptionText = product.description && product.description.trim().length > 0
        ? (product.description.length > 155 ? product.description.substring(0, 152) + '...' : product.description)
        : `Kup teraz "${product.title}" w RAPwUK Shop – polskim sklepie muzycznym w UK. Cena: £${Number(product.price).toFixed(2)}. Szybka dostawa InPost po całym UK.`;

    // Zawsze użyj okładki produktu — logo tylko gdy brak zdjęcia
    const productImage = product.image_url || 'https://rapwuk.com/logo.jpg';

    return {
        title,
        description: descriptionText,
        robots: { index: true, follow: true },
        alternates: {
            canonical: `https://rapwuk.com/shop/product/${product.slug}`,
        },
        openGraph: {
            title: product.title,
            description: descriptionText,
            type: 'website',
            url: `https://rapwuk.com/shop/product/${product.slug}`,
            siteName: 'RAPwUK Shop',
            locale: 'pl_PL',
            images: [
                {
                    url: productImage,
                    width: 800,
                    height: 800,
                    alt: product.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            site: '@RAPwUK',
            creator: '@RAPwUK',
            title: product.title,
            description: descriptionText,
            images: [productImage],
        },
    };
}

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

    const categoryLabels: Record<string, string> = { muzyka: 'Muzyka', bilety: 'Bilety', ubrania: 'Ubrania', filmy: 'Filmy' };
    const categoryEmoji: Record<string, string> = { muzyka: '🎵', bilety: '🎟️', ubrania: '👕', filmy: '🎬' };

    // Schema.org structured data
    const itemConditionSchema = product.item_condition === 'Nowa w folii'
        ? 'https://schema.org/NewCondition'
        : product.item_condition === 'Nowa'
            ? 'https://schema.org/NewCondition'
            : 'https://schema.org/UsedCondition';

    const productSchema = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.title,
        image: product.image_url ? [product.image_url] : ['https://rapwuk.com/logo.jpg'],
        description: product.description || `${product.title} dostępny w RAPwUK Shop - jedyny polski sklep muzyczny w Wielkiej Brytanii.`,
        sku: product.id,
        brand: {
            '@type': 'Brand',
            name: 'RAPwUK Shop',
        },
        offers: {
            '@type': 'Offer',
            url: `https://rapwuk.com/shop/product/${product.slug}`,
            priceCurrency: 'GBP',
            price: product.price.toFixed(2),
            priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            itemCondition: itemConditionSchema,
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'RAPwUK Shop',
                url: 'https://rapwuk.com/shop',
            },
        },
    };

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '5rem' }}>
            {/* Schema.org Product JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />

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

                    {product.category === 'bilety' && (product.ticket_event_date || product.ticket_venue || product.ticket_city || product.ticket_type || product.ticket_age_restriction) && (
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
                                    🎟️ Szczegóły Wydarzenia & Biletów:
                                </h3>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {product.ticket_event_date && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>📅 Data i godzina:</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{product.ticket_event_date}</strong>
                                    </li>
                                )}
                                {product.ticket_venue && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>🏟️ Klub / Miejsce:</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{product.ticket_venue}</strong>
                                    </li>
                                )}
                                {product.ticket_city && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>📍 Miasto:</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{product.ticket_city}</strong>
                                    </li>
                                )}
                                {product.ticket_type && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>🎟️ Rodzaj / Pula:</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{product.ticket_type}</strong>
                                    </li>
                                )}
                                {product.ticket_age_restriction && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>🔞 Wymóg wiekowy:</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{product.ticket_age_restriction}</strong>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}

                    {product.category === 'ubrania' && (product.clothing_size || product.clothing_condition) && (
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
                                    👕 Specyfikacja Ubrania:
                                </h3>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {product.clothing_size && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Rozmiar:</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{product.clothing_size}</strong>
                                    </li>
                                )}
                                {product.clothing_condition && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Stan:</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{product.clothing_condition}</strong>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}

                    {product.category === 'filmy' && (product.movie_format || product.movie_language || product.movie_subtitles || product.movie_genre || product.movie_cast || product.item_condition || product.condition_media || product.condition_cover || product.condition_notes) && (
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
                                    🎬 Szczegóły Wydania Filmowego & Stan:
                                </h3>
                                <ConditionGuideButton />
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {product.item_condition && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Stan ogólny:</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{product.item_condition}</strong>
                                    </li>
                                )}
                                {product.movie_genre && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>📽️ Gatunek:</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{product.movie_genre}</strong>
                                    </li>
                                )}
                                {product.movie_format && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Format / Nośnik:</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>💿 {product.movie_format}</strong>
                                    </li>
                                )}
                                {product.movie_language && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>🗣️ Język audio:</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{product.movie_language}</strong>
                                    </li>
                                )}
                                {product.movie_subtitles && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>💬 Napisy:</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{product.movie_subtitles}</strong>
                                    </li>
                                )}
                                {product.movie_cast && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>🎭 Obsada / Aktorzy:</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{product.movie_cast}</strong>
                                    </li>
                                )}
                                {product.condition_media && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Stan nośnika (Płyty):</span>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.condition_media}</span>
                                    </li>
                                )}
                                {product.condition_cover && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Stan okładki / poligrafii:</span>
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <ShippingInfoButton />
                        <ProductInquiryButton product={product} />
                    </div>
                </div>
            </div>
        </div>
    );
}
