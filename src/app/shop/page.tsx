import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Music, Ticket, Shirt, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';

export const dynamic = 'force-dynamic';

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
}

const CATEGORIES = [
    {
        id: 'muzyka',
        title: 'Muzyka',
        desc: 'Płyty, merch artystów, wydawnictwa',
        icon: '🎵',
        href: '/shop/muzyka',
        className: 'category-card--muzyka',
    },
    {
        id: 'bilety',
        title: 'Bilety',
        desc: 'Wejściówki na imprezy i koncerty',
        icon: '🎟️',
        href: '/shop/bilety',
        className: 'category-card--bilety',
    },
    {
        id: 'ubrania',
        title: 'Ubrania',
        desc: 'Streetwear, kolekcje limitowane',
        icon: '👕',
        href: '/shop/ubrania',
        className: 'category-card--ubrania',
    },
];

export default async function ShopPage() {
    const { data: newProducts } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);

    const products = (newProducts || []) as Product[];

    return (
        <div className="container animate-fade-in">
            {/* Hero */}
            <section className="shop-hero">
                <h1 className="shop-hero-title">
                    RAPwUK <span>Shop</span>
                </h1>
                <p className="shop-hero-subtitle">
                    Muzyka, bilety i ubrania z polskiej sceny hip-hop w UK
                </p>
            </section>

            {/* Category Cards */}
            <div className="shop-categories">
                {CATEGORIES.map((cat) => (
                    <Link key={cat.id} href={cat.href} className={`category-card ${cat.className}`}>
                        <div className="category-card-icon">{cat.icon}</div>
                        <div className="category-card-body">
                            <h2 className="category-card-title">{cat.title}</h2>
                            <p className="category-card-desc">{cat.desc}</p>
                            <span className="category-card-arrow">
                                Przeglądaj <ArrowRight size={14} />
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Newest Products */}
            {products.length > 0 && (
                <section style={{ padding: '3rem 0' }}>
                    <h2 className="shop-section-title">Nowości</h2>
                    <div className="product-grid">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {products.length === 0 && (
                <div className="shop-empty" style={{ padding: '4rem 0 6rem' }}>
                    <div className="shop-empty-icon">🛒</div>
                    <h2 className="shop-empty-title">Sklep wkrótce!</h2>
                    <p>Pracujemy nad asortymentem. Wróć niebawem.</p>
                </div>
            )}
        </div>
    );
}
