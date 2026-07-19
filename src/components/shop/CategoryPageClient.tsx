'use client';

import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/shop/ProductCard';
import type { Product } from '@/app/shop/page';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface CategoryPageClientProps {
    products: Product[];
    category: string;
    categoryTitle: string;
    categoryIcon: React.ReactNode;
    initialSort?: string;
}

export function CategoryPageClient({
    products,
    category,
    categoryTitle,
    categoryIcon,
    initialSort = 'artist_asc'
}: CategoryPageClientProps) {
    const isMuzyka = category === 'muzyka';

    // Filters state
    const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
    const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
    const [activeSort, setActiveSort] = useState(initialSort);

    // Dynamic music categories and their product counts (from all active category products)
    const subcategoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        products.forEach(p => {
            if (p.music_category) {
                counts[p.music_category] = (counts[p.music_category] || 0) + 1;
            }
        });
        
        // Sort keys by counts descending
        return Object.keys(counts)
            .map(sub => ({ name: sub, count: counts[sub] }))
            .sort((a, b) => b.count - a.count);
    }, [products]);

    // Product conditions and counts
    const conditionData = useMemo(() => {
        const counts: Record<string, number> = {
            'Nowa w folii': 0,
            'Nowa': 0,
            'Używana': 0
        };
        products.forEach(p => {
            if (p.item_condition && p.item_condition in counts) {
                counts[p.item_condition]++;
            }
        });
        return Object.keys(counts).map(c => ({ name: c, count: counts[c] }));
    }, [products]);

    // Price ranges and counts
    const priceRangeData = useMemo(() => {
        const ranges = [
            { id: 'over100', label: 'Powyżej £100', match: (p: number) => p > 100 },
            { id: '50to100', label: '£50 - £100', match: (p: number) => p >= 50 && p <= 100 },
            { id: '20to50', label: '£20 - £50', match: (p: number) => p >= 20 && p < 50 },
            { id: '10to20', label: '£10 - £20', match: (p: number) => p >= 10 && p < 20 },
            { id: '1to10', label: '£1 - £10', match: (p: number) => p >= 1 && p < 10 },
        ];
        
        return ranges.map(r => {
            const count = products.filter(p => r.match(p.price)).length;
            return { ...r, count };
        });
    }, [products]);

    // Toggle handlers
    const toggleSubcategory = (sub: string) => {
        setSelectedSubcategories(prev =>
            prev.includes(sub) ? prev.filter(x => x !== sub) : [...prev, sub]
        );
    };

    const toggleCondition = (cond: string) => {
        setSelectedConditions(prev =>
            prev.includes(cond) ? prev.filter(x => x !== cond) : [...prev, cond]
        );
    };

    const togglePriceRange = (rangeId: string) => {
        setSelectedPriceRanges(prev =>
            prev.includes(rangeId) ? prev.filter(x => x !== rangeId) : [...prev, rangeId]
        );
    };

    // Reset all filters
    const resetFilters = () => {
        setSelectedSubcategories([]);
        setSelectedConditions([]);
        setSelectedPriceRanges([]);
    };

    // Filter and Sort Products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Subcategory check (only applies if isMuzyka and some checkboxes checked)
            if (isMuzyka && selectedSubcategories.length > 0) {
                if (!product.music_category || !selectedSubcategories.includes(product.music_category)) {
                    return false;
                }
            }

            // Condition check (only applies if some checkboxes checked)
            if (isMuzyka && selectedConditions.length > 0) {
                if (!product.item_condition || !selectedConditions.includes(product.item_condition)) {
                    return false;
                }
            }

            // Price range check (only applies if some checkboxes checked)
            if (selectedPriceRanges.length > 0) {
                const price = Number(product.price);
                const matchesAnyRange = selectedPriceRanges.some(rangeId => {
                    if (rangeId === 'over100') return price > 100;
                    if (rangeId === '50to100') return price >= 50 && price <= 100;
                    if (rangeId === '20to50') return price >= 20 && price < 50;
                    if (rangeId === '10to20') return price >= 10 && price < 20;
                    if (rangeId === '1to10') return price >= 1 && price < 10;
                    return false;
                });
                if (!matchesAnyRange) return false;
            }

            return true;
        });
    }, [products, isMuzyka, selectedSubcategories, selectedConditions, selectedPriceRanges]);

    const sortedProducts = useMemo(() => {
        const result = [...filteredProducts];
        if (activeSort === 'artist_asc') {
            result.sort((a, b) => a.title.localeCompare(b.title, 'pl'));
        } else if (activeSort === 'artist_desc') {
            result.sort((a, b) => b.title.localeCompare(a.title, 'pl'));
        } else if (activeSort === 'price_asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (activeSort === 'price_desc') {
            result.sort((a, b) => b.price - a.price);
        } else if (activeSort === 'newest') {
            result.sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateB - dateA;
            });
        }
        return result;
    }, [filteredProducts, activeSort]);

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <Link href="/shop" className="back-btn">
                <ChevronLeft size={18} /> Sklep
            </Link>

            <header className="page-header" style={{ marginBottom: '1.5rem' }}>
                <h1 className="page-header-title">
                    {categoryIcon} {categoryTitle}
                </h1>
            </header>

            {/* Sorting bar on top of contents */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SORTUJ:</span>
                    <select
                        value={activeSort}
                        onChange={(e) => setActiveSort(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="artist_asc">A-Z</option>
                        <option value="artist_desc">Z-A</option>
                        <option value="price_asc">Cena: rosnąco</option>
                        <option value="price_desc">Cena: malejąco</option>
                        <option value="newest">Najnowsze</option>
                    </select>
                </div>
            </div>

            <div className="shop-layout">
                {/* Left Sidebar (Only for muzyka) */}
                {isMuzyka && (
                    <aside className="shop-sidebar">
                        {/* 1. Subcategories */}
                        <div className="filter-group">
                            <h4 className="filter-group-title">Kategoria</h4>
                            <div className="filter-list">
                                {subcategoryData.map(sub => (
                                    <label key={sub.name} className="filter-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedSubcategories.includes(sub.name)}
                                            onChange={() => toggleSubcategory(sub.name)}
                                            className="filter-checkbox"
                                        />
                                        <span>{sub.name}</span>
                                        <span className="filter-count">({sub.count})</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 2. Condition */}
                        <div className="filter-group">
                            <h4 className="filter-group-title">Stan płyty</h4>
                            <div className="filter-list">
                                {conditionData.map(cond => (
                                    <label key={cond.name} className="filter-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedConditions.includes(cond.name)}
                                            onChange={() => toggleCondition(cond.name)}
                                            className="filter-checkbox"
                                        />
                                        <span>{cond.name}</span>
                                        {cond.count > 0 && <span className="filter-count">({cond.count})</span>}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 3. Price ranges */}
                        <div className="filter-group">
                            <h4 className="filter-group-title">Cena</h4>
                            <div className="filter-list">
                                {priceRangeData.map(range => (
                                    <label key={range.id} className="filter-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedPriceRanges.includes(range.id)}
                                            onChange={() => togglePriceRange(range.id)}
                                            className="filter-checkbox"
                                        />
                                        <span>{range.label}</span>
                                        {range.count > 0 && <span className="filter-count">({range.count})</span>}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Reset button */}
                        {(selectedSubcategories.length > 0 || selectedConditions.length > 0 || selectedPriceRanges.length > 0) && (
                            <button
                                onClick={resetFilters}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    marginTop: '1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    color: '#ef4444',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Wyczyść filtry
                            </button>
                        )}
                    </aside>
                )}

                {/* Right Main Content */}
                <main className="shop-main-content">
                    {sortedProducts.length > 0 ? (
                        <div className="product-grid">
                            {sortedProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    ) : (
                        <div className="shop-empty" style={{ padding: '4rem 1rem' }}>
                            <div className="shop-empty-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                            <h2 className="shop-empty-title" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Brak pasujących produktów</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                {isMuzyka && (selectedSubcategories.length > 0 || selectedConditions.length > 0 || selectedPriceRanges.length > 0)
                                    ? "Zmień zaznaczone opcje filtrowania, aby zobaczyć asortyment."
                                    : "Obecnie brak produktów w tej kategorii."}
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
