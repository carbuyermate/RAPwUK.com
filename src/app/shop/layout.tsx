import { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import './shop.css';
import { CartIcon } from '@/components/shop/CartIcon';

export const metadata: Metadata = {
    title: 'RAPwUK Shop',
    description: 'Oficjalny sklep RAPwUK.com - Muzyka, Bilety, Ubrania',
    robots: {
        index: false,
        follow: false,
    }
};

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="shop-layout">
            <header className="shop-header">
                <div className="container flex items-center justify-between py-4">
                    <Link href="/shop" className="text-2xl font-bold tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-1px', fontWeight: 900 }}>
                        RAPwUK <span className="text-accent">SHOP</span>
                    </Link>
                    
                    <nav className="shop-nav hidden md:flex items-center gap-6">
                        <Link href="/shop/muzyka" className="shop-nav-link">Muzyka</Link>
                        <Link href="/shop/bilety" className="shop-nav-link">Bilety</Link>
                        <Link href="/shop/ubrania" className="shop-nav-link">Ubrania</Link>
                    </nav>

                    <div className="shop-actions">
                        <CartIcon />
                    </div>
                </div>
            </header>
            <main className="shop-main">
                {children}
            </main>
        </div>
    );
}
