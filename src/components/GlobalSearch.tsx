'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SearchResult {
    id: string;
    slug: string;
    title: string;
    category: string;
    image_url?: string;
    type: 'news' | 'event' | 'rapper';
}

export function GlobalSearch({ onClose }: { onClose?: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        // Zamykanie przy zmianie strony
        setShowDropdown(false);
        setQuery('');
        if (onClose) onClose();
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                setShowDropdown(false);
                return;
            }

            setLoading(true);
            setShowDropdown(true);

            // Przeszukujemy bazę Newsów
            const { data: newsData } = await supabase
                .from('news')
                .select('id, slug, title, category, image_url')
                .ilike('title', `%${query}%`)
                .order('created_at', { ascending: false })
                .limit(3);

            // Przeszukujemy bazę raperów
            const { data: rappersData } = await supabase
                .from('rappers')
                .select('id, slug, name, category, images')
                .ilike('name', `%${query}%`)
                .limit(2);

            // Przeszukujemy bazę eventów
            const { data: eventsData } = await supabase
                .from('events')
                .select('id, slug, title, is_premium, image_url')
                .ilike('title', `%${query}%`)
                .order('date_start', { ascending: false })
                .limit(2);

            const combinedResults: SearchResult[] = [];

            if (newsData) {
                combinedResults.push(...newsData.map(n => ({
                    id: n.id,
                    slug: n.slug,
                    title: n.title,
                    category: n.category || 'News',
                    image_url: n.image_url,
                    type: 'news' as const
                })));
            }

            if (eventsData) {
                combinedResults.push(...eventsData.map(e => ({
                    id: e.id,
                    slug: e.slug,
                    title: e.title,
                    category: e.is_premium ? 'Wydarzenie (Premium)' : 'Wydarzenie',
                    image_url: e.image_url,
                    type: 'event' as const
                })));
            }

            if (rappersData) {
                combinedResults.push(...rappersData.map(r => ({
                    id: r.id,
                    slug: r.slug,
                    title: r.name,
                    category: r.category ? r.category.split(',')[0] : 'Scena',
                    image_url: r.images?.[0],
                    type: 'rapper' as const
                })));
            }

            setResults(combinedResults);
            setLoading(false);
        };

        const debounceTimer = setTimeout(() => {
            fetchResults();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [query]);

    return (
        <div className="global-search-container" ref={dropdownRef}>
            <div className="global-search-wrapper">
                <Search size={16} className="global-search-icon" />
                <input
                    type="text"
                    className="global-search-input"
                    placeholder="Szukaj..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (query.length >= 2) setShowDropdown(true); }}
                />
                {loading && <Loader2 size={16} className="global-search-loading animate-spin" />}
            </div>

            {showDropdown && (
                <div className="global-search-dropdown glass-panel">
                    {results.length > 0 ? (
                        <div className="global-search-results">
                            {results.map((res) => {
                                const href = res.type === 'news' 
                                    ? `/news/${res.slug || res.id}`
                                    : res.type === 'event'
                                    ? `/events/${res.slug || res.id}`
                                    : `/rappers/${res.slug || res.id}`;

                                return (
                                    <Link key={`${res.type}-${res.id}`} href={href} className="global-search-item" onClick={() => { setShowDropdown(false); if (onClose) onClose(); }}>
                                        <div className="global-search-item-img">
                                            {res.image_url ? (
                                                <img src={res.image_url} alt={res.title} />
                                            ) : (
                                                <Search size={14} className="opacity-50" />
                                            )}
                                        </div>
                                        <div className="global-search-item-info">
                                            <span className="global-search-item-cat">{res.category}</span>
                                            <h4 className="global-search-item-title">{res.title}</h4>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : query.length >= 2 && !loading ? (
                        <div className="global-search-empty">
                            Brak wyników.
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
