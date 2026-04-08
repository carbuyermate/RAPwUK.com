'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Tag, FileText, Link as LinkIcon, ChevronLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import '../../dashboard.css';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [title, setTitle] = useState('');
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
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const getSessionAndData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            } else {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
            if (error) {
                setError("Nie znaleziono wydarzenia!");
            } else if (data) {
                setTitle(data.title);
                setDescription(data.description || '');
                if (data.event_date) {
                    const evtDate = new Date(data.event_date);
                    // Handle offset to get correct local date/time
                    const offset = evtDate.getTimezoneOffset();
                    const localDate = new Date(evtDate.getTime() - (offset * 60 * 1000));
                    setDate(localDate.toISOString().split('T')[0]);
                    setTime(localDate.toISOString().substring(11, 16));
                }
                setVenue(data.venue);
                setCity(data.city);
                setTicketUrl(data.ticket_url || '');
                setIsPremium(data.is_premium);
                if (data.image_url) {
                    setImagePreview(data.image_url);
                }
            }
            setFetching(false);
        };
        getSessionAndData();
    }, [id, router]);

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

        let finalImageUrl = imagePreview && !imageFile ? imagePreview : null;

        try {
            // 1. Upload plakat (jeśli wybrano nowy plik)
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
            } else if (!imagePreview) {
                finalImageUrl = null; // Removed existing image
            }

            // 2. Aktualizacja wydarzenia
            setUploadProgress('Zapisuję zmiany...');
            const eventDateTime = `${date}T${time}:00Z`;

            const { error: updateError } = await supabase
                .from('events')
                .update({
                    title,
                    description,
                    event_date: eventDateTime,
                    venue,
                    city,
                    ticket_url: ticketUrl,
                    is_premium: isPremium,
                    image_url: finalImageUrl
                })
                .eq('id', id);

            if (updateError) throw updateError;

            router.push('/dashboard/events');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd podczas edycji wydarzenia');
        } finally {
            setLoading(false);
            setUploadProgress('');
        }
    };

    if (fetching) {
        return <div className="dashboard-container container mt-12 text-center">Ładowanie edytora...</div>;
    }

    return (
        <div className="dashboard-container container animate-fade-in">
            <header className="dashboard-header">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/events" className="action-btn">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold">Edytuj Wydarzenie</h1>
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
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
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
                        <input
                            type="time"
                            className="form-input"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
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
                                    <X size={18} /> Usuń/Zmień plakat
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
                        {loading ? 'Zapisywanie...' : 'Zapisz Zmiany'}
                    </button>
                    <Link href="/dashboard/events" className="btn-secondary py-3 px-8">
                        Anuluj
                    </Link>
                </div>
            </form>
        </div>
    );
}
