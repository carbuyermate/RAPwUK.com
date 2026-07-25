import Link from "next/link";
import "./page.css";
import { CalendarDays, ExternalLink, Newspaper, Clock, MapPin, ArrowRight, Tag, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PromoWidget } from "@/components/PromoWidget";
import { ViewTracker } from "@/components/ViewTracker";
import { SocialBox } from "@/components/SocialBox";
import { ShopWidget } from "@/components/ShopWidget";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  image_url?: string;
  created_at: string;
  likes?: number;
  dislikes?: number;
}

interface EventItem {
  id: string;
  slug: string;
  title: string;
  event_date: string;
  venue: string;
  city: string;
  ticket_url?: string;
  image_url?: string;
  is_premium: boolean;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString('pl-PL', { timeZone: 'UTC', day: '2-digit' }),
    month: d.toLocaleDateString('pl-PL', { timeZone: 'UTC', month: 'short' }).toUpperCase(),
    weekday: d.toLocaleDateString('pl-PL', { timeZone: 'UTC', weekday: 'short' }),
    full: d.toLocaleDateString('pl-PL', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }),
    time: d.toLocaleTimeString('pl-PL', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' }),
  };
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return 'Przed chwilą';
  if (diffH < 24) return `${diffH}h temu`;
  if (diffD < 7) return `${diffD} dni temu`;
  return new Date(dateStr).toLocaleDateString('pl-PL');
}

