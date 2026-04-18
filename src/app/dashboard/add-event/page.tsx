'use client';
// Build version: 1.0.1 (Force refresh)

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Tag, FileText, Link as LinkIcon, ChevronLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { createSlug } from '@/lib/utils';
import '../dashboard.css';

export default function AddEventPage() {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [manualSlug, setManualSlug] = useState(false);
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [venue, setVenue] = useState('');
    const [city, setCity] = useState('');
    const [ticketUrl, setTicketUrl] = useState('');
    const [isPremium, setIsPremium] = useState(false);
    
    // Image state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const getSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            } else {
                router.push('/login');
            }
        };
        getSession();
    }, [router]);

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
        if (!userId) return;

        setLoading(true);
        setError(null);

        let finalImageUrl = null;

        try {
            // 1. Upload plakat (jeśli wybrano)
            if (imageFile) {
                setUploadProgress('Wysyłam plakat...');
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `events/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(fileName, imageFile, { upsert: false });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
                finalImageUrl = publicUrl;
            }

            // 2. Zapisz wydarzenie
            setUploadProgress('Zapisuję wydarzenie...');
            const savedTime = time || '00:00';
            const eventDateTime = `${date}T${savedTime}:00Z`;

            const { error: insertError } = await supabase
                .from('events')
                .insert([
                    {
                        title,
                        description,
                        event_date: eventDateTime,
                        venue,
                        city,
                        is_premium: isPremium,
                        promoter_id: userId,
                        image_url: finalImageUrl,
                        slug: slug || `${createSlug(title)}-${Date.now()}`
                    }
                ]);

            if (insertError) throw insertError;

            router.push('/dashboard/events');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd podczas dodawania wydarzenia');
        } finally {
            setLoading(false);
            setUploadProgress('');
        }
    };

    return (
        <div className="dashboard-container container animate-fade-in">
            <header className="dashboard-header">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="action-btn">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold">Dodaj Nowe Wydarzenie</h1>
                </div>
            </header>

            <form className="glass-panel p-8 max-w-2xl mx-auto" onSubmit={handleSubmit}>
                {error && <div className="error-message mb-6">{error}</div>}

                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label flex items-center gap-2">
                            <Tag size={16} /> Tytuł Wydarzenia
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="np. O.S.T.R. w Londynie"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (!manualSlug) setSlug(createSlug(e.target.value));
                            }}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label flex items-center gap-2">
                            <Tag size={16} /> Przyjazny URL (Slug)
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-secondary text-sm">/events/</span>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="nazwa-imprezy"
                                value={slug}
                                onChange={(e) => {
                                    setSlug(createSlug(e.target.value));
                                    setManualSlug(true);
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label flex items-center gap-2">
                            <FileText size={16} /> Opis
                        </label>
                        <textarea
                            className="form-input"
                            style={{ minHeight: '100px', resize: 'vertical' }}
                            placeholder="Krótki opis wydarzenia, kto wystąpi, czego się spodziewać..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <Calendar size={16} /> Data
                        </label>
                        <input
                            type="date"
                            className="form-input"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <Calendar size={16} /> Godzina
                        </label>
                        <div className="text-secondary text-xs mb-1" style={{ opacity: 0.6 }}>(Opcjonalnie. Jeśli nie znasz, zostaw puste)</div>
                        <input
                            type="time"
                            className="form-input"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <MapPin size={16} /> Miasto
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="np. Londyn"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                            <MapPin size={16} /> Miejsce (Venue)
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="np. O2 Academy"
                            value={venue}
                            onChange={(e) => setVenue(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label flex items-center gap-2">
                            <LinkIcon size={16} /> Link do biletów
                        </label>
                        <input
                            type="url"
                            className="form-input"
                            placeholder="https://bilety.pl/..."
                            value={ticketUrl}
                            onChange={(e) => setTicketUrl(e.target.value)}
                        />
                    </div>

                    {/* Zdjęcie (Plakat) */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Plakat / Zdjęcie wydarzenia</label>

                        {imagePreview ? (
                            <div className="image-preview-wrapper">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imagePreview} alt="Podgląd plakatu" className="image-preview" />
                                <button type="button" className="image-remove-btn" onClick={removeImage}>
                                    <X size={18} /> Usuń plakat
                                </button>
                            </div>
                        ) : (
                            <label className="upload-zone" htmlFor="image-upload">
                                <Upload size={32} strokeWidth={1.5} />
                                <span>Dodaj plakat imprezy</span>
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

                    <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                        <input
                            type="checkbox"
                            id="premium"
                            className="form-checkbox"
                            checked={isPremium}
                            onChange={(e) => setIsPremium(e.target.checked)}
                        />
                        <label htmlFor="premium" className="form-label" style={{ marginBottom: 0 }}>
                            Oznacz jako wydarzenie PREMIUM (wyróżnione)
                        </label>
                    </div>
                </div>

                {uploadProgress && (
                    <p className="text-secondary text-sm mt-4 text-center">{uploadProgress}</p>
                )}

                <div className="mt-8 flex gap-4">
                    <button
                        type="submit"
                        className="btn-primary flex-1 py-3"
                        disabled={loading}
                    >
                        {loading ? 'Zapisywanie...' : 'Opublikuj Wydarzenie'}
                    </button>
                    <Link href="/dashboard" className="btn-secondary py-3 px-8">
                        Anuluj
                    </Link>
                </div>
            </form>
        </div>
    );
}
