'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { RapperCard } from './rapper-card';

interface Rapper {
    id: string;
    name: string;
    bio: string;
    social_ig?: string;
    social_fb?: string;
    social_yt?: string;
    images?: string[];
}

export default function RappersList({ initialRappers }: { initialRappers: Rapper[] }) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        return initialRappers.filter(r => 
            r.name.toLowerCase().includes(search.toLowerCase()) || 
            (r.bio && r.bio.toLowerCase().includes(search.toLowerCase()))
        );
    }, [initialRappers, search]);

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
            <div className="search-bar glass-panel animate-fade-in" style={{ marginBottom: '2rem' }}>
                <Search size={20} className="text-secondary" />
                <input
                    type="text"
                    placeholder="Szukaj rapera..."
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
                            <div className="rappers-grid">
                                {groupedRappers[letter].map(rapper => (
                                    <RapperCard 
                                        key={rapper.id} 
                                        rapper={{
                                            id: rapper.id,
                                            name: rapper.name,
                                            bio: rapper.bio || '',
                                            ig: rapper.social_ig,
                                            fb: rapper.social_fb,
                                            yt: rapper.social_yt,
                                            images: rapper.images
                                        }} 
                                    />
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>
        </>
    );
}
