import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'RAPwUK Shop',
    description: 'Oficjalny sklep RAPwUK.com - Muzyka, Bilety, Ubrania, Elektronika',
    robots: { index: false, follow: false },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
