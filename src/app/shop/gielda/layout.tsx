import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Giełda Płytowa i Rap w UK | Ogłoszenia Darmowe | RAPwUK',
    description: 'Darmowa giełda płytowa w Wielkiej Brytanii. Kupuj, sprzedawaj i wymieniaj polskie płyty rapowe, hip-hopowe, CD, winyle i ubrania streetwear w UK bez prowizji.',
    keywords: [
        'gielda plytowa uk',
        'polski rap w uk gielda',
        'ogloszenia darmowe uk',
        'plyty cd rap uk',
        'sprzedam plyty rap uk',
        'polskie ogloszenia wielka brytania',
        'rap w uk'
    ],
    openGraph: {
        title: 'Giełda Płytowa i Rap w UK | Ogłoszenia Darmowe | RAPwUK',
        description: 'Darmowa giełda płytowa w Wielkiej Brytanii. Kupuj, sprzedawaj i wymieniaj polskie płyty rapowe, hip-hopowe, CD, winyle i ubrania streetwear w UK bez prowizji.',
        type: 'website',
        url: 'https://rapwuk.com/shop/gielda',
    }
};

export default function GieldaLayout({ children }: { children: React.ReactNode }) {
    return children;
}
