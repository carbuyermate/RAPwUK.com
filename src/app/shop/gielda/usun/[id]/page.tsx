'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { deleteListingWithToken } from '../../actions';
import { ChevronLeft, Trash2, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import '../../../shop.css';

interface Listing {
    id: string;
    title: string;
    price: number;
    image_url: string | null;
    delete_token: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ token?: string }>;
}

export default function DeleteListingPage({ params, searchParams }: PageProps) {
    const router = useRouter();
    
    // Await params using React.use()
    const { id } = use(params);
    const { token } = use(searchParams);

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!token) {
                    throw new Error('Brak tokenu usuwania w linku.');
                }

                const { data, error: fetchErr } = await supabase
                    .from('listings')
                    .select('id, title, price, image_url, delete_token')
                    .eq('id', id)
                    .maybeSingle();

                if (fetchErr) throw fetchErr;
                if (!data) {
                    throw new Error('Ogłoszenie nie istnieje lub zostało już usunięte.');
                }

                if (data.delete_token !== token) {
                    throw new Error('Nieprawidłowy token usuwania. Upewnij się, że link jest poprawny.');
                }

                setListing(data as Listing);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [id, token]);

    const handleDelete = async () => {
        if (!listing || !token) return;
        setDeleting(true);
        setError(null);

        try {
            const result = await deleteListingWithToken(listing.id, token);
            if (!result.success) {
                throw new Error(result.error || 'Nie udało się usunąć ogłoszenia.');
            }
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
                <RefreshCw className="animate-spin" size={32} style={{ color: '#f59e0b', margin: '0 auto 1rem' }} />
                <p className="text-secondary">Weryfikacja danych...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="container animate-fade-in" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
                <div className="glass-panel p-8 max-w-md mx-auto text-center" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
                    <CheckCircle size={56} style={{ color: '#10b981', margin: '0 auto 1.5rem' }} />
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.6rem', margin: '0 0 10px', color: 'var(--text-primary)' }}>
                        Ogłoszenie Usunięte!
                    </h1>
                    <p className="text-secondary text-sm mb-6">
                        Przedmiot został pomyślnie usunięty z Giełdy RAPwUK.com.
                    </p>
                    <Link href="/shop/gielda" className="btn-primary py-3 w-full" style={{ textDecoration: 'none', borderRadius: '10px', fontWeight: 700, display: 'block' }}>
                        Wróć do Giełdy
                    </Link>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container animate-fade-in" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
                <div className="glass-panel p-8 max-w-md mx-auto text-center" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
                    <AlertTriangle size={56} style={{ color: '#ef4444', margin: '0 auto 1.5rem' }} />
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.6rem', margin: '0 0 10px', color: 'var(--text-primary)' }}>
                        Wystąpił Błąd
                    </h1>
                    <p className="text-secondary text-sm mb-6">
                        {error}
                    </p>
                    <Link href="/shop/gielda" className="btn-secondary py-3 w-full" style={{ textDecoration: 'none', borderRadius: '10px', fontWeight: 700, display: 'block' }}>
                        Przejdź do Giełdy
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <header className="page-header" style={{ marginBottom: '1.5rem' }}>
                <div className="flex items-center gap-4">
                    <Link href="/shop/gielda" className="action-btn"><ChevronLeft size={24} /></Link>
                    <h1 className="text-2xl font-bold">Usuń Ogłoszenie</h1>
                </div>
            </header>

            {listing && (
                <div className="glass-panel p-8 max-w-md mx-auto text-center">
                    <AlertTriangle size={48} style={{ color: '#fbbf24', margin: '0 auto 1rem' }} />
                    
                    <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.3rem', margin: '0 0 10px', color: 'var(--text-primary)' }}>
                        Czy na pewno chcesz usunąć to ogłoszenie?
                    </h2>
                    <p className="text-secondary text-xs mb-6">
                        Ta operacja jest bezpowrotna. Twoja oferta zostanie skasowana z portalu.
                    </p>

                    {/* Preview listing box */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        textAlign: 'left',
                        marginBottom: '2rem'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '6px',
                            background: 'var(--bg-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            fontSize: '1.2rem'
                        }}>
                            {listing.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={listing.image_url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                '📦'
                            )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {listing.title}
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#f59e0b', marginTop: '2px' }}>
                                £{Number(listing.price).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={handleDelete} 
                            disabled={deleting}
                            className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                            style={{ background: '#ef4444', color: '#fff', borderRadius: '10px', fontWeight: 700 }}
                        >
                            <Trash2 size={16} /> {deleting ? 'Usuwanie...' : 'Usuń Ogłoszenie'}
                        </button>
                        <button 
                            onClick={() => router.push('/shop/gielda')} 
                            disabled={deleting}
                            className="btn-secondary flex-1 py-3"
                            style={{ borderRadius: '10px', fontWeight: 700 }}
                        >
                            Anuluj
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
