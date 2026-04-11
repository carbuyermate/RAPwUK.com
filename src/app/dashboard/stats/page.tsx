'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, BarChart2, Newspaper, CalendarDays, Users, MonitorPlay, ArrowUpDown, Eye, MousePointer } from 'lucide-react';
import '../dashboard.css';

type SortDir = 'desc' | 'asc';
type Tab = 'news' | 'events' | 'rappers' | 'ads';

interface Row {
    id: string;
    title?: string;
    name?: string;
    views?: number;
    clicks?: number;
    created_at?: string;
    event_date?: string;
    position?: string;
}

const TAB_CONFIG: { id: Tab; label: string; icon: React.ReactNode; viewCol: string; nameCol: string; dateCol: string }[] = [
    { id: 'news', label: 'Newsy', icon: <Newspaper size={16} />, viewCol: 'views', nameCol: 'title', dateCol: 'created_at' },
    { id: 'events', label: 'Eventy', icon: <CalendarDays size={16} />, viewCol: 'views', nameCol: 'title', dateCol: 'event_date' },
    { id: 'rappers', label: 'Raperzy', icon: <Users size={16} />, viewCol: 'views', nameCol: 'name', dateCol: 'created_at' },
    { id: 'ads', label: 'Reklamy', icon: <MonitorPlay size={16} />, viewCol: 'clicks', nameCol: 'name', dateCol: 'created_at' },
];

export default function StatsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('news');
    const [data, setData] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) router.push('/login');
        });
    }, [router]);

    useEffect(() => {
        const tab = TAB_CONFIG.find(t => t.id === activeTab)!;
        setLoading(true);
        supabase
            .from(activeTab)
            .select('*')
            .order(tab.viewCol, { ascending: sortDir === 'asc' })
            .then(({ data: rows }) => {
                setData(rows || []);
                setLoading(false);
            });
    }, [activeTab, sortDir]);

    const tab = TAB_CONFIG.find(t => t.id === activeTab)!;
    const totalViews = data.reduce((sum, r) => sum + ((r.views || r.clicks || 0)), 0);

    const formatDate = (str?: string) => {
        if (!str) return '—';
        return new Date(str).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="dashboard-container container animate-fade-in">
            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/dashboard" className="action-btn">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <BarChart2 size={24} /> Statystyki
                        </h1>
                        <p className="text-secondary text-sm">Wyświetlenia i kliknięcia dla wszystkich treści</p>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {TAB_CONFIG.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: activeTab === t.id ? '1px solid var(--text-primary)' : '1px solid var(--border-color)',
                            background: activeTab === t.id ? 'var(--text-primary)' : 'transparent',
                            color: activeTab === t.id ? 'var(--bg-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Summary card */}
            <div className="glass-panel" style={{ padding: '1.25rem 2rem', marginBottom: '1.5rem', display: 'flex', gap: '3rem', alignItems: 'center' }}>
                <div>
                    <p className="text-secondary text-sm">Łącznie {tab.viewCol === 'clicks' ? 'kliknięć' : 'wyświetleń'}</p>
                    <p style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2 }}>{totalViews.toLocaleString('pl-PL')}</p>
                </div>
                <div>
                    <p className="text-secondary text-sm">Liczba wpisów</p>
                    <p style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2 }}>{data.length}</p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <button
                        onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 16px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                        }}
                    >
                        <ArrowUpDown size={16} />
                        {sortDir === 'desc' ? 'Najwięcej → Najmniej' : 'Najmniej → Najwięcej'}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Ładowanie...</div>
                ) : data.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Brak danych. Kolumna &quot;views&quot; może wymagać dodania do bazy – sprawdź instrukcje poniżej.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 700 }}>#</th>
                                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 700 }}>Tytuł / Nazwa</th>
                                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 700 }}>Data</th>
                                {activeTab === 'ads' && <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 700 }}>Pozycja</th>}
                                <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 700 }}>
                                    {tab.viewCol === 'clicks' ? <><MousePointer size={12} style={{ display: 'inline', marginRight: '4px' }} />Kliknięcia</> : <><Eye size={12} style={{ display: 'inline', marginRight: '4px' }} />Wyświetlenia</>}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, i) => {
                                const count = row.views ?? row.clicks ?? 0;
                                const maxCount = Math.max(...data.map(r => r.views ?? r.clicks ?? 0), 1);
                                const pct = Math.round((count / maxCount) * 100);
                                return (
                                    <tr key={row.id} style={{ borderBottom: i < data.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                        <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: '0.85rem', width: '40px' }}>{i + 1}</td>
                                        <td style={{ padding: '14px 20px', fontWeight: 600, maxWidth: '400px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {(row[tab.nameCol as keyof Row] as string) || '—'}
                                                </span>
                                                {/* Bar chart */}
                                                <div style={{ height: '3px', background: 'var(--border-color)', borderRadius: '2px', maxWidth: '200px' }}>
                                                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--text-primary)', borderRadius: '2px', transition: 'width 0.3s' }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            {formatDate((row[tab.dateCol as keyof Row] as string) || undefined)}
                                        </td>
                                        {activeTab === 'ads' && (
                                            <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                                {row.position === 'homepage_bottom' ? 'Dół strony' : row.position === 'homepage_sidebar' ? 'Prawa strona' : row.position}
                                            </td>
                                        )}
                                        <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 800, fontSize: '1.1rem' }}>
                                            {count.toLocaleString('pl-PL')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* SQL instructions */}
            <div className="glass-panel" style={{ padding: '1.5rem 2rem', marginTop: '1.5rem', borderColor: 'rgba(245,158,11,0.15)', background: 'rgba(245,158,11,0.02)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ⚠️ Jeśli statystyki nie działają – uruchom w Supabase SQL Editor:
                </h3>
                <pre style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', overflowX: 'auto', lineHeight: 1.7 }}>
{`ALTER TABLE public.news    ADD COLUMN IF NOT EXISTS views INT DEFAULT 0;
ALTER TABLE public.events  ADD COLUMN IF NOT EXISTS views INT DEFAULT 0;
ALTER TABLE public.rappers ADD COLUMN IF NOT EXISTS views INT DEFAULT 0;
NOTIFY pgrst, 'reload schema';`}
                </pre>
            </div>
        </div>
    );
}
