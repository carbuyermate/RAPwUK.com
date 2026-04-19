'use client';

import { useState, useMemo } from 'react';
import { Calendar, MapPin, Ticket, ExternalLink, Search, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import './events-list.css';

interface Event {
    id: string;
    slug: string;
    title: string;
    description: string;
    event_date: string;
    venue: string;
    city: string;
    ticket_url: string;
    image_url?: string;
    is_premium: boolean;
}

interface EventsListProps {
    initialEvents: Event[];
}

export default function EventsList({ initialEvents }: EventsListProps) {
    const [search, setSearch] = useState('');
    const [cityFilter, setCityFilter] = useState('all');
    const [venueFilter, setVenueFilter] = useState('all');
    const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc'>('date-asc');

    const cities = useMemo(() => {
        const set = new Set(initialEvents.map(e => e.city));
        return Array.from(set).sort();
    }, [initialEvents]);

    const venues = useMemo(() => {
        const set = new Set(initialEvents.map(e => e.venue));
        return Array.from(set).sort();
    }, [initialEvents]);

    const filteredEvents = useMemo(() => {
        let result = initialEvents.filter(event => {
            const matchesSearch =
                event.title.toLowerCase().includes(search.toLowerCase()) ||
                event.description.toLowerCase().includes(search.toLowerCase()) ||
                event.city.toLowerCase().includes(search.toLowerCase()) ||
                event.venue.toLowerCase().includes(search.toLowerCase());

            const matchesCity = cityFilter === 'all' || event.city === cityFilter;
            const matchesVenue = venueFilter === 'all' || event.venue === venueFilter;

            return matchesSearch && matchesCity && matchesVenue;
        });

        result.sort((a, b) => {
            const dateA = new Date(a.event_date).getTime();
            const dateB = new Date(b.event_date).getTime();
            return sortBy === 'date-asc' ? dateA - dateB : dateB - dateA;
        });

        return result;
    }, [initialEvents, search, cityFilter, venueFilter, sortBy]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleDateString('pl-PL', { month: 'short' });
        const year = date.getFullYear();
        return { day, month, year };
    };

    return (
        <div className="events-list-wrapper">
            <div className="search-filters glass-panel animate-fade-in">
                <div className="filter-group search-filter-primary">
                    <label className="filter-label">Szukaj (Raper, Klub, Miasto)</label>
                    <div className="relative" style={{ position: 'relative' }}>
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            className="filter-input"
                            style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
                            placeholder="np. O.S.T.R, London, O2 Academy..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Miasto</label>
                    <select className="filter-select" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                        <option value="all">Wszystkie Miasta</option>
                        {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Klub / Venue</label>
                    <select className="filter-select" value={venueFilter} onChange={(e) => setVenueFilter(e.target.value)}>
                        <option value="all">Wszystkie Kluby</option>
                        {venues.map(venue => <option key={venue} value={venue}>{venue}</option>)}
                    </select>
                </div>
            </div>

            <div className="sort-controls animate-fade-in" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                    className={`sort-btn ${sortBy === 'date-asc' ? 'active' : ''}`}
                    onClick={() => setSortBy('date-asc')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: sortBy === 'date-asc' ? '#0070f3' : '#888', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    Najbliższe <ChevronUp size={14} />
                </button>
                <button
                    className={`sort-btn ${sortBy === 'date-desc' ? 'active' : ''}`}
                    onClick={() => setSortBy('date-desc')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: sortBy === 'date-desc' ? '#0070f3' : '#888', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    Najnowsze <ChevronDown size={14} />
                </button>
            </div>

            <div className="events-grid animate-fade-in">
                {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => {
                        const { day, month, year } = formatDate(event.event_date);
                        return (
                                <Link href={`/events/${event.slug || event.id}`} className={`event-card glass-panel ${event.is_premium ? 'premium' : ''}`}>
                                    <div className="event-image-container">
                                        {event.image_url ? (
                                            <img src={event.image_url} alt={event.title} className="event-poster" />
                                        ) : (
                                            <div className="event-poster-placeholder">
                                                <Calendar size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="event-date-box">
                                        <div className="date-day">{day}</div>
                                        <div className="date-month">{month}</div>
                                        <div className="text-secondary" style={{ fontSize: '0.7rem' }}>{year}</div>
                                    </div>
                                    <div className="event-main-info">
                                        {event.is_premium && <div className="event-tag-premium">PATRONAT!</div>}
                                        <h3 className="text-xl font-bold">{event.title}</h3>
                                        <p className="text-secondary text-sm mt-1 line-clamp-2">
                                            {event.description}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-secondary">
                                            <span className="flex items-center gap-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <MapPin size={14} /> {event.venue}, {event.city}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="event-actions">
                                        {event.ticket_url && (
                                            <div className="btn-secondary py-2 px-6 flex items-center gap-2 text-sm" style={{ pointerEvents: 'none' }}>
                                                Kup bilet
                                            </div>
                                        )}

                                    </div>
                                </Link>
                        );
                    })
                ) : (
                    <div className="no-results glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
                        <p>Nie znaleźliśmy wydarzeń pasujących do Twoich filtrów.</p>
                        <button
                            className="btn-secondary mt-4"
                            onClick={() => { setSearch(''); setCityFilter('all'); setVenueFilter('all'); }}
                        >
                            Wyczyść filtry
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
