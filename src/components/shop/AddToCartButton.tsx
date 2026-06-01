'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import type { Product } from '@/app/shop/page';

export function AddToCartButton({ product }: { product: Product }) {
    const addItem = useCartStore((s) => s.addItem);
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
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
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <button onClick={handleAdd} className={`btn-add-to-cart ${added ? 'added' : ''}`} style={{ fontSize: '1rem', padding: '14px 24px' }}>
            {added ? <><Check size={20} /> Dodano do koszyka!</> : <><ShoppingCart size={20} /> Dodaj do koszyka</>}
        </button>
    );
}