export default async function Home() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { data: newsData },
    { data: eventsData },
    { data: shopProductsData }
  ] = await Promise.all([
    supabase.from('news').select('*').order('created_at', { ascending: false }).limit(7),
    supabase.from('events').select('*').gte('event_date', todayStart.toISOString()).order('event_date', { ascending: true }),
    supabase.from('products').select('id, slug, title, price, image_url, category').eq('is_active', true).gt('stock', 0),
  ]);

  const news = (newsData || []) as NewsItem[];
  const events = (eventsData || []) as EventItem[];
  const shopProducts = shopProductsData || [];

  // Pick one random product for the Shop Widget
  const randomProduct = shopProducts.length > 0
    ? shopProducts[Math.floor(Math.random() * shopProducts.length)]
    : null;

  const featuredNews = news[0] || null;
  const restNews = news.slice(1);

  return (
    <div className="home-container container">
      <ViewTracker type="page" id="home" />

      {/* Hero */}
      <section className="hero animate-fade-in">
        <div className="hero-content-left">
          <h1 className="hero-title">
            Centrum Hip-<br className="mobile-break" />Hopu w UK
          </h1>
          <p className="hero-subtitle">
            Scena, newsy, imprezy. Wszystko w jednym miejscu.
          </p>
        </div>
      </section>

      {/* Main Layout: [News+Events] | [Sidebar Ad] */}
      <div className="homepage-outer">

        {/* Centre column: News feed + Events sidebar stacked */}
        <div className="homepage-centre">

          {/* News + Events 2-up row */}
          <div className="main-layout">

            {/* ── LEFT: News Feed ── */}
            <section className="news-main">
              <div className="section-header">
                <h2 className="section-title">
                  <Newspaper size={22} /> Świeże Newsy
                </h2>
              </div>

              {news.length === 0 ? (
                <div className="empty-state glass-panel">
                  <Newspaper size={48} strokeWidth={1} />
                  <p>Brak newsów.</p>
                </div>
              ) : (
                <div className="news-feed">
                  <div className="news-grid">
                    {news.map((item) => (
                      <Link key={item.id} href={`/news/${item.slug || item.id}`} className={`news-card glass-panel ${item.category === 'Sponsorowane' ? 'sponsored-card' : ''}`}>
                        {item.image_url && (
                          <div className="news-card__image news-card__image--small">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image_url} alt={item.title} />
                          </div>
                        )}
                        <div className="news-card__body">
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            {item.tags && item.tags.length > 0 ? (
                              [...item.tags].sort((a, b) => {
                                const isPremiumA = ['PATRONAT', 'KONKURS', 'SPONSOROWANE'].includes(a.toUpperCase());
                                const isPremiumB = ['PATRONAT', 'KONKURS', 'SPONSOROWANE'].includes(b.toUpperCase());
                                if (isPremiumA && !isPremiumB) return -1;
                                if (!isPremiumA && isPremiumB) return 1;
                                return 0;
                              }).map(t => {
                                const tag = t.toUpperCase();
                                const isP = tag === 'PATRONAT';
                                const isK = tag === 'KONKURS';
                                const isS = tag === 'SPONSOROWANE';
                                const tc = isP ? 'news-tag--patronat' : isK ? 'news-tag--konkurs' : isS ? 'news-tag--sponsorowane' : '';
                                return (
                                  <span key={tag} className={`news-tag ${tc}`}>
                                    {isP ? '👑 ' : isK ? '🏆 ' : isS ? '⭐ ' : ''}{tag}
                                  </span>
                                );
                              })
                            ) : item.category && (
                              <span className={`news-tag ${item.category === 'Patronat' ? 'news-tag--patronat' : item.category === 'Konkurs' ? 'news-tag--konkurs' : item.category === 'Sponsorowane' ? 'news-tag--sponsorowane' : ''}`}>
                                {item.category === 'Patronat' ? '👑 ' : item.category === 'Konkurs' ? '🏆 ' : item.category === 'Sponsorowane' ? '⭐ ' : ''}{item.category.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <h3 className="news-card__title">{item.title}</h3>
                          <div className="news-meta">
                            <div className="news-meta-left">
                              <Clock size={12} />
                              {timeAgo(item.created_at)}
                            </div>
                            <div className="news-meta-reactions">
                              <span className="news-meta-reaction">
                                <ThumbsUp size={11} style={{ opacity: 0.7 }} />
                                <span>{item.likes || 0}</span>
                              </span>
                              <span className="news-meta-reaction">
                                <ThumbsDown size={11} style={{ opacity: 0.7 }} />
                                <span>{item.dislikes || 0}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <Link href="/news" className="btn-secondary btn-block">
                    WIĘCEJ NEWSÓW <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </section>

            {/* ── RIGHT: Events Sidebar ── */}
            <aside className="events-sidebar">
              <div className="section-header">
                <h2 className="section-title">
                  <CalendarDays size={22} /> Imprezy
                </h2>
              </div>

              {events.length === 0 ? (
                <div className="empty-state glass-panel">
                  <CalendarDays size={40} strokeWidth={1} />
                  <p>Brak nadchodzących eventów.</p>
                </div>
              ) : (
                <div className="events-list glass-panel">
                  {events.map((ev, i) => {
                    const d = formatDate(ev.event_date);
                    return (
                      <Link
                        key={ev.id}
                        href={`/events/${ev.slug || ev.id}`}
                        className={`event-row${ev.is_premium ? ' event-row--premium' : ''}${i < events.length - 1 ? ' event-row--border' : ''}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        {ev.is_premium && (
                          <div className="event-row-premium-badge">PATRONAT!</div>
                        )}
                        <div className="event-date-pill">
                          <span className="event-date-pill__day">{d.day}</span>
                          <span className="event-date-pill__month">{d.month}</span>
                        </div>
                        <div className="event-mini-poster">
                          {ev.image_url ? (
                            <img src={ev.image_url} alt={ev.title} />
                          ) : (
                            <div className="event-mini-poster-placeholder">
                               <CalendarDays size={14} />
                            </div>
                          )}
                        </div>
                        <div className="event-info">
                          <h3 className="event-info__title">
                            {ev.title}
                          </h3>
                          <p className="event-info__meta">
                            <MapPin size={11} />
                            {ev.venue}
                          </p>
                        </div>
                        <div className="text-secondary opacity-30">
                          <ArrowRight size={14} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              <Link href="/events" className="events-cta-btn">
                <CalendarDays size={18} />
                Pełna lista imprez
                <ArrowRight size={18} />
              </Link>
            </aside>

          </div>{/* /.main-layout */}

        </div>{/* /.homepage-centre */}

        {/* Far-right: vertical sidebar */}
        <aside className="promo-zone-side">
          <div className="section-header">
            <h2 className="section-title">
              <Share2 size={22} /> Obserwuj Nas
            </h2>
          </div>
          <SocialBox showLabel={false} />
          <ShopWidget product={randomProduct} />
        </aside>

      </div>{/* /.homepage-outer */}
    </div>
  );
}
