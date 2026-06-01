'use client';

import { ShoppingCart, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import type { Product } from '@/app/shop/page';

export function ProductCard({ product }: { product: Product }) {
    const addItem = useCartStore((s) => s.addItem);
    const [added, setAdded] = useState(false);

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem({
            id: product.id,
            title: product.title,
            price: product.price,
            image_url: product.image_url,
            category: product.category,
            slug: product.slug,
            stock: product.stock,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
    };

    const categoryLabel: Record<string, string> = {
        muzyka: 'Muzyka',
        bilety: 'Bilety',
        ubrania: 'Ubrania',
    };

    return (
        <div className="product-card">
            <Link href={`/shop/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="product-card-image">
                    {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image_url} alt={product.title} />
                    ) : (
                        <span>{product.category === 'muzyka' ? '🎵' : product.category === 'bilety' ? '🎟️' : '👕'}</span>
                    )}
                </div>
                <div className="product-card-body">
                    <span className="product-card-category">{categoryLabel[product.category]}</span>
                    <h3 className="product-card-title">{product.title}</h3>
                    <div className="product-card-price">£{product.price.toFixed(2)}</div>
                </div>
            </Link>
            <div className="product-card-footer">
                <button
                    onClick={handleAdd}
                    className={`btn-add-to-cart ${added ? 'added' : ''}`}
                    disabled={product.stock === 0}
                >
                    {product.stock === 0 ? (
                        'Brak w magazynie'
                    ) : added ? (
                        <><Check size={16} /> Dodano!</>
                    ) : (
                        <><ShoppingCart size={16} /> Dodaj do koszyka</>
                    )}
                </button>
            </div>
        </div>
    );
}
