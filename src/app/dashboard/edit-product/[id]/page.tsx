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
    const [purchasePrice, setPurchasePrice] = useState('0');
    const [category, setCategory] = useState<'muzyka' | 'bilety' | 'ubrania' | 'filmy'>('muzyka');
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
    const [musicCategory, setMusicCategory] = useState<'RAP PL' | 'RAP UK' | 'RAP USA' | 'POLSKI RAP W UK' | 'ELEKTRONIKA' | ''>('');
    const [itemCondition, setItemCondition] = useState<'Nowa w folii' | 'Nowa' | 'Używana' | ''>('');
    
    // Parametry ubrania
    const [clothingSize, setClothingSize] = useState('');
    const [clothingCondition, setClothingCondition] = useState<'Nowa' | 'Używana' | ''>('');
    
    // Parametry biletów / eventu
    const [ticketEventDate, setTicketEventDate] = useState('');
    const [ticketVenue, setTicketVenue] = useState('');
    const [ticketCity, setTicketCity] = useState('');
    const [ticketType, setTicketType] = useState('');
    const [ticketAgeRestriction, setTicketAgeRestriction] = useState('');
    
    // Parametry filmu (DVD / Blu-ray)
    const [movieFormat, setMovieFormat] = useState<'DVD' | 'Blu-ray' | 'VHS' | '4K UHD' | ''>('');
    const [movieLanguage, setMovieLanguage] = useState('');
    const [movieSubtitles, setMovieSubtitles] = useState('');
    
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
                setPurchasePrice((data.purchase_price || 0).toString());
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
                setItemCondition(data.item_condition || '');
                setClothingSize(data.clothing_size || '');
                setClothingCondition(data.clothing_condition || '');
                setTicketEventDate(data.ticket_event_date || '');
                setTicketVenue(data.ticket_venue || '');
                setTicketCity(data.ticket_city || '');
                setTicketType(data.ticket_type || '');
                setTicketAgeRestriction(data.ticket_age_restriction || '');
                setMovieFormat(data.movie_format || '');
                setMovieLanguage(data.movie_language || '');
                setMovieSubtitles(data.movie_subtitles || '');
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
                throw new Error('Musisz wybrać kategorię muzyczną (RAP PL, RAP UK, RAP USA, POLSKI RAP W UK lub ELEKTRONIKA) dla produktu z kategorii Muzyka.');
            }
            if (category === 'muzyka' && !itemCondition) {
                throw new Error('Musisz wybrać stan ogólny produktu (Nowa w folii, Nowa lub Używana).');
            }
            if (category === 'ubrania' && !clothingSize) {
                throw new Error('Musisz wybrać rozmiar ubrania.');
            }
            if (category === 'ubrania' && !clothingCondition) {
                throw new Error('Musisz wybrać stan ubrania (Nowe lub Używane).');
            }
            if (category === 'bilety' && (!ticketEventDate || !ticketCity || !ticketVenue)) {
                throw new Error('Musisz podać datę, miasto i klub/miejsce wydarzenia dla biletów.');
            }
            if (category === 'filmy' && !movieFormat) {
                throw new Error('Musisz wybrać format filmu (DVD, Blu-ray, VHS lub 4K UHD).');
            }
            if (category === 'filmy' && !itemCondition) {
                throw new Error('Musisz wybrać stan ogólny filmu.');
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
                    purchase_price: parseFloat(purchasePrice) || 0.00,
                    category,
                    stock: parseInt(stock),
                    is_active: isActive,
                    image_url,
                    media_type: category === 'muzyka' && mediaType ? mediaType : null,
                    condition_media: (category === 'muzyka' || category === 'filmy') && conditionMedia ? conditionMedia : null,
                    condition_cover: category === 'muzyka' && conditionCover ? conditionCover : null,
                    condition_notes: (category === 'muzyka' || category === 'filmy') && conditionNotes ? conditionNotes : null,
                    music_category: category === 'muzyka' ? musicCategory : null,
                    item_condition: (category === 'muzyka' || category === 'filmy') && itemCondition ? itemCondition : null,
                    clothing_size: category === 'ubrania' ? clothingSize : null,
                    clothing_condition: category === 'ubrania' ? clothingCondition : null,
                    ticket_event_date: category === 'bilety' ? ticketEventDate : null,
                    ticket_venue: category === 'bilety' ? ticketVenue : null,
                    ticket_city: category === 'bilety' ? ticketCity : null,
                    ticket_type: category === 'bilety' ? ticketType : null,
                    ticket_age_restriction: category === 'bilety' ? ticketAgeRestriction : null,
                    movie_format: category === 'filmy' ? movieFormat : null,
                    movie_language: category === 'filmy' ? movieLanguage : null,
                    movie_subtitles: category === 'filmy' ? movieSubtitles : null,
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

             router.push('/dashboard/store?tab=products');
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
                     <Link href="/dashboard/store?tab=products" className="action-btn"><ChevronLeft size={24} /></Link>
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
                        <label className="form-label">Cena sprzedaży (£)</label>
                        <input type="number" step="0.01" min="0" className="form-input" placeholder="9.99" value={price} onChange={(e) => setPrice(e.target.value)} required />
                    </div>
                    {/* Purchase Price */}
                    <div className="form-group">
                        <label className="form-label">Cena zakupu / Koszt (£)</label>
                        <input type="number" step="0.01" min="0" className="form-input" placeholder="0.00" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
                    </div>
                    {/* Stock */}
                    <div className="form-group">
                        <label className="form-label">Stan magazynowy</label>
                        <input type="number" min="0" className="form-input" value={stock} onChange={(e) => setStock(e.target.value)} required />
                    </div>
                    {/* Category */}
                    <div className="form-group">
                        <label className="form-label">Kategoria</label>
                        <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value as any)} required>
                            <option value="muzyka">🎵 Muzyka</option>
                            <option value="bilety">🎟️ Bilety</option>
                            <option value="ubrania">👕 Ubrania</option>
                            <option value="filmy">🎬 Filmy</option>
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
                                    <option value="RAP PL">RAP PL</option>
                                    <option value="RAP UK">RAP UK</option>
                                    <option value="RAP USA">RAP USA</option>
                                    <option value="POLSKI RAP W UK">POLSKI RAP W UK</option>
                                    <option value="ELEKTRONIKA">ELEKTRONIKA</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Stan ogólny produktu</label>
                                <select className="form-input" value={itemCondition} onChange={(e) => setItemCondition(e.target.value as any)} required>
                                    <option value="">-- Wybierz stan ogólny produktu --</option>
                                    <option value="Nowa w folii">🆕 Nowa w folii</option>
                                    <option value="Nowa">✨ Nowa</option>
                                    <option value="Używana">💿 Używana</option>
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
                    {category === 'ubrania' && (
                        <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
                            <h3 style={{ gridColumn: 'span 2', fontSize: '1rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
                                👕 Parametry Ubrania
                            </h3>
                            <div className="form-group">
                                <label className="form-label">Rozmiar</label>
                                <select className="form-input" value={clothingSize} onChange={(e) => setClothingSize(e.target.value)} required>
                                    <option value="">-- Wybierz rozmiar --</option>
                                    <option value="XS">XS</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="XXL">XXL</option>
                                    <option value="XXXL">XXXL</option>
                                    <option value="One Size">One Size (Jeden rozmiar)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stan produktu</label>
                                <select className="form-input" value={clothingCondition} onChange={(e) => setClothingCondition(e.target.value as any)} required>
                                    <option value="">-- Wybierz stan --</option>
                                    <option value="Nowa">✨ Nowa</option>
                                    <option value="Używana">👕 Używana</option>
                                </select>
                            </div>
                        </div>
                    )}
                    {category === 'bilety' && (
                        <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
                            <h3 style={{ gridColumn: 'span 2', fontSize: '1rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
                                🎟️ Szczegóły Wydarzenia & Biletów
                            </h3>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Data i godzina wydarzenia</label>
                                <input type="text" className="form-input" placeholder="np. 15 Listopada 2026, godz. 20:00" value={ticketEventDate} onChange={(e) => setTicketEventDate(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Miasto</label>
                                <input type="text" className="form-input" placeholder="np. Londyn" value={ticketCity} onChange={(e) => setTicketCity(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Klub / Miejsce (Venue)</label>
                                <input type="text" className="form-input" placeholder="np. O2 Academy Islington" value={ticketVenue} onChange={(e) => setTicketVenue(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Rodzaj / Pula biletu</label>
                                <select className="form-input" value={ticketType} onChange={(e) => setTicketType(e.target.value)}>
                                    <option value="">-- Wybierz rodzaj --</option>
                                    <option value="Bilet Standardowy">🎟️ Bilet Standardowy</option>
                                    <option value="Bilet VIP">⭐ Bilet VIP</option>
                                    <option value="I Pula (Early Bird)">🔥 I Pula (Early Bird)</option>
                                    <option value="II Pula">🎫 II Pula</option>
                                    <option value="III Pula (Ostatnie bilety)">⏳ III Pula (Ostatnie bilety)</option>
                                    <option value="Meet & Greet">🤝 Meet & Greet</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Wymóg wiekowy</label>
                                <select className="form-input" value={ticketAgeRestriction} onChange={(e) => setTicketAgeRestriction(e.target.value)}>
                                    <option value="">-- Wybierz wymóg wiekowy --</option>
                                    <option value="18+">🔞 18+</option>
                                    <option value="16+ (z opiekunem)">🔞 16+ (z opiekunem)</option>
                                    <option value="14+ (z opiekunem)">🔞 14+ (z opiekunem)</option>
                                    <option value="Bez ograniczeń">👨‍👩‍👧 Bez ograniczeń wiekowych</option>
                                </select>
                            </div>
                        </div>
                    )}
                    {category === 'filmy' && (
                        <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
                            <h3 style={{ gridColumn: 'span 2', fontSize: '1rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
                                🎬 Parametry Wydania Filmowego & Stanu
                            </h3>
                            <div className="form-group">
                                <label className="form-label">Format / Nośnik</label>
                                <select className="form-input" value={movieFormat} onChange={(e) => setMovieFormat(e.target.value as any)} required>
                                    <option value="">-- Wybierz format --</option>
                                    <option value="DVD">💿 DVD</option>
                                    <option value="Blu-ray">📀 Blu-ray</option>
                                    <option value="VHS">📼 VHS</option>
                                    <option value="4K UHD">✨ 4K UHD</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stan ogólny filmu</label>
                                <select className="form-input" value={itemCondition} onChange={(e) => setItemCondition(e.target.value as any)} required>
                                    <option value="">-- Wybierz stan ogólny --</option>
                                    <option value="Nowa w folii">🆕 Nowy w folii</option>
                                    <option value="Nowa">✨ Nowy</option>
                                    <option value="Używana">💿 Używany</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Język audio (Lektor / Dubbing)</label>
                                <select className="form-input" value={movieLanguage} onChange={(e) => setMovieLanguage(e.target.value)}>
                                    <option value="">-- Wybierz język audio --</option>
                                    <option value="Polski (Lektor)">🇵🇱 Polski (Lektor)</option>
                                    <option value="Polski (Dubbing)">🇵🇱 Polski (Dubbing)</option>
                                    <option value="Polski (Oryginał)">🇵🇱 Polski (Oryginał)</option>
                                    <option value="Angielski">🇬🇧 Angielski</option>
                                    <option value="Polski + Angielski">🇵🇱🇬🇧 Polski + Angielski</option>
                                    <option value="Inny (Więcej w opisie)">🌐 Inny / Więcej w opisie</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Napisy</label>
                                <select className="form-input" value={movieSubtitles} onChange={(e) => setMovieSubtitles(e.target.value)}>
                                    <option value="">-- Wybierz napisy --</option>
                                    <option value="Polskie">🇵🇱 Polskie</option>
                                    <option value="Angielskie">🇬🇧 Angielskie</option>
                                    <option value="Polskie i Angielskie">🇵🇱🇬🇧 Polskie i Angielskie</option>
                                    <option value="Brak napisów">❌ Brak napisów</option>
                                    <option value="Inne">🌐 Inne</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Stan nośnika / płyty</label>
                                <select className="form-input" value={conditionMedia} onChange={(e) => setConditionMedia(e.target.value)}>
                                    <option value="">-- Wybierz stan płyty --</option>
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
                                <textarea className="form-input" style={{ minHeight: '60px', resize: 'vertical' }} placeholder="np. Wydanie 2-płytowe, ryski bez wpływu na odtwarzanie, książeczka w zestawie" value={conditionNotes} onChange={(e) => setConditionNotes(e.target.value)} />
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
