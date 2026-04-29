import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Youtube, Instagram, Facebook, User, MapPin, Globe, Star, Music, Clock, Newspaper, Share2, Mic2, AlignLeft } from "lucide-react";
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
                <div className="spotify-embed-container">
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

function timeAgo(dateStr: string) {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffD = Math.floor(diffH / 24);
    if (diffH < 1) return 'Przed chwilą';
    if (diffH < 24) return `${diffH}h temu`;
    if (diffD < 7) return `${diffD} dni temu`;
    return new Date(dateStr).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
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

    // Fetch news tagged with this artist
    const { data: taggedNews } = await supabase
        .from('news')
        .select('id, slug, title, category, tags, image_url, created_at')
        .contains('artist_ids', [entry.id])
        .order('created_at', { ascending: false })
        .limit(20);

    return (
        <div className="rapper-detail-page animate-fade-in">
            <ViewTracker type="rappers" id={entry.id} />
            <div className="container">
                <Link href="/rappers" className="back-btn">
                    <ChevronLeft size={16} /> POWRÓT
                </Link>

                <div className="rapper-detail-grid">
                    {/* INFO SIDE */}
                    <div className="rapper-detail-info">

                        {/* Name */}
                        <h1 className="rapper-detail-name" style={entry.is_premium ? { color: '#38bdf8', textShadow: '0 0 20px rgba(56,189,248,0.3)' } : {}}>
                            {entry.name}
                        </h1>

                        {/* Meta row — all badges in one line */}
                        <div className="rapper-detail-meta">
                            {entry.category ? entry.category.split(',').map(c => c.trim()).map(cat => (
                                <span key={cat} className="rapper-category-badge" style={entry.is_premium ? { borderColor: 'rgba(56,189,248,0.35)', color: '#38bdf8' } : {}}>
                                    {cat}
                                </span>
                            )) : (
                                <span className="rapper-category-badge">Raper</span>
                            )}

                            {(entry.city_pl || entry.city_uk) && (
                                <>
                                    <span className="rapper-meta-sep">·</span>
                                    <span className="rapper-city-tag">
                                        <MapPin size={13} />
                                        {[entry.city_uk ? `${entry.city_uk} (UK)` : '', entry.city_pl ? `${entry.city_pl} (PL)` : ''].filter(Boolean).join(' / ')}
                                    </span>
                                </>
                            )}

                            {entry.is_premium && (
                                <>
                                    <span className="rapper-meta-sep">·</span>
                                    <span className="rapper-patron-tag">
                                        <Star size={11} className="fill-current" /> Patronujemy
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Social icons */}
                        {(entry.social_yt || entry.social_ig || entry.social_fb || entry.website_url) && (
                            <div className="rapper-section">
                                <div className="rapper-section-header">
                                    <Share2 size={13} />
                                    <span>SOCIAL MEDIA</span>
                                </div>
                                <div className="rapper-detail-socials">
                                    {entry.social_yt && (
                                        <a href={entry.social_yt} target="_blank" rel="noreferrer" className="social-link-item yt" aria-label="YouTube">
                                            <Youtube size={20} />
                                        </a>
                                    )}
                                    {entry.social_ig && (
                                        <a href={entry.social_ig} target="_blank" rel="noreferrer" className="social-link-item ig" aria-label="Instagram">
                                            <Instagram size={20} />
                                        </a>
                                    )}
                                    {entry.social_fb && (
                                        <a href={entry.social_fb} target="_blank" rel="noreferrer" className="social-link-item fb" aria-label="Facebook">
                                            <Facebook size={20} />
                                        </a>
                                    )}
                                    {entry.website_url && (
                                        <a href={entry.website_url} target="_blank" rel="noreferrer" className="social-link-item web" aria-label="Website">
                                            <Globe size={20} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Spotify */}
                        {entry.spotify_url && (
                            <div className="rapper-section">
                                <div className="rapper-section-header">
                                    <Mic2 size={13} />
                                    <span>MUZYKA</span>
                                </div>
                                {renderSpotifyEmbed(entry.spotify_url)}
                            </div>
                        )}

                        {/* Bio */}
                        <div className="rapper-section">
                            <div className="rapper-section-header">
                                <AlignLeft size={13} />
                                <span>BIO</span>
                            </div>
                            <div className="rapper-detail-bio">
                                {entry.bio || "Brak opisu dla tego twórcy."}
                            </div>
                        </div>

                        {/* Discography */}
                        {entry.discography && entry.discography.length > 0 && (
                            <div className="rapper-section">
                                <div className="rapper-section-header">
                                    <Music size={13} />
                                    <span>DYSKOGRAFIA</span>
                                </div>
                                <div className="discography-grid">
                                    {entry.discography
                                        .sort((a, b) => b.year.localeCompare(a.year))
                                        .map((item, idx) => (
                                            <div key={idx} className="discography-item">
                                                <span className="discography-year">{item.year || '—'}</span>
                                                <span className="discography-title">{item.title}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* Related news */}
                        {taggedNews && taggedNews.length > 0 && (
                            <div className="rapper-section">
                                <div className="rapper-section-header">
                                    <Newspaper size={13} />
                                    <span>NEWSY O ARTYŚCIE</span>
                                </div>
                                <div className="related-news-list">
                                    {taggedNews.map(item => {
                                        const displayTag = (item.tags && item.tags.length > 0)
                                            ? item.tags[0].toUpperCase()
                                            : item.category?.toUpperCase() || '';
                                        return (
                                            <Link
                                                key={item.id}
                                                href={`/news/${item.slug || item.id}`}
                                                className="related-news-item"
                                            >
                                                {item.image_url && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={item.image_url} alt={item.title} className="related-news-thumb" />
                                                )}
                                                <div className="related-news-body">
                                                    {displayTag && (
                                                        <span className="related-news-tag">{displayTag}</span>
                                                    )}
                                                    <span className="related-news-title">{item.title}</span>
                                                    <span className="related-news-date">
                                                        <Clock size={10} /> {timeAgo(item.created_at)}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
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
