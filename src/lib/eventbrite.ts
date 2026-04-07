import { supabase } from './supabase';

const EVENTBRITE_API_TOKEN = process.env.EVENTBRITE_API_TOKEN;
const BASE_URL = 'https://www.eventbriteapi.com/v3';

export interface EventbriteEvent {
    id: string;
    name: { text: string };
    description: { text: string };
    start: { utc: string };
    url: string;
    logo?: {
        url: string;
    };
    venue?: {
        name: string;
        address: {
            city: string;
        }
    };
}

export async function fetchEventbriteEvents(): Promise<EventbriteEvent[]> {
    if (!EVENTBRITE_API_TOKEN) {
        console.error('Brak EVENTBRITE_API_TOKEN');
        return [];
    }

    try {
        console.log('Sprawdzanie połączenia z Eventbrite...');

        const meResponse = await fetch(`${BASE_URL}/users/me/`, {
            headers: { 'Authorization': `Bearer ${EVENTBRITE_API_TOKEN}` }
        });

        if (!meResponse.ok) {
            console.error('Eventbrite API Error:', await meResponse.text());
            return [];
        }

        const meData = await meResponse.json();
        console.log('Eventbrite zalogowany jako:', meData.name);

        // Opcja na przyszłość: Pobieranie wydarzeń z konkretnych organizacji 
        // lub ręczne parowanie linków Eventbrite.

        return [];
    } catch (error) {
        console.error('Wyjątek Eventbrite:', error);
        return [];
    }
}
