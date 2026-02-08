"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Zap, Settings, ShieldAlert, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { name: "Command Center", href: "/admin", icon: LayoutDashboard },
    { name: "User Manager", href: "/admin/users", icon: Users },
    { name: "Trend Injector", href: "/admin/trends", icon: Zap },
    { name: "Global Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans">
            {/* Admin Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold flex items-center gap-2 text-white">
                        <ShieldAlert className="size-6 text-red-500" />
                        <span>GOD MODE</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Creator OS Internal</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <div className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                                    isActive
                                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                                )}>
                                    <item.icon className="size-4" />
                                    {item.name}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <Link href="/dashboard/home">
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm">
                            <LogOut className="size-4" />
                            Exit to App
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="ml-64 flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
