import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/shop/ProductCard';
import Link from 'next/link';
import { ChevronLeft, Music, Ticket, Shirt } from 'lucide-react';
import type { Product } from '@/app/shop/page';
import '../shop.css';

export const dynamic = 'force-dynamic';

const CATEGORY_META: Record<string, { title: string; desc: string; icon: React.ReactNode }> = {
    muzyka: {
        title: 'Muzyka',
        desc: 'Płyty, merch artystów, wydawnictwa limitowane.',
        icon: <Music size={28} />,
    },
    bilety: {
        title: 'Bilety',
        desc: 'Wejściówki na imprezy i koncerty hip-hop w UK.',
        icon: <Ticket size={28} />,
    },
    ubrania: {
        title: 'Ubrania',
        desc: 'Streetwear, kolekcje limitowane, hoodki i tshirty.',
        icon: <Shirt size={28} />,
    },
};

const VALID_CATEGORIES = Object.keys(CATEGORY_META);

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ sub?: string }>;
}) {
    const { category } = await params;
    const { sub } = await searchParams;

    if (!VALID_CATEGORIES.includes(category)) return notFound();

    const meta = CATEGORY_META[category];

    let query = supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .gt('stock', 0);

    if (category === 'muzyka' && sub && ['PL', 'UK', 'USA', 'RAP W UK'].includes(sub)) {
        query = query.eq('music_category', sub);
    }

    const { data } = await query.order('created_at', { ascending: false });

    const products = (data || []) as Product[];

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <Link href="/shop" className="back-btn">
                <ChevronLeft size={18} /> Sklep
            </Link>

            <header className="page-header" style={{ marginBottom: '1.5rem' }}>
                <h1 className="page-header-title">
                    {meta.icon} {meta.title}
                </h1>
            </header>

            {category === 'muzyka' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '2.5rem' }}>
                    <Link
                        href="/shop/muzyka"
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            background: !sub ? 'var(--text-primary)' : 'var(--bg-secondary)',
                            color: !sub ? 'var(--bg-primary)' : 'var(--text-secondary)',
                            border: '1px solid var(--border-color)',
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Wszystko
                    </Link>
                    {['PL', 'UK', 'USA', 'RAP W UK'].map((item) => {
                        const isActive = sub === item;
                        return (
                            <Link
                                key={item}
                                href={`/shop/muzyka?sub=${encodeURIComponent(item)}`}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    background: isActive ? 'var(--text-primary)' : 'var(--bg-secondary)',
                                    color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)',
                                    border: '1px solid var(--border-color)',
                                    textDecoration: 'none',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {item}
                            </Link>
                        );
                    })}
                </div>
            )}

            {products.length > 0 ? (
                <div className="product-grid">
                    {products.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            ) : (
                <div className="shop-empty">
                    <div className="shop-empty-icon">📦</div>
                    <h2 className="shop-empty-title">Brak produktów</h2>
                    <p>Brak dostępnych produktów w wybranej kategorii.</p>
                </div>
            )}
        </div>
    );
}
