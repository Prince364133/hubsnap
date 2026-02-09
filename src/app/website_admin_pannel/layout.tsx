"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, LayoutDashboard, Ticket, Users, FileText, BookOpen, HelpCircle, Wrench, Lightbulb } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (profile?.role !== "admin") {
                // If not admin, redirect to home
                router.push("/creator_os_dashboard/home");
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, profile, loading, router]);

    if (loading || !isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin size-8 text-sky-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
                <div className="mb-8">
                    <Link href="/creator_os_dashboard/home" className="text-xl font-bold italic tracking-tighter">
                        <span className="text-sky-400">Hub</span>Snap <span className="text-xs ml-1 bg-red-600 px-1.5 py-0.5 rounded text-white not-italic font-sans">ADMIN</span>
                    </Link>
                </div>

                <nav className="space-y-2">
                    <Link href="/website_admin_pannel">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <LayoutDashboard className="size-4 mr-2" />
                            Dashboard
                        </Button>
                    </Link>
                    <Link href="/website_admin_pannel/coupons">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <Ticket className="size-4 mr-2" />
                            Coupons
                        </Button>
                    </Link>
                    <Link href="/website_admin_pannel/users">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <Users className="size-4 mr-2" />
                            Users
                        </Button>
                    </Link>
                    <Link href="/website_admin_pannel/tools">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <Wrench className="size-4 mr-2" />
                            Explore Tools
                        </Button>
                    </Link>
                    <Link href="/website_admin_pannel/guides">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <Lightbulb className="size-4 mr-2" />
                            Business Ideas
                        </Button>
                    </Link>
                    <Link href="/website_admin_pannel/content">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <FileText className="size-4 mr-2" />
                            Content
                        </Button>
                    </Link>
                    <Link href="/website_admin_pannel/blogs">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <BookOpen className="size-4 mr-2" />
                            Blogs
                        </Button>
                    </Link>
                    <Link href="/website_admin_pannel/help-center">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <HelpCircle className="size-4 mr-2" />
                            Help Center
                        </Button>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-slate-200 h-16 flex items-center px-8 justify-between">
                    <h2 className="font-semibold text-slate-700">Admin Panel</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-600">
                            {profile?.name}
                        </span>
                        <div className="size-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-xs">
                            {profile?.name?.[0]}
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
