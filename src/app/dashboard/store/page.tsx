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

// ─── MOCK DATA GENERATOR FOR DEVELOPER PREVIEWS ─────────────────────────────
const getMockData = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const products: Product[] = [
        { id: 'p1', title: 'PRO8L3M - Art Brut 2 CD', price: 49.99, purchase_price: 22.00, category: 'muzyka', stock: 15, is_active: true, created_at: new Date(year, month, 1).toISOString() },
        { id: 'p2', title: 'Sokół - Wojtek Sokół LP', price: 119.99, purchase_price: 55.00, category: 'muzyka', stock: 8, is_active: true, created_at: new Date(year, month, 2).toISOString() },
        { id: 'p3', title: 'Taco Hemingway - Pocztówka CD', price: 39.99, purchase_price: 18.00, category: 'muzyka', stock: 24, is_active: true, created_at: new Date(year, month, 3).toISOString() },
        { id: 'p4', title: 'O.S.T.R. - Tabasko CD', price: 45.00, purchase_price: 20.00, category: 'muzyka', stock: 12, is_active: true, created_at: new Date(year, month, 4).toISOString() },
        { id: 'p5', title: 'RAPwUK Classic Tee Black', price: 89.99, purchase_price: 35.00, category: 'ubrania', stock: 30, is_active: true, created_at: new Date(year, month, 5).toISOString() },
        { id: 'p6', title: 'Bilet: Pezet w Londynie', price: 150.00, purchase_price: 80.00, category: 'bilety', stock: 4, is_active: true, created_at: new Date(year, month, 6).toISOString() }
    ];

    const orders: Order[] = [];
    const orderItems: OrderItem[] = [];
    
    // Generate 15 simulated orders spread across the month
    const customers = ['kontakt@rapwuk.com', 'kamil@gmail.com', 'aneta@wp.pl', 'adam.nowak@yahoo.com', 'marcin@o2.pl'];
    
    for (let i = 1; i <= 15; i++) {
        const day = Math.min(i * 2, 28);
        const orderId = `o-mock-${i}`;
        const prod = products[i % products.length];
        const qty = (i % 2) + 1;
        const total = prod.price * qty;
        const date = new Date(year, month, day, 14, 30).toISOString();
        
        orders.push({
            id: orderId,
            customer_email: customers[i % customers.length],
            total_amount: total,
            status: 'paid',
            items: [{ id: prod.id, title: prod.title, quantity: qty, price: prod.price }],
            created_at: date
        });
        
        orderItems.push({
            id: `oi-mock-${i}`,
            order_id: orderId,
            product_id: prod.id,
            product_name: prod.title,
            price_sold: prod.price,
            purchase_price: prod.purchase_price,
            quantity: qty,
            created_at: date
        });
    }
    
    return { products, orders, orderItems };
};

