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
  created_at: string;
}

export const dynamic = 'force-dynamic';

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
    ? article.content.replace(/<[^>]*>?/gm, '').slice(0, 160)
    : 'Przeczytaj najnowszy news na RAPwUK.com';

  return {
    title: `${article.title} | RAPwUK.com`,
    description,
    openGraph: {
      title: article.title,
      description,
      url: `https://rapwuk.com/news/${slug}`,
      siteName: 'RAPwUK.com',
      images: article.image_url
        ? [{ url: article.image_url, width: 1200, height: 630, alt: article.title }]
        : [{ url: '/logo.jpg', width: 1080, height: 1080, alt: 'RAPwUK logo' }],
      locale: 'pl_PL',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: article.image_url ? [article.image_url] : ['/logo.jpg'],
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

        {article.youtube_url && (
            <div className="mt-12 rounded-xl overflow-hidden border border-white/10 shadow-2xl" style={{ aspectRatio: '16/9' }}>
                <iframe
                    width="100%"
                    height="100%"
                    src={getYouTubeEmbedUrl(article.youtube_url) || article.youtube_url}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ display: 'block', background: '#000' }}
                ></iframe>
            </div>
        )}
      </article>
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
