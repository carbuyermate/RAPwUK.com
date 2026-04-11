'use client';

import { supabase } from '@/lib/supabase';
import { Newspaper, Users, CalendarDays, MonitorPlay } from 'lucide-react';
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
        let isMounted = true;

        const checkAuth = async () => {
            console.log("Checking session...");
            
            // Pobieramy sesję (createBrowserClient użyje ciasteczek)
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
                console.error("Session error:", sessionError);
            }

            if (!session?.user) {
                console.log("No session found, redirecting to login...");
                if (isMounted) router.push('/login');
                return;
            }

            console.log("Session found for user:", session.user.email);
            if (isMounted) setUser(session.user);

            // Pobieramy profil
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            if (profileError) {
                console.warn("Profile fetch error (might not exist yet):", profileError);
            }
            if (isMounted) setProfile(profileData);

            // Pobieramy statystyki
            try {
                const [{ count: newsCount }, { count: eventsCount }, { count: rappersCount }] = await Promise.all([
                    supabase.from('news').select('*', { count: 'exact', head: true }),
                    supabase.from('events').select('*', { count: 'exact', head: true }),
                    supabase.from('rappers').select('*', { count: 'exact', head: true }),
                ]);

                if (isMounted) {
                    setCounts({
                        news: newsCount || 0,
                        events: eventsCount || 0,
                        rappers: rappersCount || 0
                    });
                }
            } catch (err) {
                console.error("Stats fetch error:", err);
            }

            if (isMounted) setLoading(false);
        };

        checkAuth();

        // Subskrypcja na zmiany stanu autoryzacji
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth state change:", event);
            if (event === 'SIGNED_OUT') {
                if (isMounted) {
                    setUser(null);
                    router.push('/login');
                }
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [router]);

    if (loading) {
        return (
            <div className="dashboard-container container">
                <p className="text-secondary" style={{ padding: '4rem', textAlign: 'center' }}>Autoryzacja dostępu...</p>
            </div>
        );
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
                        <h1 className="text-xl font-bold">{profile?.full_name || user.email?.split('@')[0]}</h1>
                        <p className="text-secondary text-sm">
                            {profile?.role === 'admin' ? 'Administrator' : 'Redaktor'} 
                            <span className="ml-2 text-[10px] opacity-40">({user.email})</span>
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => {
                        supabase.auth.signOut();
                        router.push('/login');
                    }}
                    className="btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                    Wyloguj
                </button>
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

                {/* Ads Module */}
                <Link href="/dashboard/ads" className="stat-card glass-panel" style={{ cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem', borderColor: 'rgba(245,158,11,0.15)', background: 'rgba(245,158,11,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '12px', background: 'rgba(245,158,11,0.08)', borderRadius: '12px' }}>
                            <MonitorPlay size={28} style={{ color: '#f59e0b' }} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Reklama</h3>
                            <p className="text-secondary text-sm">Zarządzaj banerami reklamowymi</p>
                        </div>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-secondary">Sprzedaj miejsce reklamowe</span>
                        <span style={{ color: '#f59e0b', fontWeight: 700 }}>→</span>
                    </div>
                </Link>

            </div>
        </div>
    );
}
