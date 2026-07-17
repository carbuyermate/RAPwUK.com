import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/shop/ProductCard';
import Link from 'next/link';
import { ChevronLeft, Music, Ticket, Shirt } from 'lucide-react';
import type { Product } from '@/app/shop/page';
import { ProductSort } from '@/components/shop/ProductSort';
import { Metadata } from 'next';
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

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
    const { category } = await params;
    const meta = CATEGORY_META[category];
    if (!meta) return {};
    
    let title = `${meta.title} | Polski Sklep Muzyczny w UK | RAPwUK`;
    let description = `Kupuj ${meta.title.toLowerCase()} w jedynym polskim sklepie muzycznym w Wielkiej Brytanii. Oferujemy ${meta.desc.toLowerCase()} Szybka wysyłka paczkomatem InPost w UK.`;
    
    if (category === 'muzyka') {
        title = `Polskie Płyty CD i Rap w UK | RAPwUK Shop | Polski Sklep Muzyczny`;
        description = `Polskie płyty rapowe w UK. Największy wybór polskich płyt CD, kaset i albumów hip-hop w Wielkiej Brytanii. Bezpieczna i szybka wysyłka InPost w UK.`;
    } else if (category === 'bilety') {
        title = `Bilety na Koncerty Hip-Hop w UK | Polski Sklep Muzyczny | RAPwUK`;
        description = `Kup bilety na polskie koncerty i imprezy rapowe w Wielkiej Brytanii. Oficjalna dystrybucja biletów, bezpieczne płatności Stripe, natychmiastowa wysyłka.`;
    } else if (category === 'ubrania') {
        title = `Polski Streetwear i Odzież w UK | Polski Sklep Muzyczny | RAPwUK`;
        description = `Oryginalna odzież streetwearowa, koszulki i bluzy hip-hopowe w UK. Kupuj polskie marki odzieżowe z szybką dostawą paczkomatem InPost w UK.`;
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            url: `https://rapwuk.com/shop/${category}`,
        }
    };
}

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ sub?: string; sort?: string }>;
}) {
    const { category } = await params;
    const { sub, sort } = await searchParams;

    if (!VALID_CATEGORIES.includes(category)) return notFound();

    const meta = CATEGORY_META[category];

    let query = supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .gt('stock', 0);

    if (category === 'muzyka' && sub && ['RAP PL', 'RAP UK', 'RAP USA', 'POLSKI RAP W UK', 'ELEKTRONIKA'].includes(sub)) {
        query = query.eq('music_category', sub);
    }

    const { data } = await query.order('created_at', { ascending: false });

    const products = (data || []) as Product[];

    // Sortowanie produktów (domyślnie Artysta: A-Z)
    const activeSort = sort || 'artist_asc';

    if (activeSort === 'artist_asc') {
        products.sort((a, b) => a.title.localeCompare(b.title, 'pl'));
    } else if (activeSort === 'artist_desc') {
        products.sort((a, b) => b.title.localeCompare(a.title, 'pl'));
    } else if (activeSort === 'price_asc') {
        products.sort((a, b) => a.price - b.price);
    } else if (activeSort === 'price_desc') {
        products.sort((a, b) => b.price - a.price);
    } else if (activeSort === 'newest') {
        products.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        });
    }

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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '2.5rem' }}>
                {category === 'muzyka' ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        <Link
                            href={sort ? `/shop/muzyka?sort=${sort}` : '/shop/muzyka'}
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
                        {['RAP PL', 'RAP UK', 'RAP USA', 'POLSKI RAP W UK', 'ELEKTRONIKA'].map((item) => {
                            const isActive = sub === item;
                            return (
                                <Link
                                    key={item}
                                    href={`/shop/muzyka?sub=${encodeURIComponent(item)}${sort ? `&sort=${sort}` : ''}`}
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
                ) : (
                    <div />
                )}
                
                <ProductSort />
            </div>

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
                </div>
            )}
        </div>
    );
}
