import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Truck, ShieldCheck, Clock, CreditCard, Lock } from 'lucide-react';
import '../shop/shop.css';

export const metadata = {
    title: 'Dostawa i Płatności | RAPwUK',
    description: 'Szczegóły dotyczące kosztów i czasu wysyłki InPost w UK oraz bezpiecznych płatności Stripe w sklepie RAPwUK.',
};

export default function ShippingPage() {
    return (
        <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '800px' }}>
            <Link href="/shop" className="back-btn">
                <ChevronLeft size={18} /> Sklep
            </Link>

            <header className="page-header" style={{ marginBottom: '2.5rem' }}>
                <h1 className="page-header-title">
                    <Truck size={32} /> Dostawa i Płatności
                </h1>
                <p className="page-header-subtitle">
                    Wszystkie niezbędne informacje o kosztach przesyłek, czasie dostawy oraz bezpieczeństwie Twoich transakcji.
                </p>
            </header>

            <div className="glass-panel" style={{ padding: '2.5rem', lineHeight: '1.7', color: 'var(--text-primary)' }}>
                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1.2rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Truck size={22} style={{ color: '#f59e0b' }} /> Warunki Dostawy
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Nasze przesyłki realizujemy na terenie całej Wielkiej Brytanii za pośrednictwem kuriera <strong>InPost UK</strong>.
                    </p>
                    <p style={{ marginBottom: '1rem', fontWeight: 600, color: '#fbbf24' }}>
                        ⚠️ Wysyłka wyłącznie na terenie Wielkiej Brytanii (UK Only).
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="glass-panel" style={{ padding: '1rem' }}>
                            <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.5rem 0' }}>Dostępne metody dostawy:</h3>
                            <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                                <li><strong>Odbiór w wybranym Paczkomacie InPost (Locker):</strong> Wygodny odbiór w skrytce paczkomatu o dowolnej porze.</li>
                                <li><strong>Dostawa pod wskazany adres domowy (Home Delivery):</strong> Kurier doręczy paczkę bezpośrednio do Twoich rąk.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1.2rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CreditCard size={22} style={{ color: '#f59e0b' }} /> Cennik Przesyłek (Płyty CD/DVD)
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Koszt przesyłki jest automatycznie obliczany w koszyku w zależności od liczby zamawianych płyt CD/DVD:
                    </p>
                    
                    <div className="pricing-table" style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
                        <div className="pricing-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                            <span>1 płyta CD/DVD</span>
                            <strong style={{ fontSize: '1.1rem' }}>£3.00</strong>
                        </div>
                        <div className="pricing-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}>
                            <span>Każda kolejna płyta CD/DVD</span>
                            <strong style={{ fontSize: '1.1rem' }}>+ £1.00</strong>
                        </div>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', fontStyle: 'italic' }}>
                        Przykładowo: koszt przesyłki dla 2 płyt to £4.00, dla 3 płyt to £5.00, itd.
                    </span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                        * Zasady i koszty dostawy dla ubrań (streetwear) oraz biletów na imprezy zostaną wkrótce zaktualizowane.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1.2rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={22} style={{ color: '#f59e0b' }} /> Czas Realizacji i Dostawy
                    </h2>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}>
                            <strong>Czas nadania (obsługa):</strong> Dokładamy wszelkich starań, aby przygotować i nadać Twoją paczkę w ciągu <strong>3 dni roboczych</strong> od opłacenia zamówienia.
                        </li>
                        <li style={{ marginBottom: '0.5rem' }}>
                            <strong>Czas dostawy kuriera:</strong> Standardowy transport InPost na terenie UK trwa zazwyczaj <strong>4 do 5 dni roboczych</strong> od momentu wysyłki.
                        </li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1.2rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldCheck size={22} style={{ color: '#f59e0b' }} /> Ubezpieczenie
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Wszystkie paczki są automatycznie ubezpieczone do kwoty <strong>£50.00</strong> w cenie podstawowej przesyłki. Masz pewność, że w przypadku zagubienia lub uszkodzenia przesyłki otrzymasz pełny zwrot.
                    </p>
                </section>

                <section style={{ marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1.2rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Lock size={22} style={{ color: '#4ade80' }} /> Bezpieczeństwo Płatności
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Płatności w naszym sklepie realizowane są za pośrednictwem bramki <strong>Stripe</strong>. Stripe to jeden z największych i najbardziej zaufanych operatorów płatności na świecie, zapewniający najwyższy poziom bezpieczeństwa (zgodność z PCI-DSS).
                    </p>
                    <p style={{ marginBottom: '1rem' }}>
                        Twoje dane płatnicze (numery kart kredytowych/debetowych) są wprowadzane na w pełni zabezpieczonej i szyfrowanej stronie Stripe. Nasz sklep <strong>nie ma dostępu</strong> do tych danych. Akceptujemy płatności kartami Visa, Mastercard oraz Apple Pay.
                    </p>
                </section>
            </div>
        </div>
    );
}
