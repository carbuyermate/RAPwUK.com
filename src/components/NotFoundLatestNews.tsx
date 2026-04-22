'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface NewsItem {
    id: string;
    slug: string;
    title: string;
    image_url?: string;
}

export function NotFoundLatestNews() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTopNews() {
            const { data, error } = await supabase
                .from('news')
                .select('id, slug, title, image_url')
                .order('created_at', { ascending: false })
                .limit(5);

            if (data) {
                setNews(data);
            }
            setLoading(false);
        }
        fetchTopNews();
    }, []);

    if (loading) {
        return <div className="text-secondary text-sm text-center py-4">Ładowanie newsów...</div>;
    }

    if (news.length === 0) {
        return null;
    }

    return (
        <div className="not-found-news-section animate-fade-in">
            <h3 className="not-found-news-header">Zanim pójdziesz dalej, sprawdź najnowsze newsy:</h3>
            <div className="not-found-news-list">
                {news.map(item => (
                    <Link key={item.id} href={`/news/${item.slug || item.id}`} className="not-found-news-item">
                        {item.image_url && (
                            <div className="not-found-news-thumb">
                                <img src={item.image_url} alt={item.title} />
                            </div>
                        )}
                        <h4 className="not-found-news-title">{item.title}</h4>
                    </Link>
                ))}
            </div>
        </div>
    );
}
