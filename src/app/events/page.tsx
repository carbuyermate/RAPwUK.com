import { supabase } from '@/lib/supabase';
import EventsList from '@/components/events-list';

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
    // Pobieranie danych z bazy Supabase w czasie rzeczywistym
    const { data: events, error } = await supabase
        .from('events')
        .select('*')
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
            <header className="events-header animate-fade-in">
                <h1 className="page-title">Kalendarz Koncertowy</h1>
                <p className="page-subtitle">Rap bez granic na Wyspach – od polskiego podziemia po światowe gwiazdy w jednym miejscu.</p>
            </header>

            <EventsList initialEvents={displayEvents} />
        </div>
    );
}
