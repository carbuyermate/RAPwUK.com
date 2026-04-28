import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Clock, ChevronLeft, Ticket } from "lucide-react";
import { EventPoster } from "@/components/EventPoster";
import { ViewTracker } from "@/components/ViewTracker";
import "./event.css";

interface EventDetail {
    id: string;
    title: string;
    description: string;
    event_date: string;
    venue: string;
    city: string;
    ticket_url?: string;
    image_url?: string;
    is_premium: boolean;
}

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://rapwuk.com';

function toAbsoluteUrl(url: string | undefined | null): string {
  if (!url) return `${BASE_URL}/logo.jpg`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

async function getEvent(slug: string): Promise<EventDetail | null> {
  let { data } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!data) {
    const { data: idData } = await supabase
      .from('events')
      .select('*')
      .eq('id', slug)
      .maybeSingle();
    data = idData;
  }

  return data as EventDetail | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) return {};

  const date = new Date(event.event_date).toLocaleDateString('pl-PL', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const description = event.description
    ? event.description.replace(/\s+/g, ' ').trim().slice(0, 160)
    : `${event.title} — ${event.venue}, ${event.city}, ${date}`;

  const ogImage = toAbsoluteUrl(event.image_url);
  const pageUrl = `${BASE_URL}/events/${slug}`;

  return {
    metadataBase: new URL(BASE_URL),
    title: `${event.title} | RAPwUK.com`,
    description,
    openGraph: {
      title: `${event.title} — ${event.city}, ${date}`,
      description,
      url: pageUrl,
      siteName: 'RAPwUK.com',
      images: [{ url: ogImage, width: 1200, height: 630, alt: event.title }],
      locale: 'pl_PL',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@RAPwUK',
      creator: '@RAPwUK',
      title: `${event.title} — ${event.city}`,
      description,
      images: [ogImage],
    },
  };
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const isUnknownTime = dateStr.includes('T00:00:00+00:00') || dateStr.endsWith('T00:00:00Z') || dateStr.includes('T00:00:00.000Z');
    return {
        full: d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }),
        weekday: d.toLocaleDateString('pl-PL', { weekday: 'long' }),
        time: isUnknownTime ? 'Godzina nieznana' : d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
    };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    let { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

    // Fallback search by ID if slug lookup fails
    if (!data) {
        const { data: idData } = await supabase
            .from('events')
            .select('*')
            .eq('id', slug)
            .maybeSingle();
        
        if (idData) {
            data = idData;
        }
    }

    if (!data) notFound();

    const event = data as EventDetail;
    const dateInfo = formatDate(event.event_date);

    return (
        <div className="event-detail-page animate-fade-in">
            <ViewTracker type="events" id={event.id} />
            <div className="container">
                <div className="event-detail-back">
                    <Link href="/events" className="back-btn">
                        <ChevronLeft size={16} /> POWRÓT
                    </Link>
                </div>

                <div className="event-detail-grid">
                    {/* Poster Side */}
                    <div className="event-detail-poster-sec">
                        {event.image_url ? (
                            <EventPoster src={event.image_url} alt={event.title} />
                        ) : (
                            <div className="aspect-[3/4] bg-[rgba(255,255,255,0.03)] rounded-2xl flex flex-col items-center justify-center border border-[rgba(255,255,255,0.05)] text-secondary gap-4">
                                <Calendar size={64} strokeWidth={1} opacity={0.3} />
                                <p className="text-sm opacity-50">Brak plakatu</p>
                            </div>
                        )}

                        <div className="ticket-cta-box">
                            {event.ticket_url ? (
                                <>
                                    <h4 className="text-lg font-bold mb-4">Zarezerwuj bilety</h4>
                                    <a 
                                        href={event.ticket_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="ticket-cta-btn"
                                    >
                                        <Ticket size={24} /> KUP BILETY
                                    </a>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-4 gap-3">
                                    <Ticket size={32} strokeWidth={1} />
                                    <p className="text-secondary text-sm text-center uppercase tracking-widest font-bold">Informacje o biletach wkrótce</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Side */}
                    <div className="event-detail-content">
                        <div>
                            {event.is_premium && (
                                <div className="event-tag-premium-large mb-4">
                                    PATRONAT!
                                </div>
                            )}
                            <h1 className="event-detail-title">{event.title}</h1>
                        </div>

                        <div className="event-detail-meta-group">
                            <div className="meta-item">
                                <div className="meta-icon-box">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <div className="meta-label">Kiedy</div>
                                    <div className="meta-value">{dateInfo.full}</div>
                                    <div className="text-secondary text-xs uppercase opacity-70 mt-1">{dateInfo.weekday}</div>
                                </div>
                            </div>

                            <div className="meta-item">
                                <div className="meta-icon-box">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <div className="meta-label">Start</div>
                                    <div className="meta-value">{dateInfo.time}</div>
                                </div>
                            </div>

                            <div className="meta-item">
                                <div className="meta-icon-box">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <div className="meta-label">Gdzie</div>
                                    <div className="meta-value">{event.city}</div>
                                    <div className="text-secondary text-xs opacity-70 mt-1">{event.venue}</div>
                                </div>
                            </div>
                        </div>

                        <div className="event-detail-description-box">
                            <h4 className="meta-label mb-4 opacity-50">O wydarzeniu</h4>
                            <div className="event-detail-description">
                                {event.description || "Brak dodatkowego opisu."}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
