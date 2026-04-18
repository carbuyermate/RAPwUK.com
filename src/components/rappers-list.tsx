'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';

interface Rapper {
    id: string;
    slug: string;
    name: string;
    bio: string;
    category?: string;
    social_ig?: string;
    social_fb?: string;
    social_yt?: string;
    images?: string[];
}

const CATEGORIES = ['Wszystkie', 'Raper/Skład', 'Studio nagraniowe', 'DJ/Producent', 'Label'];

export default function RappersList({ initialRappers }: { initialRappers: Rapper[] }) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Wszystkie');

    const filtered = useMemo(() => {
        return initialRappers.filter(r => {
            // Category Match
            let matchCategory = true;
            if (activeCategory !== 'Wszystkie') {
                if (activeCategory === 'DJ/Producent') {
                    // DJ/Producent aggregates all three specific subcategories
                    matchCategory = ['Zarówno DJ jak i Producent', 'Tylko DJ', 'Tylko Producent'].includes(r.category || '');
                } else {
                    // The rest should match strictly, or default old rows to 'Raper/Skład'
                    const cat = r.category || 'Raper/Skład';
                    matchCategory = cat === activeCategory;
                }
            }
            if (!matchCategory) return false;

            // Search Match
            return r.name.toLowerCase().includes(search.toLowerCase()) || 
                   (r.bio && r.bio.toLowerCase().includes(search.toLowerCase()));
        });
    }, [initialRappers, search, activeCategory]);

    const groupedRappers = useMemo(() => {
        return filtered.reduce((acc, rapper) => {
            const letter = rapper.name.charAt(0).toUpperCase();
            if (!acc[letter]) acc[letter] = [];
            acc[letter].push(rapper);
            return acc;
        }, {} as Record<string, Rapper[]>);
    }, [filtered]);

    const letters = Object.keys(groupedRappers).sort();

    return (
        <>
            <div className="section-filters animate-fade-in" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {CATEGORIES.map(cat => (
                    <button 
                        key={cat} 
                        className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="search-bar glass-panel animate-fade-in" style={{ marginBottom: '2rem' }}>
                <Search size={20} className="text-secondary" />
                <input
                    type="text"
                    placeholder="Szukaj na Scenie..."
                    className="search-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {letters.length > 0 && (
                <div className="alphabet-nav glass-panel animate-fade-in">
                    {letters.map(l => (
                        <a href={`#letter-${l}`} key={l} className="letter-link">{l}</a>
                    ))}
                </div>
            )}

            <div className="directory-list">
                {letters.length === 0 ? (
                    <div className="text-center text-secondary py-8 glass-panel animate-fade-in">
                        Brak wyników dla "{search}"
                    </div>
                ) : (
                    letters.map(letter => (
                        <section key={letter} id={`letter-${letter}`} className="letter-section animate-fade-in">
                            <h2 className="letter-header">{letter}</h2>
                            <div className="directory-items-list glass-panel">
                                {groupedRappers[letter].map(rapper => (
                                    <Link key={rapper.id} href={`/rappers/${rapper.slug || rapper.id}`} className="directory-item-row">
                                        <span className="directory-item-name">{rapper.name}</span>
                                        {rapper.category && rapper.category !== 'Raper/Skład' && (
                                            <span className="directory-item-badge">{rapper.category}</span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>
        </>
    );
}
