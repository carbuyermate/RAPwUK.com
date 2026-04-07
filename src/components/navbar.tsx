"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import "./navbar.css";

export function Navbar() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <nav className="navbar-wrapper">
            <div className="navbar container glass-panel">
                <Link href="/" className="navbar-logo">
                    <img src="/logo.jpg" alt="RAPwUK Logo" className="logo-img" />
                    RAPwUK.com
                </Link>

                <div className={`navbar-links ${mobileOpen ? "open" : ""}`}>
                    <Link href="/events" onClick={() => setMobileOpen(false)}>Imprezy</Link>
                    <Link href="/rappers" onClick={() => setMobileOpen(false)}>Raperzy UK</Link>
                    <Link href="/news" onClick={() => setMobileOpen(false)}>Newsy</Link>

                    <div className="navbar-actions">
                        {mounted && (
                            <button
                                className="theme-toggle"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                aria-label="Toggle Theme"
                            >
                                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        )}
                        <Link href="/login" className="btn-primary login-btn">
                            Promotor Login
                        </Link>
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
