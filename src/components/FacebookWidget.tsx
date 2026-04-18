import { Facebook, ChevronRight } from 'lucide-react';
import './facebook-widget.css';

interface FacebookWidgetProps {
    compact?: boolean;
}

export function FacebookWidget({ compact = false }: FacebookWidgetProps) {
    return (
        <a
            href="https://fb.com/rapwuk"
            target="_blank"
            rel="noopener noreferrer"
            className={`fb-widget-container${compact ? ' fb-widget-container--compact' : ''}`}
            aria-label="Polub nasz profil na Facebooku"
        >
            <div className="fb-icon-wrapper">
                <Facebook size={compact ? 20 : 24} fill="currentColor" strokeWidth={0} />
            </div>

            {!compact && (
                <div className="fb-widget-content">
                    <span className="fb-widget-title">Polub nasz Fanpage</span>
                    <span className="fb-widget-subtitle">Bądź zawsze na bieżąco!</span>
                </div>
            )}

            <div className="fb-widget-arrow">
                <ChevronRight size={compact ? 16 : 20} />
            </div>
        </a>
    );
}
