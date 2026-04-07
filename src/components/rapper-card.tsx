"use client";

import { useState } from "react";
import { Youtube, Instagram, Facebook } from "lucide-react";
import { RapperGallery } from "@/components/rapper-gallery";
import "./rapper-card.css";

interface RapperProps {
    rapper: {
        id: string;
        name: string;
        bio: string;
        ig?: string;
        fb?: string;
        yt?: string;
        images?: string[];
    };
}

export function RapperCard({ rapper }: RapperProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="rapper-card glass-panel horizontal-layout">
            {/* Left Column: Content */}
            <div className="rapper-content">
                <h3 className="rapper-name">{rapper.name}</h3>

                <div
                    className={`rapper-bio-container ${isExpanded ? 'expanded' : 'collapsed'}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <p className="rapper-bio-text">{rapper.bio}</p>
                    <span className="expand-hint">
                        {isExpanded ? "Zwiń bio" : "Czytaj więcej..."}
                    </span>
                </div>

                <div className="social-links mt-auto">
                    {rapper.yt && (
                        <a href={rapper.yt} target="_blank" rel="noreferrer" className="social-icon yt" aria-label="YouTube">
                            <Youtube size={20} />
                        </a>
                    )}
                    {rapper.ig && (
                        <a href={rapper.ig} target="_blank" rel="noreferrer" className="social-icon ig" aria-label="Instagram">
                            <Instagram size={20} />
                        </a>
                    )}
                    {rapper.fb && (
                        <a href={rapper.fb} target="_blank" rel="noreferrer" className="social-icon fb" aria-label="Facebook">
                            <Facebook size={20} />
                        </a>
                    )}
                </div>
            </div>

            {/* Right Column: Gallery */}
            <div className="rapper-gallery-col">
                {rapper.images && rapper.images.length > 0 ? (
                    <RapperGallery images={rapper.images} />
                ) : (
                    <div className="gallery-placeholder">Brak zdjęć</div>
                )}
            </div>
        </div>
    );
}
