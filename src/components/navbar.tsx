"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { GlobalSearch } from "./GlobalSearch";
import { CartIcon } from "./shop/CartIcon";
import "./navbar.css";

export function Navbar() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isActive = (path: string) => {
        if (!pathname) return false;
        return pathname === path || pathname.startsWith(path + "/");
    };

    return (
        <nav className="navbar-wrapper">
            <div className="navbar container glass-panel">
                <Link href="/" className="navbar-logo">
                    <img src="/logo.jpg" alt="RAPwUK Logo" className="logo-img" />
                    RAPwUK.com
                </Link>

                <div className={`navbar-links ${mobileOpen ? "open" : ""}`}>
                    <Link href="/news" className={isActive("/news") ? "active" : ""} onClick={() => setMobileOpen(false)}>Newsy</Link>
                    <Link href="/events" className={isActive("/events") ? "active" : ""} onClick={() => setMobileOpen(false)}>Imprezy</Link>
                    <Link href="/rappers" className={isActive("/rappers") ? "active" : ""} onClick={() => setMobileOpen(false)}>Scena</Link>
                    <Link href="/contact" className={isActive("/contact") ? "active" : ""} onClick={() => setMobileOpen(false)}>Kontakt</Link>


                    <div className="navbar-actions">
                        <GlobalSearch onClose={() => setMobileOpen(false)} />
                        {mounted && pathname?.startsWith('/shop') && <CartIcon />}
                        {mounted && (
                            <button
                                className="theme-toggle"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                aria-label="Toggle Theme"
                            >
                                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        )}
                    </div>
                </div>

                <button
                    className="mobile-toggle"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>
    );
}
