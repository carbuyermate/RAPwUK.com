import "./footer.css";
import { Facebook } from "lucide-react";

export function Footer() {
    return (
        <footer className="footer-container">
            <div className="container">
                {/* Google AdSense Placeholder */}
                <div className="adsense-placeholder">
                    <p className="ads-text">REKLAMA GOOGLE ADSENSE</p>
                    <span className="ads-dims">728 x 90</span>
                    {/* Tu wkleimy skrypt od Google'a */}
                    {/* <ins className="adsbygoogle" style={{display: 'block'}} data-ad-client="ca-pub-XXXXXXXXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins> */}
                </div>

                <div className="footer-bottom">
                    <p>RAPwUK powstał w <strong>2012</strong>. &copy; {new Date().getFullYear()} Wszelkie prawa zastrzeżone.</p>
                    <a href="https://www.facebook.com/RAPwUK" target="_blank" rel="noreferrer" className="footer-social-link">
                        <Facebook size={24} /> <span>/RAPwUK</span>
                    </a>
                </div>
            </div>
        </footer>
    );
}
