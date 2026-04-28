import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Youtube, Instagram, Facebook, User, MapPin, Globe, Star, Music } from "lucide-react";
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

const BASE_URL = 'https://rapwuk.com';

function toAbsoluteUrl(url: string | undefined | null): string {
  if (!url) return `${BASE_URL}/logo.jpg`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let { data } = await supabase
    .from('rappers')
    .select('id, name, bio, category, images, city_pl, city_uk')
    .eq('slug', slug)
    .maybeSingle();

  if (!data) {
    const { data: idData } = await supabase
      .from('rappers')
      .select('id, name, bio, category, images, city_pl, city_uk')
      .eq('id', slug)
      .maybeSingle();
    data = idData;
  }

  if (!data) return {};

  const rapper = data as Pick<RapperDetail, 'name' | 'bio' | 'category' | 'images' | 'city_pl' | 'city_uk'>;
  const location = [rapper.city_uk ? `${rapper.city_uk} (UK)` : '', rapper.city_pl ? `${rapper.city_pl} (PL)` : ''].filter(Boolean).join(' / ');
  const description = rapper.bio
    ? rapper.bio.slice(0, 160)
    : `${rapper.name} — ${rapper.category || 'Polski raper w UK'}${location ? ` | ${location}` : ''}. Sprawdź profil na RAPwUK.com`;

  const ogImage = toAbsoluteUrl(rapper.images?.[0]);
  const pageUrl = `${BASE_URL}/rappers/${slug}`;

  return {
    metadataBase: new URL(BASE_URL),
    title: `${rapper.name} | RAPwUK.com`,
    description,
    openGraph: {
      title: `${rapper.name}${location ? ` — ${location}` : ''} | RAPwUK.com`,
      description,
      url: pageUrl,
      siteName: 'RAPwUK.com',
      images: [{ url: ogImage, width: 1200, height: 630, alt: rapper.name }],
      locale: 'pl_PL',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@RAPwUK',
      creator: '@RAPwUK',
      title: `${rapper.name} | RAPwUK.com`,
      description,
      images: [ogImage],
    },
  };
}

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
                        <header className="mb-6">
                            <h1 className="rapper-detail-name" style={{ marginBottom: '1.2rem', color: entry.is_premium ? '#D4AF37' : 'inherit', textShadow: entry.is_premium ? '0 0 15px rgba(212, 175, 55, 0.4)' : 'none' }}>
                                {entry.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3">
                                {entry.category ? entry.category.split(',').map(c => c.trim()).map(cat => (
                                    <span key={cat} className="rapper-category-badge m-0" style={entry.is_premium ? { borderColor: 'rgba(212, 175, 55, 0.4)', color: '#D4AF37' } : {}}>
                                        {cat}
                                    </span>
                                )) : (
                                    <span className="rapper-category-badge m-0" style={entry.is_premium ? { borderColor: 'rgba(212, 175, 55, 0.4)', color: '#D4AF37' } : {}}>
                                        Raper
                                    </span>
                                )}
                                {(entry.city_pl || entry.city_uk) && (
                                    <span className="rapper-city-badge text-secondary flex items-center gap-1.5 text-sm border border-[var(--border-color)] px-4 py-1.5 rounded-full bg-[rgba(255,255,255,0.03)] font-medium">
                                        <MapPin size={14} className="opacity-70" /> {entry.city_uk ? `${entry.city_uk} (UK)` : ''}{entry.city_pl && entry.city_uk ? ' / ' : ''}{entry.city_pl ? `${entry.city_pl} (PL)` : ''}
                                    </span>
                                )}
                                {entry.is_premium && (
                                    <span className="flex items-center gap-1.5 text-sm font-bold border px-4 py-1.5 rounded-full tracking-wider" style={{ color: '#D4AF37', borderColor: 'rgba(212, 175, 55, 0.3)', background: 'linear-gradient(145deg, rgba(30,30,30,0.8) 0%, rgba(10,10,10,0.9) 100%)', boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)' }}>
                                        <Star size={14} className="fill-current" /> PATRONUJEMY
                                    </span>
                                )}
                            </div>
                        </header>

                        {(entry.social_yt || entry.social_ig || entry.social_fb || entry.website_url) && (
                            <div className="rapper-detail-socials mb-8 pb-8 border-b border-[var(--border-color)]">
                                {entry.social_yt && (
                                    <a href={entry.social_yt} target="_blank" rel="noreferrer" className="social-link-item yt" aria-label="YouTube">
                                        <Youtube size={22} />
                                    </a>
                                )}
                                {entry.social_ig && (
                                    <a href={entry.social_ig} target="_blank" rel="noreferrer" className="social-link-item ig" aria-label="Instagram">
                                        <Instagram size={22} />
                                    </a>
                                )}
                                {entry.social_fb && (
                                    <a href={entry.social_fb} target="_blank" rel="noreferrer" className="social-link-item fb" aria-label="Facebook">
                                        <Facebook size={22} />
                                    </a>
                                )}
                                {entry.website_url && (
                                    <a href={entry.website_url} target="_blank" rel="noreferrer" className="social-link-item web" aria-label="Website" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <Globe size={22} />
                                    </a>
                                )}
                            </div>
                        )}

                        <div className="rapper-detail-bio mb-10">
                            {entry.bio || "Brak opisu dla tego twórcy."}
                        </div>

                        {renderSpotifyEmbed(entry.spotify_url)}

                        {entry.discography && entry.discography.length > 0 && (
                            <div className="rapper-discography mt-8">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Music size={20} className="text-yellow-500" style={entry.is_premium ? {color: '#D4AF37'} : {}} /> DYSKOGRAFIA
                                </h3>
                                <div className="discography-grid">
                                    {entry.discography
                                        .sort((a, b) => b.year.localeCompare(a.year))
                                        .map((item, idx) => (
                                            <div key={idx} className="glass-panel discography-item">
                                                <span className="discography-year" style={entry.is_premium ? {color: '#D4AF37'} : {}}>
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
