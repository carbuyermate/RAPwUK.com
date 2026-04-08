'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import './login.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd podczas logowania');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container container">
            <div className="login-card glass-panel animate-fade-in">
                <div className="login-header">
                    <h1 className="login-title">Logowanie</h1>
                    <p className="login-subtitle">Witaj ponownie w RAPwUK</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="twoj@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Hasło</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary btn-block login-button"
                        disabled={loading}
                    >
                        {loading ? 'Logowanie...' : 'Zaloguj się'}
                    </button>
                </form>

                <div className="login-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                        <span>Zapomniałeś hasła?</span>
                        <Link href="/forgot-password" className="register-link">Zresetuj je</Link>
                    </div>
                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span>Chcesz dołączyć jako redaktor?</span>
                        <Link href="/register" className="register-link">Zobacz jak</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
