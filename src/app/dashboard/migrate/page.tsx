'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { createSlug } from '@/lib/utils';
import '../../dashboard.css';

export default function MigratePage() {
    const [status, setStatus] = useState<string>('Gotowy do rozpoczęcia');
    const [progress, setProgress] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const log = (msg: string) => setProgress(prev => [...prev, msg]);

    const runMigration = async () => {
        setLoading(true);
        setStatus('Migracja w toku...');
        setProgress([]);

        try {
            // 1. News
            log('Pobieram Newsy...');
            const { data: newsData } = await supabase.from('news').select('id, title, slug');
            if (newsData) {
                for (const item of newsData) {
                    if (!item.slug || item.slug === 'null') {
                        const newSlug = createSlug(item.title);
                        log(`Aktualizuje News: ${newSlug}`);
                        await supabase.from('news').update({ slug: newSlug }).eq('id', item.id);
                    }
                }
            }

            // 2. Events
            log('Pobieram Wydarzenia...');
            const { data: eventsData } = await supabase.from('events').select('id, title, slug');
            if (eventsData) {
                for (const item of eventsData) {
                    if (!item.slug || item.slug === 'null') {
                        const newSlug = createSlug(item.title);
                        log(`Aktualizuje Wydarzenie: ${newSlug}`);
                        await supabase.from('events').update({ slug: newSlug }).eq('id', item.id);
                    }
                }
            }

            // 3. Rappers
            log('Pobieram Scenę...');
            const { data: rappersData } = await supabase.from('rappers').select('id, name, slug');
            if (rappersData) {
                for (const item of rappersData) {
                    if (!item.slug || item.slug === 'null') {
                        const newSlug = createSlug(item.name);
                        log(`Aktualizuje Artystę: ${newSlug}`);
                        await supabase.from('rappers').update({ slug: newSlug }).eq('id', item.id);
                    }
                }
            }

            setStatus('Migracja zakończona sukcesem!');
            log('Wszystkie brakujące slugi zostały wygenerowane i zapisane w bazie danych.');
        } catch (error: any) {
            setStatus('Wystąpił błąd podczas migracji.');
            log(`Błąd: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container container mt-12 animate-fade-in">
            <div className="glass-panel p-8 max-w-2xl mx-auto text-center">
                <h1 className="text-2xl font-bold mb-4">Migracja Adresów URL (Slugi)</h1>
                <p className="text-secondary mb-8">
                    Uruchom ten skrypt, aby wygenerować i zapisać w bazie danych brakujące "przyjazne linki" (slugi) dla wszystkich starszych wpisów. Ponieważ wymaga to Twoich uprawnień administratora, skrypt musi zostać uruchomiony stąd.
                </p>

                <button 
                    onClick={runMigration} 
                    disabled={loading}
                    className="btn-primary py-3 px-8 text-lg w-full mb-8"
                >
                    {loading ? 'Generowanie w toku...' : '🚀 Rozpocznij Wyliczanie Slugów'}
                </button>

                <div className="text-left bg-black/40 p-4 rounded-xl min-h-[200px] border border-white/10 font-mono text-sm overflow-y-auto max-h-[400px]">
                    <div className="text-blue-400 mb-2">{status}</div>
                    {progress.map((msg, i) => (
                        <div key={i} className="text-secondary opacity-70 mb-1">{`> ${msg}`}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
