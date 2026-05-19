import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/shop/ProductCard';
import Link from 'next/link';
import { ChevronLeft, Music, Ticket, Shirt } from 'lucide-react';
import type { Product } from '@/app/shop/page';

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

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;

    if (!VALID_CATEGORIES.includes(category)) return notFound();

    const meta = CATEGORY_META[category];

    const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    const products = (data || []) as Product[];

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <Link href="/shop" className="back-btn">
                <ChevronLeft size={18} /> Sklep
            </Link>

            <header className="page-header">
                <h1 className="page-header-title">
                    {meta.icon} {meta.title}
                </h1>
                <p className="page-header-subtitle">{meta.desc}</p>
            </header>

            {products.length > 0 ? (
                <div className="product-grid">
                    {products.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            ) : (
                <div className="shop-empty">
                    <div className="shop-empty-icon">📦</div>
                    <h2 className="shop-empty-title">Już wkrótce!</h2>
                    <p>Produkty w tej kategorii pojawią się niebawem.</p>
                </div>
            )}
        </div>
    );
}
