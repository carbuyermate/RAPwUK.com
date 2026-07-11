'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { updateListing } from '../../actions';
import { 
    ChevronLeft, Tag, FileText, Upload, X, DollarSign, 
    MessageSquare, CheckCircle, AlertCircle, Lock
} from 'lucide-react';
import '../../../shop.css';
import '../../gielda.css';

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

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ token?: string }>;
}

export default function EditListingPage({ params, searchParams }: PageProps) {
    const router = useRouter();
    const { id } = use(params);
    const { token } = use(searchParams);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState<'muzyka' | 'ubrania' | 'bilety' | 'inne'>('muzyka');
    const [itemCondition, setItemCondition] = useState<'Nowa w folii' | 'Nowa' | 'Używana'>('Używana');
    const [phone, setPhone] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    
    // Image handling
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [keepExistingImage, setKeepExistingImage] = useState(true);

    useEffect(() => {
        const fetchListing = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!token) {
                    throw new Error('Brak tokenu uwierzytelniającego (kodu PIN) w adresie URL.');
                }

                const { data, error: fetchErr } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('id', id)
                    .maybeSingle();

                if (fetchErr) throw fetchErr;
                if (!data) {
                    throw new Error('Ogłoszenie nie istnieje lub zostało już usunięte.');
                }

                // Sprawdź PIN
                if (data.delete_token !== token) {
                    throw new Error('Podany kod PIN jest nieprawidłowy dla tego ogłoszenia.');
                }

                // Wypełnij stany
                setTitle(data.title);
                setDescription(data.description || '');
                setPrice(data.price.toString());
                setCategory(data.category);
                setItemCondition(data.item_condition);
                setPhone(data.phone || '');
                setFacebookUrl(data.facebook_url || '');
                setInstagramUrl(data.instagram_url || '');
                if (data.image_url) {
                    setImagePreview(data.image_url);
                    setKeepExistingImage(true);
                } else {
                    setKeepExistingImage(false);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [id, token]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSaving(true);
        try {
            const compressed = await compressImage(file);
            setImageFile(compressed);
            setImagePreview(URL.createObjectURL(compressed));
            setKeepExistingImage(false);
        } catch (err) {
            console.error('Image compression error:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setKeepExistingImage(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setSaving(true);
        setError(null);

        try {
            if (!title.trim()) throw new Error('Wpisz tytuł ogłoszenia.');
            if (!price || parseFloat(price) <= 0) throw new Error('Podaj poprawną cenę.');
            if (!phone.trim() && !facebookUrl.trim() && !instagramUrl.trim()) {
                throw new Error('Musisz podać co najmniej jedną metodę kontaktu (telefon, Facebook lub Instagram).');
            }

            let image_base64: string | undefined = undefined;
            if (imageFile) {
                image_base64 = await fileToBase64(imageFile);
            }

            const result = await updateListing(id, token, {
                title,
                description,
                price: parseFloat(price),
                category,
                item_condition: itemCondition,
                phone,
                facebook_url: facebookUrl,
                instagram_url: instagramUrl,
                image_base64,
                image_name: imageFile?.name,
                keep_existing_image: keepExistingImage
            });

            if (!result.success) {
                throw new Error(result.error || 'Nie udało się zaktualizować ogłoszenia.');
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container animate-fade-in" style={{ paddingTop: '5rem', textAlign: 'center' }}>
                <CheckCircle size={32} className="animate-spin" style={{ color: '#f59e0b', margin: '0 auto 1rem' }} />
                <p className="text-secondary">Wczytywanie szczegółów ogłoszenia...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="container animate-fade-in" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
                <div className="gielda-success-card max-w-xl mx-auto">
                    <CheckCircle size={56} style={{ color: '#10b981', margin: '0 auto 1.5rem' }} />
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.8rem', margin: '0 0 10px', color: 'var(--text-primary)' }}>
                        Zapisano Zmiany!
                    </h1>
                    <p className="text-secondary text-sm mb-8">
                        Twoje ogłoszenie zostało pomyślnie zaktualizowane i jest widoczne na Giełdzie.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link href="/shop/gielda" className="btn-primary" style={{ padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>
                            Wróć do Giełdy
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container animate-fade-in" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
                <div className="glass-panel p-8 max-w-md mx-auto text-center" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
                    <AlertCircle size={56} style={{ color: '#ef4444', margin: '0 auto 1.5rem' }} />
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.6rem', margin: '0 0 10px', color: 'var(--text-primary)' }}>
                        Błąd Uwierzytelniania
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
            <header className="page-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/shop/gielda" className="action-btn"><ChevronLeft size={24} /></Link>
                    <h1 className="text-2xl font-bold">Edytuj Swoje Ogłoszenie</h1>
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
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                required 
                                disabled={saving}
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
                                disabled={saving}
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
                                disabled={saving}
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
                                value={price} 
                                onChange={(e) => setPrice(e.target.value)} 
                                required 
                                disabled={saving}
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="gielda-form-group">
                            <label className="gielda-form-label"><MessageSquare size={14} /> Numer telefonu</label>
                            <input 
                                type="tel" 
                                className="gielda-form-input" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                disabled={saving}
                            />
                        </div>

                        {/* Facebook Link */}
                        <div className="gielda-form-group">
                            <label className="gielda-form-label">Link do Facebooka (opcjonalnie)</label>
                            <input 
                                type="text" 
                                className="gielda-form-input" 
                                placeholder="np. facebook.com/twoj.profil"
                                value={facebookUrl} 
                                onChange={(e) => setFacebookUrl(e.target.value)} 
                                disabled={saving}
                            />
                        </div>

                        {/* Instagram Link */}
                        <div className="gielda-form-group">
                            <label className="gielda-form-label">Link do Instagrama (opcjonalnie)</label>
                            <input 
                                type="text" 
                                className="gielda-form-input" 
                                placeholder="np. instagram.com/twoj.profil"
                                value={instagramUrl} 
                                onChange={(e) => setInstagramUrl(e.target.value)} 
                                disabled={saving}
                            />
                        </div>

                        {/* Description */}
                        <div className="gielda-form-group full-width">
                            <label className="gielda-form-label"><FileText size={14} /> Opis przedmiotu</label>
                            <textarea 
                                className="gielda-form-input" 
                                style={{ minHeight: '120px', resize: 'vertical' }} 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={saving}
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
                                        onClick={handleRemoveImage}
                                    >
                                        <X size={14} /> Usuń
                                    </button>
                                </div>
                            ) : (
                                <label className="gielda-upload-zone" htmlFor="listing-image">
                                    <Upload size={32} strokeWidth={1.5} />
                                    <span>Kliknij, aby dodać nowe zdjęcie</span>
                                    <input 
                                        id="listing-image" 
                                        type="file" 
                                        accept="image/*" 
                                        style={{ display: 'none' }} 
                                        onChange={handleImageChange}
                                        disabled={saving}
                                    />
                                </label>
                            )}
                        </div>

                    </div>

                    <div className="gielda-btn-row">
                        <button type="submit" className="btn-primary flex-1" disabled={saving}>
                            {saving ? 'Zapisywanie...' : 'Zapisz Zmiany'}
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
