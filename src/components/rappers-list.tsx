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

const CATEGORIES = ['Wszystkie', 'DJ', 'Fotograf', 'Label', 'Mix/mastering', 'Producent', 'Produkcja wideo', 'Promotor', 'Raper', 'Skład', 'Studio nagraniowe'];

export default function RappersList({ initialRappers }: { initialRappers: Rapper[] }) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Wszystkie');

    const filtered = useMemo(() => {
        return initialRappers.filter(r => {
            // Category Match
            let matchCategory = true;
            if (activeCategory !== 'Wszystkie') {
                const catString = r.category || '';
                const cats = catString.split(',').map(c => c.trim());
                matchCategory = cats.includes(activeCategory);
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
                <div className="premium-rappers-section animate-fade-in" style={{ marginBottom: '1.5rem', marginTop: '1.5rem', position: 'relative' }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '2rem',
                        transform: 'translateY(-50%)',
                        background: 'linear-gradient(145deg, #0f172a 0%, #020617 100%)',
                        padding: '4px 16px',
                        borderRadius: '6px',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 0 10px rgba(56, 189, 248, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        zIndex: 20
                    }}>
                        <span style={{ 
                            color: '#38bdf8', 
                            fontSize: '0.7rem', 
                            fontWeight: 800, 
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            textShadow: '0 0 15px rgba(56, 189, 248, 0.5)'
                        }}>★ PATRONUJEMY</span>
                    </div>

                    <div className="directory-items-list glass-panel" style={{ 
                        borderColor: 'rgba(56, 189, 248, 0.2)', 
                        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.6) 0%, rgba(2, 6, 23, 0.9) 100%)',
                        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px'
                    }}>
                        {premiumRappers.map(rapper => (
                            <Link key={rapper.id} href={`/rappers/${rapper.slug || rapper.id}`} className="directory-item-row" style={{ borderBottomColor: 'rgba(56, 189, 248, 0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <span className="directory-item-name font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{rapper.name}</span>
                                </div>
                                <div className="directory-item-meta">
                                    {(rapper.city_pl || rapper.city_uk) && (
                                        <span className="directory-item-location">📍 {rapper.city_uk || rapper.city_pl}</span>
                                    )}
                                    {rapper.category && rapper.category.split(',').map(c => c.trim()).map(cat => (
                                        <span key={cat} className="directory-item-badge" style={{ borderColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.05)' }}>{cat}</span>
                                    ))}
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
                                            {rapper.category && rapper.category.split(',').map(c => c.trim()).map(cat => (
                                                <span key={cat} className="directory-item-badge">{cat}</span>
                                            ))}
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
