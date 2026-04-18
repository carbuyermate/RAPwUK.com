'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Tag, FileText, ChevronLeft, Upload, X, Instagram, Youtube, Facebook, MapPin } from 'lucide-react';
import Link from 'next/link';
import { createSlug } from '@/lib/utils';
import '../../dashboard.css';

export default function EditRapperPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [category, setCategory] = useState('Raper/Skład');
    const [bio, setBio] = useState('');
    const [socialYt, setSocialYt] = useState('');
    const [socialIg, setSocialIg] = useState('');
    const [socialFb, setSocialFb] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
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
                if (data.category) setCategory(data.category);
                setBio(data.bio || '');
                setSocialYt(data.social_yt || '');
                setSocialIg(data.social_ig || '');
                setSocialFb(data.social_fb || '');
                
                if (data.images && data.images.length > 0) {
                    setImagePreview(data.images[0]);
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
        setError(null);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
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
                category,
                bio, 
                social_yt: socialYt || null, 
                social_ig: socialIg || null, 
                social_fb: socialFb || null, 
                images: imageUrls 
            })
            .eq('id', id);

        if (updateError) {
            setError(updateError.message);
            setLoading(false);
            setUploadProgress('');
            return;
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
                                placeholder="nazwa-wykonawcy"
                                value={slug}
                                onChange={(e) => setSlug(createSlug(e.target.value))}
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
                            <option value="Zarówno DJ jak i Producent">DJ / Producent (Oba)</option>
                            <option value="Tylko DJ">Tylko DJ</option>
                            <option value="Tylko Producent">Tylko Producent</option>
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

                    <div className="form-group mt-4">
                        <label className="form-label">Zdjęcie główne</label>

                        {imagePreview ? (
                            <div className="image-preview-wrapper">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imagePreview} alt="Podgląd" className="image-preview" />
                                <button type="button" className="image-remove-btn" onClick={removeImage}>
                                    <X size={18} /> Usuń
                                </button>
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
        </div>
    );
}
