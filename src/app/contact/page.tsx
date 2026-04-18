'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Mail, MessageSquare, Info, CheckCircle2 } from 'lucide-react';
import './contact.css';

export default function ContactPage() {
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: insertError } = await supabase
                .from('contact_messages')
                .insert([
                    {
                        email,
                        subject,
                        message
                    }
                ]);

            if (insertError) throw insertError;

            setSubmitted(true);
            setEmail('');
            setSubject('');
            setMessage('');
        } catch (err: any) {
            console.error('Błąd podczas wysyłania wiadomości:', err);
            setError(err.message || 'Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-container container animate-fade-in">
            <header className="page-header animate-fade-in">
                <h1 className="page-header-title">
                    <Mail size={32} /> KONTAKT
                </h1>
                <p className="page-header-subtitle">
                    Masz pytania? Chcesz nawiązać współpracę lub zgłosić błąd? 
                    Napisz do nas, a odpowiemy tak szybko, jak to możliwe.
                </p>
            </header>

            <div className="contact-grid">
                <aside className="contact-info-cards">
                    <div className="info-card glass-panel">
                        <h3><Mail size={20} className="text-secondary" /> Email</h3>
                        <p>Możesz też napisać bezpośrednio na:</p>
                        <a href="mailto:rapwuktv@gmail.com" style={{ color: 'var(--text-primary)', fontWeight: '700', textDecoration: 'none' }}>
                            rapwuktv@gmail.com
                        </a>
                    </div>
                    
                    <div className="info-card glass-panel">
                        <h3><MessageSquare size={20} className="text-secondary" /> Współpraca</h3>
                        <p>Jesteś promotorem, raperem, producentem, DJ'em, prowadzisz studio nagrań, robisz mix/master, organizujesz event lub kręcisz klipy? Odezwij się w sprawie współpracy, promocji i patronatów.</p>
                    </div>

                    <div className="info-card glass-panel">
                        <h3><Info size={20} className="text-secondary" /> O nas</h3>
                        <p>RAPwUK.com to jedyne centrum polskiego i światowego hip-hopu na Wyspach. Działamy od 2012 roku.</p>
                    </div>
                </aside>

                <main className="contact-form-wrapper glass-panel">
                    {submitted ? (
                        <div className="success-box animate-scale-up">
                            <CheckCircle2 size={64} color="#4ade80" style={{ margin: '0 auto 1.5rem' }} />
                            <h2>Wiadomość wysłana!</h2>
                            <p className="text-secondary">Dziękujemy za kontakt. Odpowiemy na podany adres email najszybciej jak to możliwe.</p>
                            <button 
                                onClick={() => setSubmitted(false)} 
                                className="btn-secondary mt-8"
                                style={{ margin: '2rem auto 0' }}
                            >
                                Wyślij kolejną wiadomość
                            </button>
                        </div>
                    ) : (
                        <form className="contact-form" onSubmit={handleSubmit}>
                            {error && <div className="error-box">{error}</div>}
                            
                            <div className="form-group">
                                <label htmlFor="email">Twój adres E-mail</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    placeholder="np. jan.kowalski@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Temat wiadomości</label>
                                <input 
                                    type="text" 
                                    id="subject" 
                                    placeholder="np. Współpraca, Patronat, Błąd na stronie"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group message-group">
                                <label htmlFor="message">Wiadomość</label>
                                <textarea 
                                    id="message" 
                                    rows={6}
                                    placeholder="W czym możemy Ci pomóc?"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="submit-btn" 
                                disabled={loading}
                            >
                                {loading ? (
                                    'Wysyłanie...'
                                ) : (
                                    <>
                                        Wyślij wiadomość <Send size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </main>
            </div>
        </div>
    );
}
