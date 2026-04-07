import Link from 'next/link';
import { ShieldOff } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '60vh', textAlign: 'center',
            padding: '2rem', gap: '1.5rem'
        }}>
            <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <ShieldOff size={36} color="#ef4444" />
            </div>

            <h1 style={{ fontSize: '2rem', margin: 0 }}>Brak dostępu</h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 420, lineHeight: 1.6 }}>
                Twoje konto nie ma uprawnień do panelu administracyjnego.
                Skontaktuj się z administratorem jeśli uważasz, że to błąd.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
                    Wróć na stronę główną
                </Link>
                <Link href="/login" className="btn-secondary" style={{ textDecoration: 'none', border: '1px solid var(--border-color)', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, transition: 'all 0.2s' }}>
                    Zaloguj się na inne konto
                </Link>
            </div>
        </div>
    );
}
