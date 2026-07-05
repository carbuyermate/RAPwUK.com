'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
    Search, Plus, Tag, Phone, ExternalLink, Calendar, 
    ChevronLeft, MessageSquare, AlertCircle, RefreshCw, X 
} from 'lucide-react';
import '../shop.css';
import './gielda.css';

interface Listing {
    id: string;
    title: string;
    description: string | null;
    price: number;
    item_condition: 'Nowa w folii' | 'Nowa' | 'Używana';
    category: 'muzyka' | 'ubrania' | 'bilety' | 'inne';
    image_url: string | null;
    contact_info: string;
    created_at: string;
}

const CATEGORY_LABELS = {
    muzyka: '🎵 Muzyka',
    ubrania: '👕 Ubrania',
    bilety: '🎟️ Bilety',
    inne: '📦 Inne'
};

const CONDITION_LABELS = {
    'Nowa w folii': '🆕 Nowa w folii',
    'Nowa': '✨ Nowa',
    'Używana': '💿 Używana'
};

export default function GieldaPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtry
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    // Szczegóły wybranego ogłoszenia
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

    const fetchListings = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchErr } = await supabase
                .from('listings')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (fetchErr) throw fetchErr;
            setListings((data || []) as Listing[]);
        } catch (err: any) {
            console.error('Error fetching listings:', err);
            setError('Nie udało się pobrać ogłoszeń. Spróbuj odświeżyć stronę.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    // Filtrowanie listy
    const filteredListings = listings.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="container shop-page animate-fade-in" style={{ paddingTop: '2rem' }}>
            
            {/* Header */}
            <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <Link href="/shop" className="back-btn" style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>
                        <ChevronLeft size={16} /> Sklep
                    </Link>
                    <h1 className="page-header-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                        🎤 Giełda ogłoszeniowa
                    </h1>
                    <p className="text-secondary text-sm" style={{ marginTop: '0.25rem' }}>
                        Kupuj i sprzedawaj płyty, merch i bilety bezpośrednio od innych fanów w UK!
                    </p>
                </div>

                <Link href="/shop/gielda/dodaj" className="btn-primary flex items-center gap-2" style={{ textDecoration: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700 }}>
                    <Plus size={18} /> Dodaj ogłoszenie
                </Link>
            </header>

            {/* Filters Bar */}
            <div className="gielda-filters-bar">
                {/* Search */}
                <div className="gielda-search-wrapper">
                    <input 
                        type="text" 
                        placeholder="Szukaj ogłoszenia..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="gielda-search-input" 
                    />
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                </div>

                {/* Category Filter */}
                <div className="gielda-filter-row">
                    <span className="gielda-filter-label">Kategoria:</span>
                    <div className="gielda-pills-container">
                        <button 
                            className={`gielda-pill ${categoryFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setCategoryFilter('all')}
                        >
                            Wszystko
                        </button>
                        <button 
                            className={`gielda-pill ${categoryFilter === 'muzyka' ? 'active' : ''}`}
                            onClick={() => setCategoryFilter('muzyka')}
                        >
                            🎵 Muzyka
                        </button>
                        <button 
                            className={`gielda-pill ${categoryFilter === 'ubrania' ? 'active' : ''}`}
                            onClick={() => setCategoryFilter('ubrania')}
                        >
                            👕 Ubrania
                        </button>
                        <button 
                            className={`gielda-pill ${categoryFilter === 'bilety' ? 'active' : ''}`}
                            onClick={() => setCategoryFilter('bilety')}
                        >
                            🎟️ Bilety
                        </button>
                        <button 
                            className={`gielda-pill ${categoryFilter === 'inne' ? 'active' : ''}`}
                            onClick={() => setCategoryFilter('inne')}
                        >
                            📦 Inne
                        </button>
                    </div>
                </div>

            </div>

            {/* Main Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                    <RefreshCw className="animate-spin" size={32} style={{ color: '#f59e0b', margin: '0 auto 1rem' }} />
                    <p className="text-secondary">Wczytywanie ogłoszeń...</p>
                </div>
            ) : error ? (
                <div className="glass-panel text-center" style={{ padding: '3rem 2rem', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                    <AlertCircle size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
                    <p className="font-bold">{error}</p>
                    <button onClick={fetchListings} className="btn-secondary mt-4">Spróbuj ponownie</button>
                </div>
            ) : filteredListings.length === 0 ? (
                <div className="glass-panel text-center" style={{ padding: '5rem 2rem' }}>
                    <p style={{ fontSize: '3rem', margin: 0 }}>📢</p>
                    <h3 className="font-bold text-lg mt-2">Brak ogłoszeń</h3>
                    <p className="text-secondary mt-1">Bądź pierwszy i dodaj swoje ogłoszenie za darmo!</p>
                    <Link href="/shop/gielda/dodaj" className="btn-primary mt-4" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                        Wystaw przedmiot
                    </Link>
                </div>
            ) : (
                <div className="product-grid">
                    {filteredListings.map((listing) => (
                        <div 
                            key={listing.id} 
                            onClick={() => setSelectedListing(listing)}
                            className="product-card" 
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="product-card-image" style={{ background: 'var(--bg-secondary)', position: 'relative' }}>
                                {listing.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={listing.image_url} alt={listing.title} style={{ transition: 'transform 0.2s' }} />
                                ) : (
                                    <span style={{ fontSize: '2.5rem' }}>
                                        {listing.category === 'muzyka' ? '💿' : listing.category === 'ubrania' ? '👕' : listing.category === 'bilety' ? '🎟️' : '📦'}
                                    </span>
                                )}
                                <span style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    left: '10px',
                                    background: 'rgba(0,0,0,0.7)',
                                    color: '#f59e0b',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    borderRadius: '5px',
                                    textTransform: 'uppercase',
                                    border: '1px solid rgba(245,158,11,0.3)',
                                    letterSpacing: '0.5px'
                                }}>
                                    {listing.item_condition}
                                </span>
                            </div>
                            
                            <div className="product-card-body" style={{ flex: 1, padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <span className="product-card-category" style={{ fontSize: '0.65rem' }}>
                                        {CATEGORY_LABELS[listing.category]}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={10} />
                                        {formatDate(listing.created_at)}
                                    </span>
                                </div>
                                
                                <h3 className="product-card-title" style={{ fontSize: '0.92rem', fontWeight: 700, margin: '4px 0 8px', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {listing.title}
                                </h3>

                                <div className="product-card-price" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                    <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                                        £{Number(listing.price).toFixed(2)}
                                    </span>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Szczegóły →
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Listing Details Modal */}
            {selectedListing && (
                <div className="shipping-modal-overlay animate-fade-in" onClick={() => setSelectedListing(null)}>
                    <div 
                        className="shipping-modal-content" 
                        onClick={(e) => e.stopPropagation()} 
                        style={{ maxWidth: '600px', padding: '1.75rem' }}
                    >
                        {/* Header */}
                        <div className="shipping-modal-header" style={{ paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                            <h2 className="shipping-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
                                {CATEGORY_LABELS[selectedListing.category]}
                            </h2>
                            <button className="shipping-modal-close-btn" onClick={() => setSelectedListing(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            
                            {/* Image if exists */}
                            {selectedListing.image_url && (
                                <div style={{ 
                                    width: '100%', 
                                    maxHeight: '300px', 
                                    borderRadius: '12px', 
                                    overflow: 'hidden', 
                                    background: 'var(--bg-secondary)', 
                                    border: '1px solid var(--border-color)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={selectedListing.image_url} 
                                        alt={selectedListing.title} 
                                        style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} 
                                    />
                                </div>
                            )}

                            {/* Details */}
                            <div>
                                <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.5rem', lineHeight: 1.2, margin: '0 0 8px', color: 'var(--text-primary)' }}>
                                    {selectedListing.title}
                                </h2>
                                
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0 16px' }}>
                                    <span style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '3px 8px', fontSize: '0.75rem', fontWeight: 600 }}>
                                        Stan: <strong style={{ color: 'var(--text-primary)' }}>{selectedListing.item_condition}</strong>
                                    </span>
                                    <span style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '3px 8px', fontSize: '0.75rem', fontWeight: 600 }}>
                                        Dodano: <strong style={{ color: 'var(--text-primary)' }}>{new Date(selectedListing.created_at).toLocaleDateString('pl-PL')}</strong>
                                    </span>
                                </div>

                                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                                    £{Number(selectedListing.price).toFixed(2)}
                                </div>

                                {selectedListing.description && (
                                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
                                        <h3 style={{ margin: '0 0 6px', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Opis przedmiotu:</h3>
                                        <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', margin: 0 }}>
                                            {selectedListing.description}
                                        </p>
                                    </div>
                                )}

                                {/* Contact Zone */}
                                <div style={{ 
                                    background: 'rgba(245, 158, 11, 0.04)', 
                                    border: '1px solid rgba(245, 158, 11, 0.25)', 
                                    borderRadius: '12px', 
                                    padding: '1.25rem',
                                    textAlign: 'center' 
                                }}>
                                    <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                        <MessageSquare size={14} /> Skontaktuj się ze sprzedawcą
                                    </h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                                        Wspomnij, że dzwonisz z portalu RAPwUK.com
                                    </p>
                                    <div style={{
                                        fontFamily: 'monospace',
                                        fontSize: '1.1rem',
                                        fontWeight: 700,
                                        background: 'rgba(0,0,0,0.4)',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        display: 'inline-block',
                                        color: '#fff',
                                        wordBreak: 'break-all',
                                        maxWidth: '100%'
                                    }}>
                                        {selectedListing.contact_info}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
