import { supabase } from '@/lib/supabase';
import EventsList from '@/components/events-list';
import { CalendarDays } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
