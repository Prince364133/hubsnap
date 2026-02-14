"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, LayoutDashboard, Ticket, Users, FileText, BookOpen, HelpCircle, Wrench, Lightbulb, BarChart, Mail, ListChecks, Menu, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/Sheet";
import ProfileDropdown from "@/components/admin/ProfileDropdown";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, profile, loading, isAdmin } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!isAdmin) {
                router.push("/admin-login");
            } else {
                setIsAuthorized(true);
            }
        }
    }, [loading, router, isAdmin]);

    if (loading || !isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin size-8 text-sky-500" />
            </div>
        );
    }

    const NavItems = () => (
        <nav className="space-y-2">
            <Link href="/website_admin_pannel" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                    <LayoutDashboard className="size-4 mr-2" />
                    Dashboard
                </Button>
            </Link>
            <Link href="/website_admin_pannel/analytics" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                    <BarChart className="size-4 mr-2" />
                    Analytics
                </Button>
            </Link>
            <Link href="/website_admin_pannel/coupons" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                    <Ticket className="size-4 mr-2" />
                    Coupons
                </Button>
            </Link>
            <Link href="/website_admin_pannel/users" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                    <Users className="size-4 mr-2" />
                    Users
                </Button>
            </Link>
            <Link href="/website_admin_pannel/tools" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                    <Wrench className="size-4 mr-2" />
                    Explore Tools
                </Button>
            </Link>
            <Link href="/website_admin_pannel/guides" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                    <Lightbulb className="size-4 mr-2" />
                    Business Ideas
                </Button>
            </Link>

            <Link href="/website_admin_pannel/blogs" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                    <BookOpen className="size-4 mr-2" />
                    Blogs
                </Button>
            </Link>
            <Link href="/website_admin_pannel/help-center" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                    <HelpCircle className="size-4 mr-2" />
                    Help Center
                </Button>
            </Link>
            <Link href="/website_admin_pannel/email" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                    <Mail className="size-4 mr-2" />
                    Email System
                </Button>
            </Link>
            <Link href="/website_admin_pannel/waitlist" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                    <ListChecks className="size-4 mr-2" />
                    Waitlist
                </Button>
            </Link>
            <Link href="/website_admin_pannel/website-management" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                    <LayoutDashboard className="size-4 mr-2" />
                    Website Content
                </Button>
            </Link>
            <Link href="/website_admin_pannel/website-management/admin-access" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                    <ShieldAlert className="size-4 mr-2" />
                    Admin Access
                </Button>
            </Link>
        </nav>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
                <div className="mb-8">
                    <Link href="/creator_os_dashboard/home" className="text-xl font-bold italic tracking-tighter">
                        <span className="text-sky-400">Hub</span>Snap <span className="text-xs ml-1 bg-red-600 px-1.5 py-0.5 rounded text-white not-italic font-sans">ADMIN</span>
                    </Link>
                </div>
                <NavItems />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen">
                <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 md:px-8 justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Trigger */}
                        <div className="md:hidden">
                            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="md:hidden">
                                        <Menu className="size-6 text-slate-700" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="bg-slate-900 text-white border-slate-800 p-6 w-72">
                                    <div className="mb-8">
                                        <Link href="/creator_os_dashboard/home" className="text-xl font-bold italic tracking-tighter" onClick={() => setMobileMenuOpen(false)}>
                                            <span className="text-sky-400">Hub</span>Snap <span className="text-xs ml-1 bg-red-600 px-1.5 py-0.5 rounded text-white not-italic font-sans">ADMIN</span>
                                        </Link>
                                    </div>
                                    <NavItems />
                                </SheetContent>
                            </Sheet>
                        </div>
                        <h2 className="font-semibold text-slate-700">Admin Panel</h2>
                    </div>
                    <ProfileDropdown
                        userName={profile?.name || profile?.email}
                        userEmail={profile?.email}
                    />
                </header>
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
