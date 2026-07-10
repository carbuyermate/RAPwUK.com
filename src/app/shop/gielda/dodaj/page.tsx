'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createListing } from '../actions';
import { 
    ChevronLeft, Tag, FileText, Upload, X, DollarSign, 
    MessageSquare, CheckCircle, Clipboard, AlertCircle 
} from 'lucide-react';
import '../../shop.css';
import '../gielda.css';

async function compressImage(file: File, maxPx = 1000, quality = 0.8): Promise<File> {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            let w = img.naturalWidth, h = img.naturalHeight;
            if (w > maxPx || h > maxPx) { 
                const r = Math.min(maxPx / w, maxPx / h); 
                w = Math.round(w * r); 
                h = Math.round(h * r); 
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; 
            canvas.height = h;
            canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
            const mime = 'image/webp';
            canvas.toBlob((blob) => {
                if (!blob) { resolve(file); return; }
                resolve(new File([blob], `listing.webp`, { type: mime }));
            }, mime, quality);
        };
        img.onerror = () => { 
            URL.revokeObjectURL(url); 
            resolve(file); 
        };
        img.src = url;
    });
}

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}

export default function AddListingPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState<'muzyka' | 'ubrania' | 'bilety' | 'inne'>('muzyka');
    const [itemCondition, setItemCondition] = useState<'Nowa w folii' | 'Nowa' | 'Używana'>('Używana');
    const [phone, setPhone] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Po pomyślnym dodaniu
    const [successData, setSuccessData] = useState<{ id: string; deleteToken: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        try {
            const compressed = await compressImage(file);
            setImageFile(compressed);
            setImagePreview(URL.createObjectURL(compressed));
        } catch (err) {
            console.error('Image compression error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!title.trim()) throw new Error('Wpisz tytuł ogłoszenia.');
            if (!price || parseFloat(price) <= 0) throw new Error('Podaj poprawną cenę.');
            if (!phone.trim()) throw new Error('Podaj numer telefonu.');

            let image_base64: string | undefined = undefined;
            if (imageFile) {
                image_base64 = await fileToBase64(imageFile);
            }

            const result = await createListing({
                title,
                description,
                price: parseFloat(price),
                category,
                item_condition: itemCondition,
                phone,
                facebook_url: facebookUrl,
                instagram_url: instagramUrl,
                image_base64,
                image_name: imageFile?.name
            });

            if (!result.success || !result.listing) {
                throw new Error(result.error || 'Nie udało się dodać ogłoszenia.');
            }

            setSuccessData({
                id: result.listing.id,
                deleteToken: result.listing.delete_token
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getDeleteLink = () => {
        if (!successData) return '';
        return `${window.location.origin}/shop/gielda/usun/${successData.id}?token=${successData.deleteToken}`;
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(getDeleteLink());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (successData) {
        return (
            <div className="container animate-fade-in" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
                <div className="gielda-success-card max-w-xl mx-auto">
                    <CheckCircle size={56} style={{ color: '#10b981', margin: '0 auto 1.5rem' }} />
                    
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.8rem', margin: '0 0 10px', color: 'var(--text-primary)' }}>
                        Ogłoszenie Opublikowane!
                    </h1>
                    <p className="text-secondary text-sm mb-8">
                        Twoja oferta jest już widoczna na Giełdzie RAPwUK.com.
                    </p>

                    {/* Deletion Link Alert Box */}
                    <div className="gielda-alert-box">
                        <h4 style={{ margin: '0 0 8px', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertCircle size={15} /> Link do usuwania ogłoszenia
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 12px' }}>
                            Zapisz poniższy link. Będzie Ci potrzebny, aby usunąć ogłoszenie z portalu po tym, jak sprzedasz swój przedmiot (nie wymagamy rejestracji, więc to jedyny sposób na usunięcie wpisu!).
                        </p>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                                type="text" 
                                readOnly 
                                value={getDeleteLink()} 
                                className="gielda-form-input text-xs" 
                                style={{ flex: 1, fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)' }} 
                            />
                            <button 
                                onClick={handleCopyLink} 
                                className="btn-primary flex items-center gap-2" 
                                style={{ padding: '0 15px', borderRadius: '8px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                            >
                                <Clipboard size={14} /> {copied ? 'Skopiowano!' : 'Kopiuj'}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link href="/shop/gielda" className="btn-secondary flex-1">
                            Wróć do Giełdy
                        </Link>
                        <button onClick={() => {
                            setTitle('');
                            setDescription('');
                            setPrice('');
                            setPhone('');
                            setFacebookUrl('');
                            setInstagramUrl('');
                            setImageFile(null);
                            setImagePreview(null);
                            setSuccessData(null);
                        }} className="btn-primary flex-1">
                            Dodaj kolejne
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <header className="page-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/shop/gielda" className="action-btn"><ChevronLeft size={24} /></Link>
                    <h1 className="text-2xl font-bold">Wystaw Przedmiot za Darmo</h1>
                </div>
            </header>

            <div className="gielda-form-wrapper">
                <form className="glass-panel gielda-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="error-message mb-6" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem' }}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="gielda-form-grid">
                        
                        {/* Title */}
                        <div className="gielda-form-group full-width">
                            <label className="gielda-form-label"><Tag size={14} /> Tytuł ogłoszenia</label>
                            <input 
                                type="text" 
                                className="gielda-form-input" 
                                placeholder="np. O.S.T.R. - Tabasko CD (2002) Pierwsze wydanie" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                required 
                                disabled={loading}
                            />
                        </div>

                        {/* Category */}
                        <div className="gielda-form-group">
                            <label className="gielda-form-label">Kategoria</label>
                            <select 
                                className="gielda-form-input" 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value as any)} 
                                required
                                disabled={loading}
                            >
                                <option value="muzyka">🎵 Muzyka</option>
                                <option value="ubrania">👕 Ubrania</option>
                                <option value="bilety">🎟️ Bilety</option>
                                <option value="inne">📦 Inne</option>
                            </select>
                        </div>

                        {/* Item Condition */}
                        <div className="gielda-form-group">
                            <label className="gielda-form-label">Stan przedmiotu</label>
                            <select 
                                className="gielda-form-input" 
                                value={itemCondition} 
                                onChange={(e) => setItemCondition(e.target.value as any)} 
                                required
                                disabled={loading}
                            >
                                <option value="Nowa w folii">🆕 Nowa w folii</option>
                                <option value="Nowa">✨ Nowa</option>
                                <option value="Używana">💿 Używana</option>
                            </select>
                        </div>

                        {/* Price */}
                        <div className="gielda-form-group">
                            <label className="gielda-form-label"><DollarSign size={14} /> Cena (£)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                className="gielda-form-input" 
                                placeholder="np. 20.00" 
                                value={price} 
                                onChange={(e) => setPrice(e.target.value)} 
                                required 
                                disabled={loading}
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="gielda-form-group">
                            <label className="gielda-form-label"><MessageSquare size={14} /> Numer telefonu</label>
                            <input 
                                type="tel" 
                                className="gielda-form-input" 
                                placeholder="np. +44 777 888 999" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                required 
                                disabled={loading}
                            />
                        </div>

                        {/* Facebook Link */}
                        <div className="gielda-form-group">
                            <label className="gielda-form-label">Link do Facebooka (opcjonalnie)</label>
                            <input 
                                type="url" 
                                className="gielda-form-input" 
                                placeholder="np. https://facebook.com/twoj.profil" 
                                value={facebookUrl} 
                                onChange={(e) => setFacebookUrl(e.target.value)} 
                                disabled={loading}
                            />
                        </div>

                        {/* Instagram Link */}
                        <div className="gielda-form-group">
                            <label className="gielda-form-label">Link do Instagrama (opcjonalnie)</label>
                            <input 
                                type="url" 
                                className="gielda-form-input" 
                                placeholder="np. https://instagram.com/twoj.profil" 
                                value={instagramUrl} 
                                onChange={(e) => setInstagramUrl(e.target.value)} 
                                disabled={loading}
                            />
                        </div>

                        {/* Description */}
                        <div className="gielda-form-group full-width">
                            <label className="gielda-form-label"><FileText size={14} /> Opis przedmiotu</label>
                            <textarea 
                                className="gielda-form-input" 
                                style={{ minHeight: '120px', resize: 'vertical' }} 
                                placeholder="Opisz sprzedawany przedmiot (np. stan płyty/okładki, szczegóły wysyłki lub odbioru osobistego)..."
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="gielda-form-group full-width">
                            <label className="gielda-form-label">Zdjęcie przedmiotu</label>
                            {imagePreview ? (
                                <div className="gielda-image-preview-wrapper">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imagePreview} alt="Podgląd" className="gielda-image-preview" />
                                    <button 
                                        type="button" 
                                        className="gielda-image-remove-btn" 
                                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                                    >
                                        <X size={14} /> Usuń
                                    </button>
                                </div>
                            ) : (
                                <label className="gielda-upload-zone" htmlFor="listing-image">
                                    <Upload size={32} strokeWidth={1.5} />
                                    <span>Kliknij, aby dodać zdjęcie</span>
                                    <input 
                                        id="listing-image" 
                                        type="file" 
                                        accept="image/*" 
                                        style={{ display: 'none' }} 
                                        onChange={handleImageChange}
                                        disabled={loading}
                                    />
                                </label>
                            )}
                        </div>

                    </div>

                    <div className="gielda-btn-row">
                        <button type="submit" className="btn-primary flex-1" disabled={loading}>
                            {loading ? 'Publikowanie...' : 'Opublikuj Ogłoszenie'}
                        </button>
                        <Link href="/shop/gielda" className="btn-secondary flex-1">
                            Anuluj
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
