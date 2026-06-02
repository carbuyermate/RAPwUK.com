'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, HelpCircle, Flame, Star, Award, Heart, ShieldAlert, Sparkles } from 'lucide-react';

interface ConditionGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ConditionGuideModal({ isOpen, onClose }: ConditionGuideModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return createPortal(
        <div className="shipping-modal-overlay animate-fade-in" onClick={handleBackdropClick}>
            <div className="shipping-modal-content glass-panel animate-scale-up" style={{ maxWidth: '650px' }}>
                <header className="shipping-modal-header">
                    <div className="flex items-center gap-3">
                        <HelpCircle size={24} className="text-secondary" style={{ color: '#f59e0b' }} />
                        <h2 className="shipping-modal-title">Klasyfikacja Stanu Płyt</h2>
                    </div>
                    <button onClick={onClose} className="shipping-modal-close-btn" aria-label="Zamknij">
                        <X size={20} />
                    </button>
                </header>

                <div className="shipping-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        Najbardziej uniwersalnym i powszechnie stosowanym systemem oceny używanych nośników fizycznych na świecie jest standard <strong>Goldmine</strong> (zaadaptowany m.in. przez największą bazę muzyczną, Discogs).
                    </p>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        Ocenę zawsze dzieli się na dwa osobne parametry: <strong>Stan płyty (Media)</strong> oraz <strong>Stan okładki/poligrafii (Sleeve)</strong>. Standardowe, plastikowe pudełka typu Jewel Case zazwyczaj nie podlegają ocenie, ponieważ można je łatwo i tanio wymienić.
                    </p>

                    {/* Sekcja: Stan płyty */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#f59e0b', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                            💿 Stan płyty (Media)
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div className="shipping-modal-section" style={{ alignItems: 'flex-start' }}>
                                <div className="section-icon-wrapper" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                                    <Sparkles size={16} />
                                </div>
                                <div className="section-details">
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Mint (M) – Idealny</h4>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Płyta nowa, nieużywana, często fabrycznie zafoliowana. Brak jakichkolwiek śladów użytkowania.</p>
                                </div>
                            </div>
                            <div className="shipping-modal-section" style={{ alignItems: 'flex-start' }}>
                                <div className="section-icon-wrapper" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                                    <Award size={16} />
                                </div>
                                <div className="section-details">
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Near Mint (NM lub M-) – Prawie idealny</h4>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Płyta niemal idealna. Może posiadać 1-2 minimalne, ledwo zauważalne mikroryski (tzw. "papierówki" od wyciągania z koperty). Odtwarza się bezbłędnie.</p>
                                </div>
                            </div>
                            <div className="shipping-modal-section" style={{ alignItems: 'flex-start' }}>
                                <div className="section-icon-wrapper" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
                                    <Heart size={16} />
                                </div>
                                <div className="section-details">
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Very Good Plus (VG+) – Bardzo dobry plus</h4>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Płyta posiada drobne ślady użytkowania, takie jak delikatne ryski widoczne głównie pod światło. Nie ma to wpływu na jakość dźwięku – płyta odtwarza się idealnie.</p>
                                </div>
                            </div>
                            <div className="shipping-modal-section" style={{ alignItems: 'flex-start' }}>
                                <div className="section-icon-wrapper" style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)' }}>
                                    <Flame size={16} />
                                </div>
                                <div className="section-details">
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Very Good (VG) – Bardzo dobry</h4>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Płyta ma już zauważalne i liczniejsze rysy lub lekkie zmatowienia. Powinna odtwarzać się w całości bez zacinania, choć bardzo czułe odtwarzacze mogą sporadycznie zgubić ścieżkę.</p>
                                </div>
                            </div>
                            <div className="shipping-modal-section" style={{ alignItems: 'flex-start' }}>
                                <div className="section-icon-wrapper" style={{ color: '#f97316', background: 'rgba(249, 115, 22, 0.1)' }}>
                                    <ShieldAlert size={16} />
                                </div>
                                <div className="section-details">
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Good (G / G+) – Dobry</h4>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Stan ryzykowny. Płyta jest mocno porysowana. W przypadku płyt CD oznacza to, że płyta może przeskakiwać, zacinać się lub trzeszczeć na niektórych utworach.</p>
                                </div>
                            </div>
                            <div className="shipping-modal-section" style={{ alignItems: 'flex-start' }}>
                                <div className="section-icon-wrapper" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
                                    <X size={16} />
                                </div>
                                <div className="section-details">
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Poor (P / F) – Słaby / Bardzo zniszczony</h4>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Płyta zniszczona. Gęsto i głęboko porysowana, pęknięta, połamana lub posiada uszkodzoną warstwę z danymi. Nie nadaje się do odtwarzania.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sekcja: Stan okładki */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#f59e0b', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                            🎨 Stan okładki / wkładki (Sleeve)
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div className="shipping-modal-section" style={{ alignItems: 'flex-start' }}>
                                <div className="section-icon-wrapper" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                                    <Sparkles size={16} />
                                </div>
                                <div className="section-details">
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Mint (M)</h4>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Idealna. Brak jakichkolwiek zagięć, zagnieceń, przetarć czy odcisków palców.</p>
                                </div>
                            </div>
                            <div className="shipping-modal-section" style={{ alignItems: 'flex-start' }}>
                                <div className="section-icon-wrapper" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                                    <Award size={16} />
                                </div>
                                <div className="section-details">
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Near Mint (NM)</h4>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Niemal idealna. Dopuszczalny jest minimalny, ledwo widoczny ślad zagięcia od delikatnego wyciągania wkładki z pudełka.</p>
                                </div>
                            </div>
                            <div className="shipping-modal-section" style={{ alignItems: 'flex-start' }}>
                                <div className="section-icon-wrapper" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
                                    <Heart size={16} />
                                </div>
                                <div className="section-details">
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Very Good Plus (VG+)</h4>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Lekkie ślady użytkowania. Mogą wystąpić delikatne wgniecenia na brzegach od plastikowych stoperów (tzw. "tab dents") lub minimalne przetarcia rogów w wydaniach kartonowych.</p>
                                </div>
                            </div>
                            <div className="shipping-modal-section" style={{ alignItems: 'flex-start' }}>
                                <div className="section-icon-wrapper" style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)' }}>
                                    <Flame size={16} />
                                </div>
                                <div className="section-details">
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Very Good (VG)</h4>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Wyraźniejsze ślady używania. Wkładka może być zagięta, posiadać lekkie przedarcia, ślady po naklejkach, drobne napisy długopisem lub być lekko wyblakła.</p>
                                </div>
                            </div>
                            <div className="shipping-modal-section" style={{ alignItems: 'flex-start' }}>
                                <div className="section-icon-wrapper" style={{ color: '#f97316', background: 'rgba(249, 115, 22, 0.1)' }}>
                                    <ShieldAlert size={16} />
                                </div>
                                <div className="section-details">
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Good (G / G+)</h4>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Mocne zużycie. Poligrafia naderwana, mocno pognieciona, posiada plamy od wilgoci (pofałdowany papier) lub rozległe przebarwienia i napisy markerem.</p>
                                </div>
                            </div>
                            <div className="shipping-modal-section" style={{ alignItems: 'flex-start' }}>
                                <div className="section-icon-wrapper" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
                                    <X size={16} />
                                </div>
                                <div className="section-details">
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Poor (P / F)</h4>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Bardzo zniszczona. Poligrafia podarta na kawałki, mocno poplamiona, zamazana w sposób uniemożliwiający odczytanie tekstu, lub brakuje jej fragmentów.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="shipping-modal-footer" style={{ marginTop: '1.5rem' }}>
                    <button onClick={onClose} className="btn-primary w-full py-3">
                        Zamknij poradnik
                    </button>
                </footer>
            </div>
        </div>,
        document.body
    );
}
