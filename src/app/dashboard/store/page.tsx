'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft, Plus, Trash2, Edit, Package,
    ClipboardList, BarChart3, TrendingUp, DollarSign, Percent,
    ShoppingBasket, UserCheck, Calendar, AlertTriangle, Users
} from 'lucide-react';
import '../dashboard.css';

interface Product {
    id: string;
    title: string;
    price: number;
    purchase_price: number;
    category: string;
    stock: number;
    is_active: boolean;
    image_url?: string;
    created_at: string;
}

interface OrderItem {
    id: string;
    order_id: string;
    product_id: string | null;
    product_name: string;
    price_sold: number;
    purchase_price: number;
    quantity: number;
    created_at: string;
}

// ─── StatsTabContent ─────────────────────────────────────────────────────────
// Isolated component: loads order_items itself; if it crashes only this tab
// is affected, not the whole store page.
function StatsTabContent({ products, orders }: { products: Product[]; orders: Order[] }) {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [datePreset, setDatePreset] = useState<string>('thismonth');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState<string | null>(null);

    useEffect(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const toISO = (d: Date) => d.toISOString().split('T')[0];
        setCustomStartDate(toISO(startOfMonth));
        setCustomEndDate(toISO(now));
    }, []);

    useEffect(() => {
        (async () => {
            setStatsLoading(true);
            setStatsError(null);
            try {
                const { data, error } = await supabase
                    .from('order_items')
                    .select('*')
                    .order('created_at', { ascending: true });
                if (error) throw new Error(error.message);
                setOrderItems((data || []) as OrderItem[]);
            } catch (e: any) {
                setStatsError(e.message || 'Błąd ładowania danych');
            } finally {
                setStatsLoading(false);
            }
        })();
    }, []);

    const getDateRange = (): { start: Date; end: Date } => {
        const now = new Date();
        switch (datePreset) {
            case 'today': { const s = new Date(now); s.setHours(0,0,0,0); return { start: s, end: now }; }
            case 'yesterday': { const y = new Date(now); y.setDate(y.getDate()-1); y.setHours(0,0,0,0); const ye = new Date(y); ye.setHours(23,59,59,999); return { start: y, end: ye }; }
            case '7days': { const s = new Date(now); s.setDate(s.getDate()-6); s.setHours(0,0,0,0); return { start: s, end: now }; }
            case 'lastmonth': { const s = new Date(now.getFullYear(), now.getMonth()-1, 1); const e = new Date(now.getFullYear(), now.getMonth(), 0, 23,59,59,999); return { start: s, end: e }; }
            case 'ytd': { const s = new Date(now.getFullYear(), 0, 1); return { start: s, end: now }; }
            case 'custom': {
                const s = customStartDate ? new Date(customStartDate) : new Date(now.getFullYear(), now.getMonth(), 1);
                const e = customEndDate ? new Date(customEndDate + 'T23:59:59') : now;
                return { start: s, end: e };
            }
            default: { const s = new Date(now.getFullYear(), now.getMonth(), 1); return { start: s, end: now }; }
        }
    };

    if (statsLoading) return <div className="text-center py-12"><p className="text-secondary animate-pulse">Ładowanie statystyk...</p></div>;
    if (statsError) return (
        <div className="glass-panel p-8 text-center mt-4" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
            <AlertTriangle size={36} style={{ margin: '0 auto 1rem', color: '#ef4444', opacity: 0.7 }} />
            <p className="font-semibold" style={{ color: '#ef4444' }}>Błąd ładowania statystyk</p>
            <p className="text-secondary text-sm mt-2">{statsError}</p>
            <p className="text-secondary text-xs mt-3">Upewnij się że uruchomiłeś <code>migration_store_analytics_tables.sql</code> w Supabase.</p>
        </div>
    );

    const { start: filterStart, end: filterEnd } = getDateRange();

    const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'shipped');
    const ordersInRange = paidOrders.filter(o => {
        const d = new Date(o.created_at);
        return !isNaN(d.getTime()) && d >= filterStart && d <= filterEnd;
    });

    const grossRevenue = ordersInRange.reduce((s, o) => s + Number(o.total_amount || 0), 0);
    const totalOrders = ordersInRange.length;
    const aov = totalOrders > 0 ? grossRevenue / totalOrders : 0;

    const itemsInRange = orderItems.filter(i => {
        const d = new Date(i.created_at);
        return !isNaN(d.getTime()) && d >= filterStart && d <= filterEnd;
    });
    const totalCost = itemsInRange.reduce((s, i) => s + (Number(i.purchase_price || 0) * Number(i.quantity || 1)), 0);
    const netProfit = grossRevenue - totalCost;
    const roi = totalCost > 0 ? ((netProfit / totalCost) * 100) : 0;
    const unitsSold = itemsInRange.reduce((s, i) => s + Number(i.quantity || 0), 0);

    const customerLtvMap = new Map<string, { email: string; totalSpent: number; orders: number }>();
    ordersInRange.forEach(o => {
        const email = (o.customer_email || '').trim().toLowerCase() || 'unknown';
        const existing = customerLtvMap.get(email);
        if (existing) { existing.totalSpent += Number(o.total_amount || 0); existing.orders += 1; }
        else { customerLtvMap.set(email, { email, totalSpent: Number(o.total_amount || 0), orders: 1 }); }
    });
    const topCustomers = Array.from(customerLtvMap.values()).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

    const msDiff = filterEnd.getTime() - filterStart.getTime();
    const groupByMonth = msDiff / (1000 * 60 * 60 * 24) > 60;
    const chartPointsMap = new Map<string, number>();
    if (groupByMonth) {
        let cur = new Date(filterStart.getFullYear(), filterStart.getMonth(), 1);
        while (cur <= filterEnd) {
            chartPointsMap.set(`${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}`, 0);
            cur.setMonth(cur.getMonth()+1);
        }
        ordersInRange.forEach(o => {
            const d = new Date(o.created_at);
            const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
            if (chartPointsMap.has(k)) chartPointsMap.set(k, chartPointsMap.get(k)! + Number(o.total_amount));
        });
    } else {
        let cur = new Date(filterStart);
        while (cur <= filterEnd) {
            chartPointsMap.set(cur.toISOString().split('T')[0], 0);
            cur.setDate(cur.getDate()+1);
        }
        ordersInRange.forEach(o => {
            const k = new Date(o.created_at).toISOString().split('T')[0];
            if (chartPointsMap.has(k)) chartPointsMap.set(k, chartPointsMap.get(k)! + Number(o.total_amount));
        });
    }
    const monthNames = ['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'];
    const chartData = Array.from(chartPointsMap.entries()).map(([label, value]) => {
        let displayLabel = label;
        if (groupByMonth) { const [yr, mo] = label.split('-'); displayLabel = `${monthNames[parseInt(mo)-1]} ${yr.substring(2)}`; }
        else { const [,mo,dy] = label.split('-'); displayLabel = `${dy}.${mo}`; }
        return { label: displayLabel, value };
    });
    const maxChartValue = Math.max(...chartData.map(d => d.value), 10);

    const productSalesMap = new Map<string, { name: string; qty: number; revenue: number }>();
    itemsInRange.forEach(i => {
        const name = i.product_name || 'Nieznany';
        const existing = productSalesMap.get(name);
        if (existing) { existing.qty += Number(i.quantity); existing.revenue += Number(i.price_sold) * Number(i.quantity); }
        else productSalesMap.set(name, { name, qty: Number(i.quantity), revenue: Number(i.price_sold) * Number(i.quantity) });
    });
    const topProducts = Array.from(productSalesMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const unsoldProducts = products.filter(p => !productSalesMap.has(p.title) && p.stock > 0);

    const kpis = [
        { icon: <DollarSign size={18} />, label: 'Przychód brutto', value: `£${grossRevenue.toFixed(2)}`, color: '#10b981' },
        { icon: <TrendingUp size={18} />, label: 'Zysk netto', value: `£${netProfit.toFixed(2)}`, color: netProfit >= 0 ? '#10b981' : '#ef4444' },
        { icon: <Percent size={18} />, label: 'ROI', value: `${roi.toFixed(1)}%`, color: roi >= 0 ? '#10b981' : '#ef4444' },
        { icon: <ShoppingBasket size={18} />, label: 'Zamówień', value: totalOrders.toString(), color: '#6366f1' },
        { icon: <DollarSign size={18} />, label: 'Śr. wartość', value: `£${aov.toFixed(2)}`, color: '#f59e0b' },
        { icon: <Users size={18} />, label: 'Sprzedano szt.', value: unitsSold.toString(), color: '#a78bfa' },
    ];

    return (
        <div className="space-y-6">
            {/* Date filters */}
            <div className="glass-panel p-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-emerald-400" />
                    <span className="font-semibold text-sm">Zakres analizy:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {[{key:'today',label:'Dzisiaj'},{key:'yesterday',label:'Wczoraj'},{key:'7days',label:'7 dni'},{key:'thismonth',label:'Bieżący miesiąc'},{key:'lastmonth',label:'Poprzedni miesiąc'},{key:'ytd',label:'Ten rok (YTD)'},{key:'custom',label:'Niestandardowy'}]
                        .map(p => <button key={p.key} onClick={() => setDatePreset(p.key)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${datePreset===p.key?'bg-emerald-500 text-white':'bg-white/5 text-secondary hover:text-white'}`}>{p.label}</button>)}
                </div>
                {datePreset === 'custom' && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="form-input py-1 px-2 text-xs" style={{width:'130px'}} />
                        <span className="text-secondary text-xs">do</span>
                        <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="form-input py-1 px-2 text-xs" style={{width:'130px'}} />
                    </div>
                )}
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpis.map((k, i) => (
                    <div key={i} className="glass-panel p-4 flex flex-col gap-2">
                        <div style={{ color: k.color, opacity: 0.8 }}>{k.icon}</div>
                        <div className="text-xs text-secondary">{k.label}</div>
                        <div className="text-xl font-black" style={{ color: k.color }}>{k.value}</div>
                    </div>
                ))}
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
                <div className="glass-panel p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-emerald-400" /> Przychód w czasie</h3>
                    <div style={{ display:'flex', alignItems:'flex-end', gap:'4px', height:'140px', overflowX:'auto' }}>
                        {chartData.map((d, i) => (
                            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', minWidth:'32px', flex:'0 0 auto' }}>
                                <div style={{ width:'100%', background:'rgba(16,185,129,0.15)', borderRadius:'4px 4px 0 0', height:`${Math.max((d.value/maxChartValue)*120,2)}px`, borderTop: d.value>0 ? '2px solid #10b981':undefined, transition:'height 0.3s' }} title={`£${d.value.toFixed(2)}`} />
                                <span style={{ fontSize:'9px', color:'var(--text-secondary)', whiteSpace:'nowrap' }}>{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="glass-panel p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><ShoppingBasket size={18} className="text-emerald-400" /> Top produkty</h3>
                    {topProducts.length === 0 ? <p className="text-secondary text-sm">Brak sprzedaży w tym okresie.</p> : (
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                            {topProducts.map((p, i) => (
                                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:'rgba(255,255,255,0.03)', borderRadius:'8px' }}>
                                    <div>
                                        <div className="font-semibold text-sm">{p.name}</div>
                                        <div className="text-xs text-secondary">{p.qty} szt.</div>
                                    </div>
                                    <div className="font-black text-emerald-400">£{p.revenue.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Customers */}
                <div className="glass-panel p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><UserCheck size={18} className="text-emerald-400" /> Top klienci</h3>
                    {topCustomers.length === 0 ? <p className="text-secondary text-sm">Brak danych o klientach.</p> : (
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                            {topCustomers.map((c, i) => (
                                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:'rgba(255,255,255,0.03)', borderRadius:'8px' }}>
                                    <div>
                                        <div className="font-semibold text-sm">{c.email === 'unknown' ? '(brak emaila)' : c.email}</div>
                                        <div className="text-xs text-secondary">{c.orders} zamów.</div>
                                    </div>
                                    <div className="font-black text-emerald-400">£{c.totalSpent.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Unsold products */}
            {unsoldProducts.length > 0 && (
                <div className="glass-panel p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-400" /> Produkty bez sprzedaży (w wybranym okresie)</h3>
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                        {unsoldProducts.map(p => (
                            <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:'rgba(255,255,255,0.03)', borderRadius:'8px' }}>
                                <div>
                                    <div className="font-semibold text-sm">{p.title}</div>
                                    <div className="text-[10px] text-amber-500/80 mt-0.5">Na stanie: {p.stock} szt. — brak sprzedaży</div>
                                </div>
                                <div className="font-black text-secondary whitespace-nowrap">£{p.price.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

interface Order {
    id: string;
    customer_email: string;
    total_amount: number;
    status: 'pending' | 'paid' | 'shipped' | 'cancelled';
    items: Array<{ id?: string; title: string; quantity: number; price: number }>;
    created_at: string;
    shipping_address?: {
        name: string;
        phone?: string | null;
        email?: string | null;
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

const CATEGORY_LABELS: Record<string, string> = {
    muzyka: '🎵 Muzyka',
    bilety: '🎟️ Bilety',
    ubrania: '👕 Ubrania'
};

function StoreDashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Tab switching
    const initialTab = searchParams.get('tab') as 'products' | 'orders' | 'stats' || 'products';
    const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'stats'>(initialTab);

    // Data states (no order_items here – handled by StatsTabContent)
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Update active tab when query param changes
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'products' || tab === 'orders' || tab === 'stats') {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const [productsRes, ordersRes] = await Promise.all([
                supabase.from('products').select('*').order('created_at', { ascending: false }),
                supabase.from('orders').select('*').order('created_at', { ascending: false }),
            ]);

            setProducts((productsRes.data || []) as Product[]);
            setOrders((ordersRes.data || []) as Order[]);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Update query parameters on tab switch to keep state in URL
    const handleTabChange = (tab: 'products' | 'orders' | 'stats') => {
        setActiveTab(tab);
        router.replace(`/dashboard/store?tab=${tab}`);
    };

    // Actions
    const deleteProduct = async (id: string) => {
        if (!confirm('Czy na pewno chcesz usunąć ten produkt?')) return;
        await supabase.from('products').delete().eq('id', id);
        fetchData();
    };

    const updateOrderStatus = async (id: string, status: string) => {
        await supabase.from('orders').update({ status }).eq('id', id);
        setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: status as any } : o));
    };

    const deleteOrder = async (id: string) => {
        if (!confirm('Czy na pewno chcesz usunąć to zamówienie? Przywróci to stan magazynowy produktów i bezpowrotnie skasuje rekord z bazy danych.')) return;
        try {
            const { error } = await supabase.from('orders').delete().eq('id', id);
            if (error) throw error;
            setOrders((prev) => prev.filter((o) => o.id !== id));
            // Reload database items to reflect restored stock levels
            fetchData();
        } catch (err: any) {
            alert(`Błąd podczas usuwania zamówienia: ${err.message}`);
        }
    };

    // (Stats calculations moved to StatsTabContent component)

    return (
        <div className="dashboard-container container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            {/* Header */}
            <header className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="action-btn"><ChevronLeft size={24} /></Link>
                    <div>
                        <h1 className="text-2xl font-bold">Panel Zarządzania Sklepem</h1>
                        <p className="text-secondary text-sm">Zintegrowany pulpit obsługi sprzedaży i magazynu</p>
                    </div>
                </div>
                {activeTab === 'products' && (
                    <Link href="/dashboard/add-product" className="btn-primary flex items-center gap-2 px-5 py-2">
                        <Plus size={18} /> Dodaj produkt
                    </Link>
                )}
            </header>

            {/* Tab navigation */}
            <div className="flex border-b border-white/10 mb-6 gap-2" style={{ position: 'relative' }}>
                <button 
                    onClick={() => handleTabChange('products')}
                    className={`px-5 py-3 font-semibold text-sm transition-all duration-200 flex items-center gap-2 border-b-2 -mb-[2px] ${activeTab === 'products' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-secondary hover:text-white'}`}
                >
                    <Package size={16} /> Produkty ({products.length})
                </button>
                <button 
                    onClick={() => handleTabChange('orders')}
                    className={`px-5 py-3 font-semibold text-sm transition-all duration-200 flex items-center gap-2 border-b-2 -mb-[2px] ${activeTab === 'orders' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-secondary hover:text-white'}`}
                >
                    <ClipboardList size={16} /> Zamówienia ({orders.length})
                </button>
                <button 
                    onClick={() => handleTabChange('stats')}
                    className={`px-5 py-3 font-semibold text-sm transition-all duration-200 flex items-center gap-2 border-b-2 -mb-[2px] ${activeTab === 'stats' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-secondary hover:text-white'}`}
                >
                    <BarChart3 size={16} /> Statystyki & Zyski
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-secondary animate-pulse">Pobieranie i synchronizowanie danych...</p>
                </div>
            ) : (
                <>
                    {/* 1. PRODUCTS TAB */}
                    {activeTab === 'products' && (
                        <div>
                            {products.length === 0 ? (
                                <div className="glass-panel p-12 text-center mt-4">
                                    <Package size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                                    <p className="text-secondary">Brak produktów. Dodaj pierwszy!</p>
                                </div>
                            ) : (
                                <div className="glass-panel mt-2" style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Produkt</th>
                                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Kategoria</th>
                                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Cena sprzedaży</th>
                                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Koszt zakupu</th>
                                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Stan magazynowy</th>
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
                                                    <td style={{ padding: '1rem' }}>{CATEGORY_LABELS[p.category] || p.category}</td>
                                                    <td style={{ padding: '1rem', fontWeight: 700 }}>£{p.price.toFixed(2)}</td>
                                                    <td style={{ padding: '1rem', color: '#a1a1aa' }}>£{(p.purchase_price || 0).toFixed(2)}</td>
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
                    )}

                    {/* 2. ORDERS TAB */}
                    {activeTab === 'orders' && (
                        <div>
                            {orders.length === 0 ? (
                                <div className="glass-panel p-12 text-center mt-4">
                                    <Package size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                                    <p className="text-secondary">Brak zamówień.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                                    {orders.map((order) => (
                                        <div key={order.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{order.customer_email || 'Nieznany (Brak email)'}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                        {new Date(order.created_at).toLocaleString('pl-PL')}
                                                    </div>
                                                    <div style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
                                                        {Array.isArray(order.items) && order.items.map((item, i) => (
                                                            <div key={i} className="text-secondary">
                                                                <strong className="text-white">{item.quantity}×</strong> {item.title} — £{(item.price * item.quantity).toFixed(2)}
                                                            </div>
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
                                                                {(order.shipping_address.phone || order.shipping_address.email) && (
                                                                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.08)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                        {order.shipping_address.phone && <div>📞 Tel: <strong>{order.shipping_address.phone}</strong></div>}
                                                                        {order.shipping_address.email && <div>✉️ Email: <strong>{order.shipping_address.email}</strong></div>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>£{order.total_amount.toFixed(2)}</div>
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
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                        <select
                                                            style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}
                                                            value={order.status}
                                                            onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                                        >
                                                            <option value="pending">Oczekuje</option>
                                                            <option value="paid">Opłacone</option>
                                                            <option value="shipped">Wysłane</option>
                                                            <option value="cancelled">Anulowane</option>
                                                        </select>
                                                        <button
                                                            onClick={() => deleteOrder(order.id)}
                                                            style={{
                                                                padding: '6px 10px',
                                                                borderRadius: '8px',
                                                                fontSize: '0.8rem',
                                                                background: 'rgba(239, 68, 68, 0.1)',
                                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                                color: '#ef4444',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                            title="Usuń zamówienie"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. STATS TAB – rendered by isolated component */}
                    {activeTab === 'stats' && (
                        <StatsTabContent products={products} orders={orders} />
                    )}
                </>
            )}
        </div>
    );
}

export default function StoreDashboardPage() {
    return (
        <Suspense fallback={
            <div className="dashboard-container container mt-12 text-center text-secondary animate-pulse">
                Inicjalizacja pulpitu sklepu...
            </div>
        }>
            <StoreDashboardContent />
        </Suspense>
    );
}
