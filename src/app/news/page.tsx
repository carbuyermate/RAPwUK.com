'use client';

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Clock, Newspaper, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import "./news.css";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url?: string;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return 'Przed chwilą';
  if (diffH < 24) return `${diffH}h temu`;
  if (diffD < 7) return `${diffD} dni temu`;
  return new Date(dateStr).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNews(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  // Extract unique categories from actual news data
  const publishedCategories = Array.from(new Set(news.map(item => item.category).filter(Boolean)));

  const filteredNews = selectedCategory 
    ? news.filter(item => item.category === selectedCategory)
    : news;

  return (
    <div className="news-page container animate-fade-in">
      <header className="news-page__header">
        <h1 className="news-page__title">
          <Newspaper size={32} /> Newsy
        </h1>
        <p className="news-page__subtitle">
          Bądź na bieżąco z kulturą Hip-Hop w UK.
        </p>

        {!loading && news.length > 0 && (
          <div className="news-filters">
            <button 
              className={`filter-btn ${selectedCategory === null ? 'filter-btn--active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              Wszystkie
            </button>
            {publishedCategories.map(cat => (
              <button 
                key={cat}
                className={`filter-btn ${selectedCategory === cat ? 'filter-btn--active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      {error && (
        <div className="news-error">Błąd ładowania: {error}</div>
      )}

      {loading ? (
         <div className="news-empty">
            <div className="animate-pulse flex flex-col items-center">
                <Newspaper size={64} className="opacity-20 mb-4" />
                <p>Ładowanie newsów...</p>
            </div>
         </div>
      ) : filteredNews.length === 0 ? (
        <div className="news-empty">
          <Newspaper size={64} strokeWidth={1} />
          <h2>Brak newsów</h2>
          <p>Nie znaleziono newsów w tej kategorii.</p>
          {selectedCategory && (
             <button onClick={() => setSelectedCategory(null)} className="btn-primary" style={{ marginTop: '1rem' }}>
                Pokaż wszystkie newsy
             </button>
          )}
        </div>
      ) : (
        <div className="news-page__grid">
          {filteredNews.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.id}`}
              className={`news-page__card glass-panel ${item.category === 'Sponsorowane' ? 'sponsored-card' : ''}`}
            >
              {item.image_url && (
                <div className="news-page__card-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image_url} alt={item.title} />
                </div>
              )}
              <div className="news-page__card-body">
                {item.category && (
                  <span className={`news-tag ${item.category === 'Sponsorowane' ? 'news-tag--sponsored' : ''}`}>
                    {item.category}
                  </span>
                )}
                <h2 className="news-page__card-title">{item.title}</h2>
                {item.content && (
                  <p className="news-page__card-excerpt">
                    {item.content.replace(/<[^>]*>?/gm, '').slice(0, 200)}…
                  </p>
                )}
                <p className="news-meta">
                  <Clock size={12} />
                  {timeAgo(item.created_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
