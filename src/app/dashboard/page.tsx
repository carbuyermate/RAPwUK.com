import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Newspaper, Users } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import './dashboard.css';

export default async function DashboardPage() {
    // 1. Sprawdzenie sesji (na serwerze)
    // Uwaga: W idealnym świecie używamy createServerComponentClient z @supabase/auth-helpers-nextjs
    // Ale tutaj użyjemy prostego getUser() dla demonstracji, middleware i tak pilnuje trasy.
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // 2. Pobranie profilu, aby sprawdzić rolę i nazwę
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // 3. Pobranie wydarzeń przypisanych do tego promotora
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('promoter_id', user.id)
        .order('event_date', { ascending: false });

    return (
        <div className="dashboard-container container animate-fade-in">
            <header className="dashboard-header">
                <div className="user-info">
                    <div className="user-avatar">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">{profile?.full_name || 'Użytkownik'}</h1>
                        <p className="text-secondary text-sm">{profile?.role === 'admin' ? 'Administrator' : 'Promotor'}</p>
                    </div>
                </div>
                <div className="dashboard-actions">
                    <Link href="/dashboard/add-news" className="btn-primary flex items-center gap-2">
                        <Newspaper size={18} /> Dodaj news
                    </Link>
                    <Link href="/dashboard/add-event" className="btn-secondary flex items-center gap-2">
                        <Plus size={18} /> Wydarzenie
                    </Link>
                    <Link href="/dashboard/add-rapper" className="btn-secondary flex items-center gap-2">
                        <Users size={18} /> Dodaj rapera
                    </Link>
                </div>
            </header>

            <div className="dashboard-stats">
                <div className="stat-card glass-panel">
                    <span className="stat-label">Wszystkie Wydarzenia</span>
                    <span className="stat-value">{events?.length || 0}</span>
                </div>
                <div className="stat-card glass-panel">
                    <span className="stat-label">Nadchodzące</span>
                    <span className="stat-value">
                        {events?.filter(e => new Date(e.event_date) > new Date()).length || 0}
                    </span>
                </div>
                <div className="stat-card glass-panel">
                    <span className="stat-label">Zasięg (est.)</span>
                    <span className="stat-value">--</span>
                </div>
            </div>

            <section className="events-list-section">
                <h2 className="section-title mb-4">Twoje Wydarzenia</h2>

                <div className="events-table-container glass-panel">
                    <table className="events-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Wydarzenie</th>
                                <th>Lokalizacja</th>
                                <th>Status</th>
                                <th>Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events && events.length > 0 ? (
                                events.map((event) => (
                                    <tr key={event.id} className="event-row">
                                        <td>{new Date(event.event_date).toLocaleDateString('pl-PL')}</td>
                                        <td className="font-semibold">{event.title}</td>
                                        <td>{event.city}, {event.venue}</td>
                                        <td>
                                            <span className={`status-badge ${new Date(event.event_date) > new Date() ? 'active' : 'draft'}`}>
                                                {new Date(event.event_date) > new Date() ? 'Aktywne' : 'Zakończone'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="action-btn" title="Edytuj"><Edit2 size={16} /></button>
                                                <button className="action-btn delete" title="Usuń"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-secondary">
                                        Nie dodałeś jeszcze żadnych wydarzeń.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
