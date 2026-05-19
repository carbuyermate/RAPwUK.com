'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useEffect, useState } from 'react';

export function CartIcon() {
    const itemCount = useCartStore((state) => state.getItemCount());
    const [mounted, setMounted] = useState(false);

    // Zapobiega błędom hydratacji (localStorage vs server render)
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <Link href="/shop/cart" className="shop-cart-btn relative">
            <ShoppingCart size={24} />
            {mounted && itemCount > 0 && (
                <span className="cart-badge">
                    {itemCount}
                </span>
            )}
        </Link>
    );
}
