'use client';

import { supabase } from '@/lib/supabase';
import { Edit2, Trash2, Newspaper, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { deleteNews } from '../actions';
import '../dashboard.css';

export default function ManagingNewsPage() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNews = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('news')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (data) setNews(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Czy wiesz na pewno, że chcesz usunąć news: "${title}"?`)) {
            return;
        }

        try {
            await deleteNews(id);
            setNews(news.filter(n => n.id !== id));
        } catch (error: any) {
            alert('Błąd usuwania: ' + error.message);
        }
    };

    return (
        <div className="dashboard-container container animate-fade-in">
            <header className="dashboard-header">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="action-btn">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Newspaper size={24} /> Zarządzaj Newsami
                    </h1>
                </div>
                <Link href="/dashboard/add-news" className="btn-primary">
                    + Dodaj News
                </Link>
            </header>

            <div className="events-table-container glass-panel mt-6">
                <table className="events-table">
                    <thead>
                        <tr>
                            <th>Data Dodania</th>
                            <th>Tytuł</th>
                            <th>Kategoria</th>
                            <th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="text-center py-4">Ładowanie...</td></tr>
                        ) : news.length > 0 ? (
                            news.map((item) => (
                                <tr key={item.id} className="event-row">
                                    <td>{new Date(item.created_at).toLocaleDateString('pl-PL')}</td>
                                    <td className="font-semibold">{item.title}</td>
                                    <td><span className="news-tag">{item.category}</span></td>
                                    <td>
                                        <div className="action-btns">
                                            <Link href={`/dashboard/edit-news/${item.id}`} className="action-btn" title="Edytuj">
                                                <Edit2 size={16} />
                                            </Link>
                                            <button onClick={() => handleDelete(item.id, item.title)} className="action-btn delete" title="Usuń">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-secondary">
                                    Brak dodanych newsów.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
