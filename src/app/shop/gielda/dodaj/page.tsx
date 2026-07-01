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
    const [contactInfo, setContactInfo] = useState('');
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
            if (!contactInfo.trim()) throw new Error('Podaj dane kontaktowe.');

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
                contact_info: contactInfo,
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
                <div className="glass-panel p-8 max-w-xl mx-auto text-center" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
                    <CheckCircle size={56} style={{ color: '#10b981', margin: '0 auto 1.5rem' }} />
                    
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.8rem', margin: '0 0 10px', color: 'var(--text-primary)' }}>
                        Ogłoszenie Opublikowane!
                    </h1>
                    <p className="text-secondary text-sm mb-8">
                        Twoja oferta jest już widoczna na Giełdzie RAPwUK.com.
                    </p>

                    {/* Deletion Link Alert Box */}
                    <div style={{
                        background: 'rgba(245,158,11,0.04)',
                        border: '1px dashed rgba(245,158,11,0.3)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'left',
                        marginBottom: '2rem'
                    }}>
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
                                className="form-input text-xs" 
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
                        <Link href="/shop/gielda" className="btn-secondary flex-1 py-3" style={{ textDecoration: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem' }}>
                            Wróć do Giełdy
                        </Link>
                        <button onClick={() => {
                            setTitle('');
                            setDescription('');
                            setPrice('');
                            setContactInfo('');
                            setImageFile(null);
                            setImagePreview(null);
                            setSuccessData(null);
                        }} className="btn-primary flex-1 py-3" style={{ borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem' }}>
                            Dodaj kolejne
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <header className="page-header" style={{ marginBottom: '1.5rem' }}>
                <div className="flex items-center gap-4">
                    <Link href="/shop/gielda" className="action-btn"><ChevronLeft size={24} /></Link>
                    <h1 className="text-2xl font-bold">Wystaw Przedmiot za Darmo</h1>
                </div>
            </header>

            <form className="glass-panel p-8 max-w-2xl mx-auto" onSubmit={handleSubmit}>
                {error && (
                    <div className="error-message mb-6" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem' }}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    
                    {/* Title */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label"><Tag size={14} /> Tytuł ogłoszenia</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="np. O.S.T.R. - Tabasko CD (2002) Pierwsze wydanie" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required 
                            disabled={loading}
                        />
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label className="form-label">Kategoria</label>
                        <select 
                            className="form-input" 
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
                    <div className="form-group">
                        <label className="form-label">Stan przedmiotu</label>
                        <select 
                            className="form-input" 
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
                    <div className="form-group">
                        <label className="form-label"><DollarSign size={14} /> Cena (£)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            className="form-input" 
                            placeholder="np. 20.00" 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)} 
                            required 
                            disabled={loading}
                        />
                    </div>

                    {/* Contact Info */}
                    <div className="form-group">
                        <label className="form-label"><MessageSquare size={14} /> Dane kontaktowe</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="np. Tel: +44 777... lub FB: Jan Kowalski" 
                            value={contactInfo} 
                            onChange={(e) => setContactInfo(e.target.value)} 
                            required 
                            disabled={loading}
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label"><FileText size={14} /> Opis przedmiotu</label>
                        <textarea 
                            className="form-input" 
                            style={{ minHeight: '120px', resize: 'vertical' }} 
                            placeholder="Opisz sprzedawany przedmiot (np. stan płyty/okładki, szczegóły wysyłki lub odbioru osobistego)..."
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Zdjęcie przedmiotu</label>
                        {imagePreview ? (
                            <div className="image-preview-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imagePreview} alt="Podgląd" className="image-preview" style={{ maxHeight: '200px', borderRadius: '8px' }} />
                                <button 
                                    type="button" 
                                    className="image-remove-btn" 
                                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#ff4d4d', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}
                                >
                                    <X size={14} /> Usuń
                                </button>
                            </div>
                        ) : (
                            <label className="upload-zone" htmlFor="listing-image" style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', transition: 'border-color 0.2s' }}>
                                <Upload size={32} strokeWidth={1.5} style={{ color: 'var(--text-secondary)' }} />
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Kliknij, aby dodać zdjęcie</span>
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

                <div className="mt-8 flex gap-4">
                    <button type="submit" className="btn-primary flex-1 py-3" disabled={loading} style={{ borderRadius: '10px', fontWeight: 700 }}>
                        {loading ? 'Publikowanie...' : 'Opublikuj Ogłoszenie'}
                    </button>
                    <Link href="/shop/gielda" className="btn-secondary py-3 px-8" style={{ textDecoration: 'none', borderRadius: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        Anuluj
                    </Link>
                </div>
            </form>
        </div>
    );
}
