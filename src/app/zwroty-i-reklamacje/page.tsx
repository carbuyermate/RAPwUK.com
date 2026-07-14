import React from 'react';
import Link from 'next/link';
import { ChevronLeft, RefreshCw, AlertCircle, Calendar, Truck } from 'lucide-react';
import { LEGAL_CONFIG } from '@/lib/legal-config';
import '../shop/shop.css';

export const metadata = {
    title: 'Zwroty i Reklamacje | RAPwUK',
    description: 'Polityka zwrotów towarów i reklamacji w sklepie internetowym RAPwUK w UK.',
};

export default function ReturnsPage() {
    return (
        <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '800px' }}>
            <Link href="/shop" className="back-btn">
                <ChevronLeft size={18} /> Sklep
            </Link>

            <header className="page-header" style={{ marginBottom: '2.5rem' }}>
                <h1 className="page-header-title">
                    <RefreshCw size={32} /> Zwroty i Reklamacje
                </h1>
                <p className="page-header-subtitle">
                    Przejrzyste zasady odstąpienia od umowy zakupu oraz reklamacji wadliwych produktów.
                </p>
            </header>

            <div className="glass-panel" style={{ padding: '2.5rem', lineHeight: '1.7', color: 'var(--text-primary)' }}>
                {/* Intro summary */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    <div className="glass-panel" style={{ flex: '1 1 200px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
                            <Calendar size={18} />
                            <strong style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>14 dni na zwrot</strong>
                        </div>
                        <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-secondary)' }}>
                            Możesz odstąpić od umowy zakupu online bez podawania przyczyny.
                        </p>
                    </div>
                    <div className="glass-panel" style={{ flex: '1 1 200px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80' }}>
                            <AlertCircle size={18} />
                            <strong style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>Wadliwy towar</strong>
                        </div>
                        <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-secondary)' }}>
                            Masz do 30 dni na pełny zwrot pieniędzy, jeśli produkt okaże się uszkodzony.
                        </p>
                    </div>
                </div>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        1. Prawo do odstąpienia od umowy (Zwrot towaru)
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Kupując w naszym sklepie internetowym na terenie Wielkiej Brytanii, masz prawo odstąpić od umowy bez podania przyczyny w terminie <strong>14 dni</strong> od dnia doręczenia przesyłki (zgodnie z przepisami Consumer Contracts Regulations).
                    </p>
                    <p style={{ marginBottom: '1rem' }}>
                        Aby dokonać zwrotu:
                    </p>
                    <ol style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}>Poinformuj nas o swojej decyzji drogą mailową na adres: <a href={`mailto:${LEGAL_CONFIG.email}`} style={{ color: '#f59e0b', textDecoration: 'underline' }}>{LEGAL_CONFIG.email}</a> w ciągu 14 dni od otrzymania towaru.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Zabezpiecz zwracane produkty i odeślij je na wskazany przez nas adres w ciągu kolejnych 14 dni od momentu zgłoszenia zwrotu.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Towar powinien zostać zwrócony w stanie niezmienionym (płyty CD w nienaruszonej folii, ubrania z metkami, bez śladów użytkowania).</li>
                    </ol>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        2. Koszty przesyłki zwrotnej
                    </h2>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}>
                            <strong>Zwrot z powodu zmiany zdania (odstąpienie od umowy):</strong> Koszt odesłania towaru do sklepu pokrywa w pełni kupujący. Zwracamy pełną kwotę zakupionego towaru wraz z najtańszym oferowanym przez nas kosztem dostawy pierwotnej.
                        </li>
                        <li style={{ marginBottom: '0.5rem' }}>
                            <strong>Zwrot z powodu błędu sklepu lub wady towaru:</strong> W przypadku otrzymania wadliwego towaru lub błędnego produktu, sklep pokrywa koszty przesyłki zwrotnej (dostarczamy przedpłaconą etykietę kurierską InPost).
                        </li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        3. Reklamacje (Wadliwy produkt)
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Wszystkie produkty fizyczne sprzedawane w naszym sklepie podlegają prawu ochrony konsumenta (Consumer Rights Act 2015). Jeżeli otrzymany produkt jest uszkodzony, wadliwy lub niezgodny z opisem:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}>
                            Masz prawo do **pełnego zwrotu pieniędzy** w terminie <strong>30 dni</strong> od dnia otrzymania wadliwego towaru.
                        </li>
                        <li style={{ marginBottom: '0.5rem' }}>
                            Po upływie 30 dni, ale przed upływem 6 miesięcy, masz prawo żądać w pierwszej kolejności bezpłatnej naprawy lub wymiany produktu na nowy.
                        </li>
                    </ul>
                    <p style={{ marginBottom: '1rem' }}>
                        W celu zgłoszenia reklamacji, prosimy o przesłanie na e-mail <strong>{LEGAL_CONFIG.email}</strong> wiadomości zawierającej: numer zamówienia, krótki opis wady oraz (w miarę możliwości) zdjęcia przedstawiające uszkodzenie.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        4. Zwrot środków
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Zwrotu środków dokonujemy przy użyciu tego samego sposobu płatności, którego użyłeś podczas pierwotnej transakcji (zwrot na kartę płatniczą przez Stripe).
                    </p>
                    <p style={{ marginBottom: '1rem' }}>
                        Środki zostaną zwrócone niezwłocznie, nie później niż w ciągu **14 dni** od dnia, w którym otrzymaliśmy zwracany towar z powrotem.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        5. Adres do wysyłki zwrotów i reklamacji
                    </h2>
                    <div className="shipping-modal-notice" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Truck size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
                        <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-secondary)' }}>
                            Przed odesłaniem paczki prosimy o **obowiązkowy kontakt e-mail**, abyśmy mogli przesłać instrukcję oraz właściwy adres magazynu do wysyłki (adres zwrotów zależy od kategorii towaru: płyty, ubrania itp.). 
                            Nie przyjmujemy paczek odesłanych za pobraniem bez wcześniejszej konsultacji.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
