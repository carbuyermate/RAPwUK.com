import React from 'react';
import Link from 'next/link';
import "./footer.css";
import { Facebook, Mail, ShieldCheck, MapPin } from "lucide-react";
import { PromoWidget } from "@/components/PromoWidget";
import { LEGAL_CONFIG } from "@/lib/legal-config";

const VisaIcon = () => (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
        <rect width="38" height="24" rx="4" fill="#1A1F71"/>
        <path d="M15.2 7.5L13.1 16.5H10.7L8.6 7.5H11L12.4 13.9L13.8 7.5H15.2ZM21.9 11.2C21.9 9.1 18.9 9 18.9 8.2C18.9 7.9 19.2 7.6 19.8 7.6C20.1 7.6 20.9 7.7 21.5 8L21.9 6.2C21.2 5.9 20.4 5.8 19.6 5.8C18 5.8 16.8 6.7 16.8 8.1C16.8 10.3 19.8 10.4 19.8 11.3C19.8 11.6 19.4 11.9 18.8 11.9C18.1 11.9 17.3 11.6 16.8 11.3L16.4 13.1C17.1 13.5 18 13.7 18.9 13.7C20.6 13.7 21.9 12.7 21.9 11.2ZM26.4 12.3L27.2 7.5H25.3L23.4 12.3H26.4ZM27.8 7.5L25.8 16.5H23.5L21.7 7.5H23.9L24.8 13.7L25.7 7.5H27.8ZM7.6 7.5L5 13.8L4.3 9.4L3.8 7.5H1L3.9 16.5H6.2L9.8 7.5H7.6Z" fill="white"/>
    </svg>
);

const MastercardIcon = () => (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
        <rect width="38" height="24" rx="4" fill="#0A0A0C" stroke="rgba(255,255,255,0.08)"/>
        <circle cx="14" cy="12" r="7" fill="#EB001B"/>
        <circle cx="24" cy="12" r="7" fill="#F79E1B" fillOpacity="0.8"/>
    </svg>
);

const ApplePayIcon = () => (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
        <rect width="38" height="24" rx="4" fill="#0A0A0C" stroke="rgba(255,255,255,0.08)"/>
        <path d="M12.8 11.4C12.8 10 13.8 9.3 13.8 9.3C13.2 8.4 12.2 8.3 11.9 8.3C11 8.2 10.1 8.8 9.6 8.8C9.1 8.8 8.4 8.3 7.7 8.3C6.7 8.3 5.8 8.9 5.3 9.8C4.2 11.7 5 14.5 6 16C6.5 16.7 7.1 17.5 7.9 17.5C8.6 17.5 8.9 17 9.8 17C10.6 17 10.9 17.5 11.7 17.5C12.5 17.5 13 16.8 13.5 16.1C14.1 15.3 14.3 14.5 14.3 14.4C14.3 14.4 12.8 13.8 12.8 11.4Z" fill="white"/>
        <path d="M11.5 6.9C11.9 6.4 12.2 5.7 12.1 5C11.5 5 10.7 5.4 10.3 6C9.9 6.4 9.6 7.1 9.7 7.8C10.4 7.8 11.1 7.4 11.5 6.9Z" fill="white"/>
        <text x="16" y="15.5" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="8" fill="white">Pay</text>
    </svg>
);

const StripeIcon = () => (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
        <rect width="38" height="24" rx="4" fill="#635BFF"/>
        <path d="M10 14.453c0-1.782 1.488-2.613 3.936-2.613 1.748 0 3.37.412 4.316.879l1.077-4.06c-1.402-.61-3.377-.953-5.526-.953-5.318 0-8.662 2.693-8.662 7.362 0 7.142 9.816 5.979 9.816 9.05 0 2.083-1.83 2.87-4.263 2.87-2.169 0-4.056-.592-5.263-1.266l-1.127 4.14c1.654.81 4.056 1.268 6.49 1.268 5.553 0 9.102-2.58 9.102-7.31 0-7.737-9.923-6.242-9.923-9.377z" fill="white" transform="scale(0.7) translate(8, 5)"/>
    </svg>
);

export function Footer() {
    return (
        <footer className="footer-container">
            <div className="container">
                {/* Bottom Homepage Banner in Footer */}
                <div style={{ width: '100%', maxWidth: '728px', margin: '0 auto 3rem' }}>
                    <PromoWidget position="homepage_bottom" />
                </div>

                {/* Main footer layout */}
                <div className="footer-grid">
                    {/* Column 1: Info and socials */}
                    <div className="footer-col brand-col">
                        <h3 className="footer-col-title">RAPwUK.com</h3>
                        <p className="footer-brand-text">
                            Centrum polskiego i światowego hip-hopu w Wielkiej Brytanii. Kalendarz imprez, aktualności, wywiady oraz oficjalny sklep muzyczny. Działamy nieprzerwanie od 2012 roku.
                        </p>
                        <a href="https://www.facebook.com/RAPwUK" target="_blank" rel="noreferrer" className="footer-social-link" style={{ marginTop: '1rem' }}>
                            <Facebook size={20} /> <span>/RAPwUK</span>
                        </a>
                    </div>

                    {/* Column 2: Legal and Shop links */}
                    <div className="footer-col">
                        <h3 className="footer-col-title">Sklep & Informacje</h3>
                        <ul className="footer-links-list">
                            <li><Link href="/regulamin">Regulamin sklepu</Link></li>
                            <li><Link href="/polityka-prywatnosci">Polityka prywatności</Link></li>
                            <li><Link href="/zwroty-i-reklamacje">Zwroty i reklamacje</Link></li>
                            <li><Link href="/dostawa">Dostawa i płatności</Link></li>
                            <li><Link href="/contact">Formularz kontaktowy</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Identity / Company details */}
                    <div className="footer-col company-col">
                        <h3 className="footer-col-title">Dane firmy</h3>
                        <ul className="footer-company-details">
                            <li>
                                <strong>{LEGAL_CONFIG.companyName}</strong>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                <MapPin size={16} style={{ flexShrink: 0, marginTop: '4px', color: 'var(--text-secondary)' }} />
                                <span>{LEGAL_CONFIG.address}</span>
                            </li>
                            {LEGAL_CONFIG.regNumber && (
                                <li>LTD Reg No: {LEGAL_CONFIG.regNumber}</li>
                            )}
                            {LEGAL_CONFIG.vatNumber && (
                                <li>VAT No: {LEGAL_CONFIG.vatNumber}</li>
                            )}
                            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                                <a href={`mailto:${LEGAL_CONFIG.email}`}>{LEGAL_CONFIG.email}</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom line: Copyright & Payment Security */}
                <div className="footer-bottom-bar">
                    <div className="footer-copyright-admin">
                        <p>&copy; {new Date().getFullYear()} RAPwUK. Wszelkie prawa zastrzeżone.</p>
                        <Link href="/login" className="admin-login-link">
                            Panel Administratora
                        </Link>
                    </div>

                    {/* Payments info */}
                    <div className="footer-payments-wrapper">
                        <div className="payment-icons">
                            <VisaIcon />
                            <MastercardIcon />
                            <ApplePayIcon />
                            <StripeIcon />
                        </div>
                        <div className="ssl-badge">
                            <ShieldCheck size={14} style={{ color: '#4ade80' }} />
                            <span>Bezpieczne płatności SSL przez Stripe</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
