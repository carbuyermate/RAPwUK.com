'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminDeleteListing } from '@/app/shop/gielda/actions';
import { ChevronLeft, Trash2, Calendar, Tag, AlertCircle, RefreshCw } from 'lucide-react';
import '../dashboard.css';

interface Listing {
    id: string;
    title: string;
    description: string | null;
    price: number;
    item_condition: string;
    category: string;
    image_url: string | null;
    contact_info: string;
    created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
    muzyka: '🎵 Muzyka',
    ubrania: '👕 Ubrania',
    bilety: '🎟️ Bilety',
    inne: '📦 Inne'
};

export default function AdminGieldaPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const checkAuthAndFetch = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Sprawdź sesję
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                router.push('/login');
                return;
            }

            // 2. Sprawdź rolę
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (profile?.role !== 'admin') {
                router.push('/unauthorized');
                return;
            }

            setUser(session.user);

            // 3. Pobierz ogłoszenia
            const { data: listingsData, error: fetchError } = await supabase
                .from('listings')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setListings((listingsData || []) as Listing[]);
        } catch (err: any) {
            console.error('Moderation page load error:', err);
            setError(err.message || 'Wystąpił błąd podczas ładowania danych.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuthAndFetch();
    }, [router]);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Czy na pewno chcesz MODEROWAĆ i USUNĄĆ ogłoszenie "${title}"? Zdjęcie i wpis zostaną bezpowrotnie skasowane.`)) {
            return;
        }

        setDeletingId(id);
        setError(null);

        try {
            const result = await adminDeleteListing(id);
            if (!result.success) {
                throw new Error(result.error || 'Nie udało się usunąć ogłoszenia.');
            }
            setListings(prev => prev.filter(item => item.id !== id));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
                <RefreshCw className="animate-spin" size={32} style={{ color: '#f59e0b', margin: '0 auto 1rem' }} />
                <p className="text-secondary">Autoryzacja i wczytywanie ofert...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="dashboard-container container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            
            {/* Header */}
            <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/dashboard" className="action-btn"><ChevronLeft size={24} /></Link>
                    <div>
                        <h1 className="text-2xl font-bold">Moderacja Giełdy</h1>
                        <p className="text-secondary text-sm">Zarządzanie publicznymi ogłoszeniami darmowymi</p>
                    </div>
                </div>
            </header>

            {error && (
                <div className="error-message mb-6" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {listings.length === 0 ? (
                <div className="glass-panel p-12 text-center mt-4">
                    <Tag size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                    <p className="text-secondary">Brak aktywnych ogłoszeń na Giełdzie.</p>
                </div>
            ) : (
                <div className="glass-panel mt-2" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Przedmiot</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Kategoria</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Stan</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Cena</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Kontakt</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Data dodania</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listings.map((item, i) => (
                                <tr key={item.id} style={{ borderBottom: i < listings.length - 1 ? '1px solid var(--border-color)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                    
                                    {/* Item Title & Image */}
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '6px',
                                                background: 'var(--bg-secondary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                                fontSize: '1rem',
                                                border: '1px solid var(--border-color)',
                                                flexShrink: 0
                                            }}>
                                                {item.image_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    '📦'
                                                )}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.88rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                                                    {item.title}
                                                </div>
                                                {item.description && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '280px', marginTop: '2px' }}>
                                                        {item.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Category */}
                                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                        {CATEGORY_LABELS[item.category] || item.category}
                                    </td>

                                    {/* Condition */}
                                    <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                                        {item.item_condition}
                                    </td>

                                    {/* Price */}
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 800 }}>
                                        £{Number(item.price).toFixed(2)}
                                    </td>

                                    {/* Contact info */}
                                    <td style={{ padding: '1rem', fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                                        {item.contact_info}
                                    </td>

                                    {/* Date */}
                                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} />
                                            {new Date(item.created_at).toLocaleDateString('pl-PL')}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => handleDelete(item.id, item.title)}
                                            disabled={deletingId === item.id}
                                            className="action-btn danger-btn"
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                background: 'rgba(239, 68, 68, 0.05)',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <Trash2 size={13} /> {deletingId === item.id ? 'Usuwanie...' : 'Usuń'}
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}
