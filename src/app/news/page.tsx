'use client';

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Clock, Newspaper, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import "./news.css";
import { ViewTracker } from "@/components/ViewTracker";

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;       // legacy
  tags?: string[];        // new
  image_url?: string;
  created_at: string;
}

// Fixed ordered filter tabs (new system)
const FILTER_TAGS = ['VIDEO', 'TRACK', 'EVENT', 'PREMIERA', 'NEWS', 'SPONSOROWANE', 'WYWIAD', 'RELACJA', 'KONKURS', 'PUBLICYSTYKA', 'RECENZJA', 'INNE'];

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return 'Przed chwilą';
  if (diffH < 24) return `${diffH}h temu`;
  if (diffD < 7) return `${diffD} dni temu`;
  return new Date(dateStr).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
}

const ITEMS_PER_PAGE = 12;

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        let query = supabase
          .from('news')
          .select('id, slug, title, content, category, tags, image_url, created_at', { count: 'exact' });

        if (selectedTag) {
          // Filter by new tags[] OR legacy category for backward compat
          query = query.or(`tags.cs.{"${selectedTag}"},category.ilike.${selectedTag}`);
        }

        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) throw error;
        setNews(data || []);
        setTotalCount(count || 0);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, [currentPage, selectedTag]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleTagChange = (tag: string | null) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="news-page container animate-fade-in">
      <ViewTracker type="page" id="news" />
      <header className="page-header">
        <h1 className="page-header-title">
          <Newspaper size={32} /> NEWSY
        </h1>
        <p className="page-header-subtitle">
          Bądź na bieżąco z kulturą Hip-Hop w UK.
        </p>

        <div className="news-filters">
          <button
            className={`filter-btn ${selectedTag === null ? 'filter-btn--active' : ''}`}
            onClick={() => handleTagChange(null)}
          >
            WSZYSTKIE
          </button>
          {FILTER_TAGS.map(tag => (
            <button
              key={tag}
              className={`filter-btn ${selectedTag === tag ? 'filter-btn--active' : ''}`}
              onClick={() => handleTagChange(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
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
      ) : news.length === 0 ? (
        <div className="news-empty">
          <Newspaper size={64} strokeWidth={1} />
          <h2>Brak newsów</h2>
          <p>Nie znaleziono newsów w tej kategorii.</p>
          {selectedTag && (
             <button onClick={() => handleTagChange(null)} className="btn-primary" style={{ marginTop: '1rem' }}>
                Pokaż wszystkie newsy
             </button>
          )}
        </div>
      ) : (
        <>
          <div className="news-page__grid">
            {news.map((item) => {
              const isKonkurs = item.tags?.includes('KONKURS') || item.category === 'Konkurs';
              const isSponsorowane = item.tags?.includes('SPONSOROWANE') || item.category === 'Sponsorowane';
              const premiumClass = isKonkurs
                ? 'news-page__card--konkurs'
                : isSponsorowane
                ? 'news-page__card--sponsorowane'
                : '';
              const tagClass = isKonkurs
                ? 'news-tag--konkurs'
                : isSponsorowane
                ? 'news-tag--sponsorowane'
                : '';

              // Display tag: use first from new tags[], fallback to legacy category
              const displayTag = (item.tags && item.tags.length > 0)
                ? item.tags[0].toUpperCase()
                : item.category?.toUpperCase() || '';

              return (
                <Link
                  key={item.id}
                  href={`/news/${item.slug || item.id}`}
                  className={`news-page__card glass-panel ${premiumClass}`}
                >
                  {item.image_url && (
                    <div className="news-page__card-image">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image_url} alt={item.title} />
                    </div>
                  )}
                  <div className="news-page__card-body">
                    {displayTag && (
                      <span className={`news-tag ${tagClass}`}>
                        {isKonkurs ? '🏆 ' : isSponsorowane ? '⭐ ' : ''}{displayTag}
                      </span>
                    )}
                    <h2 className="news-page__card-title">{item.title}</h2>
                    {item.content && (
                      <p className="news-page__card-excerpt">
                        {item.content.replace(/<[^>]*>?/gm, '').slice(0, 160)}…
                      </p>
                    )}
                    <div className="news-meta">
                      <Clock size={12} />
                      {timeAgo(item.created_at)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination-container">
              <button
                className="pagination-btn pagination-btn--icon"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                aria-label="Poprzednia strona"
              >
                <ChevronLeft size={20} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? 'pagination-btn--active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="pagination-btn pagination-btn--icon"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                aria-label="Następna strona"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
