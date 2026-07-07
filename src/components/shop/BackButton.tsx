'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
    fallbackUrl: string;
    label: string;
}

export function BackButton({ fallbackUrl, label }: BackButtonProps) {
    const router = useRouter();

    const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // If there is history to go back to, use router.back() to preserve filters/sorting
        if (typeof window !== 'undefined' && window.history.length > 1) {
            e.preventDefault();
            router.back();
        }
    };

    return (
        <a
            href={fallbackUrl}
            onClick={handleBack}
            className="back-btn"
            style={{ 
                marginTop: '2rem', 
                display: 'inline-flex', 
                cursor: 'pointer', 
                textDecoration: 'none',
                alignItems: 'center',
                gap: '4px'
            }}
        >
            <ChevronLeft size={18} /> {label}
        </a>
    );
}
