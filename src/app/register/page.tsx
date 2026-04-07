import Link from 'next/link';
import { Lock } from 'lucide-react';
import '../login/login.css';

export default function RegisterPage() {
    return (
        <div className="login-container container">
            <div className="login-card glass-panel animate-fade-in" style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Lock size={28} />
                    </div>
                </div>

                <h1 className="login-title">Rejestracja zamknięta</h1>
                <p className="login-subtitle" style={{ marginBottom: '2rem' }}>
                    Panel RAPwUK jest dostępny tylko na zaproszenie.<br />
                    Jeśli chcesz dodać swój event — skontaktuj się z nami.
                </p>

                <Link
                    href="/login"
                    className="btn-primary"
                    style={{ display: 'inline-flex', textDecoration: 'none', marginBottom: '1rem' }}
                >
                    Zaloguj się
                </Link>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                    Kontakt: <a href="mailto:admin@rapwuk.com" style={{ color: 'var(--text-primary)' }}>admin@rapwuk.com</a>
                </p>
            </div>
        </div>
    );
}
