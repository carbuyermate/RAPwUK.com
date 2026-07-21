import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Music, Ticket, Shirt, ShoppingBag, Tag } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { ShippingInfoButton } from '@/components/shop/ShippingInfoButton';
import './shop.css';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Polski Sklep Muzyczny w UK | RAPwUK Shop | Płyty CD i Hip-Hop',
    description: 'Jedyny i oficjalny polski sklep muzyczny w UK (Wielkiej Brytanii) - RAPwUK Shop. Kupuj polskie płyty rapowe, hip-hopowe, CD, kasety, ubrania i bilety na koncerty. Szybka wysyłka paczkomatem InPost w UK.',
    keywords: [
        'polski sklep muzyczny w uk',
        'rapwuk shop',
        'sklep muzyczny w uk',
        'polski sklep z płytami w uk',
        'polski hip hop w uk',
        'płyty cd uk',
        'rap w uk',
        'polskie płyty w wielkiej brytanii',
        'inpost uk',
        'kup płyty w uk'
    ],
    openGraph: {
        title: 'Polski Sklep Muzyczny w UK | RAPwUK Shop | Płyty CD i Hip-Hop',
        description: 'Jedyny i oficjalny polski sklep muzyczny w UK (Wielkiej Brytanii) - RAPwUK Shop. Kupuj polskie płyty rapowe, hip-hopowe, CD, kasety, ubrania i bilety na koncerty. Szybka wysyłka paczkomatem InPost w UK.',
        type: 'website',
        url: 'https://rapwuk.com/shop',
    }
};

export interface Product {
    id: string;
    slug: string;
    title: string;
    description: string;
    price: number;
    category: 'muzyka' | 'bilety' | 'ubrania';
    image_url?: string;
    stripe_price_id?: string;
    stock: number;
    media_type?: 'CD' | 'DVD' | 'Kaseta' | null;
    condition_media?: string | null;
    condition_cover?: string | null;
    condition_notes?: string | null;
    music_category?: 'RAP PL' | 'RAP UK' | 'RAP USA' | 'POLSKI RAP W UK' | 'ELEKTRONIKA' | null;
    item_condition?: 'Nowa w folii' | 'Nowa' | 'Używana' | null;
    created_at?: string;
}

const CATEGORIES = [
    {
        id: 'muzyka',
        title: 'Muzyka',
        icon: <Music size={20} strokeWidth={1.5} />,
        href: '/shop/muzyka',
    },
    {
        id: 'bilety',
        title: 'Bilety',
        icon: <Ticket size={20} strokeWidth={1.5} />,
        href: '/shop/bilety',
    },
    {
        id: 'ubrania',
        title: 'Ubrania',
        icon: <Shirt size={20} strokeWidth={1.5} />,
        href: '/shop/ubrania',
    },
    {
        id: 'gielda',
        title: 'Giełda',
        icon: <Tag size={20} strokeWidth={1.5} />,
        href: '/shop/gielda',
    },
];

export default async function ShopPage() {
    const { data: newProducts } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gt('stock', 0)
        .order('created_at', { ascending: false })
        .limit(8);

    const products = (newProducts || []) as Product[];

    // Schema.org Store + ItemList
    const storeSchema = {
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: 'RAPwUK Shop',
        description: 'Jedyny i oficjalny polski sklep muzyczny w Wielkiej Brytanii. Polskie płyty rapowe, CD, kasety, ubrania i bilety na koncerty. Szybka wysyłka InPost w UK.',
        url: 'https://rapwuk.com/shop',
        image: 'https://rapwuk.com/logo.jpg',
        telephone: '',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Peterborough',
            addressCountry: 'GB',
        },
        currenciesAccepted: 'GBP',
        paymentAccepted: 'Credit Card, Debit Card, Apple Pay',
        priceRange: '£1 - £200',
        hasMap: 'https://rapwuk.com/shop',
        openingHours: 'Mo-Su 00:00-23:59',
    };

    const itemListSchema = products.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Nowości w RAPwUK Shop',
        url: 'https://rapwuk.com/shop',
        numberOfItems: products.length,
        itemListElement: products.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `https://rapwuk.com/shop/product/${p.slug}`,
            name: p.title,
        })),
    } : null;

    return (
        <div className="container shop-page animate-fade-in">
            {/* Schema.org structured data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
            />
            {itemListSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
                />
            )}

            {/* Standard page header — identical to Newsy, Eventy, Scena */}
            <header className="page-header animate-fade-in">
                <h1 className="page-header-title">
                    <ShoppingBag size={32} /> Sklep
                </h1>
                <div style={{ marginTop: '1rem' }}>
                    <ShippingInfoButton />
                </div>
            </header>

            {/* Categories */}
            <div className="shop-categories">
                {CATEGORIES.map((cat) => (
                    <Link key={cat.id} href={cat.href} className="category-card">
                        <div className="category-card-icon" style={{ color: 'var(--text-secondary)' }}>
                            {cat.icon}
                        </div>
                        <div className="category-card-body">
                            <h2 className="category-card-title">{cat.title}</h2>
                        </div>
                        <span className="category-card-arrow">
                            Przeglądaj <ArrowRight size={13} />
                        </span>
                    </Link>
                ))}
            </div>

            {/* Products */}
            {products.length > 0 ? (
                <section>
                    <h2 className="shop-section-title">Nowości</h2>
                    <div className="product-grid">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            ) : (
                <div className="shop-empty">
                    <p style={{ fontSize: '2.5rem', opacity: 0.3 }}>🛒</p>
                    <h2 className="shop-empty-title">Sklep wkrótce</h2>
                    <p>Pracujemy nad asortymentem.</p>
                </div>
            )}

            {/* Informacje o sklepie */}
            <section style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px dashed var(--border-color)' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '20px',
                }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🚚 Szybka dostawa InPost UK
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                            Przesyłki na terenie Wielkiej Brytanii realizujemy kurierem i do Paczkomatów InPost. Bezpieczne ubezpieczenie paczki do £50.
                        </p>
                        <Link href="/dostawa" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'underline', marginTop: 'auto' }}>
                            Szczegóły dostawy →
                        </Link>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🔒 Bezpieczne płatności Stripe
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                            Obsługujemy płatności kartami Visa, Mastercard oraz Apple Pay. Transakcje są szyfrowane (SSL) i przetwarzane bezpośrednio przez Stripe.
                        </p>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 'auto' }}>
                            PCI-DSS Compliant
                        </span>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            📄 Informacje i Zwroty
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                            Kupując online, masz 14 dni na odstąpienie od umowy bez podania przyczyny. Sprawdź warunki zakupów w naszym sklepie.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', fontWeight: 700, marginTop: 'auto' }}>
                            <Link href="/regulamin" style={{ textDecoration: 'underline' }}>Regulamin</Link>
                            <Link href="/zwroty-i-reklamacje" style={{ textDecoration: 'underline' }}>Zwroty</Link>
                            <Link href="/polityka-prywatnosci" style={{ textDecoration: 'underline' }}>Prywatność</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
