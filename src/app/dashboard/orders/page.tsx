'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronLeft, Package } from 'lucide-react';
import '../dashboard.css';

interface Order {
    id: string;
    customer_email: string;
    total_amount: number;
    status: string;
    items: Array<{ title: string; quantity: number; price: number }>;
    created_at: string;
    shipping_address?: {
        name: string;
        method: 'home' | 'locker' | null;
        locker_code: string | null;
        address: {
            line1: string | null;
            line2: string | null;
            city: string | null;
            state: string | null;
            postal_code: string | null;
            country: string | null;
        } | null;
    } | null;
}

const STATUS_COLORS: Record<string, string> = {
    pending: '#f59e0b',
    paid: '#10b981',
    shipped: '#6366f1',
    cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Oczekuje',
    paid: 'Opłacone',
    shipped: 'Wysłane',
    cancelled: 'Anulowane',
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
            setOrders((data || []) as Order[]);
            setLoading(false);
        };
        fetchOrders();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        await supabase.from('orders').update({ status }).eq('id', id);
        setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    };

    return (
        <div className="dashboard-container container animate-fade-in">
            <header className="dashboard-header">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="action-btn"><ChevronLeft size={24} /></Link>
                    <h1 className="text-2xl font-bold">Zamówienia</h1>
                </div>
            </header>

            {loading ? (
                <p className="text-center text-secondary mt-8">Ładowanie zamówień...</p>
            ) : orders.length === 0 ? (
                <div className="glass-panel p-12 text-center mt-8">
                    <Package size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                    <p className="text-secondary">Brak zamówień.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                    {orders.map((order) => (
                        <div key={order.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{order.customer_email}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        {new Date(order.created_at).toLocaleString('pl-PL')}
                                    </div>
                                    <div style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
                                        {Array.isArray(order.items) && order.items.map((item, i) => (
                                            <div key={i}>{item.quantity}× {item.title} — £{(item.price * item.quantity).toFixed(2)}</div>
                                        ))}
                                    </div>
                                    {order.shipping_address && (
                                        <div style={{ 
                                            marginTop: '1rem', 
                                            padding: '10px 14px', 
                                            borderRadius: '8px', 
                                            background: 'rgba(255,255,255,0.03)', 
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            fontSize: '0.85rem'
                                        }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                                <span>📦 Wysyłka:</span>
                                                <span style={{ 
                                                    textTransform: 'uppercase', 
                                                    fontSize: '0.72rem', 
                                                    padding: '2px 8px', 
                                                    borderRadius: '4px', 
                                                    background: order.shipping_address.method === 'locker' ? '#d9770620' : '#05966920',
                                                    color: order.shipping_address.method === 'locker' ? '#fbbf24' : '#34d399',
                                                    border: order.shipping_address.method === 'locker' ? '1px solid #d9770640' : '1px solid #05966940'
                                                }}>
                                                    {order.shipping_address.method === 'locker' ? 'Paczkomat InPost' : 'Adres Domowy'}
                                                </span>
                                                {order.shipping_address.method === 'locker' && order.shipping_address.locker_code && (
                                                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                                                        [{order.shipping_address.locker_code}]
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                <strong>{order.shipping_address.name}</strong><br />
                                                {order.shipping_address.address?.line1}
                                                {order.shipping_address.address?.line2 && `, ${order.shipping_address.address.line2}`}
                                                <br />
                                                {order.shipping_address.address?.postal_code} {order.shipping_address.address?.city}
                                                <br />
                                                {order.shipping_address.address?.country}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 900 }}>£{order.total_amount.toFixed(2)}</div>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 12px',
                                            borderRadius: '99px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: `${STATUS_COLORS[order.status]}20`,
                                            color: STATUS_COLORS[order.status],
                                            border: `1px solid ${STATUS_COLORS[order.status]}50`,
                                        }}>
                                            {STATUS_LABELS[order.status] || order.status}
                                        </span>
                                    </div>
                                    <select
                                        style={{ marginTop: '0.75rem', padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}
                                        value={order.status}
                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                    >
                                        <option value="pending">Oczekuje</option>
                                        <option value="paid">Opłacone</option>
                                        <option value="shipped">Wysłane</option>
                                        <option value="cancelled">Anulowane</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
