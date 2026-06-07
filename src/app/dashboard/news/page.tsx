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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const ITEMS_PER_PAGE = 15;

    const fetchNews = async (page: number) => {
        setLoading(true);
        const from = (page - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        const { data, count, error } = await supabase
            .from('news')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);
        
        if (error) {
            console.error('Błąd pobierania newsów:', error);
        } else {
            if (data) setNews(data);
            if (count !== null) setTotalCount(count);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNews(currentPage);
    }, [currentPage]);

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Czy wiesz na pewno, że chcesz usunąć news: "${title}"?`)) {
            return;
        }

        try {
            await deleteNews(id);
            if (news.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            } else {
                fetchNews(currentPage);
            }
        } catch (error: any) {
            alert('Błąd usuwania: ' + error.message);
        }
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const getPageNumbers = () => {
        const delta = 2;
        const left = currentPage - delta;
        const right = currentPage + delta + 1;
        const range = [];
        const rangeWithDots: (number | string)[] = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= left && i < right)) {
                range.push(i);
            }
        }

        for (const i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l > 2) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
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
                            <th>Popularność</th>
                            <th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-4">Ładowanie...</td></tr>
                        ) : news.length > 0 ? (
                            news.map((item) => (
                                <tr key={item.id} className="dash-table-row">
                                    <td>{new Date(item.created_at).toLocaleDateString('pl-PL')}</td>
                                    <td className="font-semibold">{item.title}</td>
                                    <td><span className="news-tag">{item.category}</span></td>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        <span style={{ color: '#22c55e', fontWeight: 600 }}>👍 {item.likes || 0}</span>
                                        <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
                                        <span style={{ color: '#ef4444', fontWeight: 600 }}>👎 {item.dislikes || 0}</span>
                                    </td>
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
                                <td colSpan={5} className="text-center py-8 text-secondary">
                                    Brak dodanych newsów.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="pagination-container">
                        <p className="text-secondary text-sm">
                            Pokazuje {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalCount)} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} z {totalCount} newsów
                        </p>
                        <div className="pagination-controls">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1 || loading}
                                className="pagination-btn"
                            >
                                Poprzednia
                            </button>
                            
                            {getPageNumbers().map((pageNum, idx) => {
                                if (pageNum === '...') {
                                    return <span key={`dots-${idx}`} className="pagination-ellipsis">...</span>;
                                }
                                return (
                                    <button
                                        key={`page-${pageNum}`}
                                        onClick={() => setCurrentPage(Number(pageNum))}
                                        disabled={loading}
                                        className={`pagination-btn pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || loading}
                                className="pagination-btn"
                            >
                                Następna
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
