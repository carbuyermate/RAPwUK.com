'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Newspaper, Tag, FileText, Image as ImageIcon, ChevronLeft, Upload, X, Youtube } from 'lucide-react';
import Link from 'next/link';
import { RichTextEditor } from '@/components/RichTextEditor';
import { ImageCropper } from '@/components/ImageCropper';
import { createSlug, shortenSlug } from '@/lib/utils';
import '../../dashboard.css';
import { use } from 'react';

const CATEGORIES = ['News', 'Teledysk', 'Nowość', 'Sponsorowane', 'Muzyka', 'Event', 'Wywiad', 'Premiera', 'Relacja', 'Konkurs', 'Publicystyka', 'Recenzja', 'Inne'];

export default function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [youtubeUrl2, setYoutubeUrl2] = useState('');
    const [youtubeUrl3, setYoutubeUrl3] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploadProgress, setUploadProgress] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            const { data, error } = await supabase.from('news').select('*').eq('id', id).single();
            if (error) {
                setError("Nie znaleziono wpisu!");
            } else if (data) {
                setTitle(data.title);
                setSlug(data.slug || '');
                setContent(data.content || '');
                setCategory(data.category);
                setYoutubeUrl(data.youtube_url || '');
                setYoutubeUrl2(data.youtube_url_2 || '');
                setYoutubeUrl3(data.youtube_url_3 || '');
                if (data.image_url) {
                    setImagePreview(data.image_url);
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
        setShowCropper(true); // Open cropper for new image
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let image_url: string | null = imagePreview && !imageFile ? imagePreview : null;

        // 1. Upload zdjęcia do Supabase Storage
        if (imageFile) {
            setUploadProgress('Wysyłam zdjęcie...');
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `news/${Date.now()}.${fileExt}`;

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
            image_url = publicUrl;
        } else if (!imagePreview) {
            image_url = null; // Removed image
        }

        // 2. Aktualizacja (PATCH) w bazie
        setUploadProgress('Zapisuję zmiany...');
        const { error: updateError } = await supabase
            .from('news')
            .update({ 
                title, 
                slug: slug || createSlug(title),
                content, 
                category, 
                image_url, 
                youtube_url: youtubeUrl || null,
                youtube_url_2: youtubeUrl2 || null,
                youtube_url_3: youtubeUrl3 || null 
            })
            .eq('id', id);

        if (updateError) {
            setError(updateError.message);
            setLoading(false);
            setUploadProgress('');
            return;
        }

        router.push('/dashboard/news');
        router.refresh();
    };

    if (fetching) {
        return <div className="dashboard-container container mt-12 text-center">Ładowanie edytora...</div>;
    }

    return (
        <div className="dashboard-container container animate-fade-in">
            <header className="dashboard-header">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/news" className="action-btn">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold">Edytuj News</h1>
                </div>
            </header>

            <form className="glass-panel p-8 max-w-2xl mx-auto" onSubmit={handleSubmit}>
                {error && <div className="error-message mb-6">{error}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Tytuł */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <Tag size={16} /> Tytuł
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="np. O.S.T.R. zapowiada nowy album"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Slug / Przyjazny URL */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <Tag size={16} /> Przyjazny URL (Slug)
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-secondary text-sm">/news/</span>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="moj-tytul-newsa"
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

                    {/* Kategoria */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <Tag size={16} /> Kategoria
                        </label>
                        <select
                            className="form-input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Wybierz kategorię...</option>
                            {CATEGORIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Treść */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <FileText size={16} /> Treść newsa
                        </label>
                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Pełna treść newsa. Użyj paska narzędzi do formatowania tekstu."
                        />
                    </div>

                    {/* YouTube URL 1 */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <Youtube size={16} /> Link do YouTube 1 (opcjonalnie)
                        </label>
                        <input
                            type="url"
                            className="form-input"
                            placeholder="np. https://www.youtube.com/watch?v=..."
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                        />
                    </div>

                    {/* YouTube URL 2 */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <Youtube size={16} /> Link do YouTube 2 (opcjonalnie)
                        </label>
                        <input
                            type="url"
                            className="form-input"
                            placeholder="np. https://www.youtube.com/watch?v=..."
                            value={youtubeUrl2}
                            onChange={(e) => setYoutubeUrl2(e.target.value)}
                        />
                    </div>

                    {/* YouTube URL 3 */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <Youtube size={16} /> Link do YouTube 3 (opcjonalnie)
                        </label>
                        <input
                            type="url"
                            className="form-input"
                            placeholder="np. https://www.youtube.com/watch?v=..."
                            value={youtubeUrl3}
                            onChange={(e) => setYoutubeUrl3(e.target.value)}
                        />
                    </div>

                    {/* Zdjęcie */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <ImageIcon size={16} /> Zdjęcie główne
                        </label>

                        {imagePreview ? (
                            <div className="image-preview-wrapper">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imagePreview} alt="Podgląd" className="image-preview" />
                                <div className="flex gap-2">
                                    <button type="button" className="btn-secondary text-sm" onClick={() => setShowCropper(true)}>
                                        ✂️ Dostosuj kadr
                                    </button>
                                    <button type="button" className="image-remove-btn" onClick={removeImage}>
                                        <X size={18} /> Usuń zdjęcie
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="upload-zone" htmlFor="image-upload">
                                <Upload size={32} strokeWidth={1.5} />
                                <span>Kliknij lub przeciągnij zdjęcie</span>
                                <span className="upload-hint">PNG, JPG, WEBP · max 5MB</span>
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
                    <Link href="/dashboard/news" className="btn-secondary py-3 px-8">
                        Anuluj
                    </Link>
                </div>
            </form>

            {showCropper && imagePreview && (
                <ImageCropper
                    image={imagePreview}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setShowCropper(false)}
                />
            )}
        </div>
    );
}
