import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowLeft, Ticket, Zap } from "lucide-react";
import { EventPoster } from "@/components/EventPoster";
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

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return {
        full: d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }),
        weekday: d.toLocaleDateString('pl-PL', { weekday: 'long' }),
        time: d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
    };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) notFound();

    const event = data as EventDetail;
    const dateInfo = formatDate(event.event_date);

    return (
        <div className="event-detail-page container animate-fade-in">
            <div className="event-detail-back">
                <Link href="/events" className="back-link">
                    <ArrowLeft size={18} /> Powrót do listy imprez
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
                            <p className="text-sm opacity-50">Brak plakatu dla tego wydarzenia</p>
                        </div>
                    )}

                    <div className="ticket-cta-box mt-8">
                        {event.ticket_url ? (
                            <>
                                <h4 className="text-lg font-bold">Wybierasz się?</h4>
                                <p className="text-secondary text-sm">Zarezerwuj swoje miejsce już teraz, zanim bilety zostaną wyprzedane!</p>
                                <a 
                                    href={event.ticket_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ticket-cta-btn"
                                >
                                    <Ticket size={24} /> KUP BILETY ONLINE
                                </a>
                            </>
                        ) : (
                            <p className="text-secondary text-sm italic">Informacje o biletach wkrótce lub u organizatora.</p>
                        )}
                    </div>
                </div>

                {/* Info Side */}
                <div className="event-detail-content">
                    {event.is_premium && (
                        <div className="event-tag-premium-large">
                            <Zap size={14} fill="black" /> Polecane Wydarzenie
                        </div>
                    )}

                    <h1 className="event-detail-title">{event.title}</h1>

                    <div className="event-detail-meta-group mt-4">
                        <div className="meta-item">
                            <div className="meta-icon-box">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <div className="meta-label">Data</div>
                                <div className="meta-value">{dateInfo.full}</div>
                                <div className="text-secondary text-sm capitalize">{dateInfo.weekday}</div>
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
                                <div className="meta-label">Lokalizacja</div>
                                <div className="meta-value">{event.city}</div>
                                <div className="text-secondary text-sm">{event.venue}</div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/10 my-4" />

                    <div className="event-detail-description-box">
                        <h4 className="text-sm uppercase tracking-widest font-bold text-secondary mb-4">Informacje o wydarzeniu</h4>
                        <div className="event-detail-description">
                            {event.description || "Brak dodatkowego opisu dla tego wydarzenia."}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
