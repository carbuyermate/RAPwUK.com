'use client';

import { supabase } from '@/lib/supabase';
import { Trash2, Users, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { deleteRapper } from '../actions';
import '../dashboard.css';

export default function ManagingRappersPage() {
    const [rappers, setRappers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRappers = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('rappers')
            .select('*')
            .order('name', { ascending: true });
        
        if (data) setRappers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchRappers();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Czy wiesz na pewno, że chcesz usunąć profil rapera: "${name}"?`)) {
            return;
        }
        try {
            await deleteRapper(id);
            setRappers(rappers.filter(r => r.id !== id));
        } catch (error: any) {
            alert('Błąd usuwania: ' + error.message);
        }
    };

    return (
        <div className="dashboard-container container animate-fade-in">
            <header className="dashboard-header">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="action-btn">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users size={24} /> Zarządzaj Raperami
                    </h1>
                </div>
                <Link href="/dashboard/add-rapper" className="btn-primary">
                    + Dodaj Rapera
                </Link>
            </header>

            <div className="events-table-container glass-panel mt-6">
                <table className="events-table">
                    <thead>
                        <tr>
                            <th>Imię / Ksywa</th>
                            <th>Miasto PL</th>
                            <th>Miasto UK</th>
                            <th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="text-center py-4">Ładowanie...</td></tr>
                        ) : rappers.length > 0 ? (
                            rappers.map((rapper) => (
                                <tr key={rapper.id} className="event-row">
                                    <td className="font-semibold">{rapper.name}</td>
                                    <td><span className="text-secondary">{rapper.city_pl || '-'}</span></td>
                                    <td>{rapper.city_uk || '-'}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button onClick={() => handleDelete(rapper.id, rapper.name)} className="action-btn delete" title="Usuń">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-secondary">
                                    Brak raperów w systemie.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
