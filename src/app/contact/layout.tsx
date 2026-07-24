import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kontakt | RAPwUK.com',
    description: 'Skontaktuj się z redakcją RAPwUK.com. Współpraca, patronaty, reklama, wywiady i wszelkie zapytania dotyczące polskiej sceny hip-hopowej w Wielkiej Brytanii.',
    alternates: {
        canonical: 'https://rapwuk.com/contact',
    },
    openGraph: {
        title: 'Kontakt | RAPwUK.com',
        description: 'Skontaktuj się z redakcją RAPwUK.com. Współpraca, patronaty, reklama i pytania dotyczące polskiego hip-hopu w UK.',
        url: 'https://rapwuk.com/contact',
        siteName: 'RAPwUK.com',
        locale: 'pl_PL',
        type: 'website',
    },
    twitter: {
        card: 'summary',
        site: '@RAPwUK',
        creator: '@RAPwUK',
        title: 'Kontakt | RAPwUK.com',
        description: 'Skontaktuj się z redakcją RAPwUK.com. Współpraca, patronaty i reklama.',
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
