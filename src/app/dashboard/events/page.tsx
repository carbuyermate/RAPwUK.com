'use client';

import { supabase } from '@/lib/supabase';
import { Edit2, Trash2, CalendarDays, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { deleteEvent } from '../actions';
import '../dashboard.css';

export default function ManagingEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('events')
                .select('*')
                .eq('promoter_id', user.id)
                .order('event_date', { ascending: false });
            
            if (data) setEvents(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Czy wiesz na pewno, że chcesz usunąć wydarzenie: "${title}"?`)) {
            return;
        }
        try {
            await deleteEvent(id);
            setEvents(events.filter(e => e.id !== id));
        } catch (error: any) {
            alert('Błąd usuwania: ' + error.message);
        }
    };

    return (
        <div className="dashboard-container container animate-fade-in">
            <header className="dashboard-header">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="action-btn">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarDays size={24} /> Zarządzaj Wydarzeniami
                    </h1>
                </div>
                <Link href="/dashboard/add-event" className="btn-primary">
                    + Dodaj Wydarzenie
                </Link>
            </header>

            <div className="events-table-container glass-panel mt-6">
                <table className="events-table">
                    <thead>
                        <tr>
                            <th>Data koncertu</th>
                            <th>Wydarzenie</th>
                            <th>Miejscowość</th>
                            <th>Status (czas)</th>
                            <th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-4">Ładowanie...</td></tr>
                        ) : events.length > 0 ? (
                            events.map((event) => (
                                <tr key={event.id} className="event-row">
                                    <td>{new Date(event.event_date).toLocaleDateString('pl-PL')}</td>
                                    <td className="font-semibold">{event.title}</td>
                                    <td>{event.city}, {event.venue}</td>
                                    <td>
                                        <span className={`status-badge ${new Date(event.event_date) > new Date() ? 'active' : 'draft'}`}>
                                            {new Date(event.event_date) > new Date() ? 'Nadchodzi' : 'Zakończone'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <Link href={`/dashboard/edit-event/${event.id}`} className="action-btn" title="Edytuj">
                                                <Edit2 size={16} />
                                            </Link>
                                            <button onClick={() => handleDelete(event.id, event.title)} className="action-btn delete" title="Usuń">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-secondary">
                                    Brak dodanych wydarzeń.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
