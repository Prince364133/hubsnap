"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useHeaderTitle } from "@/context/HeaderTitleContext";

export function PublicHeader() {
    const { user, profile, logout } = useAuth();
    const { title } = useHeaderTitle();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: "/features", label: "Features" },
        { href: "/products/creator-os", label: "Creator OS" },
        { href: "/explore", label: "Explore Tools" },
        { href: "/digital-business-ideas", label: "Digital Business Ideas" },
        { href: "/blog", label: "Blogs" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" }
    ];

    return (
        <>
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <Image
                                src="/hubsnap_logo.jpeg"
                                alt="HubSnap Logo"
                                width={56}
                                height={56}
                                className="rounded-xl group-hover:scale-105 transition-transform shadow-lg shadow-sky-500/20"
                            />
                            <div className="absolute inset-0 bg-sky-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        {title ? (
                            <span className="text-xl font-bold text-slate-900 truncate max-w-xl">{title}</span>
                        ) : (
                            navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="hover:text-black transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/profile">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200">
                                        <div className="size-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                                            {profile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">Account</span>
                                    </div>
                                </Link>
                                <Button variant="ghost" size="sm" onClick={logout} className="text-slate-500 hover:text-red-500">
                                    <LogOut className="size-4" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Link href="/login">
                                    <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
                                        Sign In
                                    </span>
                                </Link>
                                <Link href="/waitlist">
                                    <Button className="rounded-full px-6 shadow-lg shadow-primary/20">
                                        Join Waitlist
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="size-6 text-slate-900" />
                        ) : (
                            <Menu className="size-6 text-slate-900" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Drawer */}
            <div
                className={`fixed top-16 right-0 bottom-0 w-64 bg-white z-40 transform transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto py-6 px-4">
                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Auth Buttons */}
                    <div className="border-t border-slate-100 p-4 space-y-3">
                        {user ? (
                            <>
                                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full rounded-full font-medium gap-2">
                                        <UserIcon className="size-4" /> Profile
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    className="w-full rounded-full font-medium text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                        logout();
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    Log Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-full font-medium"
                                    >
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/waitlist" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full rounded-full font-medium shadow-lg shadow-primary/20">
                                        Join Waitlist
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
