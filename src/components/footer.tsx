import React from 'react';
import Link from 'next/link';
import "./footer.css";
import { Facebook, Mail, ShieldCheck, MapPin } from "lucide-react";
import { PromoWidget } from "@/components/PromoWidget";
import { LEGAL_CONFIG } from "@/lib/legal-config";

const VisaIcon = () => (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.9 }}>
        <rect width="38" height="24" rx="4" fill="#1A1F71"/>
        <path d="M14.5 16.5l1.8-8.5h2.9l-1.8 8.5h-2.9zm8.5-8.3c-.6-.2-1.5-.4-2.4-.4-2.6 0-4.4 1.3-4.4 3.2 0 1.4 1.3 2.2 2.3 2.7 1 .5 1.4.8 1.4 1.2 0 .6-.8.9-1.5.9-1 0-1.6-.2-2.4-.6l-.3 1.9c.6.3 1.7.5 2.8.5 2.8 0 4.6-1.3 4.6-3.3 0-1.1-.7-1.9-2.2-2.6-.9-.5-1.5-.8-1.5-1.3 0-.4.5-.9 1.5-.9.8 0 1.4.2 1.9.4l.3-1.8zm6.5 2.2c-.2-.5-.9-2.4-.9-2.4L28.3 14h2.1l.4-1.2h2.5l.2 1.2h1.9L33.7 8.2h-2.2L29.5 16.5h2.1zm-1.8-3.4l.8 2.2h-1.5l.7-2.2zM10.8 8.2L8.2 13.9 7.5 10.3l-.6-3.2L4.5 7.1l-.1-.1 3.5 9.5h3.1L15.3 8.2h-4.5z" fill="#FFF"/>
    </svg>
);

const MastercardIcon = () => (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.9 }}>
        <rect width="38" height="24" rx="4" fill="#0A0A0C" stroke="rgba(255,255,255,0.12)"/>
        <circle cx="15.5" cy="12" r="6.5" fill="#EB001B"/>
        <circle cx="22.5" cy="12" r="6.5" fill="#F79E1B" fillOpacity="0.8"/>
    </svg>
);

const ApplePayIcon = () => (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.9 }}>
        <rect width="38" height="24" rx="4" fill="#FFFFFF" stroke="rgba(0,0,0,0.08)"/>
        <path d="M12.2 12.1c0-1 .7-1.5.7-1.5s-.4-.6-1.1-.6c-.7 0-1.1.4-1.4.4s-.8-.4-1.4-.4c-.8 0-1.6.5-2 1.2-.8 1.4-.2 3.5.6 4.6.4.5.8 1.1 1.4 1.1.5 0 .7-.3 1.3-.3.6 0 .8.3 1.3.3.6 0 1-.5 1.4-1.1.5-.7.7-1.3.7-1.3s-1.1-.4-1.1-1.6z" fill="#000"/>
        <path d="M11.3 8.8c.3-.4.5-.9.4-1.4-.5 0-1 .3-1.3.7-.3.3-.5.8-.4 1.3.5.1 1-.2 1.3-.6z" fill="#000"/>
        <path d="M16 10h1.8c.8 0 1.4.4 1.4 1.2 0 .8-.6 1.2-1.4 1.2H16v2.6h-1.1V10h1.1zm0 1.6h.6c.4 0 .6-.2.6-.6s-.2-.6-.6-.6h-.6v1.2zm6.2-.2v3.6h-1v-.4c-.3.3-.7.5-1.2.5-.8 0-1.4-.6-1.4-1.5 0-1 .7-1.5 1.8-1.5h.8v-.2c0-.5-.3-.7-.8-.7-.4 0-.8.1-1.1.3l-.3-.7c.4-.3.9-.4 1.5-.4 1.2 0 1.7.6 1.7 1.6zm-1 1.4v-.4h-.7c-.6 0-.9.2-.9.7 0 .4.2.6.6.6.6.1 1-.3 1-1zM28.1 10l-1.9 4.3h-.1L24.2 10h1.2l1.3 3.1 1.2-3.1h1.2z" fill="#000"/>
    </svg>
);

const StripeIcon = () => (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.9 }}>
        <rect width="38" height="24" rx="4" fill="#635BFF"/>
        <path d="M16.5 14.4c0-1.1 1-1.6 2.5-1.6 1.1 0 2.1.3 2.7.5l.7-2.5c-.9-.4-2.1-.6-3.5-.6-3.3 0-5.4 1.7-5.4 4.6 0 4.5 6.1 3.7 6.1 5.7 0 1.3-1.1 1.8-2.7 1.8-1.4 0-2.5-.4-3.3-.8l-.7 2.6c1 .5 2.5.8 4.1.8 3.5 0 5.7-1.6 5.7-4.6 0-4.8-6.2-3.9-6.2-5.9z" fill="white"/>
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
