"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Home,
    Lightbulb,
    TrendingUp,
    Video,
    Bookmark,
    Wrench,
    DollarSign,
    LogOut,
    Settings,
    Compass,
    BookOpen,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

const MENU_ITEMS = [
    { name: "Home", icon: Home, href: "/creator_os_dashboard/home" },
    { name: "Channel Ideas", icon: Lightbulb, href: "/creator_os_dashboard/channel-ideas" },
    { name: "Trends", icon: TrendingUp, href: "/creator_os_dashboard/trends" },
    { name: "Content", icon: Video, href: "/creator_os_dashboard/content" },
    { name: "Saved", icon: Bookmark, href: "/creator_os_dashboard/saved" },
    { name: "Income Sources", icon: DollarSign, href: "/creator_os_dashboard/income-sources" },
    { name: "Settings", icon: Settings, href: "/creator_os_dashboard/settings" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-[240px] border-r border-border bg-white flex flex-col z-30">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-border/50">
                <div>
                    {/* Logo */}
                    <Link href="/creator_os_dashboard/home" className="flex items-center gap-2 mb-1">
                        <BrandLogo size="md" />
                    </Link>
                    <p className="text-xs text-text-secondary">Earn-First Creator System</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary border-l-4 border-primary"
                                    : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
                            )}
                        >
                            <item.icon className={cn("size-5", isActive ? "text-primary" : "text-text-secondary")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Profile (could be in header too, but often sidebar footer is good for logout) */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-gray-200" />
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">Demo User</p>
                        <p className="text-xs text-text-secondary truncate">Free Plan</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
