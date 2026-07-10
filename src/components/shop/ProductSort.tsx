'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function ProductSort() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get('sort') || 'artist_asc';

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'artist_asc') {
            params.delete('sort');
        } else {
            params.set('sort', value);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="product-sort-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
                Sortuj:
            </span>
            <div style={{ position: 'relative' }}>
                <select
                    value={currentSort}
                    onChange={handleSortChange}
                    style={{
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        padding: '8px 36px 8px 12px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '12px',
                    }}
                >
                    <option value="artist_asc" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                        Artysta: A-Z
                    </option>
                    <option value="artist_desc" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                        Artysta: Z-A
                    </option>
                    <option value="newest" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                        Najnowsze
                    </option>
                    <option value="price_asc" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                        Cena: od najniższej
                    </option>
                    <option value="price_desc" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                        Cena: od najwyższej
                    </option>
                </select>
            </div>
        </div>
    );
}
