'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import '../login/login.css'; // Używamy stylu logowania

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('Hasła nie są takie same.');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                router.push('/dashboard');
                router.refresh();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd przy zmianie hasła');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="login-container container">
                <div className="login-card glass-panel animate-fade-in text-center">
                    <h1 className="login-title">Hasło ustawione!</h1>
                    <p className="login-subtitle">Przekierowuję do panelu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container container">
            <div className="login-card glass-panel animate-fade-in">
                <div className="login-header">
                    <h1 className="login-title">Ustaw nowe hasło</h1>
                    <p className="login-subtitle">Wpisz nowe hasło do swojego konta.</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="login-form" onSubmit={handleUpdate}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Nowe hasło</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="Min. 6 znaków"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="confirm-password">Powtórz hasło</label>
                        <input
                            id="confirm-password"
                            type="password"
                            className="form-input"
                            placeholder="Potwierdź nowe hasło"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary btn-block login-button"
                        disabled={loading}
                    >
                        {loading ? 'Zapisywanie...' : 'Zapisz hasło'}
                    </button>
                </form>
            </div>
        </div>
    );
}
