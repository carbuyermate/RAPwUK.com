import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Music, Ticket, Shirt, ShoppingBag, Tag } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { ShippingInfoButton } from '@/components/shop/ShippingInfoButton';
import './shop.css';

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
    media_type?: 'CD' | 'DVD' | 'Kaseta' | null;
    condition_media?: string | null;
    condition_cover?: string | null;
    condition_notes?: string | null;
    music_category?: 'PL' | 'UK' | 'USA' | 'RAP W UK' | null;
    item_condition?: 'Nowa w folii' | 'Nowa' | 'Używana' | null;
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

    return (
        <div className="container shop-page animate-fade-in">

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
        </div>
    );
}
