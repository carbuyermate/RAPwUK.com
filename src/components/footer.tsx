import "./footer.css";
import { Facebook } from "lucide-react";
import { PromoWidget } from "@/components/PromoWidget";

export function Footer() {
    return (
        <footer className="footer-container">
            <div className="container">
                {/* Bottom Homepage Banner in Footer */}
                <div style={{ width: '100%', maxWidth: '728px', margin: '0 auto' }}>
                    <PromoWidget position="homepage_bottom" />
                </div>

                <div className="footer-bottom">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                        <p>RAPwUK powstał w <strong>2012</strong>. &copy; {new Date().getFullYear()} Wszelkie prawa zastrzeżone.</p>
                        <a href="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', opacity: 0.6, textDecoration: 'none' }}>
                            Admin / Promotor login
                        </a>
                    </div>
                    <a href="https://www.facebook.com/RAPwUK" target="_blank" rel="noreferrer" className="footer-social-link">
                        <Facebook size={24} /> <span>/RAPwUK</span>
                    </a>
                </div>
            </div>
        </footer>
    );
}