const MOCK_DATA = getMockData();

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
    const [isDemo, setIsDemo] = useState(false);

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
                setIsDemo(false);
            } catch (e: any) {
                console.warn("Could not query order_items from database, falling back to mock data:", e.message);
                setOrderItems(MOCK_DATA.orderItems);
                setIsDemo(true);
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

    // Generate coordinate points for SVG line/area chart
    const chartWidth = 600;
    const chartHeight = 180;
    const paddingTop = 20;
    const paddingBottom = 25;
    const paddingLeft = 45;
    const paddingRight = 15;

    const usableWidth = chartWidth - paddingLeft - paddingRight;
    const usableHeight = chartHeight - paddingTop - paddingBottom;

    const chartPoints = chartData.map((d, idx) => {
        const x = paddingLeft + (chartData.length > 1 ? (idx / (chartData.length - 1)) * usableWidth : usableWidth / 2);
        const y = chartHeight - paddingBottom - (maxChartValue > 0 ? (d.value / maxChartValue) * usableHeight : 0);
        return { x, y, label: d.label, value: d.value };
    });

    let linePathStr = '';
    let areaPathStr = '';
    if (chartPoints.length > 0) {
        linePathStr = chartPoints.reduce((acc, p, idx) => {
            return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
        }, '');
        if (chartPoints.length > 1) {
            areaPathStr = `${linePathStr} L ${chartPoints[chartPoints.length - 1].x} ${chartHeight - paddingBottom} L ${chartPoints[0].x} ${chartHeight - paddingBottom} Z`;
        } else {
            areaPathStr = `M ${chartPoints[0].x - 10} ${chartPoints[0].y} L ${chartPoints[0].x + 10} ${chartPoints[0].y} L ${chartPoints[0].x + 10} ${chartHeight - paddingBottom} L ${chartPoints[0].x - 10} ${chartHeight - paddingBottom} Z`;
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {isDemo && (
                <div style={{
                    padding: '0.85rem 1.25rem',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '12px',
                    color: '#f59e0b',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <AlertTriangle size={16} />
                    <span>Tryb demonstracyjny: Wyświetlane są symulowane dane (brak tabeli order_items w Supabase).</span>
                </div>
            )}

            {/* Date filters */}
            <div className="stats-filter-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} style={{ color: '#10b981' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Zakres analizy</span>
                </div>
                
                <div className="stats-preset-btn-container">
                    {[
                        { key: 'today', label: 'Dzisiaj' },
                        { key: 'yesterday', label: 'Wczoraj' },
                        { key: '7days', label: '7 dni' },
                        { key: 'thismonth', label: 'Ten miesiąc' },
                        { key: 'lastmonth', label: 'Poprzedni' },
                        { key: 'ytd', label: 'YTD' },
                        { key: 'custom', label: 'Niestandardowy' }
                    ].map(preset => (
                        <button 
                            key={preset.key} 
                            onClick={() => setDatePreset(preset.key)} 
                            className={`stats-preset-btn ${datePreset === preset.key ? 'active' : ''}`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {datePreset === 'custom' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', marginTop: '0.75rem' }} className="sm:w-auto sm:mt-0">
                        <input 
                            type="date" 
                            value={customStartDate} 
                            onChange={e => setCustomStartDate(e.target.value)} 
                            className="input-premium py-1.5 px-2.5 text-xs" 
                            style={{ width: '130px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }} 
                        />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>do</span>
                        <input 
                            type="date" 
                            value={customEndDate} 
                            onChange={e => setCustomEndDate(e.target.value)} 
                            className="input-premium py-1.5 px-2.5 text-xs" 
                            style={{ width: '130px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }} 
                        />
                    </div>
                )}
            </div>

            {/* KPI Grid */}
            <div className="stats-kpi-grid">
                <div className="stats-kpi-card kpi-revenue">
                    <div className="stats-kpi-card-header">
                        <span className="stats-kpi-card-title">Przychód brutto</span>
                        <div className="stats-kpi-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <DollarSign size={15} />
                        </div>
                    </div>
                    <div>
                        <div className="stats-kpi-card-value">£{grossRevenue.toFixed(2)}</div>
                        <div className="stats-kpi-card-trend" style={{ color: '#10b981' }}>
                            Sprzedaż z zamówień
                        </div>
                    </div>
                </div>

                <div className="stats-kpi-card kpi-profit">
                    <div className="stats-kpi-card-header">
                        <span className="stats-kpi-card-title">Zysk netto</span>
                        <div className="stats-kpi-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <TrendingUp size={15} />
                        </div>
                    </div>
                    <div>
                        <div className="stats-kpi-card-value" style={{ color: netProfit >= 0 ? '#3b82f6' : '#ef4444' }}>
                            {netProfit < 0 ? '-' : ''}£{Math.abs(netProfit).toFixed(2)}
                        </div>
                        <div className="stats-kpi-card-trend" style={{ color: netProfit >= 0 ? '#3b82f6' : '#ef4444' }}>
                            Po odliczeniu zakupu
                        </div>
                    </div>
                </div>

                <div className="stats-kpi-card kpi-roi">
                    <div className="stats-kpi-card-header">
                        <span className="stats-kpi-card-title">Zwrot ROI</span>
                        <div className="stats-kpi-card-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                            <Percent size={15} />
                        </div>
                    </div>
                    <div>
                        <div className="stats-kpi-card-value" style={{ color: '#8b5cf6' }}>{roi.toFixed(1)}%</div>
                        <div className="stats-kpi-card-trend" style={{ color: '#8b5cf6' }}>
                            Zysk do kosztu
                        </div>
                    </div>
                </div>

                <div className="stats-kpi-card kpi-orders">
                    <div className="stats-kpi-card-header">
                        <span className="stats-kpi-card-title">Zamówienia</span>
                        <div className="stats-kpi-card-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                            <ClipboardList size={15} />
                        </div>
                    </div>
                    <div>
                        <div className="stats-kpi-card-value" style={{ color: '#6366f1' }}>{totalOrders}</div>
                        <div className="stats-kpi-card-trend" style={{ color: '#6366f1' }}>
                            Opłacone koszyki
                        </div>
                    </div>
                </div>

                <div className="stats-kpi-card kpi-aov">
                    <div className="stats-kpi-card-header">
                        <span className="stats-kpi-card-title">Średnia wartość</span>
                        <div className="stats-kpi-card-icon" style={{ background: 'rgba(245, 158, 7, 0.1)', color: '#f59e0b' }}>
                            <DollarSign size={15} />
                        </div>
                    </div>
                    <div>
                        <div className="stats-kpi-card-value" style={{ color: '#f59e0b' }}>£{aov.toFixed(2)}</div>
                        <div className="stats-kpi-card-trend" style={{ color: '#f59e0b' }}>
                            Wartość zamówienia
                        </div>
                    </div>
                </div>

                <div className="stats-kpi-card kpi-sold">
                    <div className="stats-kpi-card-header">
                        <span className="stats-kpi-card-title">Sprzedane płyty</span>
                        <div className="stats-kpi-card-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                            <ShoppingBasket size={15} />
                        </div>
                    </div>
                    <div>
                        <div className="stats-kpi-card-value" style={{ color: '#ec4899' }}>{unitsSold} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>szt.</span></div>
                        <div className="stats-kpi-card-trend" style={{ color: '#ec4899' }}>
                            Całkowita liczba
                        </div>
                    </div>
                </div>
            </div>

            {/* SVG Chart Section */}
            {chartData.length > 0 && (
                <div className="stats-section-card">
                    <h3 className="stats-section-title">
                        <TrendingUp size={16} style={{ color: '#10b981' }} /> Dynamika obrotu (przychód w czasie)
                    </h3>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', overflow: 'visible' }}>
                            <defs>
                                <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            
                            {/* Grid Lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                                const yVal = paddingTop + ratio * usableHeight;
                                const gridValue = maxChartValue - ratio * maxChartValue;
                                return (
                                    <g key={idx}>
                                        <line 
                                            x1={paddingLeft} 
                                            y1={yVal} 
                                            x2={chartWidth - paddingRight} 
                                            y2={yVal} 
                                            className="chart-grid-line" 
                                        />
                                        <text 
                                            x={paddingLeft - 8} 
                                            y={yVal + 3} 
                                            fontSize="9" 
                                            fill="var(--text-secondary)" 
                                            textAnchor="end"
                                            style={{ fontFamily: 'monospace' }}
                                        >
                                            £{gridValue.toFixed(0)}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Area Path */}
                            {areaPathStr && (
                                <path 
                                    d={areaPathStr} 
                                    fill="url(#chartAreaGradient)" 
                                />
                            )}

                            {/* Line Path */}
                            {linePathStr && (
                                <path 
                                    d={linePathStr} 
                                    fill="none" 
                                    stroke="#10b981" 
                                    strokeWidth="2.5" 
                                    className="chart-line-glow"
                                />
                            )}

                            {/* Data points */}
                            {chartPoints.map((p, idx) => (
                                <g key={idx}>
                                    <circle 
                                        cx={p.x} 
                                        cy={p.y} 
                                        r="4" 
                                        fill="#10b981" 
                                        className="chart-point"
                                    >
                                        <title>{`${p.label}: £${p.value.toFixed(2)}`}</title>
                                    </circle>
                                    
                                    {/* Labels along X-Axis */}
                                    {(chartPoints.length < 15 || idx % Math.ceil(chartPoints.length / 10) === 0) && (
                                        <text 
                                            x={p.x} 
                                            y={chartHeight - 8} 
                                            fontSize="8" 
                                            fill="var(--text-secondary)" 
                                            textAnchor="middle"
                                        >
                                            {p.label}
                                        </text>
                                    )}
                                </g>
                            ))}
                        </svg>
                    </div>
                </div>
            )}

            {/* Ranking Grid */}
            <div className="stats-cols-grid">
                {/* Top Products */}
                <div className="stats-section-card" style={{ marginBottom: 0 }}>
                    <h3 className="stats-section-title">
                        <ShoppingBasket size={16} style={{ color: '#10b981' }} /> Najlepiej sprzedające się płyty
                    </h3>
                    {topProducts.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Brak sprzedaży w wybranym okresie.</p>
                    ) : (
                        <div className="stats-list">
                            {topProducts.map((p, i) => (
                                <div key={i} className="stats-list-item">
                                    <div className={`stats-rank-num rank-${i + 1}`}>
                                        {i + 1}
                                    </div>
                                    <div className="stats-item-info">
                                        <div className="stats-item-name">{p.name}</div>
                                        <div className="stats-item-subtitle">{p.qty} sprzedanych sztuk</div>
                                    </div>
                                    <div className="stats-item-value" style={{ color: '#10b981' }}>
                                        £{p.revenue.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Customers */}
                <div className="stats-section-card" style={{ marginBottom: 0 }}>
                    <h3 className="stats-section-title">
                        <UserCheck size={16} style={{ color: '#3b82f6' }} /> Liderzy zakupów (Najlepsi klienci)
                    </h3>
                    {topCustomers.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Brak danych o klientach.</p>
                    ) : (
                        <div className="stats-list">
                            {topCustomers.map((c, i) => (
                                <div key={i} className="stats-list-item">
                                    <div className={`stats-rank-num rank-${i + 1}`}>
                                        {i + 1}
                                    </div>
                                    <div className="stats-item-info">
                                        <div className="stats-item-name">{c.email === 'unknown' ? 'Anonimowy klient' : c.email}</div>
                                        <div className="stats-item-subtitle">{c.orders} sfinalizowanych transakcji</div>
                                    </div>
                                    <div className="stats-item-value" style={{ color: '#3b82f6' }}>
                                        £{c.totalSpent.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Dead stock */}
            {unsoldProducts.length > 0 && (
                <div className="stats-section-card">
                    <h3 className="stats-section-title" style={{ color: '#f59e0b' }}>
                        <AlertTriangle size={16} style={{ color: '#f59e0b' }} /> Martwy asortyment (Produkty bez sprzedaży w tym okresie)
                    </h3>
                    <div className="stats-list">
                        {unsoldProducts.slice(0, 10).map(p => (
                            <div key={p.id} className="stats-list-item" style={{ borderColor: 'rgba(245, 158, 11, 0.08)' }}>
                                <div className="stats-item-info">
                                    <div className="stats-item-name">{p.title}</div>
                                    <div className="stats-item-subtitle" style={{ color: '#f59e0b', opacity: 0.85 }}>
                                        Na stanie: {p.stock} szt. — brak transakcji
                                    </div>
                                </div>
                                <div className="stats-item-value" style={{ color: 'var(--text-secondary)' }}>
                                    £{p.price.toFixed(2)}
                                </div>
                            </div>
                        ))}
                        {unsoldProducts.length > 10 && (
                            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', padding: '0.25rem' }}>
                                Oraz {unsoldProducts.length - 10} innych produktów bez sprzedaży...
                            </div>
                        )}
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
    ubrania: '👕 Ubrania',
    elektronika: '💻 Elektronika'
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
    const [parentDemo, setParentDemo] = useState(false);
    
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
                console.warn('Użytkownik niezalogowany – wczytuję dane demo do celów wizualnych.');
                setProducts(MOCK_DATA.products);
                setOrders(MOCK_DATA.orders);
                setParentDemo(true);
                setLoading(false);
                return;
            }

            setParentDemo(false);
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

            {parentDemo && (
                <div style={{
                    padding: '0.85rem 1.25rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '12px',
                    color: '#3b82f6',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '1rem'
                }}>
                    <Users size={16} style={{ color: '#3b82f6' }} />
                    <span>Tryb demonstracyjny: Brak aktywnej sesji logowania. Prezentowane są dynamiczne dane pokazowe.</span>
                </div>
            )}

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
