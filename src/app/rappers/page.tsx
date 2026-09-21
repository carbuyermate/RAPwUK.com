import { supabase } from "@/lib/supabase";
import "./rappers.css";
import RappersList from "@/components/rappers-list";
import { Mic2 } from "lucide-react";
import { ViewTracker } from "@/components/ViewTracker";
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
    title: "Scena - Polska scena w UK. Raperzy, DJ'e, studia nagrań w UK.",
    description: "Polska scena hip-hopowa w Wielkiej Brytanii. Raperzy, DJ'e i studia nagrań działające w UK. Odkryj polskich artystów hip-hopowych na Wyspach.",
    alternates: {
        canonical: 'https://rapwuk.com/rappers',
    },
    openGraph: {
        title: "Scena - Polska scena w UK. Raperzy, DJ'e, studia nagrań w UK.",
        description: "Polska scena hip-hopowa w Wielkiej Brytanii. Raperzy, DJ'e i studia nagrań działające w UK.",
        url: 'https://rapwuk.com/rappers',
        siteName: 'RAPwUK.com',
        locale: 'pl_PL',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        site: '@RAPwUK',
        creator: '@RAPwUK',
        title: 'Scena | Polscy raperzy w UK – RAPwUK.com',
        description: 'Katalog polskich artystów hip-hopowych w UK. Raperzy, DJ-e, studia i labele.',
    },
};



export default async function RappersDirectory() {
    const { data: rappers, error } = await supabase
        .from('rappers')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('[RappersDirectory] Błąd Supabase:', error);
    }

    return (
        <div className="directory-container container">
            <ViewTracker type="page" id="rappers" />
            <header className="page-header animate-fade-in">
                <h1 className="page-header-title">
                    <Mic2 size={32} /> SCENA
                </h1>
                <p className="page-header-subtitle">Alfabetyczny spis twórców, studiów, labeli i DJ-ów polskiego rapu na Wyspach.</p>
            </header>
            
            <RappersList initialRappers={rappers || []} />
        </div>
    );
}
