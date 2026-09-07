'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft, Plus, Trash2, Eye, EyeOff, ExternalLink,
    Monitor, Image as ImageIcon, Link as LinkIcon, AlertCircle, CheckCircle,
    Pencil, LayoutTemplate, Columns, ArrowUpDown, RefreshCw
} from 'lucide-react';
import '../dashboard.css';

interface Ad {
    id: string;
    name: string;
    image_url: string;
    link_url: string;
    is_active: boolean;
    position: string;
    clicks: number;
    created_at: string;
}

const POSITIONS = [
    {
        value: 'homepage_bottom',
        label: '🖥️ Baner — dół strony głównej',
        hint: 'Poziomy baner, pojawia się nad stopką na każdej stronie (970 × 90 px)',
        icon: <LayoutTemplate size={20} />,
        color: '#7c3aed',
        bgColor: 'rgba(124,58,237,0.07)',
        borderColor: 'rgba(124,58,237,0.25)',
    },
    {
        value: 'homepage_sidebar',
        label: '📐 Baner — prawa kolumna (sidebar)',
        hint: 'Pionowy baner boczny na stronie głównej (160 × 600 px)',
        icon: <Columns size={20} />,
        color: '#0891b2',
        bgColor: 'rgba(8,145,178,0.07)',
        borderColor: 'rgba(8,145,178,0.25)',
    },
];

const PLACEHOLDER_URL = '/banner-cardiffornia.png';

