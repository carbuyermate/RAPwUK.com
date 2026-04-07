'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import '../login/login.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                // Po udanym resecie wróci na Callback, a stamtąd na /update-password
                redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
            });

            if (error) throw error;

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd przy wysyłaniu linku.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="login-container container">
                <div className="login-card glass-panel animate-fade-in text-center">
                    <h1 className="login-title">Sprawdź skrzynkę</h1>
                    <p className="login-subtitle">
                        Wysłaliśmy link do resetu hasła na podany adres e-mail.
                    </p>
                    <Link href="/login" className="btn-primary btn-block mt-4" style={{ textDecoration: 'none', display: 'block' }}>
                        Wróć do logowania
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container container">
            <div className="login-card glass-panel animate-fade-in">
                <div className="login-header">
                    <h1 className="login-title">Reset Hasła</h1>
                    <p className="login-subtitle">Wpisz e-mail powiązany ze swoim kontem, a wyślemy Ci link do zmiany zapomnianego hasła.</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="login-form" onSubmit={handleReset}>
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

                    <button
                        type="submit"
                        className="btn-primary btn-block login-button"
                        disabled={loading}
                    >
                        {loading ? 'Wysyłanie...' : 'Zresetuj hasło'}
                    </button>
                </form>

                <div className="login-footer">
                    <span>Przypomniałeś sobie?</span>
                    <Link href="/login" className="register-link">Wróć do logowania</Link>
                </div>
            </div>
        </div>
    );
}
