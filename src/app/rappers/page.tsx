import { supabase } from "@/lib/supabase";
import "./rappers.css";
import RappersList from "@/components/rappers-list";
import { Mic2 } from "lucide-react";
import { ViewTracker } from "@/components/ViewTracker";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
