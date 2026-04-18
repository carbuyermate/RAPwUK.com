import { supabase } from "@/lib/supabase";
import "./rappers.css";
import RappersList from "@/components/rappers-list";

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
            <div className="directory-header animate-fade-in">
                <h1 className="page-title">Scena</h1>
                <p className="page-subtitle">Alfabetyczny spis twórców, studiów, labeli i DJ-ów polskiego rapu na Wyspach.</p>
            </div>
            
            <RappersList initialRappers={rappers || []} />
        </div>
    );
}
