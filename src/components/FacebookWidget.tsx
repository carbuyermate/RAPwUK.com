import { Facebook, ChevronRight } from 'lucide-react';
import './facebook-widget.css';

export function FacebookWidget() {
    return (
        <a
            href="https://fb.com/rapwuk"
            target="_blank"
            rel="noopener noreferrer"
            className="fb-widget-container"
            aria-label="Polub nasz profil na Facebooku"
        >
            <div className="fb-icon-wrapper">
                <Facebook size={24} fill="currentColor" border="none" strokeWidth={0} />
            </div>

            <div className="fb-widget-content">
                <span className="fb-widget-title">Polub nasz Fanpage</span>
                <span className="fb-widget-subtitle">Bądź zawsze na bieżąco!</span>
            </div>

            <div className="fb-widget-arrow">
                <ChevronRight size={20} />
            </div>
        </a>
    );
}
