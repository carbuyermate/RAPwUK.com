'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { Ticket, Printer, AlertTriangle, Calendar, MapPin, User, Key, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import '../dashboard.css';

interface TicketProduct {
    id: string;
    title: string;
    ticket_event_date: string;
    ticket_city: string;
    ticket_venue: string;
}

interface Order {
    id: string;
    customer_email: string;
    total_amount: number;
    status: 'pending' | 'paid' | 'shipped' | 'cancelled';
    items: Array<{ id: string; title: string; quantity: number; price: number }>;
    created_at: string;
    ticket_buyer_name?: string;
    ticket_password?: string;
}

interface Attendee {
    order_id: string;
    customer_email: string;
    buyer_name: string;
    password: string;
    quantity: number;
    status: string;
    purchased_at: string;
}

interface TicketGroup {
    product: TicketProduct;
    attendees: Attendee[];
}

export default function TicketsDashboard() {
    const [groups, setGroups] = useState<TicketGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Fetch ticket products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('id, title, ticket_event_date, ticket_city, ticket_venue')
                .eq('category', 'bilety');

            if (productsError) throw productsError;
            const ticketProducts: TicketProduct[] = productsData || [];
            const ticketIds = new Set(ticketProducts.map(p => p.id));

            // 2. Fetch all orders (we filter them in JS)
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;
            const allOrders: Order[] = ordersData || [];

            // 3. Group attendees by ticket event
            const groupedMap = new Map<string, Attendee[]>();
            
            allOrders.forEach(order => {
                if (!Array.isArray(order.items)) return;
                
                order.items.forEach(item => {
                    if (ticketIds.has(item.id)) {
                        const existing = groupedMap.get(item.id) || [];
                        existing.push({
                            order_id: order.id,
                            customer_email: order.customer_email,
                            buyer_name: order.ticket_buyer_name || order.customer_email.split('@')[0],
                            password: order.ticket_password || 'Brak hasła',
                            quantity: item.quantity,
                            status: order.status,
                            purchased_at: order.created_at
                        });
                        groupedMap.set(item.id, existing);
                    }
                });
            });

            const finalGroups: TicketGroup[] = ticketProducts.map(product => ({
                product,
                attendees: groupedMap.get(product.id) || []
            })).sort((a, b) => new Date(a.product.ticket_event_date || 0).getTime() - new Date(b.product.ticket_event_date || 0).getTime());

            setGroups(finalGroups);
            if (finalGroups.length > 0) setExpandedEventId(finalGroups[0].product.id);
        } catch (err: any) {
            console.error('Error fetching tickets:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (eventId: string) => {
        // Zwijamy resztę i drukujemy
        setExpandedEventId(eventId);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const toggleStatus = async (orderId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
        try {
            const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
            if (error) throw error;
            fetchData(); // Refresh UI
        } catch (err) {
            alert('Błąd aktualizacji statusu zamówienia');
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container container">
                <p className="text-secondary" style={{ padding: '4rem', textAlign: 'center' }}>Pobieranie list gości...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container container animate-fade-in print-container">
            {/* STYLES FOR PRINTING PDF */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-container, .print-container * {
                        visibility: visible;
                    }
                    .print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    .ticket-group-card {
                        border: none !important;
                        background: none !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                    }
                    .print-header {
                        margin-bottom: 2rem;
                        border-bottom: 2px solid #000;
                        padding-bottom: 1rem;
                    }
                    .print-table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .print-table th, .print-table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                        color: #000 !important;
                    }
                    .print-table th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                    }
                }
            `}} />

            <div className="flex justify-between items-center mb-6 no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="section-title m-0" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Ticket size={24} /> Zarządzanie Biletami (Listy Gości)
                </h1>
                <Link href="/dashboard" className="btn-secondary text-sm">
                    Powrót
                </Link>
            </div>

            {error && (
                <div className="glass-panel text-center no-print" style={{ borderColor: 'rgba(239,68,68,0.2)', padding: '2rem', marginBottom: '2rem' }}>
                    <AlertTriangle size={36} style={{ margin: '0 auto 1rem', color: '#ef4444', opacity: 0.7 }} />
                    <p style={{ color: '#ef4444' }}>Błąd pobierania danych: {error}</p>
                </div>
            )}

            {groups.length === 0 ? (
                <div className="glass-panel text-center no-print" style={{ padding: '4rem' }}>
                    <p>Brak wydarzeń biletowanych w bazie.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {groups.map(group => {
                        const isExpanded = expandedEventId === group.product.id;
                        const totalTickets = group.attendees.reduce((sum, a) => sum + a.quantity, 0);
                        const paidTickets = group.attendees.filter(a => a.status === 'paid').reduce((sum, a) => sum + a.quantity, 0);

                        return (
                            <div key={group.product.id} className="ticket-group-card glass-panel" style={{ display: isExpanded ? 'block' : 'none', '@media screen': { display: 'block' } } as any}>
                                
                                {/* CARD HEADER (SCREEN) */}
                                <div className="no-print" style={{ 
                                    padding: '1.5rem', 
                                    borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '1rem',
                                    background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent',
                                    cursor: 'pointer'
                                }} onClick={() => setExpandedEventId(isExpanded ? null : group.product.id)}>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>{group.product.title}</h2>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {group.product.ticket_event_date || 'Brak daty'}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {group.product.ticket_venue || 'Brak klubu'}, {group.product.ticket_city || 'Brak miasta'}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ textAlign: 'right', marginRight: '1rem' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sprzedane bilety</div>
                                            <div style={{ fontWeight: 'bold', color: '#10b981' }}>{paidTickets} / {totalTickets} opłaconych</div>
                                        </div>
                                        {isExpanded && (
                                            <button 
                                                className="btn-primary" 
                                                onClick={(e) => { e.stopPropagation(); handlePrint(group.product.id); }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '8px 16px', fontSize: '0.85rem' }}
                                            >
                                                <Printer size={16} /> Pobierz PDF
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* HEADER (PRINT ONLY) */}
                                <div className="print-only print-header" style={{ display: 'none' }}>
                                    <h1 style={{ color: '#000', margin: '0 0 10px 0', fontSize: '24px' }}>Lista Gości: {group.product.title}</h1>
                                    <p style={{ color: '#333', margin: '0 0 5px 0' }}>Data: {group.product.ticket_event_date}</p>
                                    <p style={{ color: '#333', margin: '0 0 15px 0' }}>Miejsce: {group.product.ticket_venue}, {group.product.ticket_city}</p>
                                    <p style={{ color: '#333', margin: 0, fontWeight: 'bold' }}>Łącznie sprzedanych biletów (opłaconych): {paidTickets}</p>
                                </div>

                                {/* ATTENDEES TABLE */}
                                {isExpanded && (
                                    <div style={{ padding: '1.5rem', overflowX: 'auto' }}>
                                        {group.attendees.length === 0 ? (
                                            <p className="text-secondary text-center">Brak zamówień dla tego wydarzenia.</p>
                                        ) : (
                                            <table className="print-table w-full text-left" style={{ width: '100%', minWidth: '600px' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                                                        <th style={{ padding: '12px 8px', fontWeight: 500 }}>Imię i Nazwisko</th>
                                                        <th style={{ padding: '12px 8px', fontWeight: 500 }}>Hasło</th>
                                                        <th style={{ padding: '12px 8px', fontWeight: 500, textAlign: 'center' }}>Ilość</th>
                                                        <th className="no-print" style={{ padding: '12px 8px', fontWeight: 500 }}>Data Zakupu</th>
                                                        <th style={{ padding: '12px 8px', fontWeight: 500, textAlign: 'center' }}>Status</th>
                                                        <th className="no-print" style={{ padding: '12px 8px', fontWeight: 500, textAlign: 'right' }}>Akcja</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {group.attendees.map((attendee, idx) => (
                                                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: attendee.status === 'paid' ? 1 : 0.6 }}>
                                                            <td style={{ padding: '12px 8px' }}>
                                                                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <User size={14} className="text-secondary no-print" /> 
                                                                    {attendee.buyer_name}
                                                                </div>
                                                                <div className="text-secondary text-xs no-print" style={{ marginTop: '2px' }}>{attendee.customer_email}</div>
                                                            </td>
                                                            <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.1em', letterSpacing: '1px' }}>
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <Key size={14} className="text-secondary no-print" /> 
                                                                    {attendee.password}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2em' }}>
                                                                {attendee.quantity}
                                                            </td>
                                                            <td className="no-print" style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                                {new Date(attendee.purchased_at).toLocaleDateString('pl-PL')}
                                                            </td>
                                                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                                {attendee.status === 'paid' ? (
                                                                    <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.85rem' }}>
                                                                        <CheckCircle size={14} /> Opłacone
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.85rem' }}>
                                                                        <Clock size={14} /> Oczekuje
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="no-print" style={{ padding: '12px 8px', textAlign: 'right' }}>
                                                                <button 
                                                                    onClick={() => toggleStatus(attendee.order_id, attendee.status)}
                                                                    style={{ 
                                                                        background: attendee.status === 'paid' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                                                                        color: attendee.status === 'paid' ? '#f59e0b' : '#10b981',
                                                                        border: attendee.status === 'paid' ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(16,185,129,0.3)',
                                                                        padding: '4px 10px',
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.75rem',
                                                                        cursor: 'pointer',
                                                                        fontWeight: 600
                                                                    }}
                                                                >
                                                                    {attendee.status === 'paid' ? 'Oznacz jako Nieopłacone' : 'Oznacz jako Opłacone'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
