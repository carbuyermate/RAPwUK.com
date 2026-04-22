'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
    id: string;
    slug: string;
    title: string;
    category: string;
    image_url?: string;
    type: 'news' | 'event' | 'rapper'; // We can search multiple tables if we want, but let's stick to news/rappers for now
}

export function NotFoundSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

            // Przeszukujemy bazę Newsów (najczęstszy przypadek użycia)
            const { data: newsData, error: newsError } = await supabase
                .from('news')
                .select('id, slug, title, category, image_url')
                .ilike('title', `%${query}%`)
                .order('created_at', { ascending: false })
                .limit(4);

            // Opcjonalnie przeszukujemy bazę raperów
            const { data: rappersData, error: rappersError } = await supabase
                .from('rappers')
                .select('id, slug, name, category, images')
                .ilike('name', `%${query}%`)
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

            if (rappersData) {
                combinedResults.push(...rappersData.map(r => ({
                    id: r.id,
                    slug: r.slug,
                    title: r.name,
                    category: r.category || 'Scena',
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
        <div className="not-found-search-container" ref={dropdownRef}>
            <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                    type="text"
                    className="not-found-search-input"
                    placeholder="Czego szukasz? (np. Central Cee, nowy wywiad, eventy...)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (query.length >= 2) setShowDropdown(true); }}
                />
                {loading && <Loader2 size={20} className="loading-spinner animate-spin" />}
            </div>

            {showDropdown && (
                <div className="search-dropdown glass-panel">
                    {results.length > 0 ? (
                        <div className="search-results-list">
                            {results.map((res) => {
                                const href = res.type === 'news' 
                                    ? `/news/${res.slug || res.id}`
                                    : `/rappers/${res.slug || res.id}`;

                                return (
                                    <Link key={res.id} href={href} className="search-result-item" onClick={() => setShowDropdown(false)}>
                                        <div className="search-result-image">
                                            {res.image_url ? (
                                                <img src={res.image_url} alt={res.title} />
                                            ) : (
                                                <div className="image-placeholder"><Search size={16} /></div>
                                            )}
                                        </div>
                                        <div className="search-result-info">
                                            <span className="search-result-category">{res.category}</span>
                                            <h4 className="search-result-title">{res.title}</h4>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : query.length >= 2 && !loading ? (
                        <div className="search-no-results">
                            Brak wyników dla "{query}". Spróbuj wpisać inaczej.
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
