import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Product } from '@/app/shop/page';
import { Metadata } from 'next';
import { Music, Ticket, Shirt } from 'lucide-react';
import { CategoryPageClient } from '@/components/shop/CategoryPageClient';
import '../shop.css';

export const dynamic = 'force-dynamic';

const CATEGORY_META: Record<string, { title: string; desc: string; icon: React.ReactNode }> = {
    muzyka: {
        title: 'Muzyka',
        desc: 'Płyty, merch artystów, wydawnictwa limitowane.',
        icon: <Music size={28} />,
    },
    bilety: {
        title: 'Bilety',
        desc: 'Wejściówki na imprezy i koncerty hip-hop w UK.',
        icon: <Ticket size={28} />,
    },
    ubrania: {
        title: 'Ubrania',
        desc: 'Streetwear, kolekcje limitowane, hoodki i tshirty.',
        icon: <Shirt size={28} />,
    },
};

const VALID_CATEGORIES = Object.keys(CATEGORY_META);

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
    const { category } = await params;
    const meta = CATEGORY_META[category];
    if (!meta) return {};
    
    let title = `${meta.title} | Polski Sklep Muzyczny w UK | RAPwUK`;
    let description = `Kupuj ${meta.title.toLowerCase()} w jedynym polskim sklepie muzycznym w Wielkiej Brytanii. Oferujemy ${meta.desc.toLowerCase()} Szybka wysyłka paczkomatem InPost w UK.`;
    
    if (category === 'muzyka') {
        title = `Polskie Płyty CD i Rap w UK | RAPwUK Shop | Polski Sklep Muzyczny`;
        description = `Polskie płyty rapowe w UK. Największy wybór polskich płyt CD, kaset i albumów hip-hop w Wielkiej Brytanii. Bezpieczna i szybka wysyłka InPost w UK.`;
    } else if (category === 'bilety') {
        title = `Bilety na Koncerty Hip-Hop w UK | Polski Sklep Muzyczny | RAPwUK`;
        description = `Kup bilety na polskie koncerty i imprezy rapowe w Wielkiej Brytanii. Oficjalna dystrybucja biletów, bezpieczne płatności Stripe, natychmiastowa wysyłka.`;
    } else if (category === 'ubrania') {
        title = `Polski Streetwear i Odzież w UK | Polski Sklep Muzyczny | RAPwUK`;
        description = `Oryginalna odzież streetwearowa, koszulki i bluzy hip-hopowe w UK. Kupuj polskie marki odzieżowe z szybką dostawą paczkomatem InPost w UK.`;
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            url: `https://rapwuk.com/shop/${category}`,
        }
    };
}

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ sort?: string }>;
}) {
    const { category } = await params;
    const { sort } = await searchParams;

    if (!VALID_CATEGORIES.includes(category)) return notFound();

    const meta = CATEGORY_META[category];

    // Fetch all active products in stock for the category
    const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .gt('stock', 0);

    const products = (data || []) as Product[];

    return (
        <CategoryPageClient 
            products={products} 
            category={category} 
            categoryTitle={meta.title} 
            categoryIcon={meta.icon}
            initialSort={sort || 'artist_asc'}
        />
    );
}
