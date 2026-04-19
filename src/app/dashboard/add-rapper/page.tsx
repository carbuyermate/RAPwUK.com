'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Tag, FileText, ChevronLeft, Upload, X, MapPin, Youtube, Instagram, Facebook, Globe, Music, Star } from 'lucide-react';
import Link from 'next/link';
import { createSlug, shortenSlug } from '@/lib/utils';
import { ImageCropper } from '@/components/ImageCropper';
import '../dashboard.css';

export default function AddRapperPage() {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [manualSlug, setManualSlug] = useState(false);
    const [category, setCategory] = useState('Raper/Skład');
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
    const [showCropper, setShowCropper] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError('Zdjęcie nie może przekraczać 5MB.');
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setShowCropper(true); // Open cropper immediately
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

        // 1. Upload zdjęcia (do tablicy images, na razie jedno dla uproszczenia formularza)
        if (imageFile) {
            setUploadProgress('Wysyłam zdjęcie...');
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `rappers/${Date.now()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(fileName, imageFile, { upsert: false });

            if (uploadError) {
                setError(`Błąd uploadu zdjęcia: ${uploadError.message}`);
                setLoading(false);
                setUploadProgress('');
                return;
            }

            const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
            imageUrls.push(publicUrl);
        }

        // 2. Zapisz rapera do bazy
        setUploadProgress('Zapisuję profil...');
        const { error: insertError } = await supabase
            .from('rappers')
            .insert([{ 
                name, 
                slug: slug || createSlug(name),
                category,
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
            }]);

        if (insertError) {
            if (insertError.code === '23505' || insertError.message?.includes('duplicate key value')) {
                setError('Taki przyjazny URL (Slug) już istnieje w bazie (np. dla innego artysty). Dodaj na końcu cyfrę lub inny znak (np. kowalski-2), aby był unikalny.');
            } else {
                setError(insertError.message);
            }
            setLoading(false);
            setUploadProgress('');
            return;
        }

        router.push('/dashboard');
        router.refresh(); // Odświeża dane na serwerze
    };

    return (
        <div className="dashboard-container container animate-fade-in">
            <header className="dashboard-header">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="action-btn">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold">Dodaj Rapera</h1>
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
                            onChange={(e) => {
                                setName(e.target.value);
                                if (!manualSlug) setSlug(createSlug(e.target.value));
                            }}
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
                                placeholder="nazwa-wykopu"
                                value={slug}
                                onChange={(e) => {
                                    setSlug(createSlug(e.target.value, true));
                                    setManualSlug(true);
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <Tag size={16} /> Kategoria na Scenie
                        </label>
                        <select
                            className="form-input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="Raper/Skład">Raper/Skład</option>
                            <option value="Studio nagraniowe">Studio nagraniowe</option>
                            <option value="Label">Label</option>
                            <option value="DJ">DJ</option>
                            <option value="Producent">Producent</option>
                            <option value="DJ/Producent">DJ / Producent (Oba)</option>
                            <option value="Produkcja wideo">Produkcja wideo</option>
                            <option value="Fotograf">Fotograf</option>
                        </select>
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
                        {(['Raper/Skład', 'DJ', 'Producent', 'DJ/Producent'].includes(category)) && (
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
                        {(['Raper/Skład', 'DJ', 'Producent', 'DJ/Producent'].includes(category)) && (
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
                        {loading ? 'Zapisywanie...' : 'Dodaj Rapera'}
                    </button>
                    <Link href="/dashboard" className="btn-secondary py-3 px-8">
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
