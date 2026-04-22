import Link from 'next/link';
import { Instagram, Youtube, Facebook } from 'lucide-react';
import { NotFoundSearch } from '@/components/NotFoundSearch';
import { NotFoundLatestNews } from '@/components/NotFoundLatestNews';
import './not-found.css';

export const metadata = {
    title: 'Ups, zabłądziłeś | RAPwUK.com',
    description: 'Ta podstrona nie istnieje. Znajdź to, czego szukasz na RAPwUK.com.',
};

export default function NotFound() {
    return (
        <div className="not-found-page container">
            <div className="not-found-content animate-fade-in">
                
                <header className="not-found-header text-center">
                    <h1 className="not-found-title">Ups, zabłądziłeś</h1>
                    <p className="not-found-subtitle">Wypadłeś z rytmu, ta podstrona nie istnieje.</p>
                </header>

                <NotFoundSearch />

                <div className="not-found-cta">
                    <Link href="/" className="btn-primary">
                        WRÓĆ DO GRY (Strona główna)
                    </Link>
                </div>

                <NotFoundLatestNews />

                <div className="not-found-socials border-t border-white/10 pt-6 mt-4 w-full">
                    <a href="https://instagram.com/rapwuk" target="_blank" rel="noreferrer" className="not-found-social-link" aria-label="Instagram">
                        <Instagram size={20} />
                    </a>
                    <a href="https://youtube.com/rapwuk" target="_blank" rel="noreferrer" className="not-found-social-link" aria-label="YouTube">
                        <Youtube size={20} />
                    </a>
                    <a href="https://facebook.com/rapwuk" target="_blank" rel="noreferrer" className="not-found-social-link" aria-label="Facebook">
                        <Facebook size={20} />
                    </a>
                </div>
                
            </div>
        </div>
    );
}
