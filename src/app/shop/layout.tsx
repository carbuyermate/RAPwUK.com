import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sklep RAPwUK.com Shop - jedyny polski sklep hip-hopowy w UK',
    description: 'Jedyny polski sklep hip-hopowy w Wielkiej Brytanii. Polskie płyty rapowe, CD, merch, streetwear i bilety na koncerty. Szybka dostawa InPost w UK.',
    robots: { index: true, follow: true },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
