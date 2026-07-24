import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Newsy | Hip-Hop w UK – RAPwUK.com',
    description: 'Aktualności ze sceny hip-hopowej w Wielkiej Brytanii. Premiery, wywiady, relacje z wydarzeń i najnowsze newsy z polskiego i światowego rapu w UK.',
    alternates: {
        canonical: 'https://rapwuk.com/news',
    },
    openGraph: {
        title: 'Newsy | Hip-Hop w UK – RAPwUK.com',
        description: 'Aktualności ze sceny hip-hopowej w Wielkiej Brytanii. Premiery, wywiady, relacje z wydarzeń i najnowsze newsy.',
        url: 'https://rapwuk.com/news',
        siteName: 'RAPwUK.com',
        locale: 'pl_PL',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        site: '@RAPwUK',
        creator: '@RAPwUK',
        title: 'Newsy | Hip-Hop w UK – RAPwUK.com',
        description: 'Aktualności ze sceny hip-hopowej w UK. Premiery, wywiady, relacje i najnowsze newsy.',
    },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
