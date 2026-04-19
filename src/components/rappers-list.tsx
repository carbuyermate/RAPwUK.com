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
    is_premium?: boolean;
    city_pl?: string;
    city_uk?: string;
}

const CATEGORIES = ['Wszystkie', 'Raper/Skład', 'Studio nagraniowe', 'DJ/Producent', 'Label', 'Produkcja wideo', 'Fotograf'];

export default function RappersList({ initialRappers }: { initialRappers: Rapper[] }) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Wszystkie');

    const filtered = useMemo(() => {
        return initialRappers.filter(r => {
            // Category Match
            let matchCategory = true;
            if (activeCategory !== 'Wszystkie') {
                const cat = r.category || 'Raper/Skład';
                if (activeCategory === 'DJ/Producent') {
                    matchCategory = cat === 'DJ/Producent' || cat.includes('DJ') || cat.includes('Producent');
                } else {
                    matchCategory = cat === activeCategory;
                }
            }
            if (!matchCategory) return false;

            // Search Match
            return r.name.toLowerCase().includes(search.toLowerCase()) || 
                   (r.bio && r.bio.toLowerCase().includes(search.toLowerCase()));
        });
    }, [initialRappers, search, activeCategory]);

    const [premiumRappers, groupedRappers] = useMemo(() => {
        const premium: Rapper[] = [];
        const standardGrouped: Record<string, Rapper[]> = {};
        
        filtered.forEach(rapper => {
            if (rapper.is_premium) {
                premium.push(rapper);
            } else {
                const letter = rapper.name.charAt(0).toUpperCase();
                if (!standardGrouped[letter]) standardGrouped[letter] = [];
                standardGrouped[letter].push(rapper);
            }
        });
        
        return [premium, standardGrouped];
    }, [filtered]);

    const letters = Object.keys(groupedRappers).sort();

    return (
        <>
            <div className="section-filters animate-fade-in" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.8rem', paddingBottom: '0.5rem' }}>
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

            {premiumRappers.length > 0 && (
                <div className="premium-rappers-section animate-fade-in" style={{ marginBottom: '1.5rem' }}>
                    <div className="directory-items-list glass-panel" style={{ borderColor: 'rgba(234, 179, 8, 0.4)', background: 'linear-gradient(145deg, rgba(234, 179, 8, 0.08) 0%, transparent 100%)' }}>
                        {premiumRappers.map(rapper => (
                            <Link key={rapper.id} href={`/rappers/${rapper.slug || rapper.id}`} className="directory-item-row" style={{ borderBottomColor: 'rgba(234,179,8,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <span className="text-yellow-500" style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', background: 'rgba(234, 179, 8, 0.15)', borderRadius: '4px', border: '1px solid rgba(234, 179, 8, 0.3)', letterSpacing: '0.5px' }}>★ PROMUJEMY</span>
                                    <span className="directory-item-name font-bold text-white">{rapper.name}</span>
                                </div>
                                <div className="directory-item-meta">
                                    {(rapper.city_pl || rapper.city_uk) && (
                                        <span className="directory-item-location">📍 {rapper.city_uk || rapper.city_pl}</span>
                                    )}
                                    {rapper.category && rapper.category !== 'Raper/Skład' && (
                                        <span className="directory-item-badge" style={{ borderColor: 'rgba(234, 179, 8, 0.3)', color: '#eab308', background: 'rgba(234,179,8,0.05)' }}>{rapper.category}</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

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
                                        <div className="directory-item-meta">
                                            {(rapper.city_pl || rapper.city_uk) && (
                                                <span className="directory-item-location">📍 {rapper.city_uk || rapper.city_pl}</span>
                                            )}
                                            {rapper.category && rapper.category !== 'Raper/Skład' && (
                                                <span className="directory-item-badge">{rapper.category}</span>
                                            )}
                                        </div>
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
