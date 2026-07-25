import Link from 'next/link';
import { Flame, Eye } from 'lucide-react';
import './top-news-widget.css';

export interface TopNewsItem {
    id: string;
    slug: string;
    title: string;
    image_url?: string | null;
    views?: number | null;
    created_at?: string;
}

interface TopNewsWidgetProps {
    news: TopNewsItem[];
}

export function TopNewsWidget({ news }: TopNewsWidgetProps) {
    if (!news || news.length === 0) return null;

    return (
        <div className="top-news-widget glass-panel">
            <div className="top-news-widget__header">
                <Flame size={18} style={{ color: '#ef4444' }} />
                <span className="top-news-widget__label">TOP 5 NEWSÓW</span>
            </div>

            <div className="top-news-widget__list">
                {news.map((item, index) => (
                    <Link
                        key={item.id}
                        href={`/news/${item.slug || item.id}`}
                        className="top-news-widget__item"
                    >
                        <div className={`top-news-widget__rank rank-${index + 1}`}>
                            #{index + 1}
                        </div>

                        {item.image_url && (
                            <div className="top-news-widget__thumb">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.image_url} alt={item.title} />
                            </div>
                        )}

                        <div className="top-news-widget__info">
                            <h4 className="top-news-widget__title">{item.title}</h4>
                            <div className="top-news-widget__meta">
                                {item.views !== undefined && item.views !== null && item.views > 0 ? (
                                    <span className="top-news-widget__views">
                                        <Eye size={11} /> {item.views.toLocaleString('pl-PL')}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
