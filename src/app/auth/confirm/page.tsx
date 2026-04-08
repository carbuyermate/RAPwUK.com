'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ConfirmAuthContent() {
    const searchParams = useSearchParams();
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const next = searchParams.get('next') ?? '/update-password';

    if (!token_hash || !type) {
        return (
            <div className="login-container container">
                <div className="login-card glass-panel text-center animate-fade-in">
                    <h1 className="login-title text-red-500">Brakujący klucz</h1>
                    <p className="text-secondary mt-4">Link jest niekompletny lub uszkodzony.</p>
                    <Link href="/login" className="btn-secondary mt-8 inline-block">Wróć do logowania</Link>
                </div>
            </div>
        );
    }

    const callbackUrl = `/auth/callback?token_hash=${token_hash}&type=${type}&next=${next}`;

    return (
        <div className="login-container container">
            <div className="login-card glass-panel text-center animate-fade-in">
                <h1 className="login-title">Weryfikacja Człowieka</h1>
                <p className="text-secondary mt-4 mb-8">
                    Używamy tego ekranu, aby zablokować automatyczne boty antywirusowe Twojej poczty email (np. Outlook), które potajemnie "klikają" w linki w tle przed Tobą, niszcząc dostęp i zgłaszając "wygasły link".
                </p>
                <a href={callbackUrl} className="btn-primary" style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
                    Rozumiem, kontynuuj do ustawienia hasła
                </a>
            </div>
            
            <style jsx>{`
                .login-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
                .login-card { max-width: 500px; padding: 40px; }
            `}</style>
        </div>
    );
}

export default function ConfirmAuthPage() {
    return (
        <Suspense fallback={<div className="container mt-12 text-center text-white">Ładowanie weryfikacji...</div>}>
            <ConfirmAuthContent />
        </Suspense>
    );
}
