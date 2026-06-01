'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronLeft, Plus, Trash2, Edit, Package } from 'lucide-react';
import '../dashboard.css';

interface Product {
    id: string;
    title: string;
    price: number;
    category: string;
    stock: number;
    is_active: boolean;
    image_url?: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        setProducts(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchProducts(); }, []);

    const deleteProduct = async (id: string) => {
        if (!confirm('Czy na pewno chcesz usunąć ten produkt?')) return;
        await supabase.from('products').delete().eq('id', id);
        fetchProducts();
    };

    const categoryLabel: Record<string, string> = { muzyka: '🎵 Muzyka', bilety: '🎟️ Bilety', ubrania: '👕 Ubrania' };

    return (
        <div className="dashboard-container container animate-fade-in">
            <header className="dashboard-header">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="action-btn"><ChevronLeft size={24} /></Link>
                    <h1 className="text-2xl font-bold">Produkty Sklepu</h1>
                </div>
                <Link href="/dashboard/add-product" className="btn-primary flex items-center gap-2 px-5 py-2">
                    <Plus size={18} /> Dodaj produkt
                </Link>
            </header>

            {loading ? (
                <p className="text-center text-secondary mt-8">Ładowanie...</p>
            ) : products.length === 0 ? (
                <div className="glass-panel p-12 text-center mt-8">
                    <Package size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                    <p className="text-secondary">Brak produktów. Dodaj pierwszy!</p>
                </div>
            ) : (
                <div className="glass-panel mt-6" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Produkt</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Kategoria</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Cena</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Stan</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p, i) => (
                                <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ fontWeight: 700 }}>{p.title}</div>
                                        <div style={{ fontSize: '0.72rem', display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                            <span style={{ color: p.is_active ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                                {p.is_active ? '● Aktywny' : '● Nieaktywny'}
                                            </span>
                                            {p.is_active && (
                                                <span style={{ 
                                                    color: p.stock > 0 ? '#34d399' : '#fbbf24', 
                                                    background: p.stock > 0 ? '#10b98115' : '#f59e0b15',
                                                    border: p.stock > 0 ? '1px solid #10b98130' : '1px solid #f59e0b30',
                                                    padding: '1px 6px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.68rem',
                                                    fontWeight: 600
                                                }}>
                                                    {p.stock > 0 ? 'w sprzedaży' : 'brak na magazynie'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{categoryLabel[p.category] || p.category}</td>
                                    <td style={{ padding: '1rem', fontWeight: 700 }}>£{p.price.toFixed(2)}</td>
                                    <td style={{ padding: '1rem' }}>{p.stock} szt.</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <Link href={`/dashboard/edit-product/${p.id}`} className="action-btn" title="Edytuj">
                                                <Edit size={16} />
                                            </Link>
                                            <button onClick={() => deleteProduct(p.id)} className="action-btn danger-btn" title="Usuń">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
