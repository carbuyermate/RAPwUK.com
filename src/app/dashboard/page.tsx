'use client';

import { supabase } from '@/lib/supabase';
import { Newspaper, Users, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './dashboard.css';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [counts, setCounts] = useState({ news: 0, events: 0, rappers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session?.user) {
                    router.push('/login');
                    return;
                }

                setUser(session.user);

                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                
                setProfile(profileData);

                const [{ count: newsCount }, { count: eventsCount }, { count: rappersCount }] = await Promise.all([
                    supabase.from('news').select('*', { count: 'exact', head: true }),
                    supabase.from('events').select('*', { count: 'exact', head: true }),
                    supabase.from('rappers').select('*', { count: 'exact', head: true }),
                ]);

                setCounts({
                    news: newsCount || 0,
                    events: eventsCount || 0,
                    rappers: rappersCount || 0
                });
            } catch (error) {
                console.error("Dashboard error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [router]);

    if (loading) {
        return <div className="container mt-12 text-center text-white">Ładowanie panelu...</div>;
    }

    if (!user) return null;

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
                        <span className="font-bold">{counts.news}</span>
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
                            <p className="text-secondary text-sm">Zarządzaj kalendarzem imprez</p>
                        </div>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-secondary">Liczba imprez:</span>
                        <span className="font-bold">{counts.events}</span>
                    </div>
                </Link>

                {/* Rappers Module */}
                <Link href="/dashboard/rappers" className="stat-card glass-panel" style={{ cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <Users size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Raperzy</h3>
                            <p className="text-secondary text-sm">Zarządzaj katalogiem polskich raperów w UK</p>
                        </div>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-secondary">Liczba profili:</span>
                        <span className="font-bold">{counts.rappers}</span>
                    </div>
                </Link>

            </div>
        </div>
    );
}
