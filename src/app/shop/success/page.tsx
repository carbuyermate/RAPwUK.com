import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
    return (
        <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1.5rem', color: '#10b981' }}>
                <CheckCircle size={80} strokeWidth={1.5} />
            </div>
            <h1 style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>
                Dziękujemy za zakup! 🎉
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                Potwierdzenie i szczegóły zamówienia zostały wysłane na Twój adres e-mail.
            </p>
            <Link href="/shop" className="btn-primary" style={{ padding: '14px 32px', display: 'inline-block' }}>
                Wróć do sklepu
            </Link>
        </div>
    );
}
