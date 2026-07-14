import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck, Lock, Eye, CheckCircle2 } from 'lucide-react';
import { LEGAL_CONFIG } from '@/lib/legal-config';
import '../shop/shop.css';

export const metadata = {
    title: 'Polityka Prywatności | RAPwUK',
    description: 'Polityka prywatności i plików cookies serwisu i sklepu RAPwUK.com w UK.',
};

export default function PrivacyPage() {
    return (
        <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '800px' }}>
            <Link href="/shop" className="back-btn">
                <ChevronLeft size={18} /> Sklep
            </Link>

            <header className="page-header" style={{ marginBottom: '2.5rem' }}>
                <h1 className="page-header-title">
                    <Lock size={32} /> Polityka Prywatności
                </h1>
                <p className="page-header-subtitle">
                    Dowiedz się, jak chronimy Twoje dane osobowe i jakich plików cookie używamy w naszym serwisie.
                </p>
            </header>

            <div className="glass-panel" style={{ padding: '2.5rem', lineHeight: '1.7', color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <ShieldCheck size={20} style={{ color: '#4ade80' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>
                        Zgodna z wymogami UK GDPR / RODO
                    </span>
                </div>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        1. Kto jest administratorem Twoich danych?
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Administratorem danych osobowych zbieranych za pośrednictwem serwisu i sklepu internetowego <strong>https://rapwuk.com</strong> jest:
                    </p>
                    <p style={{ marginBottom: '1rem' }}>
                        <strong>{LEGAL_CONFIG.companyName}</strong><br />
                        Adres rejestracyjny: {LEGAL_CONFIG.address}<br />
                        Email kontaktowy: <a href={`mailto:${LEGAL_CONFIG.email}`} style={{ color: '#f59e0b', textDecoration: 'underline' }}>{LEGAL_CONFIG.email}</a>
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        2. Jakie dane zbieramy i w jakim celu?
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Przetwarzamy dane osobowe w następujących celach:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}>
                            <strong>Realizacja zamówień w sklepie:</strong> Zbieramy dane takie jak: imię, nazwisko, adres dostawy, adres e-mail oraz numer telefonu w celu realizacji zawartej umowy sprzedaży.
                        </li>
                        <li style={{ marginBottom: '0.5rem' }}>
                            <strong>Kontakt z klientem:</strong> W formularzu kontaktowym lub zapytaniu o produkt przetwarzamy Twój adres e-mail oraz treść wiadomości, aby odpowiedzieć na Twoje zapytania.
                        </li>
                        <li style={{ marginBottom: '0.5rem' }}>
                            <strong>Statystyki i analityka:</strong> Używamy narzędzia Google Analytics do zbierania zanonimizowanych danych o ruchu na stronie w celu optymalizacji działania serwisu.
                        </li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        3. Bezpieczeństwo płatności i Stripe
                    </h2>
                    <div className="shipping-modal-notice" style={{ marginBottom: '1.5rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <Lock size={20} style={{ color: '#4ade80', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <h4 style={{ margin: '0 0 0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Bezpieczne przetwarzanie płatności</h4>
                            <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-secondary)' }}>
                                Wszystkie płatności w naszym sklepie obsługiwane są bezpośrednio przez licencjonowanego operatora <strong>Stripe</strong>. 
                                Nasz sklep <strong>nie ma dostępu, nie rejestruje ani nie przechowuje</strong> danych Twoich kart płatniczych ani informacji autoryzacyjnych. 
                                Połączenie ze Stripe jest w pełni zaszyfrowane certyfikatem SSL.
                            </p>
                        </div>
                    </div>
                    <p style={{ marginBottom: '1rem' }}>
                        Dane płatnicze przetwarzane są zgodnie z polityką prywatności firmy Stripe, z którą można zapoznać się pod adresem: <a href={LEGAL_CONFIG.stripePrivacyPolicy} target="_blank" rel="noreferrer" style={{ color: '#f59e0b', textDecoration: 'underline' }}>Polityka Prywatności Stripe</a>.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        4. Komu przekazujemy Twoje dane?
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Twoje dane osobowe mogą być przekazywane wyłącznie zaufanym podmiotom zewnętrznym w celu realizacji zamówienia:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}><strong>InPost UK</strong> – w celu dostarczenia przesyłki z zamówionym towarem.</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Stripe Payments</strong> – w celu autoryzacji i przetworzenia płatności.</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Supabase</strong> – dostawcy naszej bazy danych w celach bezpiecznego przechowywania danych zamówień i wiadomości.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        5. Twoje prawa (RODO / UK GDPR)
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Zgodnie z przepisami dotyczącymi ochrony danych osobowych, przysługują Ci następujące prawa:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}>Prawo dostępu do treści swoich danych osobowych oraz otrzymania ich kopii.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Prawo do sprostowania (poprawiania) swoich danych.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Prawo do usunięcia danych ("prawo do bycia zapomnianym").</li>
                        <li style={{ marginBottom: '0.5rem' }}>Prawo do ograniczenia lub wniesienia sprzeciwu wobec przetwarzania danych.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Prawo do cofnięcia zgody w dowolnym momencie (jeśli przetwarzanie odbywało się na podstawie zgody).</li>
                    </ul>
                    <p style={{ marginBottom: '1rem' }}>
                        W celu wykonania swoich praw możesz skontaktować się z nami pod adresem mailowym: <strong>{LEGAL_CONFIG.email}</strong>.
                    </p>
                </section>

                <section id="cookies" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        6. Polityka plików cookies (ciasteczek)
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Pliki cookies to małe pliki tekstowe zapisywane na Twoim urządzeniu podczas przeglądania naszej strony. Wykorzystujemy:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}>
                            <strong>Cookies niezbędne (sesyjne):</strong> Umożliwiają prawidłowe działanie strony, np. utrzymanie koszyka zakupowego czy zalogowanie do panelu.
                        </li>
                        <li style={{ marginBottom: '0.5rem' }}>
                            <strong>Cookies analityczne:</strong> Służą do zliczania wizyt i źródeł ruchu (Google Analytics), dzięki czemu możemy mierzyć i poprawiać wydajność naszej witryny. Dane te są zanonimizowane.
                        </li>
                    </ul>
                    <p style={{ marginBottom: '1rem' }}>
                        Możesz w każdej chwili zmienić ustawienia dotyczące cookies w swojej przeglądarce internetowej lub kliknąć opcję odrzucenia w naszym banerze cookies. Wyłączenie niezbędnych plików cookie może jednak wpłynąć na poprawne działanie sklepu i koszyka.
                    </p>
                </section>
            </div>
        </div>
    );
}
