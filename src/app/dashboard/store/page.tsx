'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
    ChevronLeft, Plus, Trash2, Edit, Package, ShoppingBag, 
    ClipboardList, BarChart3, TrendingUp, DollarSign, Percent, 
    ShoppingBasket, UserCheck, Calendar, Info, AlertTriangle, Users
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
    
    // Data states
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Date filter presets
    const [datePreset, setDatePreset] = useState<string>('thismonth');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    
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

            const [productsRes, ordersRes, itemsRes] = await Promise.all([
                supabase.from('products').select('*').order('created_at', { ascending: false }),
                supabase.from('orders').select('*').order('created_at', { ascending: false }),
                supabase.from('order_items').select('*').order('created_at', { ascending: true })
            ]);

            setProducts((productsRes.data || []) as Product[]);
            setOrders((ordersRes.data || []) as Order[]);
            setOrderItems((itemsRes.data || []) as OrderItem[]);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Set custom date inputs based on current month initially
    useEffect(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const toISODate = (d: Date) => d.toISOString().split('T')[0];
        setCustomStartDate(toISODate(startOfMonth));
        setCustomEndDate(toISODate(now));
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

    // Date range helper
    const getDateRange = (): { start: Date; end: Date } => {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        switch (datePreset) {
            case 'today':
                start.setHours(0,0,0,0);
                end.setHours(23,59,59,999);
                break;
            case 'yesterday':
                start.setDate(now.getDate() - 1);
                start.setHours(0,0,0,0);
                end.setDate(now.getDate() - 1);
                end.setHours(23,59,59,999);
                break;
            case '7days':
                start.setDate(now.getDate() - 6);
                start.setHours(0,0,0,0);
                end.setHours(23,59,59,999);
                break;
            case 'thismonth':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end.setHours(23,59,59,999);
                break;
            case 'lastmonth':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                end.setHours(23,59,59,999);
                break;
            case 'ytd':
                start = new Date(now.getFullYear(), 0, 1);
                end.setHours(23,59,59,999);
                break;
            case 'custom':
                if (customStartDate) {
                    start = new Date(customStartDate);
                    start.setHours(0,0,0,0);
                }
                if (customEndDate) {
                    end = new Date(customEndDate);
                    end.setHours(23,59,59,999);
                }
                break;
        }
        return { start, end };
    };

    const { start: filterStart, end: filterEnd } = getDateRange();

    // Stats calculations
    const sfinalizowaneOrders = orders.filter(o => o.status === 'paid' || o.status === 'shipped');
    
    // Filter orders in range
    const ordersInRange = sfinalizowaneOrders.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= filterStart && orderDate <= filterEnd;
    });

    // Filter order items in range
    const itemsInRange = orderItems.filter(item => {
        // Find parent order to ensure status is paid/shipped
        const parentOrder = orders.find(o => o.id === item.order_id);
        if (!parentOrder || (parentOrder.status !== 'paid' && parentOrder.status !== 'shipped')) {
            return false;
        }
        const itemDate = new Date(item.created_at);
        return itemDate >= filterStart && itemDate <= filterEnd;
    });

    // 1. KPI Calculations
    const grossRevenue = ordersInRange.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const totalOrders = ordersInRange.length;
    const totalItemsSold = itemsInRange.reduce((sum, item) => sum + item.quantity, 0);
    
    const totalCost = itemsInRange.reduce((sum, item) => sum + (Number(item.purchase_price) * item.quantity), 0);
    const netProfit = itemsInRange.reduce((sum, item) => sum + ((Number(item.price_sold) - Number(item.purchase_price)) * item.quantity), 0);
    const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
    
    const aov = totalOrders > 0 ? grossRevenue / totalOrders : 0;
    const upt = totalOrders > 0 ? totalItemsSold / totalOrders : 0;

    // 2. Best Sellers
    const productStatsMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    itemsInRange.forEach(item => {
        const key = item.product_id || item.product_name;
        const existing = productStatsMap.get(key) || { name: item.product_name, quantity: 0, revenue: 0 };
        productStatsMap.set(key, {
            name: item.product_name,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + (item.price_sold * item.quantity)
        });
    });
    const bestSellers = Array.from(productStatsMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    // 3. Category & Genre Analysis
    // Store categories (muzyka, bilety, ubrania)
    const categoryStats: Record<string, { quantity: number; revenue: number }> = {
        muzyka: { quantity: 0, revenue: 0 },
        bilety: { quantity: 0, revenue: 0 },
        ubrania: { quantity: 0, revenue: 0 }
    };
    // Music subcategories (PL, UK, USA, RAP W UK)
    const musicCategoryStats: Record<string, { quantity: number; revenue: number }> = {
        PL: { quantity: 0, revenue: 0 },
        UK: { quantity: 0, revenue: 0 },
        USA: { quantity: 0, revenue: 0 },
        'RAP W UK': { quantity: 0, revenue: 0 }
    };

    itemsInRange.forEach(item => {
        // Find corresponding product to get category details
        const prod = products.find(p => p.id === item.product_id);
        const cat = prod?.category || 'muzyka'; // Fallback
        if (categoryStats[cat]) {
            categoryStats[cat].quantity += item.quantity;
            categoryStats[cat].revenue += (item.price_sold * item.quantity);
        }

        if (cat === 'muzyka') {
            // Find music category
            const mCat = (prod as any)?.music_category || 'PL';
            if (musicCategoryStats[mCat]) {
                musicCategoryStats[mCat].quantity += item.quantity;
                musicCategoryStats[mCat].revenue += (item.price_sold * item.quantity);
            }
        }
    });

    // 4. Dead Stock
    // Active products with stock > 0 but 0 units sold in the current date range, sorted by oldest creation date
    const deadStock = products
        .filter(p => p.is_active && p.stock > 0)
        .filter(p => {
            const soldCount = orderItems
                .filter(item => {
                    const parentOrder = orders.find(o => o.id === item.order_id);
                    return parentOrder && (parentOrder.status === 'paid' || parentOrder.status === 'shipped');
                })
                .filter(item => item.product_id === p.id)
                .reduce((sum, item) => sum + item.quantity, 0);
            return soldCount === 0;
        })
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .slice(0, 5);

    // 5. Customer Analytics
    // Unique customer emails in range
    const customersInRange = Array.from(new Set(ordersInRange.map(o => o.customer_email.trim().toLowerCase())));
    let newCustomersCount = 0;
    let returningCustomersCount = 0;

    customersInRange.forEach(email => {
        // Check if user had any sfinalizowane orders prior to start range
        const hadPriorOrder = sfinalizowaneOrders.some(o => {
            const orderDate = new Date(o.created_at);
            return o.customer_email.trim().toLowerCase() === email && orderDate < filterStart;
        });

        if (hadPriorOrder) {
            returningCustomersCount++;
        } else {
            newCustomersCount++;
        }
    });

    const totalUniqueCustomersInRange = customersInRange.length;
    const newCustomerRatio = totalUniqueCustomersInRange > 0 ? (newCustomersCount / totalUniqueCustomersInRange) * 100 : 0;
    const returningCustomerRatio = totalUniqueCustomersInRange > 0 ? (returningCustomersCount / totalUniqueCustomersInRange) * 100 : 0;

    // Top Customers LTV ranking (All time sfinalizowane orders)
    const customerLtvMap = new Map<string, { email: string; totalSpent: number; ordersCount: number }>();
    sfinalizowaneOrders.forEach(o => {
        const email = o.customer_email.trim().toLowerCase();
        const existing = customerLtvMap.get(email) || { email: o.customer_email, totalSpent: 0, ordersCount: 0 };
        customerLtvMap.set(email, {
            email: o.customer_email,
            totalSpent: existing.totalSpent + Number(o.total_amount),
            ordersCount: existing.ordersCount + 1
        });
    });
    const topCustomers = Array.from(customerLtvMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

    // 6. Chart Data points
    // Depending on date range length, we group either by Date or by Month
    const msDiff = filterEnd.getTime() - filterStart.getTime();
    const dayDiff = msDiff / (1000 * 60 * 60 * 24);
    const groupByMonth = dayDiff > 60;

    const chartPointsMap = new Map<string, number>();

    if (groupByMonth) {
        // Initialize months in range
        let current = new Date(filterStart.getFullYear(), filterStart.getMonth(), 1);
        while (current <= filterEnd) {
            const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
            chartPointsMap.set(key, 0);
            current.setMonth(current.getMonth() + 1);
        }

        ordersInRange.forEach(o => {
            const d = new Date(o.created_at);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (chartPointsMap.has(key)) {
                chartPointsMap.set(key, chartPointsMap.get(key)! + Number(o.total_amount));
            }
        });
    } else {
        // Initialize days in range
        let current = new Date(filterStart);
        while (current <= filterEnd) {
            const key = current.toISOString().split('T')[0];
            chartPointsMap.set(key, 0);
            current.setDate(current.getDate() + 1);
        }

        ordersInRange.forEach(o => {
            const key = new Date(o.created_at).toISOString().split('T')[0];
            if (chartPointsMap.has(key)) {
                chartPointsMap.set(key, chartPointsMap.get(key)! + Number(o.total_amount));
            }
        });
    }

    const chartData = Array.from(chartPointsMap.entries()).map(([label, value]) => {
        // Format label for visual display
        let displayLabel = label;
        if (groupByMonth) {
            const [year, month] = label.split('-');
            const monthsNames = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
            displayLabel = `${monthsNames[parseInt(month) - 1]} ${year.substring(2)}`;
        } else {
            const [_, month, day] = label.split('-');
            displayLabel = `${day}.${month}`;
        }
        return { label: displayLabel, rawLabel: label, value };
    });

    const maxChartValue = Math.max(...chartData.map(d => d.value), 10);

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
                                                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{order.customer_email}</div>
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

                    {/* 3. STATS TAB */}
                    {activeTab === 'stats' && (
                        <div className="space-y-6">
                            {/* Controls and Filters */}
                            <div className="glass-panel p-4 flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className="text-emerald-400" />
                                    <span className="font-semibold text-sm">Zakres analizy:</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { key: 'today', label: 'Dzisiaj' },
                                        { key: 'yesterday', label: 'Wczoraj' },
                                        { key: '7days', label: '7 dni' },
                                        { key: 'thismonth', label: 'Bieżący miesiąc' },
                                        { key: 'lastmonth', label: 'Poprzedni miesiąc' },
                                        { key: 'ytd', label: 'Ten rok (YTD)' },
                                        { key: 'custom', label: 'Niestandardowy' }
                                    ].map(preset => (
                                        <button
                                            key={preset.key}
                                            onClick={() => setDatePreset(preset.key)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${datePreset === preset.key ? 'bg-emerald-500 text-white' : 'bg-white/5 text-secondary hover:text-white'}`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>

                                {datePreset === 'custom' && (
                                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                                        <input 
                                            type="date" 
                                            value={customStartDate} 
                                            onChange={(e) => setCustomStartDate(e.target.value)} 
                                            className="form-input py-1 px-2 text-xs" 
                                            style={{ width: '130px' }}
                                        />
                                        <span className="text-secondary text-xs">do</span>
                                        <input 
                                            type="date" 
                                            value={customEndDate} 
                                            onChange={(e) => setCustomEndDate(e.target.value)} 
                                            className="form-input py-1 px-2 text-xs" 
                                            style={{ width: '130px' }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* KPI Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                <div className="glass-panel p-4 flex flex-col justify-between" style={{ borderColor: 'rgba(16,185,129,0.15)' }}>
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs text-secondary font-medium">Przychód brutto</span>
                                        <div className="p-1.5 bg-emerald-500/10 rounded-lg"><DollarSign size={14} className="text-emerald-400" /></div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-xl font-black">£{grossRevenue.toFixed(2)}</div>
                                        <p className="text-[10px] text-emerald-400/70 flex items-center gap-1 mt-1"><TrendingUp size={10} /> Sprzedane zamówienia</p>
                                    </div>
                                </div>

                                <div className="glass-panel p-4 flex flex-col justify-between" style={{ borderColor: 'rgba(59,130,246,0.15)' }}>
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs text-secondary font-medium">Zysk netto</span>
                                        <div className="p-1.5 bg-blue-500/10 rounded-lg"><TrendingUp size={14} className="text-blue-400" /></div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-xl font-black" style={{ color: netProfit >= 0 ? '#60a5fa' : '#ef4444' }}>
                                            {netProfit < 0 ? '-' : ''}£{Math.abs(netProfit).toFixed(2)}
                                        </div>
                                        <p className="text-[10px] text-blue-400/70 flex items-center gap-1 mt-1"><Info size={10} /> Cena sprzedaży - koszt</p>
                                    </div>
                                </div>

                                <div className="glass-panel p-4 flex flex-col justify-between" style={{ borderColor: 'rgba(139,92,246,0.15)' }}>
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs text-secondary font-medium">Zwrot z inwestycji (ROI)</span>
                                        <div className="p-1.5 bg-violet-500/10 rounded-lg"><Percent size={14} className="text-violet-400" /></div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-xl font-black text-violet-400">{roi.toFixed(1)}%</div>
                                        <p className="text-[10px] text-violet-400/70 flex items-center gap-1 mt-1"><TrendingUp size={10} /> Zysk / koszt zakupu</p>
                                    </div>
                                </div>

                                <div className="glass-panel p-4 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs text-secondary font-medium">Liczba zamówień</span>
                                        <div className="p-1.5 bg-white/5 rounded-lg"><ClipboardList size={14} className="text-secondary" /></div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-xl font-black">{totalOrders}</div>
                                        <p className="text-[10px] text-secondary/70 flex items-center gap-1 mt-1"><ShoppingBasket size={10} /> Sfinalizowane koszyki</p>
                                    </div>
                                </div>

                                <div className="glass-panel p-4 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs text-secondary font-medium">Średnia wartość (AOV)</span>
                                        <div className="p-1.5 bg-white/5 rounded-lg"><DollarSign size={14} className="text-secondary" /></div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-xl font-black">£{aov.toFixed(2)}</div>
                                        <p className="text-[10px] text-secondary/70 flex items-center gap-1 mt-1"><Info size={10} /> Średni rachunek koszyka</p>
                                    </div>
                                </div>

                                <div className="glass-panel p-4 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs text-secondary font-medium">Sztuk na transakcję</span>
                                        <div className="p-1.5 bg-white/5 rounded-lg"><ShoppingBasket size={14} className="text-secondary" /></div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-xl font-black">{upt.toFixed(1)}</div>
                                        <p className="text-[10px] text-secondary/70 flex items-center gap-1 mt-1"><Info size={10} /> Liczba fizycznych płyt/szt.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Main Chart Card */}
                            <div className="glass-panel p-6">
                                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                    <BarChart3 size={16} className="text-emerald-400" /> Dynamika przychodu
                                </h3>
                                {chartData.length === 0 || maxChartValue === 10 ? (
                                    <div className="h-[200px] flex items-center justify-center text-secondary text-sm">
                                        Brak danych do wygenerowania wykresu dla tego zakresu dat
                                    </div>
                                ) : (
                                    <div className="w-full mt-4">
                                        {/* SVG Chart */}
                                        <svg viewBox="0 0 600 220" className="w-full overflow-visible">
                                            <defs>
                                                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            {/* Grid Lines */}
                                            <line x1="0" y1="20" x2="600" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                                            <line x1="0" y1="65" x2="600" y2="65" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                                            <line x1="0" y1="110" x2="600" y2="110" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                                            <line x1="0" y1="155" x2="600" y2="155" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                                            <line x1="0" y1="190" x2="600" y2="190" stroke="rgba(255,255,255,0.2)" />

                                            {/* Columns */}
                                            {chartData.map((d, i) => {
                                                const xSpace = 600 / chartData.length;
                                                const barWidth = Math.max(2, Math.min(25, xSpace * 0.5));
                                                const x = i * xSpace + (xSpace - barWidth) / 2;
                                                const height = (d.value / maxChartValue) * 170; // Max height is 170px
                                                const y = 190 - height;
                                                
                                                return (
                                                    <g key={i} className="group cursor-pointer">
                                                        {/* Interactive Hover Area */}
                                                        <rect 
                                                            x={i * xSpace} 
                                                            y="0" 
                                                            width={xSpace} 
                                                            height="190" 
                                                            fill="transparent"
                                                        />
                                                        {/* Bar */}
                                                        <rect 
                                                            x={x} 
                                                            y={y} 
                                                            width={barWidth} 
                                                            height={height} 
                                                            fill="url(#chartGrad)" 
                                                            stroke="#10b981"
                                                            strokeWidth="1.5"
                                                            rx="3"
                                                            style={{ transition: 'all 0.3s' }}
                                                            className="group-hover:fill-emerald-400/30"
                                                        />
                                                        {/* Label */}
                                                        {(chartData.length < 15 || i % Math.ceil(chartData.length / 10) === 0) && (
                                                            <text 
                                                                x={i * xSpace + xSpace / 2} 
                                                                y="210" 
                                                                fontSize="8" 
                                                                fill="#a1a1aa" 
                                                                textAnchor="middle"
                                                            >
                                                                {d.label}
                                                            </text>
                                                        )}
                                                        {/* Tooltip */}
                                                        <title>{`${d.label}: £${d.value.toFixed(2)}`}</title>
                                                    </g>
                                                );
                                            })}
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Secondary Stats Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Best Sellers */}
                                <div className="glass-panel p-5">
                                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                        <TrendingUp size={16} className="text-emerald-400" /> Bestsellery (Top 5)
                                    </h3>
                                    {bestSellers.length === 0 ? (
                                        <p className="text-secondary text-xs text-center py-6">Brak sprzedaży w tym zakresie dat</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {bestSellers.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center bg-white/2 p-3 rounded-lg border border-white/5">
                                                    <div>
                                                        <div className="text-xs font-bold text-white">{item.name}</div>
                                                        <div className="text-[10px] text-secondary mt-0.5">{item.quantity} szt.</div>
                                                    </div>
                                                    <div className="text-sm font-black text-emerald-400">£{item.revenue.toFixed(2)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Category analysis */}
                                <div className="glass-panel p-5">
                                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                        <PieChart size={16} className="text-emerald-400" /> Udział w sprzedaży
                                    </h3>
                                    <div className="space-y-4">
                                        {/* Store Category progress */}
                                        <div>
                                            <div className="text-xs font-semibold text-secondary mb-2">Kategorie Sklepu</div>
                                            <div className="space-y-2">
                                                {Object.entries(categoryStats).map(([cat, val]) => {
                                                    const pct = grossRevenue > 0 ? (val.revenue / grossRevenue) * 100 : 0;
                                                    return (
                                                        <div key={cat} className="text-xs">
                                                            <div className="flex justify-between text-secondary mb-1">
                                                                <span className="capitalize">{CATEGORY_LABELS[cat] || cat} ({val.quantity} szt.)</span>
                                                                <span className="font-bold text-white">£{val.revenue.toFixed(2)} ({pct.toFixed(0)}%)</span>
                                                            </div>
                                                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Music category progress */}
                                        <div className="pt-2 border-t border-white/5">
                                            <div className="text-xs font-semibold text-secondary mb-2">Muzyka - Pochodzenie/Gatunek</div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {Object.entries(musicCategoryStats).map(([cat, val]) => {
                                                    const musicTotal = Object.values(musicCategoryStats).reduce((sum, v) => sum + v.revenue, 0);
                                                    const pct = musicTotal > 0 ? (val.revenue / musicTotal) * 100 : 0;
                                                    return (
                                                        <div key={cat} className="bg-white/2 p-2.5 rounded-lg border border-white/5 text-xs">
                                                            <div className="flex justify-between font-bold mb-1">
                                                                <span>{cat}</span>
                                                                <span className="text-emerald-400">£{val.revenue.toFixed(0)}</span>
                                                            </div>
                                                            <div className="text-[10px] text-secondary">{val.quantity} szt. ({pct.toFixed(0)}%)</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lower Stats Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Customer Analytics (New vs Returning) */}
                                <div className="glass-panel p-5">
                                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                        <UserCheck size={16} className="text-emerald-400" /> Klienci Nowi vs Powracający
                                    </h3>
                                    {totalUniqueCustomersInRange === 0 ? (
                                        <p className="text-secondary text-xs text-center py-6">Brak klientów w tym zakresie dat</p>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-around py-2">
                                                <div className="text-center">
                                                    <div className="text-xs text-secondary">Nowi Klienci</div>
                                                    <div className="text-lg font-black text-emerald-400 mt-1">{newCustomersCount}</div>
                                                    <div className="text-[10px] text-secondary mt-0.5">({newCustomerRatio.toFixed(0)}%)</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-secondary">Powracający</div>
                                                    <div className="text-lg font-black text-blue-400 mt-1">{returningCustomersCount}</div>
                                                    <div className="text-[10px] text-secondary mt-0.5">({returningCustomerRatio.toFixed(0)}%)</div>
                                                </div>
                                            </div>
                                            <div className="w-full flex h-3 rounded-full overflow-hidden bg-white/5">
                                                <div className="bg-emerald-500 h-full" style={{ width: `${newCustomerRatio}%` }}></div>
                                                <div className="bg-blue-500 h-full" style={{ width: `${returningCustomerRatio}%` }}></div>
                                            </div>
                                            <p className="text-[10px] text-secondary/60 leading-relaxed">
                                                Analiza bazuje na historii zamówień klienta. Powracający klient to taki, który złożył przynajmniej jedno sfinalizowane zamówienie przed wybranym okresem.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Top Customers LTV */}
                                <div className="glass-panel p-5">
                                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                        <Users size={16} className="text-emerald-400" /> Najlepsi Klienci (LTV Liderzy)
                                    </h3>
                                    {topCustomers.length === 0 ? (
                                        <p className="text-secondary text-xs text-center py-6">Brak klientów w bazie</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {topCustomers.map((cust, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white/2 p-2.5 rounded-lg border border-white/5 text-xs">
                                                    <div className="overflow-hidden mr-2">
                                                        <div className="font-bold text-white truncate" title={cust.email}>{cust.email}</div>
                                                        <div className="text-[10px] text-secondary mt-0.5">{cust.ordersCount} sfinalizowanych zamówień</div>
                                                    </div>
                                                    <div className="font-black text-emerald-400 whitespace-nowrap">£{cust.totalSpent.toFixed(2)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Dead Stock */}
                                <div className="glass-panel p-5">
                                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-amber-500" /> Martwy Asortyment (Dead Stock)
                                    </h3>
                                    {deadStock.length === 0 ? (
                                        <p className="text-secondary text-xs text-center py-6">Brak martwych produktów na stanie</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {deadStock.map((prod, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white/2 p-2.5 rounded-lg border border-white/5 text-xs">
                                                    <div className="overflow-hidden mr-2">
                                                        <div className="font-bold text-white truncate" title={prod.title}>{prod.title}</div>
                                                        <div className="text-[10px] text-amber-500/80 mt-0.5">Na stanie: {prod.stock} szt. — brak sprzedaży</div>
                                                    </div>
                                                    <div className="font-black text-secondary whitespace-nowrap">£{prod.price.toFixed(2)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
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
