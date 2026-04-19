import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Youtube, Instagram, Facebook, User, MapPin, Globe, Star } from "lucide-react";
import { RapperGallery } from "@/components/rapper-gallery";
import { ViewTracker } from "@/components/ViewTracker";
import "../rapper-detail.css";

interface RapperDetail {
    id: string;
    name: string;
    bio: string;
    category: string;
    social_yt?: string;
    social_fb?: string;
    social_ig?: string;
    images: string[];
    city_pl?: string;
    city_uk?: string;
    spotify_url?: string;
    website_url?: string;
    is_premium?: boolean;
    discography?: { year: string, title: string }[];
}

const renderSpotifyEmbed = (url?: string) => {
    if (!url || !url.includes('spotify.com')) return null;
    try {
        const match = url.match(/(artist|album|track|playlist)\/([a-zA-Z0-9]+)/);
        if (match) {
            const type = match[1];
            const id = match[2];
            return (
                <div className="spotify-embed-container" style={{ marginTop: '2rem', width: '100%' }}>
                    <iframe
                        style={{ borderRadius: '12px' }}
                        src={`https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                    ></iframe>
                </div>
            );
        }
    } catch (e) {}
    return null;
};

export const dynamic = 'force-dynamic';

export default async function RapperDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    let { data, error } = await supabase
        .from('rappers')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

    // Fallback search by ID if slug lookup fails
    if (!data) {
        const { data: idData } = await supabase
            .from('rappers')
            .select('*')
            .eq('id', slug)
            .maybeSingle();
        
        if (idData) {
            data = idData;
        }
    }

    if (!data) notFound();

    const entry = data as RapperDetail;

    return (
        <div className="rapper-detail-page animate-fade-in">
            <ViewTracker type="rappers" id={entry.id} />
            <div className="container">
                <Link href="/rappers" className="back-btn">
                    <ChevronLeft size={16} /> Powrót do Sceny
                </Link>

                <div className="rapper-detail-grid">
                    {/* INFO SIDE */}
                    <div className="rapper-detail-info">
                        <header className="rapper-detail-header">
                            <span className="rapper-category-badge" style={entry.is_premium ? { borderColor: 'rgba(234, 179, 8, 0.4)', color: '#eab308' } : {}}>
                                {entry.category || 'Raper/Skład'}
                            </span>
                            {(entry.city_pl || entry.city_uk) && (
                                <span className="rapper-city-badge text-secondary flex items-center gap-1 text-sm border border-[var(--border-color)] px-3 py-1 rounded-full bg-[rgba(255,255,255,0.03)]">
                                    <MapPin size={14} /> {entry.city_uk ? `${entry.city_uk} (UK)` : ''}{entry.city_pl && entry.city_uk ? ' / ' : ''}{entry.city_pl ? `${entry.city_pl} (PL)` : ''}
                                </span>
                            )}
                            {entry.is_premium && (
                                <span className="text-yellow-500 flex items-center gap-1 text-sm font-bold border border-yellow-500/30 px-3 py-1 rounded-full bg-yellow-500/10 tracking-wider">
                                    <Star size={14} /> PROMUJEMY
                                </span>
                            )}
                        </header>
                        <h1 className="rapper-detail-name" style={{ marginTop: '1rem', color: entry.is_premium ? '#eab308' : 'inherit' }}>{entry.name}</h1>

                        <div className="rapper-detail-bio">
                            {entry.bio || "Brak opisu dla tego twórcy."}
                        </div>

                        <div className="rapper-detail-socials">
                            {entry.social_yt && (
                                <a href={entry.social_yt} target="_blank" rel="noreferrer" className="social-link-item yt" aria-label="YouTube">
                                    <Youtube size={24} />
                                </a>
                            )}
                            {entry.social_ig && (
                                <a href={entry.social_ig} target="_blank" rel="noreferrer" className="social-link-item ig" aria-label="Instagram">
                                    <Instagram size={24} />
                                </a>
                            )}
                            {entry.social_fb && (
                                <a href={entry.social_fb} target="_blank" rel="noreferrer" className="social-link-item fb" aria-label="Facebook">
                                    <Facebook size={24} />
                                </a>
                            )}
                            {entry.website_url && (
                                <a href={entry.website_url} target="_blank" rel="noreferrer" className="social-link-item web" aria-label="Website" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <Globe size={24} />
                                </a>
                            )}
                        </div>

                        {renderSpotifyEmbed(entry.spotify_url)}

                        {entry.discography && entry.discography.length > 0 && (
                            <div className="rapper-discography">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Music size={20} className="text-yellow-500" /> DYSKOGRAFIA
                                </h3>
                                <div className="discography-grid">
                                    {entry.discography
                                        .sort((a, b) => b.year.localeCompare(a.year))
                                        .map((item, idx) => (
                                            <div key={idx} className="glass-panel discography-item">
                                                <span className="discography-year">
                                                    {item.year || '—'}
                                                </span>
                                                <span className="discography-title">{item.title}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}
                    </div>

                    {/* GALLERY SIDE */}
                    <div className="rapper-detail-gallery-col">
                        {entry.images && entry.images.length > 0 ? (
                            <RapperGallery images={entry.images} />
                        ) : (
                            <div className="glass-panel aspect-[3/4] flex flex-col items-center justify-center text-secondary opacity-30 gap-4">
                                <User size={64} strokeWidth={1} />
                                <span className="text-sm font-bold uppercase tracking-widest">Brak zdjęć</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
