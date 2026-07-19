import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'RAPwUK Shop | Polski Sklep Muzyczny w UK',
    description: 'Oficjalny polski sklep muzyczny w Wielkiej Brytanii. Kupuj polskie płyty rapowe, CD, bilety na koncerty i streetwear. Szybka dostawa InPost w UK.',
    robots: { index: true, follow: true },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
