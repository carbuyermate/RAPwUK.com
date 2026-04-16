'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Newspaper, Tag, FileText, Image as ImageIcon, ChevronLeft, Upload, X, Youtube } from 'lucide-react';
import Link from 'next/link';
import { RichTextEditor } from '@/components/RichTextEditor';
import '../dashboard.css';

const CATEGORIES = ['News', 'Teledysk', 'Nowość', 'Sponsorowane', 'Muzyka', 'Event', 'Wywiad', 'Premiera', 'Relacja', 'Konkurs', 'Publicystyka', 'Recenzja', 'Inne'];

export default function AddNewsPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
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

        let image_url: string | null = null;

        // 1. Upload zdjęcia do Supabase Storage (jeśli wybrano)
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
        }

        // 2. Zapisz news do bazy
        setUploadProgress('Zapisuję news...');
        const { error: insertError } = await supabase
            .from('news')
            .insert([{ title, content, category, image_url, youtube_url: youtubeUrl || null, is_auto_generated: false }]);

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
            setUploadProgress('');
            return;
        }

        router.push('/dashboard');
        router.refresh();
    };

    return (
        <div className="dashboard-container container animate-fade-in">
            <header className="dashboard-header">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="action-btn">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold">Dodaj News</h1>
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

                    {/* YouTube URL */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <Youtube size={16} /> Link do YouTube (opcjonalnie)
                        </label>
                        <input
                            type="url"
                            className="form-input"
                            placeholder="np. https://www.youtube.com/watch?v=..."
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
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
                                <button type="button" className="image-remove-btn" onClick={removeImage}>
                                    <X size={18} /> Usuń zdjęcie
                                </button>
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
                        {loading ? 'Publikowanie...' : 'Opublikuj News'}
                    </button>
                    <Link href="/dashboard" className="btn-secondary py-3 px-8">
                        Anuluj
                    </Link>
                </div>
            </form>
        </div>
    );
}
