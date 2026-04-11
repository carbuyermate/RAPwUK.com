import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Tag, ArrowLeft } from "lucide-react";
import "../news.css";
import "./article.css";

interface NewsDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url?: string;
  created_at: string;
}

export const dynamic = 'force-dynamic';

export default async function NewsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) notFound();

  const article = data as NewsDetail;
  const date = new Date(article.created_at).toLocaleDateString('pl-PL', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="article-page container animate-fade-in">
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
      </article>
    </div>
  );
}
