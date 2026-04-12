'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft, Plus, Trash2, Eye, EyeOff, ExternalLink,
    Monitor, Image as ImageIcon, Link as LinkIcon, AlertCircle, CheckCircle
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

const PLACEHOLDER_URL = '/banner-placeholder.png';

export default function AdsPage() {
    const router = useRouter();
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // New ad form
    const [name, setName] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [position, setPosition] = useState('homepage_bottom');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchAds = async () => {
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
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/login'); return; }
            fetchAds();
        });
    }, [router]);

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
            const fileName = `ads/${Date.now()}.${fileExt}`;
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
            const updatePayload: any = { name, link_url: linkUrl, position };
            if (imageFile) updatePayload.image_url = image_url;

            const res = await fetch(`/api/ads?id=${editingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload),
            });
            const json = await res.json();
            if (json.error) {
                setError(json.error);
            } else {
                setSuccess('Reklama zaktualizowana!');
                resetForm();
                fetchAds();
            }
        } else {
            const res = await fetch('/api/ads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                setSuccess('Reklama dodana!');
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
    };

    const startEdit = (ad: Ad) => {
        setName(ad.name);
        setLinkUrl(ad.link_url);
        setPosition(ad.position);
        setImagePreview(ad.image_url);
        setImageFile(null);
        setEditingId(ad.id);
        setShowForm(true);
        window.scrollTo(0, 0);
    };

    const toggleActive = async (ad: Ad) => {
        const res = await fetch(`/api/ads?id=${ad.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: !ad.is_active }),
        });
        const json = await res.json();
        if (json.error) {
            setError(json.error);
        } else {
            fetchAds();
        }
    };

    const deleteAd = async (id: string) => {
        if (!confirm('Czy na pewno usunąć tę reklamę?')) return;
        setError(null);

        const res = await fetch(`/api/ads?id=${id}`, { method: 'DELETE' });

        let json: any = {};
        try {
            json = await res.json();
        } catch(e) {
            setError('Błąd usuwania: nie można odczytać odpowiedzi serwera (status: ' + res.status + ')');
            return;
        }

        if (json.error || !res.ok) {
            setError('Błąd usuwania: ' + (json.error || res.statusText));
        } else {
            setAds(prev => prev.filter(ad => ad.id !== id));
            setSuccess('Reklama usunięta.');
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container container">
                <p className="text-secondary">Ładowanie...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container container animate-fade-in">
            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/dashboard" className="action-btn">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Zarządzanie Reklamami</h1>
                        <p className="text-secondary text-sm">Banery reklamowe na stronie głównej</p>
                    </div>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => { resetForm(); setShowForm(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} /> Dodaj baner
                </button>
            </header>

            {error && (
                <div className="error-message mb-6" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}
            {success && (
                <div style={{ background: 'rgba(46,213,115,0.1)', border: '1px solid rgba(46,213,115,0.3)', borderRadius: '8px', padding: '12px 16px', color: '#2ed573', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} /> {success}
                </div>
            )}

            {/* Add form */}
            {showForm && (
                <div className="glass-panel p-8 mb-8 animate-fade-in">
                    <h2 className="font-bold text-xl mb-6">{editingId ? 'Edytuj baner' : 'Nowy baner reklamowy'}</h2>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label"><Monitor size={14} /> Nazwa (wewnętrzna)</label>
                            <input className="form-input" placeholder="np. Klient A - kwiecień 2026" value={name} onChange={e => setName(e.target.value)} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label"><LinkIcon size={14} /> Link docelowy (gdzie kliknięcie otwiera)</label>
                            <input className="form-input" placeholder="https://..." value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label className="form-label"><Monitor size={14} /> Pozycja banera</label>
                            <select className="form-input" value={position} onChange={e => setPosition(e.target.value)}>
                                <option value="homepage_bottom">🖥️ Dół strony głównej – poziomy (970×90 px)</option>
                                <option value="homepage_sidebar">📐 Prawa strona – pionowy (160×600 px)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label"><ImageIcon size={14} /> Grafika banera {position === 'homepage_sidebar' ? '(zalecane: 160×600 px)' : '(zalecane: 970×90 px)'}</label>
                            {imagePreview ? (
                                <div>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imagePreview} alt="Podgląd" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '8px' }} />
                                    <button type="button" className="image-remove-btn" onClick={() => { setImageFile(null); setImagePreview(null); }}>Usuń grafikę</button>
                                </div>
                            ) : (
                                <label className="upload-zone" htmlFor="ad-image">
                                    <ImageIcon size={28} strokeWidth={1.5} />
                                    <span>Kliknij aby wybrać grafikę</span>
                                    <span className="upload-hint">PNG, JPG, WEBP · max 2MB · Jeśli nie wybierzesz, zostanie użyty placeholder</span>
                                    <input id="ad-image" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                                </label>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1 }}>
                                {saving ? 'Zapisywanie...' : (editingId ? 'Zapisz zmiany' : 'Dodaj reklamę')}
                            </button>
                            <button type="button" className="btn-secondary" onClick={resetForm}>
                                Anuluj
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Ads list */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="font-bold">Aktywne banery ({ads.length})</h2>
                </div>

                {ads.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <Monitor size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <p>Brak dodanych reklam. Kliknij "Dodaj baner" aby rozpocząć.</p>
                    </div>
                ) : (
                    <div>
                        {ads.map((ad, i) => (
                            <div
                                key={ad.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    padding: '1.25rem 2rem',
                                    borderBottom: i < ads.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    opacity: ad.is_active ? 1 : 0.5,
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                {/* Thumbnail */}
                                <div style={{ width: '120px', height: '45px', borderRadius: '6px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={ad.image_url} alt={ad.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>{ad.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
                                        <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {ad.position === 'homepage_bottom' ? '🖥️ Dół strony głównej' :
                                             ad.position === 'homepage_sidebar' ? '📐 Prawa strona (pionowy)' : ad.position}
                                        </span>
                                        <span>· {ad.clicks} kliknięć</span>
                                    </div>
                                    {ad.link_url && (
                                        <a href={ad.link_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}>
                                            <ExternalLink size={10} /> {ad.link_url.slice(0, 50)}{ad.link_url.length > 50 ? '...' : ''}
                                        </a>
                                    )}
                                </div>

                                {/* Status */}
                                <span className={`status-badge ${ad.is_active ? 'active' : 'draft'}`}>
                                    {ad.is_active ? 'Aktywna' : 'Nieaktywna'}
                                </span>

                                {/* Actions */}
                                <div className="action-btns">
                                    <button
                                        className="action-btn"
                                        onClick={() => toggleActive(ad)}
                                        title={ad.is_active ? 'Dezaktywuj' : 'Aktywuj'}
                                    >
                                        {ad.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    <button
                                        className="action-btn"
                                        onClick={() => startEdit(ad)}
                                        title="Edytuj"
                                    >
                                        <Monitor size={18} />
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        onClick={() => deleteAd(ad.id)}
                                        title="Usuń"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info box */}
            <div className="glass-panel p-8 mt-6" style={{ borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.03)' }}>
                <h3 className="font-bold mb-3" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
                    <Monitor size={16} /> Informacje o formatach banerów
                </h3>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 2, paddingLeft: '1rem' }}>
                    <li><strong>🖥️ Dół strony głównej (homepage_bottom):</strong> 970 × 90 px – poziomy baner na dole</li>
                    <li><strong>📐 Prawa strona (homepage_sidebar):</strong> 160 × 600 px – pionowy baner boczny</li>
                    <li>Kontakt z reklamodawcami: <strong>fb.com/RAPwUK</strong></li>
                </ul>
            </div>
        </div>
    );
}
