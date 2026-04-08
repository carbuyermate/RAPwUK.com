import Link from "next/link";
import "./page.css";
import { CalendarDays, ExternalLink, Newspaper, Clock, MapPin, ArrowRight, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url?: string;
  created_at: string;
}

interface EventItem {
  id: string;
  title: string;
  event_date: string;
  venue: string;
  city: string;
  ticket_url?: string;
  is_premium: boolean;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString('pl-PL', { day: '2-digit' }),
    month: d.toLocaleDateString('pl-PL', { month: 'short' }).toUpperCase(),
    weekday: d.toLocaleDateString('pl-PL', { weekday: 'short' }),
    full: d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }),
    time: d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
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
  const [{ data: newsData }, { data: eventsData }] = await Promise.all([
    supabase.from('news').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('events').select('*').gte('event_date', new Date().toISOString()).order('event_date', { ascending: true }).limit(30),
  ]);

  const news = (newsData || []) as NewsItem[];
  const events = (eventsData || []) as EventItem[];

  const featuredNews = news[0] || null;
  const restNews = news.slice(1);

  return (
    <div className="home-container container">

      {/* Hero */}
      <section className="hero animate-fade-in">
        <p className="hero-eyebrow">🎤 Polski rap na Wyspach</p>
        <h1 className="hero-title">
          Rapowe Wibracje<br />na Wyspach
        </h1>
        <p className="hero-subtitle">
          Najświeższe newsy ze sceny, kalendarz koncertów i wszystko o polskim hip-hopie w UK.
        </p>
      </section>

      {/* Main Layout: News + Events sidebar */}
      <div className="main-layout">

        {/* ── LEFT: News Feed ── */}
        <section className="news-main">
          <div className="section-header">
            <h2 className="section-title">
              <Newspaper size={22} /> Świeże Newsy
            </h2>
            <Link href="/news" className="view-all-link">Wszystkie newsy →</Link>
          </div>

          {news.length === 0 ? (
            <div className="empty-state glass-panel">
              <Newspaper size={48} strokeWidth={1} />
              <p>Brak newsów.</p>
            </div>
          ) : (
            <div className="news-feed">
              {/* Featured (first) news */}
              {featuredNews && (
                <Link href={`/news/${featuredNews.id}`} className="news-card news-card--featured glass-panel">
                  {featuredNews.image_url && (
                    <div className="news-card__image">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={featuredNews.image_url} alt={featuredNews.title} />
                    </div>
                  )}
                  <div className="news-card__body">
                    {featuredNews.category && (
                      <span className="news-tag news-tag--highlight">{featuredNews.category}</span>
                    )}
                    <h3 className="news-card__title news-card__title--featured">{featuredNews.title}</h3>
                    {featuredNews.content && (
                      <p className="news-card__excerpt">{featuredNews.content.slice(0, 180)}…</p>
                    )}
                    <p className="news-meta">
                      <Clock size={12} />
                      {timeAgo(featuredNews.created_at)}
                    </p>
                  </div>
                </Link>
              )}

              {/* Rest of news grid */}
              {restNews.length > 0 && (
                <div className="news-grid">
                  {restNews.map((item) => (
                    <Link key={item.id} href={`/news/${item.id}`} className="news-card glass-panel">
                      {item.image_url && (
                        <div className="news-card__image news-card__image--small">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image_url} alt={item.title} />
                        </div>
                      )}
                      <div className="news-card__body">
                        {item.category && (
                          <span className="news-tag">{item.category}</span>
                        )}
                        <h3 className="news-card__title">{item.title}</h3>
                        <p className="news-meta">
                          <Clock size={12} />
                          {timeAgo(item.created_at)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <Link href="/news" className="btn-secondary btn-block">
                Więcej newsów <ArrowRight size={16} />
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
                  <div
                    key={ev.id}
                    className={`event-row${ev.is_premium ? ' event-row--premium' : ''}${i < events.length - 1 ? ' event-row--border' : ''}`}
                  >
                    {/* Date pill */}
                    <div className="event-date-pill">
                      <span className="event-date-pill__day">{d.day}</span>
                      <span className="event-date-pill__month">{d.month}</span>
                    </div>

                    {/* Info */}
                    <div className="event-info">
                      <h3 className="event-info__title">
                        {ev.is_premium && <span className="premium-dot" title="Premium" />}
                        {ev.title}
                      </h3>
                      <p className="event-info__meta">
                        <MapPin size={11} />
                        {ev.city}{ev.venue ? `, ${ev.venue}` : ''}
                      </p>
                      <p className="event-info__time">
                        <Clock size={11} />
                        {d.time}
                      </p>
                    </div>

                    {/* Ticket link */}
                    {ev.ticket_url && (
                      <a
                        href={ev.ticket_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ticket-btn"
                        aria-label="Kup bilety"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom CTA */}
          <Link href="/events" className="events-cta-btn">
            <CalendarDays size={18} />
            Pełny kalendarz koncertów
            <ArrowRight size={18} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
