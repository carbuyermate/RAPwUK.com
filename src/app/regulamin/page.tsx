import React from 'react';
import Link from 'next/link';
import { ChevronLeft, FileText, Scale, ShieldAlert } from 'lucide-react';
import { LEGAL_CONFIG } from '@/lib/legal-config';
import '../shop/shop.css';

export const metadata = {
    title: 'Regulamin Sklepu | RAPwUK',
    description: 'Regulamin i warunki korzystania ze sklepu internetowego RAPwUK.pl w UK.',
};

export default function TermsPage() {
    return (
        <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '800px' }}>
            <Link href="/shop" className="back-btn">
                <ChevronLeft size={18} /> Sklep
            </Link>

            <header className="page-header" style={{ marginBottom: '2.5rem' }}>
                <h1 className="page-header-title">
                    <FileText size={32} /> Regulamin Sklepu
                </h1>
                <p className="page-header-subtitle">
                    Zasady korzystania ze sklepu internetowego RAPwUK.com oraz warunki składania zamówień.
                </p>
            </header>

            <div className="glass-panel" style={{ padding: '2.5rem', lineHeight: '1.7', color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <Scale size={20} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>
                        Ostatnia aktualizacja: 14 lipca 2026 r.
                    </span>
                </div>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        1. Postanowienia ogólne
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Niniejszy regulamin określa zasady korzystania ze sklepu internetowego dostępnego pod adresem <strong>https://rapwuk.com/shop</strong>.
                    </p>
                    <p style={{ marginBottom: '1rem' }}>
                        Właścicielem i administratorem sklepu jest: <br />
                        <strong>{LEGAL_CONFIG.companyName}</strong><br />
                        Adres rejestracyjny: {LEGAL_CONFIG.address}<br />
                        {LEGAL_CONFIG.regNumber && <>Numer rejestracyjny firmy: {LEGAL_CONFIG.regNumber}<br /></>}
                        {LEGAL_CONFIG.vatNumber && <>Numer VAT: {LEGAL_CONFIG.vatNumber}<br /></>}
                        Email kontaktowy: <a href={`mailto:${LEGAL_CONFIG.email}`} style={{ color: '#f59e0b', textDecoration: 'underline' }}>{LEGAL_CONFIG.email}</a>
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        2. Ceny i Produkty
                    </h2>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}>Wszystkie produkty oferowane w sklepie są fabrycznie nowe lub używane (w przypadku giełdy, co jest wyraźnie zaznaczone w opisie produktu wraz z klasyfikacją stanu).</li>
                        <li style={{ marginBottom: '0.5rem' }}>Ceny podane przy produktach wyrażone są w funtach szterlingach (GBP) i zawierają wszelkie należne podatki (w tym podatek VAT, jeśli dotyczy).</li>
                        <li style={{ marginBottom: '0.5rem' }}>Ceny produktów nie zawierają kosztów dostawy. Koszt przesyłki jest automatycznie obliczany w koszyku przed dokonaniem płatności.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        3. Składanie zamówień i Płatności
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Zamówienia można składać za pośrednictwem strony internetowej 24 godziny na dobę, 7 dni w tygodniu.
                    </p>
                    <p style={{ marginBottom: '1rem' }}>
                        Proces zakupu przebiega następująco:
                    </p>
                    <ol style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}>Dodanie wybranych produktów do koszyka.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Zaakceptowanie niniejszego Regulaminu oraz Polityki Prywatności.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Kliknięcie przycisku płatności i przekierowanie do bezpiecznej bramki płatniczej <strong>Stripe</strong>.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Wprowadzenie danych dostawy oraz danych płatniczych na stronie Stripe.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Po pomyślnej płatności klient otrzymuje potwierdzenie na wskazany adres e-mail.</li>
                    </ol>
                    <p style={{ marginBottom: '1rem' }}>
                        Obsługujemy płatności kartami płatniczymi (Visa, Mastercard), Apple Pay oraz inne metody udostępniane przez operatora Stripe. Sklep nie przechowuje danych kart płatniczych użytkowników.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        4. Dostawa i Realizacja
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Dostawa zamówionych produktów fizycznych realizowana jest wyłącznie na terenie <strong>Wielkiej Brytanii (UK)</strong> za pośrednictwem firmy kurierskiej <strong>InPost UK</strong>.
                    </p>
                    <p style={{ marginBottom: '1rem' }}>
                        Standardowy czas nadania przesyłki wynosi do 3 dni roboczych od zaksięgowania płatności. Dostarczenie przesyłki przez kuriera trwa zazwyczaj 4-5 dni roboczych. Dokładne informacje i cennik znajdują się na stronie <Link href="/dostawa" style={{ color: '#f59e0b', textDecoration: 'underline' }}>Dostawa i Płatności</Link>.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        5. Odstąpienie od umowy i Reklamacje
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Zgodnie z przepisami Consumer Contracts Regulations, kupującemu przysługuje prawo do odstąpienia od umowy bez podania przyczyny w terminie <strong>14 dni</strong> od dnia wejścia w posiadanie produktu.
                    </p>
                    <p style={{ marginBottom: '1rem' }}>
                        Więcej szczegółów dotyczących procedury zwrotów, reklamacji produktów wadliwych oraz adresów do wysyłki zwrotnej znajduje się w sekcji <Link href="/zwroty-i-reklamacje" style={{ color: '#f59e0b', textDecoration: 'underline' }}>Zwroty i Reklamacje</Link>.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        6. Postanowienia końcowe
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają odpowiednie przepisy prawa Wielkiej Brytanii (English Law), w szczególności Consumer Rights Act 2015.
                    </p>
                    <p style={{ marginBottom: '1rem' }}>
                        Regulamin może ulec zmianie. Wszelkie zmiany wchodzą w życie z chwilą opublikowania ich na stronie internetowej sklepu.
                    </p>
                </section>

                <div className="shipping-modal-notice" style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShieldAlert size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-secondary)' }}>
                        Złożenie zamówienia w sklepie jest jednoznaczne z akceptacją powyższych warunków regulaminu. Jeśli masz pytania, prosimy o kontakt pod adresem {LEGAL_CONFIG.email}.
                    </p>
                </div>
            </div>
        </div>
    );
}
