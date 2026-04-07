const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

export interface TicketmasterEvent {
    id: string;
    name: string;
    description?: string;
    dates: {
        start: {
            dateTime: string;
            localDate: string;
            localTime: string;
        }
    };
    _embedded?: {
        venues: Array<{
            name: string;
            city: {
                name: string;
            }
        }>
    };
    url: string;
    images: Array<{
        url: string;
        width: number;
        height: number;
    }>;
    classifications?: Array<{
        genre?: { name: string };
        subGenre?: { name: string };
    }>;
}

export async function fetchTicketmasterEvents() {
    if (!TICKETMASTER_API_KEY) {
        throw new Error('Brak TICKETMASTER_API_KEY w zmiennych środowiskowych.');
    }

    const allEvents: TicketmasterEvent[] = [];
    const now = new Date();

    for (let i = 0; i < 6; i++) {
        const start = new Date(now);
        start.setMonth(now.getMonth() + i);
        if (i > 0) start.setDate(1);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setMonth(start.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);

        const startStr = start.toISOString().split('.')[0] + 'Z';
        const endStr = end.toISOString().split('.')[0] + 'Z';

        console.log(`Pobieranie Ticketmaster: ${startStr} do ${endStr}...`);

        const params = new URLSearchParams({
            apikey: TICKETMASTER_API_KEY,
            classificationName: 'Hip-Hop/Rap',
            countryCode: 'GB',
            size: '200',
            sort: 'date,asc',
            startDateTime: startStr,
            endDateTime: endStr
        });

        const response = await fetch(`${BASE_URL}/events.json?${params.toString()}`);

        if (response.ok) {
            const data = await response.json();
            const events = (data._embedded?.events || []) as TicketmasterEvent[];

            // Ścisłe filtrowanie gatunków:
            const filtered = events.filter(e => {
                const genre = e.classifications?.[0]?.genre?.name?.toLowerCase() || '';
                const subGenre = e.classifications?.[0]?.subGenre?.name?.toLowerCase() || '';
                const name = e.name.toLowerCase();

                // Blacklist dla bezpieczeństwa
                const blocklist = ['tribute', 'metal', 'rock', 'country', 'jazz', 'classical'];
                if (blocklist.some(word => name.includes(word) || genre.includes(word))) return false;

                return genre.includes('rap') ||
                    genre.includes('hip-hop') ||
                    subGenre.includes('rap') ||
                    subGenre.includes('hip-hop') ||
                    name.includes('rap') ||
                    name.includes('hip-hop');
            });

            allEvents.push(...filtered);
            console.log(`Miesiąc ${i + 1} (${startStr.substring(0, 7)}): pobrano ${events.length}, po filtracji ${filtered.length}.`);
        } else {
            console.error(`Błąd Ticketmaster (Miesiąc ${i + 1}): ${response.statusText}`);
        }

        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`Łącznie pobrano ${allEvents.length} wydarzeń z Ticketmaster.`);
    return allEvents;
}
