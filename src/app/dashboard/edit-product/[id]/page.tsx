'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Tag, FileText, Upload, X } from 'lucide-react';
import { createSlug } from '@/lib/utils';
import '../../dashboard.css';

async function compressImage(file: File, maxPx = 1200, quality = 0.82): Promise<File> {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            let w = img.naturalWidth, h = img.naturalHeight;
            if (w > maxPx || h > maxPx) { const r = Math.min(maxPx / w, maxPx / h); w = Math.round(w * r); h = Math.round(h * r); }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
            const mime = 'image/webp';
            canvas.toBlob((blob) => {
                if (!blob) { resolve(file); return; }
                resolve(new File([blob], `product.webp`, { type: mime }));
            }, mime, quality);
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
        img.src = url;
    });
}

export default function EditProductPage() {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState<'muzyka' | 'bilety' | 'ubrania'>('muzyka');
    const [stock, setStock] = useState('1');
    const [isActive, setIsActive] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [oldImageUrl, setOldImageUrl] = useState<string | null>(null);
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Parametry wydania muzycznego i stanu
    const [mediaType, setMediaType] = useState<'CD' | 'DVD' | 'Kaseta' | ''>('');
    const [conditionMedia, setConditionMedia] = useState('');
    const [conditionCover, setConditionCover] = useState('');
    const [conditionNotes, setConditionNotes] = useState('');
    const [musicCategory, setMusicCategory] = useState<'PL' | 'UK' | 'USA' | 'RAP W UK' | ''>('');
    
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    useEffect(() => {
        const checkAndLoad = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            try {
                const { data, error: fetchErr } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (fetchErr || !data) {
                    throw new Error(fetchErr?.message || 'Nie znaleziono produktu.');
                }

                setTitle(data.title);
                setSlug(data.slug);
                setDescription(data.description || '');
                setPrice(data.price.toString());
                setCategory(data.category);
                setStock(data.stock.toString());
                setIsActive(data.is_active);
                if (data.image_url) {
                    setImagePreview(data.image_url);
                    setOldImageUrl(data.image_url);
                }
                setMediaType(data.media_type || '');
                setConditionMedia(data.condition_media || '');
                setConditionCover(data.condition_cover || '');
                setConditionNotes(data.condition_notes || '');
                setMusicCategory(data.music_category || '');
            } catch (err: any) {
                setError(err.message);
            } finally {
                setFetching(false);
            }
        };

        if (id) {
            checkAndLoad();
        }
    }, [id, router]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const compressed = await compressImage(file);
        setImageFile(compressed);
        setImagePreview(URL.createObjectURL(compressed));
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (category === 'muzyka' && !musicCategory) {
                throw new Error('Musisz wybrać kategorię muzyczną (PL, UK, USA lub RAP W UK) dla produktu z kategorii Muzyka.');
            }

            let image_url: string | null = imagePreview && !imageFile ? imagePreview : null;

            if (imageFile) {
                const fileName = `products/${Date.now()}.webp`;
                const { error: uploadErr } = await supabase.storage
                    .from('uploads')
                    .upload(fileName, imageFile, { upsert: false });
                
                if (uploadErr) throw uploadErr;

                const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
                image_url = publicUrl;
            }

            const { error: updateErr } = await supabase
                .from('products')
                .update({
                    title,
                    slug: slug || createSlug(title),
                    description,
                    price: parseFloat(price),
                    category,
                    stock: parseInt(stock),
                    is_active: isActive,
                    image_url,
                    media_type: category === 'muzyka' && mediaType ? mediaType : null,
                    condition_media: category === 'muzyka' ? conditionMedia : null,
                    condition_cover: category === 'muzyka' ? conditionCover : null,
                    condition_notes: category === 'muzyka' ? conditionNotes : null,
                    music_category: category === 'muzyka' ? musicCategory : null,
                })
                .eq('id', id);

            if (updateErr) throw updateErr;

            // Clean up the old image from Supabase Storage if it was replaced or deleted
            if (oldImageUrl && oldImageUrl !== image_url) {
                const filePath = oldImageUrl.split('/uploads/')[1];
                if (filePath) {
                    await supabase.storage.from('uploads').remove([filePath]);
                }
            }

            router.push('/dashboard/products');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="dashboard-container container mt-12 text-center text-secondary">Ładowanie danych produktu...</div>;
    }

    return (
        <div className="dashboard-container container animate-fade-in">
            <header className="dashboard-header">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/products" className="action-btn"><ChevronLeft size={24} /></Link>
                    <h1 className="text-2xl font-bold">Edytuj Produkt</h1>
                </div>
            </header>
            <form className="glass-panel p-8 max-w-2xl mx-auto" onSubmit={handleSubmit}>
                {error && <div className="error-message mb-6">{error}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* Title */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label"><Tag size={14} /> Tytuł</label>
                        <input type="text" className="form-input" value={title} onChange={(e) => { setTitle(e.target.value); setSlug(createSlug(e.target.value)); }} required />
                    </div>
                    {/* Slug */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Slug (URL)</label>
                        <div className="flex items-center gap-2">
                            <span className="text-secondary text-sm">/shop/product/</span>
                            <input type="text" className="form-input" value={slug} onChange={(e) => setSlug(createSlug(e.target.value, true))} required />
                        </div>
                    </div>
                    {/* Description */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label"><FileText size={14} /> Opis</label>
                        <textarea className="form-input" style={{ minHeight: '90px', resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    {/* Price */}
                    <div className="form-group">
                        <label className="form-label">Cena (£)</label>
                        <input type="number" step="0.01" min="0" className="form-input" placeholder="9.99" value={price} onChange={(e) => setPrice(e.target.value)} required />
                    </div>
                    {/* Stock */}
                    <div className="form-group">
                        <label className="form-label">Stan magazynowy</label>
                        <input type="number" min="0" className="form-input" value={stock} onChange={(e) => setStock(e.target.value)} required />
                    </div>
                    {/* Category */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Kategoria</label>
                        <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value as any)} required>
                            <option value="muzyka">🎵 Muzyka</option>
                            <option value="bilety">🎟️ Bilety</option>
                            <option value="ubrania">👕 Ubrania</option>
                        </select>
                    </div>
                    {category === 'muzyka' && (
                        <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
                            <h3 style={{ gridColumn: 'span 2', fontSize: '1rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
                                Parametry Wydania Muzycznego & Stanu
                            </h3>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Nośnik fizyczny</label>
                                <select className="form-input" value={mediaType} onChange={(e) => setMediaType(e.target.value as any)}>
                                    <option value="">-- Wybierz nośnik (np. CD, DVD, Kaseta) --</option>
                                    <option value="CD">💿 CD</option>
                                    <option value="DVD">📀 DVD</option>
                                    <option value="Kaseta">📼 Kaseta</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Kategoria Muzyczna (Kraj/Nurt)</label>
                                <select className="form-input" value={musicCategory} onChange={(e) => setMusicCategory(e.target.value as any)} required>
                                    <option value="">-- Wybierz kategorię muzyczną --</option>
                                    <option value="PL">PL</option>
                                    <option value="UK">UK</option>
                                    <option value="USA">USA</option>
                                    <option value="RAP W UK">RAP W UK</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stan nośnika (Media)</label>
                                <select className="form-input" value={conditionMedia} onChange={(e) => setConditionMedia(e.target.value)}>
                                    <option value="">-- Wybierz stan nośnika --</option>
                                    <option value="Mint (M)">Mint (M) – Idealny</option>
                                    <option value="Near Mint (NM)">Near Mint (NM) – Prawie idealny</option>
                                    <option value="Very Good Plus (VG+)">Very Good Plus (VG+) – Bardzo dobry plus</option>
                                    <option value="Very Good (VG)">Very Good (VG) – Bardzo dobry</option>
                                    <option value="Good (G)">Good (G) – Dobry</option>
                                    <option value="Poor (P)">Poor (P) – Słaby</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stan okładki (Sleeve)</label>
                                <select className="form-input" value={conditionCover} onChange={(e) => setConditionCover(e.target.value)}>
                                    <option value="">-- Wybierz stan okładki --</option>
                                    <option value="Mint (M)">Mint (M) – Idealny</option>
                                    <option value="Near Mint (NM)">Near Mint (NM) – Prawie idealny</option>
                                    <option value="Very Good Plus (VG+)">Very Good Plus (VG+) – Bardzo dobry plus</option>
                                    <option value="Very Good (VG)">Very Good (VG) – Bardzo dobry</option>
                                    <option value="Good (G)">Good (G) – Dobry</option>
                                    <option value="Poor (P)">Poor (P) – Słaby</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Uwagi do stanu / wydania</label>
                                <textarea className="form-input" style={{ minHeight: '60px', resize: 'vertical' }} placeholder="np. Pudełko lekko pęknięte, zawiera autograf artysty, itp." value={conditionNotes} onChange={(e) => setConditionNotes(e.target.value)} />
                            </div>
                        </div>
                    )}
                    {/* Image */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Zdjęcie produktu</label>
                        {imagePreview ? (
                            <div className="image-preview-wrapper">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imagePreview} alt="Podgląd" className="image-preview" />
                                <button type="button" className="image-remove-btn" onClick={removeImage}>
                                    <X size={16} /> Usuń
                                </button>
                            </div>
                        ) : (
                            <label className="upload-zone" htmlFor="product-image">
                                <Upload size={28} strokeWidth={1.5} />
                                <span>Zmień zdjęcie</span>
                                <input id="product-image" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                            </label>
                        )}
                    </div>
                    {/* Active */}
                    <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input type="checkbox" id="is_active" className="form-checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                        <label htmlFor="is_active" className="form-label" style={{ marginBottom: 0 }}>Produkt aktywny (widoczny w sklepie)</label>
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <button type="submit" className="btn-primary flex-1 py-3" disabled={loading}>
                        {loading ? 'Zapisywanie...' : 'Zapisz Zmiany'}
                    </button>
                    <Link href="/dashboard/products" className="btn-secondary py-3 px-8">Anuluj</Link>
                </div>
            </form>
        </div>
    );
}
