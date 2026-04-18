import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Youtube, Instagram, Facebook, User } from "lucide-react";
import { RapperGallery } from "@/components/rapper-gallery";
import { ViewTracker } from "@/components/ViewTracker";
import "../rapper-detail.css";

interface RapperDetail {
    id: string;
    name: string;
    bio: string;
    category: string;
    social_yt?: string;
    social_fb?: string;
    social_ig?: string;
    images: string[];
}

export const dynamic = 'force-dynamic';

export default async function RapperDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const { data, error } = await supabase
        .from('rappers')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !data) notFound();

    const entry = data as RapperDetail;

    return (
        <div className="rapper-detail-page animate-fade-in">
            <ViewTracker type="rappers" id={entry.id} />
            <div className="container">
                <Link href="/rappers" className="back-btn">
                    <ChevronLeft size={16} /> Powrót do Sceny
                </Link>

                <div className="rapper-detail-grid">
                    {/* INFO SIDE */}
                    <div className="rapper-detail-info">
                        <header className="rapper-detail-header">
                            <span className="rapper-category-badge">
                                {entry.category || 'Raper/Skład'}
                            </span>
                            <h1 className="rapper-detail-name">{entry.name}</h1>
                        </header>

                        <div className="rapper-detail-bio">
                            {entry.bio || "Brak opisu dla tego twórcy."}
                        </div>

                        <div className="rapper-detail-socials">
                            {entry.social_yt && (
                                <a href={entry.social_yt} target="_blank" rel="noreferrer" className="social-link-item yt" aria-label="YouTube">
                                    <Youtube size={24} />
                                </a>
                            )}
                            {entry.social_ig && (
                                <a href={entry.social_ig} target="_blank" rel="noreferrer" className="social-link-item ig" aria-label="Instagram">
                                    <Instagram size={24} />
                                </a>
                            )}
                            {entry.social_fb && (
                                <a href={entry.social_fb} target="_blank" rel="noreferrer" className="social-link-item fb" aria-label="Facebook">
                                    <Facebook size={24} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* GALLERY SIDE */}
                    <div className="rapper-detail-gallery-col">
                        {entry.images && entry.images.length > 0 ? (
                            <RapperGallery images={entry.images} />
                        ) : (
                            <div className="glass-panel aspect-[3/4] flex flex-col items-center justify-center text-secondary opacity-30 gap-4">
                                <User size={64} strokeWidth={1} />
                                <span className="text-sm font-bold uppercase tracking-widest">Brak zdjęć</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
