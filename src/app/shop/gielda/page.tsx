'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
    Search, Plus, Tag, Phone, ExternalLink, Calendar, 
    ChevronLeft, MessageSquare, AlertCircle, RefreshCw, X,
    Facebook, Instagram
} from 'lucide-react';
import { deleteListingWithToken } from './actions';
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
    contact_info?: string | null;
    phone?: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
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

    // Usuwanie ogłoszenia przez użytkownika z kodem PIN
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePin, setDeletePin] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleCloseModal = () => {
        setSelectedListing(null);
        setShowDeleteConfirm(false);
        setDeletePin('');
        setDeleteLoading(false);
        setDeleteError(null);
    };

    const handleUserDelete = async () => {
        if (!selectedListing) return;
        if (!deletePin.trim()) {
            setDeleteError('Wpisz kod PIN.');
            return;
        }
        setDeleteLoading(true);
        setDeleteError(null);
        try {
            const result = await deleteListingWithToken(selectedListing.id, deletePin);
            if (!result.success) {
                throw new Error(result.error || 'Nieprawidłowy kod PIN.');
            }
            // Usuń z listy na kliencie
            setListings(prev => prev.filter(item => item.id !== selectedListing.id));
            handleCloseModal();
            alert('Ogłoszenie zostało usunięte!');
        } catch (err: any) {
            setDeleteError(err.message);
        } finally {
            setDeleteLoading(false);
        }
    };

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
                <div className="gielda-list">
                    {filteredListings.map((listing) => (
                        <div 
                            key={listing.id} 
                            onClick={() => setSelectedListing(listing)}
                            className="gielda-item-row"
                        >
                            <div className="gielda-item-image">
                                {listing.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={listing.image_url} alt={listing.title} />
                                ) : (
                                    <span style={{ fontSize: '1.8rem' }}>
                                        {listing.category === 'muzyka' ? '💿' : listing.category === 'ubrania' ? '👕' : listing.category === 'bilety' ? '🎟️' : '📦'}
                                    </span>
                                )}
                            </div>
                            
                            <div className="gielda-item-details">
                                <div className="gielda-item-header">
                                    <span className="gielda-item-category">
                                        {CATEGORY_LABELS[listing.category]}
                                    </span>
                                    <span className="gielda-item-date">
                                        <Calendar size={12} />
                                        {formatDate(listing.created_at)}
                                    </span>
                                </div>
                                
                                <h3 className="gielda-item-title">
                                    {listing.title}
                                </h3>
                                
                                <div className="gielda-item-meta">
                                    <span className="gielda-item-condition">
                                        {listing.item_condition}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="gielda-item-right">
                                <span className="gielda-item-price">
                                    £{Number(listing.price).toFixed(2)}
                                </span>
                                <span className="gielda-item-action">
                                    Szczegóły →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Listing Details Modal */}
            {selectedListing && (
                <div className="shipping-modal-overlay animate-fade-in" onClick={handleCloseModal}>
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
                            <button className="shipping-modal-close-btn" onClick={handleCloseModal}>
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
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <h4 style={{ margin: '0', fontSize: '0.85rem', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                        <MessageSquare size={14} /> Skontaktuj się ze sprzedawcą
                                    </h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0' }}>
                                        Wspomnij, że dzwonisz z portalu RAPwUK.com
                                    </p>
                                    
                                    {(selectedListing.phone || selectedListing.contact_info) && (
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
                                            maxWidth: '100%',
                                            marginTop: '4px',
                                            width: '100%'
                                        }}>
                                            {selectedListing.phone || selectedListing.contact_info}
                                        </div>
                                    )}

                                    {selectedListing.facebook_url && (
                                        <a 
                                            href={selectedListing.facebook_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '8px',
                                                background: '#1877F2',
                                                color: '#fff',
                                                fontWeight: 700,
                                                fontSize: '0.85rem',
                                                textDecoration: 'none',
                                                transition: 'opacity 0.2s',
                                                marginTop: '4px'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                                            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                        >
                                            <Facebook size={16} /> Profil Facebook
                                        </a>
                                    )}

                                    {selectedListing.instagram_url && (
                                        <a 
                                            href={selectedListing.instagram_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '8px',
                                                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                                                color: '#fff',
                                                fontWeight: 700,
                                                fontSize: '0.85rem',
                                                textDecoration: 'none',
                                                transition: 'opacity 0.2s',
                                                marginTop: '4px'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                                            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                        >
                                            <Instagram size={16} /> Profil Instagram
                                        </a>
                                    )}
                                </div>

                                {/* Usunięcie ogłoszenia przez użytkownika */}
                                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {!showDeleteConfirm ? (
                                        <button 
                                            onClick={() => setShowDeleteConfirm(true)}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.08)',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                color: '#ef4444',
                                                borderRadius: '10px',
                                                padding: '10px 14px',
                                                fontSize: '0.85rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            ❌ Chcę usunąć to ogłoszenie
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(239, 68, 68, 0.03)', border: '1px dashed rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '10px' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Wpisz kod PIN podany podczas dodawania ogłoszenia:</span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input 
                                                    type="password" 
                                                    placeholder="Kod PIN"
                                                    value={deletePin}
                                                    onChange={(e) => setDeletePin(e.target.value)}
                                                    style={{ flex: 1, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                                                />
                                                <button 
                                                    onClick={handleUserDelete}
                                                    disabled={deleteLoading}
                                                    className="btn-primary" 
                                                    style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '0.75rem', background: '#ef4444', borderColor: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}
                                                >
                                                    {deleteLoading ? 'Usuwanie...' : 'Potwierdź'}
                                                </button>
                                                <button 
                                                    onClick={() => { setShowDeleteConfirm(false); setDeletePin(''); setDeleteError(null); }}
                                                    className="btn-secondary"
                                                    style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                                                >
                                                    Anuluj
                                                </button>
                                            </div>
                                            {deleteError && (
                                                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', fontWeight: 'bold' }}>⚠️ Błąd: {deleteError}</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
