'use client';

import { useState } from 'react';
import type { TicketTier } from '@/app/shop/page';
import type { Product } from '@/app/shop/page';
import { AddToCartButton } from '@/components/shop/AddToCartButton';

export function TicketTierSelector({ product, tiers }: { product: Product; tiers: TicketTier[] }) {
    const [selected, setSelected] = useState<TicketTier>(tiers[0]);

    return (
        <div>
            {/* Selektor wariantów */}
            <div style={{
                margin: '1.5rem 0',
                padding: '1.25rem',
                background: 'var(--bg-secondary)',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '0.75rem'
                }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        🎟️ Wybierz rodzaj biletu:
                    </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {tiers.map((tier) => {
                        const isSelected = selected.id === tier.id;
                        return (
                            <button
                                key={tier.id}
                                type="button"
                                onClick={() => setSelected(tier)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.85rem 1.1rem',
                                    borderRadius: '8px',
                                    border: isSelected
                                        ? '1.5px solid #f59e0b'
                                        : '1px solid var(--border-color)',
                                    background: isSelected
                                        ? 'rgba(245,158,11,0.07)'
                                        : 'rgba(255,255,255,0.02)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    width: '100%',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {/* Radio dot */}
                                    <div style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        border: isSelected ? '5px solid #f59e0b' : '2px solid rgba(255,255,255,0.25)',
                                        flexShrink: 0,
                                        transition: 'all 0.15s ease',
                                    }} />
                                    <div>
                                        <div style={{
                                            fontWeight: 700,
                                            color: isSelected ? '#f59e0b' : 'var(--text-primary)',
                                            fontSize: '0.95rem',
                                        }}>
                                            {tier.name}
                                        </div>
                                        {tier.description && (
                                            <div style={{
                                                fontSize: '0.78rem',
                                                color: 'var(--text-secondary)',
                                                marginTop: '2px',
                                            }}>
                                                {tier.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{
                                    fontWeight: 900,
                                    fontSize: '1.1rem',
                                    color: isSelected ? '#f59e0b' : 'var(--text-primary)',
                                    fontFamily: 'var(--font-outfit, Outfit)',
                                    flexShrink: 0,
                                    marginLeft: '1rem',
                                }}>
                                    £{tier.price.toFixed(2)}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Wybrana cena */}
                <div style={{
                    marginTop: '1rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Wybrany wariant:
                    </span>
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                        {selected.name} — £{selected.price.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Przycisk dodaj do koszyka z wybranym wariantem */}
            <AddToCartButton product={product} selectedTier={selected} />
        </div>
    );
}