export default function AdsPage() {
    const router = useRouter();
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toggling, setToggling] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [position, setPosition] = useState('homepage_bottom');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchAds = useCallback(async () => {
        const { data, error } = await supabase
            .from('ads')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            setError('Błąd ładowania reklam: ' + error.message);
        } else {
            setAds(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/login'); return; }
            setToken(session.access_token);
            fetchAds();
        });
    }, [router, fetchAds]);

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        ...(token ? { 'x-token': token } : {}),
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { setError('Baner nie może przekraczać 2MB.'); return; }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setError(null);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        let image_url = PLACEHOLDER_URL;

        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `promo/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(fileName, imageFile, { upsert: false });

            if (uploadError) {
                setError('Błąd uploadu: ' + uploadError.message);
                setSaving(false);
                return;
            }
            const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
            image_url = publicUrl;
        }

        if (editingId) {
            const updatePayload: Record<string, unknown> = { name, link_url: linkUrl, position };
            if (imageFile) updatePayload.image_url = image_url;

            const res = await fetch(`/api/promo?id=${editingId}`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify(updatePayload),
            });
            const json = await res.json();
            if (json.error) {
                setError(json.error);
            } else {
                setSuccess('✅ Baner zaktualizowany!');
                resetForm();
                fetchAds();
            }
        } else {
            const res = await fetch('/api/promo', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    name,
                    image_url,
                    link_url: linkUrl,
                    position,
                    is_active: true,
                    clicks: 0,
                }),
            });
            const json = await res.json();
            if (json.error) {
                setError(json.error);
            } else {
                setSuccess('✅ Baner dodany i aktywny!');
                resetForm();
                fetchAds();
            }
        }
        setSaving(false);
    };

    const resetForm = () => {
        setName('');
        setLinkUrl('');
        setImageFile(null);
        setImagePreview(null);
        setEditingId(null);
        setShowForm(false);
        setPosition('homepage_bottom');
    };

    const startEdit = (ad: Ad) => {
        setName(ad.name);
        setLinkUrl(ad.link_url);
        setPosition(ad.position);
        setImagePreview(ad.image_url);
        setImageFile(null);
        setEditingId(ad.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const startAdd = (pos: string) => {
        resetForm();
        setPosition(pos);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleActive = async (ad: Ad) => {
        setToggling(ad.id);
        setError(null);
        const res = await fetch(`/api/promo?id=${ad.id}`, {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify({ is_active: !ad.is_active }),
        });
        const json = await res.json();
        if (json.error) {
            setError(json.error);
        } else {
            setSuccess(ad.is_active ? '⏸ Baner wyłączony.' : '▶ Baner włączony!');
            setTimeout(() => setSuccess(null), 3000);
            fetchAds();
        }
        setToggling(null);
    };

    const deleteAd = async (id: string) => {
        if (!confirm('Czy na pewno usunąć ten baner?')) return;
        setError(null);

        const res = await fetch(`/api/promo?id=${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });

        let json: Record<string, unknown> = {};
        try { json = await res.json(); } catch { /* ignore */ }

        if (json.error || !res.ok) {
            setError('Błąd usuwania: ' + (json.error || res.statusText));
        } else {
            setAds(prev => prev.filter(ad => ad.id !== id));
            setSuccess('🗑 Baner usunięty.');
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    const getActiveAdForPosition = (pos: string) =>
        ads.filter(a => a.position === pos && a.is_active)[0] || null;

    const getAdsForPosition = (pos: string) =>
        ads.filter(a => a.position === pos);

    if (loading) {
        return (
            <div className="dashboard-container container">
                <p className="text-secondary" style={{ padding: '4rem', textAlign: 'center' }}>Ładowanie...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container container animate-fade-in">
            {/* ── Header ── */}
            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/dashboard" className="action-btn">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Zarządzanie Banerami</h1>
                        <p className="text-secondary text-sm">Włączaj, wyłączaj i edytuj banery reklamowe na stronie</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="action-btn"
                        onClick={() => { setLoading(true); fetchAds(); }}
                        title="Odśwież"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => { resetForm(); setShowForm(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Plus size={18} /> Dodaj baner
                    </button>
                </div>
            </header>

            {/* ── Notifications ── */}
            {error && (
                <div className="error-message mb-6" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}
            {success && (
                <div style={{ background: 'rgba(46,213,115,0.1)', border: '1px solid rgba(46,213,115,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#2ed573', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} /> {success}
                </div>
            )}

            {/* ── Add / Edit Form ── */}
            {showForm && (
                <div className="glass-panel p-8 mb-8 animate-fade-in" style={{ borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.05)' }}>
                    <h2 className="font-bold text-xl mb-6" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {editingId ? <><Pencil size={20} /> Edytuj baner</> : <><Plus size={20} /> Nowy baner reklamowy</>}
                    </h2>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label"><Monitor size={14} /> Nazwa (wewnętrzna)</label>
                                <input
                                    className="form-input"
                                    placeholder="np. Hip Hop Cardiffornia – wrzesień 2026"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label"><LinkIcon size={14} /> Link docelowy</label>
                                <input
                                    className="form-input"
                                    placeholder="https://..."
                                    value={linkUrl}
                                    onChange={e => setLinkUrl(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label"><ArrowUpDown size={14} /> Pozycja banera na stronie</label>
                            <select className="form-input" value={position} onChange={e => setPosition(e.target.value)}>
                                <option value="homepage_bottom">🖥️ Dół strony głównej – poziomy baner (970×90 px)</option>
                                <option value="homepage_sidebar">📐 Prawa strona – pionowy baner (160×600 px)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <ImageIcon size={14} /> Grafika banera
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '8px' }}>
                                    {position === 'homepage_sidebar' ? '(zalecane: 160×600 px)' : '(zalecane: 970×90 px)'}
                                </span>
                            </label>
                            {imagePreview ? (
                                <div>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={imagePreview}
                                        alt="Podgląd"
                                        style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '8px' }}
                                    />
                                    <button type="button" className="image-remove-btn" onClick={() => { setImageFile(null); setImagePreview(null); }}>
                                        Usuń grafikę i wybierz inną
                                    </button>
                                </div>
                            ) : (
                                <label className="upload-zone" htmlFor="ad-image">
                                    <ImageIcon size={28} strokeWidth={1.5} />
                                    <span>Kliknij aby wybrać grafikę banera</span>
                                    <span className="upload-hint">PNG, JPG, WEBP · max 2MB</span>
                                    <input id="ad-image" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                                </label>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1 }}>
                                {saving ? 'Zapisywanie...' : (editingId ? 'Zapisz zmiany' : 'Dodaj baner')}
                            </button>
                            <button type="button" className="btn-secondary" onClick={resetForm}>
                                Anuluj
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Per-Position Sections ── */}
            {POSITIONS.map(pos => {
                const posAds = getAdsForPosition(pos.value);
                const activeAd = getActiveAdForPosition(pos.value);

                return (
                    <div key={pos.value} style={{ marginBottom: '2.5rem' }}>
                        {/* Section header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ color: pos.color }}>{pos.icon}</div>
                                <div>
                                    <h2 className="font-bold" style={{ color: pos.color, fontSize: '1.05rem' }}>{pos.label}</h2>
                                    <p className="text-secondary" style={{ fontSize: '0.78rem', marginTop: '2px' }}>{pos.hint}</p>
                                </div>
                            </div>
                            <button
                                className="btn-primary"
                                onClick={() => startAdd(pos.value)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 14px', background: pos.color }}
                            >
                                <Plus size={15} /> Dodaj
                            </button>
                        </div>

                        {/* Live Preview Panel */}
                        <div className="glass-panel p-6 mb-3" style={{ borderColor: pos.borderColor, background: pos.bgColor }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: pos.color }}>
                                    Podgląd aktywnego banera
                                </span>
                                {activeAd ? (
                                    <span style={{ fontSize: '0.72rem', color: '#2ed573', background: 'rgba(46,213,115,0.1)', border: '1px solid rgba(46,213,115,0.3)', borderRadius: '20px', padding: '3px 10px', fontWeight: 700 }}>
                                        ● AKTYWNY
                                    </span>
                                ) : (
                                    <span style={{ fontSize: '0.72rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '20px', padding: '3px 10px', fontWeight: 700 }}>
                                        ● BRAK AKTYWNEGO
                                    </span>
                                )}
                            </div>

                            {activeAd ? (
                                <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={activeAd.image_url}
                                        alt={activeAd.name}
                                        style={{
                                            width: '100%',
                                            maxHeight: pos.value === 'homepage_sidebar' ? '300px' : '100px',
                                            objectFit: 'cover',
                                            display: 'block',
                                        }}
                                    />
                                </div>
                            ) : (
                                <div style={{
                                    borderRadius: '8px',
                                    border: '2px dashed rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.02)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    padding: pos.value === 'homepage_sidebar' ? '60px 20px' : '28px',
                                    color: 'var(--text-secondary)',
                                }}>
                                    <ImageIcon size={32} strokeWidth={1} style={{ opacity: 0.3 }} />
                                    <span style={{ fontSize: '0.82rem' }}>Brak aktywnego banera — wyświetla się domyślny placeholder</span>
                                    <button
                                        className="btn-primary"
                                        onClick={() => startAdd(pos.value)}
                                        style={{ marginTop: '8px', fontSize: '0.8rem', padding: '8px 16px', background: pos.color }}
                                    >
                                        <Plus size={14} /> Dodaj baner dla tej pozycji
                                    </button>
                                </div>
                            )}

                            {activeAd && (
                                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{activeAd.name}</div>
                                        {activeAd.link_url && (
                                            <a href={activeAd.link_url} target="_blank" rel="noopener noreferrer"
                                                style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                                                <ExternalLink size={11} /> {activeAd.link_url.slice(0, 60)}{activeAd.link_url.length > 60 ? '...' : ''}
                                            </a>
                                        )}
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                                            {activeAd.clicks} kliknięć
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="action-btn"
                                            onClick={() => toggleActive(activeAd)}
                                            disabled={toggling === activeAd.id}
                                            title="Wyłącz baner"
                                            style={{ color: '#f59e0b' }}
                                        >
                                            <EyeOff size={18} />
                                        </button>
                                        <button className="action-btn" onClick={() => startEdit(activeAd)} title="Edytuj">
                                            <Pencil size={18} />
                                        </button>
                                        <button className="action-btn delete" onClick={() => deleteAd(activeAd.id)} title="Usuń">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* List of inactive ads for this position */}
                        {posAds.filter(a => !a.is_active).length > 0 && (
                            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                                <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Nieaktywne banery dla tej pozycji
                                </div>
                                {posAds.filter(a => !a.is_active).map((ad, i, arr) => (
                                    <div
                                        key={ad.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1rem 1.5rem',
                                            borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                            opacity: 0.6,
                                        }}
                                    >
                                        {/* Thumbnail */}
                                        <div style={{ width: '90px', height: '34px', borderRadius: '5px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={ad.image_url} alt={ad.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{ad.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{ad.clicks} kliknięć</div>
                                        </div>
                                        <span className="status-badge draft">Nieaktywny</span>
                                        <div className="action-btns">
                                            <button
                                                className="action-btn"
                                                onClick={() => toggleActive(ad)}
                                                disabled={toggling === ad.id}
                                                title="Włącz baner"
                                                style={{ color: '#2ed573' }}
                                            >
                                                <Eye size={17} />
                                            </button>
                                            <button className="action-btn" onClick={() => startEdit(ad)} title="Edytuj">
                                                <Pencil size={17} />
                                            </button>
                                            <button className="action-btn delete" onClick={() => deleteAd(ad.id)} title="Usuń">
                                                <Trash2 size={17} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {posAds.length === 0 && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', paddingLeft: '4px' }}>
                                Brak banerów dla tej pozycji.
                            </p>
                        )}
                    </div>
                );
            })}

            {/* ── Info box ── */}
            <div className="glass-panel p-8 mt-4" style={{ borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.03)' }}>
                <h3 className="font-bold mb-3" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
                    <Monitor size={16} /> Formaty i wymiary banerów
                </h3>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 2.2, paddingLeft: '1rem' }}>
                    <li><strong>🖥️ Dół strony (homepage_bottom):</strong> 970 × 90 px – poziomy leaderboard, wyświetlany nad stopką na wszystkich podstronach</li>
                    <li><strong>📐 Sidebar (homepage_sidebar):</strong> 160 × 600 px – pionowy half-page po prawej stronie strony głównej</li>
                    <li>Jeśli żaden baner nie jest aktywny dla danej pozycji, wyświetla się domyślny placeholder.</li>
                    <li>Tylko jeden baner może być jednocześnie aktywny dla każdej pozycji (ostatni aktywowany jest pokazywany).</li>
                    <li>Kontakt z reklamodawcami: <strong>fb.com/RAPwUK</strong></li>
                </ul>
            </div>
        </div>
    );
}
