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
    const [ticketEventTime, setTicketEventTime] = useState('');
    const [ticketVenue, setTicketVenue] = useState('');
    const [ticketVenueAddress, setTicketVenueAddress] = useState('');
    const [ticketCity, setTicketCity] = useState('');
    const [ticketType, setTicketType] = useState('');
    const [ticketAgeRestriction, setTicketAgeRestriction] = useState('');
    // Pule biletów (warianty)
    const [ticketTiers, setTicketTiers] = useState<Array<{ id: string; name: string; price: string; description: string }>>([]);
    
    // Parametry filmu & muzyki
    const [releaseYear, setReleaseYear] = useState('');
    const [movieFormat, setMovieFormat] = useState<'DVD' | 'Blu-ray' | 'VHS' | '4K UHD' | ''>('');
    const [movieCast, setMovieCast] = useState('');
    
    // Audio Languages (Multi-select + Custom)
    const [audioOptions, setAudioOptions] = useState<string[]>([
        'Polski (Lektor)', 'Polski (Dubbing)', 'Polski (Oryginał)',
        'Angielski', 'Francuski', 'Niemiecki', 'Włoski', 'Hiszpański', 'Japoński'
    ]);
    const [selectedAudioLangs, setSelectedAudioLangs] = useState<string[]>(['Angielski']);
    const [customAudioInput, setCustomAudioInput] = useState('');

    // Subtitles (Multi-select + Custom)
    const [subOptions, setSubOptions] = useState<string[]>([
        'Polskie', 'Angielskie', 'Francuskie', 'Niemieckie', 'Włoskie', 'Hiszpańskie', 'Brak napisów'
    ]);
    const [selectedSubtitles, setSelectedSubtitles] = useState<string[]>(['Polskie']);
    const [customSubInput, setCustomSubInput] = useState('');

    // Movie Genres (Multi-select + Custom)
    const [genreOptions, setGenreOptions] = useState<string[]>([
        'Dokument', 'Kryminał', 'Dramat', 'Sensacja', 'Gangsterski',
        'Biograficzny', 'Muzyczny', 'Akcja', 'Komedia', 'Horror', 'Sci-Fi'
    ]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>(['Dokument']);
    const [customGenreInput, setCustomGenreInput] = useState('');

    useEffect(() => {
        try {
            const savedAudio = JSON.parse(localStorage.getItem('rapwuk_custom_audio_languages') || '[]');
            if (Array.isArray(savedAudio) && savedAudio.length > 0) {
                setAudioOptions(prev => Array.from(new Set([...prev, ...savedAudio])));
            }
            const savedSubs = JSON.parse(localStorage.getItem('rapwuk_custom_subtitles') || '[]');
            if (Array.isArray(savedSubs) && savedSubs.length > 0) {
                setSubOptions(prev => Array.from(new Set([...prev, ...savedSubs])));
            }
            const savedGenres = JSON.parse(localStorage.getItem('rapwuk_custom_movie_genres') || '[]');
            if (Array.isArray(savedGenres) && savedGenres.length > 0) {
                setGenreOptions(prev => Array.from(new Set([...prev, ...savedGenres])));
            }
        } catch (e) {}
    }, []);

    const toggleAudioLang = (lang: string) => {
        setSelectedAudioLangs(prev => 
            prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
        );
    };

    const handleAddCustomAudio = () => {
        const trimmed = customAudioInput.trim();
        if (!trimmed) return;
        if (!audioOptions.includes(trimmed)) {
            const updated = [...audioOptions, trimmed];
            setAudioOptions(updated);
            try {
                const saved = JSON.parse(localStorage.getItem('rapwuk_custom_audio_languages') || '[]');
                if (!saved.includes(trimmed)) {
                    localStorage.setItem('rapwuk_custom_audio_languages', JSON.stringify([...saved, trimmed]));
                }
            } catch (e) {}
        }
        if (!selectedAudioLangs.includes(trimmed)) {
            setSelectedAudioLangs(prev => [...prev, trimmed]);
        }
        setCustomAudioInput('');
    };

    const toggleSubtitle = (sub: string) => {
        setSelectedSubtitles(prev => 
            prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
        );
    };

    const handleAddCustomSub = () => {
        const trimmed = customSubInput.trim();
        if (!trimmed) return;
        if (!subOptions.includes(trimmed)) {
            const updated = [...subOptions, trimmed];
            setSubOptions(updated);
            try {
                const saved = JSON.parse(localStorage.getItem('rapwuk_custom_subtitles') || '[]');
                if (!saved.includes(trimmed)) {
                    localStorage.setItem('rapwuk_custom_subtitles', JSON.stringify([...saved, trimmed]));
                }
            } catch (e) {}
        }
        if (!selectedSubtitles.includes(trimmed)) {
            setSelectedSubtitles(prev => [...prev, trimmed]);
        }
        setCustomSubInput('');
    };

    const toggleGenre = (genre: string) => {
        setSelectedGenres(prev => 
            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
        );
    };

    const handleAddCustomGenre = () => {
        const trimmed = customGenreInput.trim();
        if (!trimmed) return;
        if (!genreOptions.includes(trimmed)) {
            const updated = [...genreOptions, trimmed];
            setGenreOptions(updated);
            try {
                const saved = JSON.parse(localStorage.getItem('rapwuk_custom_movie_genres') || '[]');
                if (!saved.includes(trimmed)) {
                    localStorage.setItem('rapwuk_custom_movie_genres', JSON.stringify([...saved, trimmed]));
                }
            } catch (e) {}
        }
        if (!selectedGenres.includes(trimmed)) {
            setSelectedGenres(prev => [...prev, trimmed]);
        }
        setCustomGenreInput('');
    };
    
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
                setReleaseYear(data.release_year || '');
                setConditionMedia(data.condition_media || '');
                setConditionCover(data.condition_cover || '');
                setConditionNotes(data.condition_notes || '');
                setMusicCategory(data.music_category || '');
                setItemCondition(data.item_condition || '');
                setClothingSize(data.clothing_size || '');
                setClothingCondition(data.clothing_condition || '');
                if (data.ticket_event_date) {
                    const parts = data.ticket_event_date.split(' ');
                    if (parts.length > 1 && parts[0].includes('-') && parts[1].includes(':')) {
                        setTicketEventDate(parts[0]);
                        setTicketEventTime(parts[1]);
                    } else {
                        setTicketEventDate(data.ticket_event_date);
                        setTicketEventTime('');
                    }
                } else {
                    setTicketEventDate('');
                    setTicketEventTime('');
                }
                setTicketVenue(data.ticket_venue || '');
                setTicketVenueAddress(data.ticket_venue_address || '');
                setTicketCity(data.ticket_city || '');
                setTicketType(data.ticket_type || '');
                setTicketAgeRestriction(data.ticket_age_restriction || '');
                // Load ticket tiers
                if (data.ticket_tiers && Array.isArray(data.ticket_tiers)) {
                    setTicketTiers(data.ticket_tiers.map((t: any) => ({
                        id: t.id || `tier-${Math.random()}`,
                        name: t.name || '',
                        price: String(t.price ?? ''),
                        description: t.description || '',
                    })));
                }

                setMovieFormat(data.movie_format || '');
                setMovieCast(data.movie_cast || '');
                if (data.movie_language) {
                    const langs = data.movie_language.split(',').map((s: string) => s.trim()).filter(Boolean);
                    setSelectedAudioLangs(langs);
                    setAudioOptions(prev => Array.from(new Set([...prev, ...langs])));
                }
                if (data.movie_subtitles) {
                    const subs = data.movie_subtitles.split(',').map((s: string) => s.trim()).filter(Boolean);
                    setSelectedSubtitles(subs);
                    setSubOptions(prev => Array.from(new Set([...prev, ...subs])));
                }
                if (data.movie_genre) {
                    const genres = data.movie_genre.split(',').map((s: string) => s.trim()).filter(Boolean);
                    setSelectedGenres(genres);
                    setGenreOptions(prev => Array.from(new Set([...prev, ...genres])));
                }
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
            if (category === 'bilety' && (!ticketEventDate || !ticketEventTime || !ticketCity || !ticketVenue)) {
                throw new Error('Musisz podać datę, godzinę, miasto i klub/miejsce wydarzenia dla biletów.');
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

            const finalTicketEventDate = ticketEventDate && ticketEventTime ? `${ticketEventDate} ${ticketEventTime}` : null;

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
                    condition_cover: (category === 'muzyka' || category === 'filmy') && conditionCover ? conditionCover : null,
                    condition_notes: (category === 'muzyka' || category === 'filmy') && conditionNotes ? conditionNotes : null,
                    music_category: category === 'muzyka' ? musicCategory : null,
                    item_condition: (category === 'muzyka' || category === 'filmy') && itemCondition ? itemCondition : null,
                    clothing_size: category === 'ubrania' ? clothingSize : null,
                    clothing_condition: category === 'ubrania' ? clothingCondition : null,
                    ticket_event_date: category === 'bilety' ? finalTicketEventDate : null,
                    ticket_venue: category === 'bilety' ? ticketVenue : null,
                    ticket_venue_address: category === 'bilety' ? ticketVenueAddress : null,
                    ticket_city: category === 'bilety' ? ticketCity : null,
                    ticket_type: category === 'bilety' ? ticketType : null,
                    ticket_age_restriction: category === 'bilety' ? ticketAgeRestriction : null,
                    ticket_tiers: category === 'bilety' && ticketTiers.length > 0
                        ? ticketTiers.map(t => ({ ...t, price: parseFloat(t.price) || 0 }))
                        : null,
                    movie_format: category === 'filmy' ? movieFormat : null,
                    movie_language: category === 'filmy' && selectedAudioLangs.length > 0 ? selectedAudioLangs.join(', ') : null,
                    movie_subtitles: category === 'filmy' && selectedSubtitles.length > 0 ? selectedSubtitles.join(', ') : null,
                    movie_cast: category === 'filmy' && movieCast ? movieCast : null,
                    movie_genre: category === 'filmy' && selectedGenres.length > 0 ? selectedGenres.join(', ') : null,
                    release_year: (category === 'muzyka' || category === 'filmy') && releaseYear ? releaseYear : null,
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
                                <label className="form-label">Rok wydania / produkcji</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="np. 1994 lub 2023"
                                    value={releaseYear}
                                    onChange={(e) => setReleaseYear(e.target.value)}
                                />
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
                            <div className="form-group">
                                <label className="form-label">Data wydarzenia (Kalendarz)</label>
                                <input type="date" className="form-input" value={ticketEventDate} onChange={(e) => setTicketEventDate(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Godzina wydarzenia</label>
                                <input type="time" className="form-input" value={ticketEventTime} onChange={(e) => setTicketEventTime(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Miasto</label>
                                <input type="text" className="form-input" placeholder="np. Londyn" value={ticketCity} onChange={(e) => setTicketCity(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Klub / Miejsce (Venue)</label>
                                <input type="text" className="form-input" placeholder="np. O2 Academy Islington" value={ticketVenue} onChange={(e) => setTicketVenue(e.target.value)} required />
                            </div>

                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Adres Klubu / Miejsca (Opcjonalnie)</label>
                                <input type="text" className="form-input" placeholder="np. 16 Parkfield St, London N1 0PS" value={ticketVenueAddress} onChange={(e) => setTicketVenueAddress(e.target.value)} />
                            </div>

                            {/* Pule biletów – edytor */}
                            <div style={{ gridColumn: 'span 2', marginTop: '0.5rem', padding: '1.25rem', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>🎟️ Pule biletów (warianty)</h4>
                                    <button
                                        type="button"
                                        style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: '6px', border: '1px solid #f59e0b', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', cursor: 'pointer', fontWeight: 600 }}
                                        onClick={() => setTicketTiers([
                                            { id: 'early-bird', name: 'Early Bird', price: '', description: 'Pierwsza pula – ograniczona liczba!' },
                                            { id: 'general-admission', name: 'General Admission', price: '', description: '' },
                                            { id: 'vip', name: 'VIP', price: '', description: 'Strefa VIP + Polish Buffet' },
                                            { id: 'polish-buffet', name: 'Polish Buffet', price: '', description: 'Bilet z dostępem do polskiego bufetu' },
                                        ])}
                                    >
                                        ⚡ Załaduj szablon
                                    </button>
                                </div>

                                {ticketTiers.length === 0 && (
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                                        Brak wariantów – bilet będzie miał jedną cenę (z pola Cena powyżej). Kliknij ⚡ Załaduj szablon lub dodaj warianty ręcznie.
                                    </p>
                                )}

                                {ticketTiers.map((tier, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'end' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nazwa</label>
                                            <input
                                                className="form-input"
                                                value={tier.name}
                                                onChange={e => setTicketTiers(prev => prev.map((t, i) => i === idx ? { ...t, name: e.target.value } : t))}
                                                placeholder="np. VIP"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Cena (£)</label>
                                            <input
                                                className="form-input"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={tier.price}
                                                onChange={e => setTicketTiers(prev => prev.map((t, i) => i === idx ? { ...t, price: e.target.value } : t))}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Opis (opcjonalnie)</label>
                                            <input
                                                className="form-input"
                                                value={tier.description}
                                                onChange={e => setTicketTiers(prev => prev.map((t, i) => i === idx ? { ...t, description: e.target.value } : t))}
                                                placeholder="np. Strefa VIP + wejście bez kolejki"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,80,80,0.4)', background: 'rgba(255,80,80,0.08)', color: '#f87171', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', lineHeight: 1 }}
                                            onClick={() => setTicketTiers(prev => prev.filter((_, i) => i !== idx))}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    style={{ marginTop: ticketTiers.length > 0 ? '0.25rem' : '0.5rem', fontSize: '0.82rem', padding: '7px 14px', borderRadius: '6px', border: '1px dashed rgba(255,255,255,0.2)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                    onClick={() => setTicketTiers(prev => [...prev, { id: `tier-${Date.now()}`, name: '', price: '', description: '' }])}
                                >
                                    + Dodaj wariant
                                </button>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Wymóg wiekowy</label>
                                <select className="form-input" value={ticketAgeRestriction} onChange={(e) => setTicketAgeRestriction(e.target.value)}>
                                    <option value="">-- Wybierz wymóg wiekowy --</option>
                                    <option value="18+">🔞 18+</option>
                                    <option value="16+">🔞 16+</option>
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
                                <label className="form-label">Rok wydania / produkcji</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="np. 1994 lub 2023"
                                    value={releaseYear}
                                    onChange={(e) => setReleaseYear(e.target.value)}
                                />
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
                                <label className="form-label">Stan nośnika / płyty (Media)</label>
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

                            <div className="form-group">
                                <label className="form-label">Stan okładki / poligrafii (Sleeve)</label>
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
                                <label className="form-label">Obsada (Występujący aktorzy)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="np. Robert De Niro, Al Pacino, Val Kilmer"
                                    value={movieCast}
                                    onChange={(e) => setMovieCast(e.target.value)}
                                />
                            </div>

                            {/* Języki audio (Multi-select) */}
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Język audio (Wybierz jeden lub kilka)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                    {audioOptions.map((lang) => {
                                        const isSelected = selectedAudioLangs.includes(lang);
                                        return (
                                            <button
                                                key={lang}
                                                type="button"
                                                onClick={() => toggleAudioLang(lang)}
                                                style={{
                                                    padding: '5px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.82rem',
                                                    fontWeight: 600,
                                                    border: isSelected ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                                                    background: isSelected ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.03)',
                                                    color: isSelected ? '#f59e0b' : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease',
                                                }}
                                            >
                                                {isSelected ? '✓ ' : '+ '}{lang}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        style={{ fontSize: '0.85rem' }}
                                        placeholder="Wpisz własny język audio (np. Szwedzki) i kliknij Dodaj"
                                        value={customAudioInput}
                                        onChange={(e) => setCustomAudioInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomAudio(); } }}
                                    />
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', padding: '0 1rem' }}
                                        onClick={handleAddCustomAudio}
                                    >
                                        + Dodaj język
                                    </button>
                                </div>
                            </div>

                            {/* Napisy (Multi-select) */}
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Napisy (Wybierz jedne lub kilka)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                    {subOptions.map((sub) => {
                                        const isSelected = selectedSubtitles.includes(sub);
                                        return (
                                            <button
                                                key={sub}
                                                type="button"
                                                onClick={() => toggleSubtitle(sub)}
                                                style={{
                                                    padding: '5px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.82rem',
                                                    fontWeight: 600,
                                                    border: isSelected ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                                                    background: isSelected ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.03)',
                                                    color: isSelected ? '#f59e0b' : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease',
                                                }}
                                            >
                                                {isSelected ? '✓ ' : '+ '}{sub}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        style={{ fontSize: '0.85rem' }}
                                        placeholder="Wpisz własne napisy (np. Japońskie) i kliknij Dodaj"
                                        value={customSubInput}
                                        onChange={(e) => setCustomSubInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSub(); } }}
                                    />
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', padding: '0 1rem' }}
                                        onClick={handleAddCustomSub}
                                    >
                                        + Dodaj napisy
                                    </button>
                                </div>
                            </div>

                            {/* Gatunek filmu (Multi-select) */}
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Gatunek filmu (Wybierz jeden lub kilka)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                    {genreOptions.map((genre) => {
                                        const isSelected = selectedGenres.includes(genre);
                                        return (
                                            <button
                                                key={genre}
                                                type="button"
                                                onClick={() => toggleGenre(genre)}
                                                style={{
                                                    padding: '5px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.82rem',
                                                    fontWeight: 600,
                                                    border: isSelected ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                                                    background: isSelected ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.03)',
                                                    color: isSelected ? '#f59e0b' : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease',
                                                }}
                                            >
                                                {isSelected ? '✓ ' : '+ '}{genre}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        style={{ fontSize: '0.85rem' }}
                                        placeholder="Wpisz własny gatunek (np. Thriller) i kliknij Dodaj"
                                        value={customGenreInput}
                                        onChange={(e) => setCustomGenreInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomGenre(); } }}
                                    />
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', padding: '0 1rem' }}
                                        onClick={handleAddCustomGenre}
                                    >
                                        + Dodaj gatunek
                                    </button>
                                </div>
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
