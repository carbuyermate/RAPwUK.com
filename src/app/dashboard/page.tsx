import { supabase } from '@/lib/supabase';
import { Newspaper, Users, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import './dashboard.css';

export default async function DashboardPage() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const [{ count: newsCount }, { count: eventsCount }, { count: rappersCount }] = await Promise.all([
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('rappers').select('*', { count: 'exact', head: true }),
    ]);

    return (
        <div className="dashboard-container container animate-fade-in">
            <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <div className="user-info">
                    <div className="user-avatar">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">{profile?.full_name || 'Użytkownik'}</h1>
                        <p className="text-secondary text-sm">{profile?.role === 'admin' ? 'Administrator' : 'Promotor'}</p>
                    </div>
                </div>
            </header>

            <h2 className="section-title mb-6">Wybierz moduł do zarządzania</h2>

            <div className="dashboard-modules" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                
                {/* News Module */}
                <Link href="/dashboard/news" className="stat-card glass-panel" style={{ cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <Newspaper size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Newsy</h3>
                            <p className="text-secondary text-sm">Zarządzaj artykułami i wiadomościami</p>
                        </div>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-secondary">Liczba wpisów:</span>
                        <span className="font-bold">{newsCount || 0}</span>
                    </div>
                </Link>

                {/* Events Module */}
                <Link href="/dashboard/events" className="stat-card glass-panel" style={{ cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <CalendarDays size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Wydarzenia</h3>
                            <p className="text-secondary text-sm">Zarządzaj kalendarzem imprez i koncertów</p>
                        </div>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-secondary">Liczba koncertów:</span>
                        <span className="font-bold">{eventsCount || 0}</span>
                    </div>
                </Link>

                {/* Rappers Module */}
                <Link href="/dashboard/rappers" className="stat-card glass-panel" style={{ cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <Users size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Raperzy UK</h3>
                            <p className="text-secondary text-sm">Zarządzaj katalogiem polskich raperów w UK</p>
                        </div>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-secondary">Liczba profili:</span>
                        <span className="font-bold">{rappersCount || 0}</span>
                    </div>
                </Link>

            </div>
        </div>
    );
}
