'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Tag, FileText, ChevronLeft, Upload, X, Instagram, Youtube, Facebook, MapPin, Globe, Music, Star } from 'lucide-react';
import Link from 'next/link';
import { createSlug, shortenSlug } from '@/lib/utils';
import { ImageCropper } from '@/components/ImageCropper';
import '../../dashboard.css';

export default function EditRapperPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [categories, setCategories] = useState<string[]>([]);

    const CATEGORY_OPTIONS = [
        'DJ',
        'Fotograf',
        'Label',
        'Mix/mastering',
        'Producent',
        'Produkcja wideo',
        'Promotor',
        'Raper',
        'Skład',
        'Studio nagraniowe'
    ];

    const handleCategoryChange = (cat: string) => {
        setCategories(prev => 
            prev.includes(cat) 
                ? prev.filter(c => c !== cat)
                : [...prev, cat]
        );
    };
    const [bio, setBio] = useState('');
    const [socialYt, setSocialYt] = useState('');
    const [socialIg, setSocialIg] = useState('');
    const [socialFb, setSocialFb] = useState('');
    const [cityPl, setCityPl] = useState('');
    const [cityUk, setCityUk] = useState('');
    const [spotifyUrl, setSpotifyUrl] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [isPremium, setIsPremium] = useState(false);
    const [discography, setDiscography] = useState<{ year: string, title: string }[]>([]);
    const [newDiscYear, setNewDiscYear] = useState('');
    const [newDiscTitle, setNewDiscTitle] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [oldImageUrls, setOldImageUrls] = useState<string[]>([]);
    const [showCropper, setShowCropper] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploadProgress, setUploadProgress] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            const { data, error } = await supabase.from('rappers').select('*').eq('id', id).single();
            if (error) {
                setError("Nie znaleziono profilu rapera!");
            } else if (data) {
                setName(data.name);
                setSlug(data.slug || '');
                if (data.category) setCategories(data.category.split(',').map((c: string) => c.trim()));
                setBio(data.bio || '');
                setSocialYt(data.social_yt || '');
                setSocialIg(data.social_ig || '');
                setSocialFb(data.social_fb || '');
                setCityPl(data.city_pl || '');
                setCityUk(data.city_uk || '');
                setSpotifyUrl(data.spotify_url || '');
                setWebsiteUrl(data.website_url || '');
                setIsPremium(data.is_premium || false);
                setDiscography(data.discography || []);
                
                if (data.images && data.images.length > 0) {
                    setImagePreview(data.images[0]);
                    setOldImageUrls(data.images);
                }
            }
            setFetching(false);
        }
        loadData();
    }, [id]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError('Zdjęcie nie może przekraczać 5MB.');
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setShowCropper(true);
        setError(null);
    };

    const handleCropComplete = (croppedFile: File) => {
        setImageFile(croppedFile);
        setImagePreview(URL.createObjectURL(croppedFile));
        setShowCropper(false);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const addDiscographyItem = () => {
        if (!newDiscYear || !newDiscTitle) return;
        setDiscography(prev => [...prev, { year: newDiscYear, title: newDiscTitle }]);
        setNewDiscYear('');
        setNewDiscTitle('');
    };

    const removeDiscographyItem = (index: number) => {
        setDiscography(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let imageUrls: string[] = [];

        // 1. Upload zdjęcia (do tablicy images, na razie jedno z podglądu lub nowe)
        if (imageFile) {
            setUploadProgress('Wysyłam zdjęcie...');
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `rappers/${Date.now()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(fileName, imageFile, { upsert: false });

            if (uploadError) {
                setError(`Błąd uploadu: ${uploadError.message}`);
                setLoading(false);
                setUploadProgress('');
                return;
            }

            const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
            imageUrls.push(publicUrl);
        } else if (imagePreview) {
            // Keep existing
            imageUrls.push(imagePreview);
        }

        // 2. Aktualizacja Rapera (PATCH)
        setUploadProgress('Zapisuję profil...');
        const { error: updateError } = await supabase
            .from('rappers')
            .update({ 
                name, 
                slug: slug || createSlug(name),
                category: categories.join(', '),
                bio, 
                social_yt: socialYt || null, 
                social_ig: socialIg || null, 
                social_fb: socialFb || null, 
                city_pl: cityPl || null,
                city_uk: cityUk || null,
                spotify_url: spotifyUrl || null,
                website_url: websiteUrl || null,
                is_premium: isPremium,
                discography: discography,
                images: imageUrls 
            })
            .eq('id', id);

        if (updateError) {
            setError(updateError.message);
            setLoading(false);
            setUploadProgress('');
            return;
        }

        // Usuń stare zdjęcia jeśli zostały podmienione lub usunięte
        for (const oldUrl of oldImageUrls) {
            if (!imageUrls.includes(oldUrl)) {
                const filePath = oldUrl.split('/uploads/')[1];
                if (filePath) {
                    await supabase.storage.from('uploads').remove([filePath]);
                }
            }
        }

        router.push('/dashboard/rappers');
        router.refresh();
    };

    if (fetching) {
        return <div className="dashboard-container container mt-12 text-center">Ładowanie edytora...</div>;
    }

    return (
        <div className="dashboard-container container animate-fade-in">
            <header className="dashboard-header">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/rappers" className="action-btn">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold">Edytuj Rapera</h1>
                </div>
            </header>

            <form className="glass-panel p-8 max-w-2xl mx-auto" onSubmit={handleSubmit}>
                {error && <div className="error-message mb-6">{error}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <Tag size={16} /> Ksywa / Nazwa
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="np. Central Cee"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <Tag size={16} /> Przyjazny URL (Slug)
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-secondary text-sm">/rappers/</span>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="moja-ksywa"
                                value={slug}
                                onChange={(e) => setSlug(createSlug(e.target.value, true))}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setSlug(shortenSlug(slug))}
                                className="btn-secondary text-xs px-3 py-2 whitespace-nowrap"
                                title="Skróć usuwając łączniki i słabiej znaczące słowa"
                            >
                                ✂️ Skróć
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label flex items-center gap-2 mb-3">
                            <Tag size={16} /> Kategorie na Scenie (Zaznacz minimum jedną)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {CATEGORY_OPTIONS.map(cat => (
                                <label key={cat} className="flex items-center gap-2 cursor-pointer p-2 glass-panel hover:bg-white/5 transition-colors rounded-lg border border-white/5">
                                    <input
                                        type="checkbox"
                                        checked={categories.includes(cat)}
                                        onChange={() => handleCategoryChange(cat)}
                                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                                    />
                                    <span className="text-sm">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <FileText size={16} /> Krótki opis (Bio)
                        </label>
                        <textarea
                            className="form-input"
                            style={{ minHeight: '120px', resize: 'vertical' }}
                            placeholder="Kilka słów o twórcy..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label flex items-center gap-2">
                                <Instagram size={16} /> Instagram (URL)
                            </label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://instagram.com/..."
                                value={socialIg}
                                onChange={(e) => setSocialIg(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label flex items-center gap-2">
                                <Youtube size={16} /> YouTube (URL)
                            </label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://youtube.com/..."
                                value={socialYt}
                                onChange={(e) => setSocialYt(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label flex items-center gap-2">
                                <Facebook size={16} /> Facebook (URL)
                            </label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://facebook.com/..."
                                value={socialFb}
                                onChange={(e) => setSocialFb(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        {categories.some(c => ['Raper', 'Skład', 'DJ', 'Producent'].includes(c)) && (
                            <div className="form-group">
                                <label className="form-label flex items-center gap-2">
                                    <MapPin size={16} /> Miasto PL (Opcjonalnie)
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="np. Warszawa"
                                    value={cityPl}
                                    onChange={(e) => setCityPl(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label flex items-center gap-2">
                                <MapPin size={16} /> Miasto UK (Opcjonalnie)
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="np. Londyn"
                                value={cityUk}
                                onChange={(e) => setCityUk(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                        {categories.some(c => ['Raper', 'Skład', 'DJ', 'Producent'].includes(c)) && (
                            <div className="form-group">
                                <label className="form-label flex items-center gap-2">
                                    <Music size={16} /> Spotify (URL - Opcjonalnie)
                                </label>
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://open.spotify.com/artist/..."
                                    value={spotifyUrl}
                                    onChange={(e) => setSpotifyUrl(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label flex items-center gap-2">
                                <Globe size={16} /> Strona WWW (Opcjonalnie)
                            </label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://..."
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group mt-4 p-4 glass-panel border border-yellow-500/30 bg-yellow-500/5 rounded-xl" style={{ borderColor: 'rgba(234, 179, 8, 0.3)', background: 'rgba(234, 179, 8, 0.05)' }}>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isPremium}
                                onChange={(e) => setIsPremium(e.target.checked)}
                                style={{ width: '20px', height: '20px', accentColor: '#eab308' }}
                            />
                            <div className="flex flex-col">
                                <span className="font-bold flex items-center gap-2" style={{ color: '#eab308' }}>
                                    <Star size={18} /> Promowany profil (Premium)
                                </span>
                                <span className="text-secondary text-sm">Zaznacz, aby kafel został przypięty na górze listy Sceny i oznaczony ekskluzywnym obramowaniem.</span>
                            </div>
                        </label>
                    </div>

                    {/* Discography Section */}
                    <div className="form-group mt-6">
                        <label className="form-label flex items-center gap-2 mb-4">
                            <Music size={16} /> Dyskografia (Rok i Tytuł)
                        </label>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '10px', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Rok"
                                value={newDiscYear}
                                onChange={(e) => setNewDiscYear(e.target.value)}
                            />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Tytuł albumu / singla"
                                value={newDiscTitle}
                                onChange={(e) => setNewDiscTitle(e.target.value)}
                            />
                            <button 
                                type="button" 
                                className="btn-secondary"
                                onClick={addDiscographyItem}
                                style={{ padding: '0 15px' }}
                            >
                                Dodaj
                            </button>
                        </div>

                        {discography.length > 0 && (
                            <div className="discography-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {discography
                                    .sort((a, b) => b.year.localeCompare(a.year))
                                    .map((item, index) => (
                                        <div key={index} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px' }}>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                <span className="text-yellow-500 font-bold" style={{ fontSize: '0.85rem' }}>{item.year || '—'}</span>
                                                <span style={{ fontWeight: 600 }}>{item.title}</span>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => removeDiscographyItem(index)}
                                                className="text-secondary hover:text-red-500 transition-colors"
                                                title="Usuń"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))
                                }
                            </div>
                        )}
                    </div>

                    <div className="form-group mt-4">
                        <label className="form-label">Zdjęcie główne</label>

                        {imagePreview ? (
                            <div className="image-preview-wrapper">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imagePreview} alt="Podgląd" className="image-preview" />
                                <div className="flex gap-2">
                                    <button type="button" className="btn-secondary text-sm" onClick={() => setShowCropper(true)}>
                                        ✂️ Dostosuj kadr
                                    </button>
                                    <button type="button" className="image-remove-btn" onClick={removeImage}>
                                        <X size={18} /> Usuń
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="upload-zone" htmlFor="image-upload">
                                <Upload size={32} strokeWidth={1.5} />
                                <span>Dodaj zdjęcie rapera</span>
                                <span className="upload-hint">Zalecany proporcja pionowa</span>
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>

                </div>

                {uploadProgress && (
                    <p className="text-secondary text-sm mt-4">{uploadProgress}</p>
                )}

                <div className="mt-8 flex gap-4">
                    <button
                        type="submit"
                        className="btn-primary flex-1 py-3"
                        disabled={loading}
                    >
                        {loading ? 'Zapisywanie...' : 'Zapisz Zmiany'}
                    </button>
                    <Link href="/dashboard/rappers" className="btn-secondary py-3 px-8">
                        Anuluj
                    </Link>
                </div>
            </form>

            {showCropper && imagePreview && (
                <ImageCropper
                    image={imagePreview}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setShowCropper(false)}
                    aspectRatio={3 / 4}
                />
            )}
        </div>
    );
}
