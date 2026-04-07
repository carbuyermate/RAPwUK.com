import { NextResponse } from 'next/server';
import { fetchTicketmasterEvents } from '@/lib/ticketmaster';
import { fetchEventbriteEvents } from '@/lib/eventbrite';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const [tmEvents, ebEvents] = await Promise.all([
            fetchTicketmasterEvents(),
            fetchEventbriteEvents()
        ]);

        const results = {
            added: 0,
            skipped: 0,
            errors: 0
        };

        // Standaryzacja i Deduplikacja w locie
        const eventMap = new Map<string, any>();

        tmEvents.forEach(event => {
            // Normalizacja tytułu (wywalamy tagi biletowe i opcje restauracyjne)
            let cleanTitle = event.name
                .replace(/\s*\(.*?\)\s*/g, ' ')
                .replace(/\s*[-:|]\s*(VIP|Package|Aisle Seat|Standard|Official|Restaurant|Hospitality|Coach|Travel|Experience|Meet & Greet|Afterparty|Standing|Seated|Early Entry|Gallery|Lounge|Side Stage|Front Row|Soundcheck|Pre-Show).*$/i, '')
                .replace(/\s+(VIP|Resale|Platinum|Premium|Collector)\s+/i, ' ')
                .trim();

            const date = event.dates.start.dateTime || `${event.dates.start.localDate}T00:00:00Z`;
            const city = event._embedded?.venues?.[0]?.city?.name || 'Unknown';

            // Klucz deduplikacji: Tytuł + Data + Miasto
            const key = `${cleanTitle}-${date.substring(0, 10)}-${city}`.toLowerCase();

            if (!eventMap.has(key)) {
                eventMap.set(key, {
                    external_id: event.id,
                    title: cleanTitle,
                    date,
                    venue: event._embedded?.venues?.[0]?.name || 'Nieznany klub',
                    city: city,
                    ticketUrl: (() => {
                        const raw = event.url;
                        const affId = process.env.TICKETMASTER_AFFILIATE_ID;
                        return affId ? `${raw}${raw.includes('?') ? '&' : '?'}publisherId=${affId}` : raw;
                    })(),
                    imageUrl: event.images?.sort((a, b) => b.width - a.width)[0]?.url || null,
                    source: 'Ticketmaster'
                });
            }
        });

        ebEvents.forEach((event: any) => {
            const cleanTitle = event.name?.text || 'Bez tytułu';
            const date = event.start?.utc;
            const city = event.venue?.address?.city || 'Unknown';
            const key = `${cleanTitle}-${date?.substring(0, 10)}-${city}`.toLowerCase();

            if (!eventMap.has(key)) {
                eventMap.set(key, {
                    external_id: `eb-${event.id}`,
                    title: cleanTitle,
                    date,
                    venue: event.venue?.name || 'Nieznany klub',
                    city: city,
                    ticketUrl: event.url,
                    imageUrl: event.logo?.url || null,
                    source: 'Eventbrite'
                });
            }
        });

        const allEvents = Array.from(eventMap.values());

        for (const event of allEvents) {
            const { external_id, title, date, venue, city, ticketUrl, imageUrl, source } = event;

            // Prosta "lokalizacja" opisu
            const description = `Zapraszamy na koncert: ${title}! Wydarzenie odbędzie się w mieście ${city} (klub: ${venue}). Nie przegap okazji, aby zobaczyć swoje ulubione gwiazdy rapu na żywo w Wielkiej Brytanii. (Źródło: ${source})`;

            // 1. Sprawdzenie czy wydarzenie już istnieje (po external_id)
            const { data: existing } = await supabase
                .from('events')
                .select('id, image_url')
                .eq('external_id', external_id)
                .maybeSingle();

            if (existing) {
                // Aktualizacja jeśli brakuje obrazka
                if (!existing.image_url && imageUrl) {
                    await supabase
                        .from('events')
                        .update({ image_url: imageUrl, description })
                        .eq('id', existing.id);
                    results.added++;
                } else {
                    results.skipped++;
                }
                continue;
            }

            // 2. Dodanie do bazy
            const { error: insertError } = await supabase
                .from('events')
                .insert([{
                    external_id,
                    source,
                    title,
                    description,
                    event_date: date,
                    venue,
                    city,
                    ticket_url: ticketUrl,
                    image_url: imageUrl,
                    is_premium: false
                }]);

            if (insertError) {
                console.error(`Błąd zapisu (${source}):`, insertError);
                results.errors++;
            } else {
                results.added++;
            }
        }

        return NextResponse.json({
            message: 'Synchronizacja zakończona (TM + EB)',
            totalFetched: allEvents.length,
            stats: results
        });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message || 'Wystąpił błąd synchronizacji'
        }, { status: 500 });
    }
}
