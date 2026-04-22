import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowLeft } from "lucide-react";
import { ViewTracker } from "@/components/ViewTracker";
import "../news.css";
import "./article.css";

interface NewsDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url?: string;
  youtube_url?: string;
  youtube_url_2?: string;
  youtube_url_3?: string;
  created_at: string;
}

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://rapwuk.com';

function toAbsoluteUrl(url: string | undefined | null): string {
  if (!url) return `${BASE_URL}/logo.jpg`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

async function getArticle(slug: string): Promise<NewsDetail | null> {
  let { data } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!data) {
    const { data: idData } = await supabase
      .from('news')
      .select('*')
      .eq('id', slug)
      .maybeSingle();
    data = idData;
  }

  return data as NewsDetail | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return {};

  const description = article.content
    ? article.content.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)
    : 'Przeczytaj najnowszy news na RAPwUK.com';

  const ogImage = toAbsoluteUrl(article.image_url);
  const pageUrl = `${BASE_URL}/news/${slug}`;

  return {
    metadataBase: new URL(BASE_URL),
    title: `${article.title} | RAPwUK.com`,
    description,
    openGraph: {
      title: article.title,
      description,
      url: pageUrl,
      siteName: 'RAPwUK.com',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      locale: 'pl_PL',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@RAPwUK',
      creator: '@RAPwUK',
      title: article.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  // Fallback search by ID if slug lookup fails
  if (!data) {
    const { data: idData } = await supabase
      .from('news')
      .select('*')
      .eq('id', slug)
      .maybeSingle();
    
    if (idData) {
        data = idData;
    }
  }

  if (!data) notFound();

  const article = data as NewsDetail;
  const date = new Date(article.created_at).toLocaleDateString('pl-PL', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // Fetch related news (5 latest, excluding current)
  const { data: relatedNewsData } = await supabase
    .from('news')
    .select('id, title, slug, image_url, category, created_at')
    .neq('id', article.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const relatedNews = relatedNewsData || [];

  return (
    <div className="article-page container animate-fade-in">
      <ViewTracker type="news" id={article.id} />
      <div className="article-back">
        <Link href="/news" className="back-link">
          <ArrowLeft size={16} /> Wszystkie newsy
        </Link>
      </div>

      <article className="article-content">
        {article.image_url && (
          <div className="article-hero-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.image_url} alt={article.title} />
          </div>
        )}

        <div className="article-meta">
          {article.category && (
            <span className="news-tag news-tag--highlight">{article.category}</span>
          )}
          <span className="news-meta">
            <Clock size={12} />
            {date}
          </span>
        </div>

        <h1 className="article-title">{article.title}</h1>

        <div 
          className="article-body rich-content"
          dangerouslySetInnerHTML={{ __html: article.content || '' }}
        >
        </div>

        {[article.youtube_url, article.youtube_url_2, article.youtube_url_3].map((url, index) => (
          url && (
            <div key={index} className="mt-8 rounded-xl overflow-hidden border border-white/10 shadow-2xl" style={{ aspectRatio: '16/9' }}>
                <iframe
                    width="100%"
                    height="100%"
                    src={getYouTubeEmbedUrl(url) || url}
                    title={`YouTube video player ${index + 1}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ display: 'block', background: '#000' }}
                ></iframe>
            </div>
          )
        ))}
      </article>

      {/* Czytaj też: 5 najnowszych newsów (tylko tytuły) */}
      {relatedNews.length > 0 && (
        <div 
          className="animate-fade-in" 
          style={{ 
            fontSize: '1.05rem', 
            lineHeight: '1.8', 
            marginTop: '3rem', 
            paddingTop: '2rem', 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
          }}
        >
          <p style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Czytaj też:
          </p>
          <ul style={{ listStyleType: 'none', paddingLeft: 0, margin: 0 }}>
            {relatedNews.map((item) => (
              <li key={item.id} style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem', opacity: 0.7 }}>•</span>
                <Link 
                  href={`/news/${item.slug || item.id}`} 
                  className="hover-opacity"
                  style={{ textDecoration: 'none', color: 'var(--text-secondary)', display: 'block' }}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function getYouTubeEmbedUrl(url: string) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
}
