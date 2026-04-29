'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Tag, FileText, Image as ImageIcon, ChevronLeft, Upload, X, Youtube, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { RichTextEditor } from '@/components/RichTextEditor';
import { ImageCropper } from '@/components/ImageCropper';
import { createSlug, shortenSlug } from '@/lib/utils';
import '../dashboard.css';

// Tags + their available regions
const TAG_CONFIG: Record<string, string[]> = {
    'VIDEO':        ['PL', 'UK'],
    'TRACK':        ['PL', 'UK'],
    'EVENT':        ['PL', 'UK', 'USA'],
    'PREMIERA':     ['PL', 'UK'],
    'NEWS':         [],
    'SPONSOROWANE': [],
    'WYWIAD':       [],
    'RELACJA':      [],
    'KONKURS':      [],
    'PUBLICYSTYKA': [],
    'RECENZJA':     [],
    'INNE':         [],
};

interface Rapper {
    id: string;
    name: string;
}

export default function AddNewsPage() {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [manualSlug, setManualSlug] = useState(false);
    const [content, setContent] = useState('');

    // New multi-tag system
    const [tags, setTags] = useState<string[]>([]);
    const [regions, setRegions] = useState<string[]>([]);
    const [artistIds, setArtistIds] = useState<string[]>([]);
    const [artistSearch, setArtistSearch] = useState('');
    const [rappers, setRappers] = useState<Rapper[]>([]);
    const artistInputRef = useRef<HTMLInputElement>(null);

    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [youtubeUrl2, setYoutubeUrl2] = useState('');
    const [youtubeUrl3, setYoutubeUrl3] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Fetch rappers for artist tagging
    useEffect(() => {
        async function fetchRappers() {
            const { data } = await supabase.from('rappers').select('id, name').order('name');
            if (data) setRappers(data);
        }
        fetchRappers();
    }, []);

    // Available regions based on selected tags
    const availableRegions = Array.from(new Set(
        tags.flatMap(t => TAG_CONFIG[t] || [])
    ));

    const toggleTag = (tag: string) => {
        setTags(prev => {
            const next = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag];
            // Remove regions that are no longer available
            const nextAvailable = Array.from(new Set(next.flatMap(t => TAG_CONFIG[t] || [])));
            setRegions(r => r.filter(re => nextAvailable.includes(re)));
            return next;
        });
    };

    const toggleRegion = (region: string) => {
        setRegions(prev =>
            prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
        );
    };

    const toggleArtist = (id: string) => {
        setArtistIds(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const filteredRappers = rappers.filter(r =>
        r.name.toLowerCase().includes(artistSearch.toLowerCase())
    );

    const selectedRappers = rappers.filter(r => artistIds.includes(r.id));

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

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);
        if (!manualSlug) setSlug(createSlug(val));
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

        if (imageFile) {
            setUploadProgress('Wysyłam zdjęcie...');
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `news/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
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

        setUploadProgress('Zapisuję news...');
        const { error: insertError } = await supabase
            .from('news')
            .insert([{
                title,
                slug: slug || createSlug(title),
                content,
                category: tags[0] || '',   // backward compat
                tags,                        // new multi-tag
                regions,                     // new regions
                artist_ids: artistIds,       // new artist tags
                image_url,
                youtube_url: youtubeUrl || null,
                youtube_url_2: youtubeUrl2 || null,
                youtube_url_3: youtubeUrl3 || null,
                is_auto_generated: false,
            }]);

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
                            <Tag size={16} /> TYTUŁ
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="np. O.S.T.R. zapowiada nowy album"
                            value={title}
                            onChange={handleTitleChange}
                            required
                        />
                    </div>

                    {/* Slug */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <Tag size={16} /> PRZYJAZNY URL (SLUG)
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-secondary text-sm">/news/</span>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="moj-tytul-newsa"
                                value={slug}
                                onChange={(e) => { setSlug(createSlug(e.target.value, true)); setManualSlug(true); }}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setSlug(shortenSlug(slug))}
                                className="btn-secondary text-xs px-3 py-2 whitespace-nowrap"
                            >
                                ✂️ Skróć
                            </button>
                        </div>
                    </div>

                    {/* Tagi (multi-select pills) */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <Tag size={16} /> TAGI / KATEGORIE
                        </label>
                        <div className="news-tag-pills">
                            {Object.keys(TAG_CONFIG).map(tag => (
                                <button
                                    type="button"
                                    key={tag}
                                    className={`news-tag-pill ${tags.includes(tag) ? 'news-tag-pill--active' : ''}`}
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Regiony (pojawia się gdy wybrany tag ma regiony) */}
                    {availableRegions.length > 0 && (
                        <div className="region-section">
                            <label className="form-label">REGION</label>
                            <div className="news-tag-pills">
                                {availableRegions.map(region => (
                                    <button
                                        type="button"
                                        key={region}
                                        className={`news-tag-pill news-tag-pill--region ${regions.includes(region) ? 'news-tag-pill--active' : ''}`}
                                        onClick={() => toggleRegion(region)}
                                    >
                                        {region}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Artyści */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <Users size={16} /> ARTYŚCI (OPCJONALNIE)
                        </label>

                        {selectedRappers.length > 0 && (
                            <div className="news-tag-pills" style={{ marginBottom: '8px' }}>
                                {selectedRappers.map(r => (
                                    <button
                                        type="button"
                                        key={r.id}
                                        className="news-tag-pill news-tag-pill--artist news-tag-pill--active"
                                        onClick={() => toggleArtist(r.id)}
                                    >
                                        {r.name} <X size={11} />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="artist-search-wrapper">
                            <Search size={14} className="artist-search-icon" />
                            <input
                                ref={artistInputRef}
                                type="text"
                                className="form-input"
                                placeholder="Szukaj artysty..."
                                value={artistSearch}
                                onChange={e => setArtistSearch(e.target.value)}
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>

                        {artistSearch && (
                            <div className="artist-dropdown">
                                {filteredRappers.length === 0 ? (
                                    <div className="artist-dropdown-empty">Brak wyników</div>
                                ) : filteredRappers.slice(0, 8).map(r => (
                                    <button
                                        type="button"
                                        key={r.id}
                                        className={`artist-dropdown-item ${artistIds.includes(r.id) ? 'selected' : ''}`}
                                        onClick={() => { toggleArtist(r.id); setArtistSearch(''); }}
                                    >
                                        {r.name}
                                        {artistIds.includes(r.id) && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>✓ DODANY</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Treść */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <FileText size={16} /> TREŚĆ NEWSA
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
                            <Youtube size={16} /> LINK DO YOUTUBE 1 (OPCJONALNIE)
                        </label>
                        <input type="url" className="form-input" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
                    </div>

                    {/* YouTube URL 2 */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <Youtube size={16} /> LINK DO YOUTUBE 2 (OPCJONALNIE)
                        </label>
                        <input type="url" className="form-input" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl2} onChange={(e) => setYoutubeUrl2(e.target.value)} />
                    </div>

                    {/* YouTube URL 3 */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <Youtube size={16} /> LINK DO YOUTUBE 3 (OPCJONALNIE)
                        </label>
                        <input type="url" className="form-input" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl3} onChange={(e) => setYoutubeUrl3(e.target.value)} />
                    </div>

                    {/* Zdjęcie */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <ImageIcon size={16} /> ZDJĘCIE GŁÓWNE
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
                    <button type="submit" className="btn-primary flex-1 py-3" disabled={loading}>
                        {loading ? 'Publikowanie...' : 'Opublikuj News'}
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
                />
            )}
        </div>
    );
}
