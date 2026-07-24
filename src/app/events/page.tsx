import { supabase } from '@/lib/supabase';
import EventsList from '@/components/events-list';
import { CalendarDays } from 'lucide-react';
import { ViewTracker } from "@/components/ViewTracker";

import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
    title: 'Lista imprez w UK | Hip-hopowe koncerty i eventy',
    description: 'Kalendarz hip-hopowych imprez w Wielkiej Brytanii. Koncerty, eventy i festiwale – polski rap w UK i światowe gwiazdy hip-hopu na jednej liście.',
    alternates: {
        canonical: 'https://rapwuk.com/events',
    },
    openGraph: {
        title: 'Lista imprez w UK | Hip-hopowe koncerty i eventy',
        description: 'Kalendarz hip-hopowych imprez w Wielkiej Brytanii. Koncerty, eventy i festiwale – polski rap w UK i światowe gwiazdy hip-hopu na jednej liście.',
        url: 'https://rapwuk.com/events',
        siteName: 'RAPwUK.com',
        locale: 'pl_PL',
        type: 'website',
        images: [
            {
                url: 'https://rapwuk.com/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Lista imprez hip-hopowych w UK – RAPwUK.com',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@RAPwUK',
        creator: '@RAPwUK',
        title: 'Lista imprez w UK | Hip-hopowe koncerty i eventy',
        description: 'Kalendarz hip-hopowych imprez w Wielkiej Brytanii. Koncerty, eventy i festiwale – polski rap w UK.',
    },
};



// Interfejs dla wydarzenia (zgodny z schema.sql)
interface Event {
    id: string;
    title: string;
    description: string;
    event_date: string;
    venue: string;
    city: string;
    ticket_url: string;
    image_url?: string;
    is_premium: boolean;
}

export default async function EventsPage() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Pobieranie danych z bazy Supabase w czasie rzeczywistym
    const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', todayStart.toISOString())
        .order('event_date', { ascending: true });

    console.log(`[EventsPage] Pobrano ${events?.length || 0} wydarzeń z Supabase.`);

    if (error) {
        console.error('[EventsPage] Błąd Supabase:', error);
    }

    // Jeśli baza jest kompletnie pusta i nie ma błędu, możemy pokazać pustą listę lub fallback
    // Ale przy 400 rekordach w bazie, events nie powinno być puste.
    const displayEvents = (events || []) as Event[];

    return (
        <div className="events-container container">
            <ViewTracker type="page" id="events" />
            <header className="page-header animate-fade-in">
                <h1 className="page-header-title">
                    <CalendarDays size={32} /> LISTA IMPREZ
                </h1>
                <p className="page-header-subtitle">Hip-Hop w UK - od polskiego podziemia po światowe gwiazdy w jednym miejscu.</p>
            </header>

            <EventsList initialEvents={displayEvents} />
        </div>
    );
}
