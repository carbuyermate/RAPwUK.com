import React from 'react';
import Link from 'next/link';
import "./footer.css";
import { Facebook, Mail, ShieldCheck, MapPin } from "lucide-react";
import { PromoWidget } from "@/components/PromoWidget";
import { LEGAL_CONFIG } from "@/lib/legal-config";

const VisaIcon = () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/visa.svg" alt="Visa" style={{ width: '36px', height: '24px', flexShrink: 0, borderRadius: '4px' }} />
);

const MastercardIcon = () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/mastercard.svg" alt="Mastercard" style={{ width: '36px', height: '24px', flexShrink: 0, borderRadius: '4px' }} />
);

const ApplePayIcon = () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/apple-pay.svg" alt="Apple Pay" style={{ width: '36px', height: '24px', flexShrink: 0, borderRadius: '4px' }} />
);

const StripeIcon = () => (
    <div style={{
        width: '36px',
        height: '24px',
        background: '#635BFF',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    }}>
        <svg viewBox="0 0 24 24" width="12" height="12" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
        </svg>
    </div>
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
                        <p>℗ & © 2012-{new Date().getFullYear()} RAPwUK. Wszelkie prawa zastrzeżone.</p>
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
