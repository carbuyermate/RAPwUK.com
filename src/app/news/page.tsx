import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Clock, Newspaper, ArrowLeft } from "lucide-react";
import "./news.css";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

export default async function NewsPage() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });

  const news = (data || []) as NewsItem[];

  return (
    <div className="news-page container animate-fade-in">
      <header className="news-page__header">
        <h1 className="news-page__title">
          <Newspaper size={32} /> Newsy
        </h1>
        <p className="news-page__subtitle">
          Najświeższe informacje ze sceny polskiego hip-hopu na Wyspach.
        </p>
      </header>

      {error && (
        <div className="news-error">Błąd ładowania: {error.message}</div>
      )}

      {news.length === 0 ? (
        <div className="news-empty">
          <Newspaper size={64} strokeWidth={1} />
          <h2>Brak newsów</h2>
          <p>Nie ma jeszcze żadnych newsów. Wróć wkrótce!</p>
          <Link href="/" className="btn-primary">← Wróć na stronę główną</Link>
        </div>
      ) : (
        <div className="news-page__grid">
          {news.map((item) => (
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
