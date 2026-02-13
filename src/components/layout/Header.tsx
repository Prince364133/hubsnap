"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";

const TITLES: Record<string, string> = {
    "/creator_os_dashboard/home": "Dashboard",
    "/creator_os_dashboard/trends": "Trend Discovery",
    "/creator_os_dashboard/channel-ideas": "Channel Ideas",
    "/creator_os_dashboard/content": "Content Engine",
    "/creator_os_dashboard/saved": "Idea Vault",
    "/creator_os_dashboard/tools": "AI Tools",
    "/creator_os_dashboard/income-sources": "Income Streams",
    "/creator_os_dashboard/youtube-analytics": "Analytics",
};

export function Header() {
    const pathname = usePathname();
    // Simple exact match logic, fallback to "CreatorOS"
    // Can handle dynamic routes later if needed
    const currentTitle = Object.entries(TITLES).find(([path]) => pathname.startsWith(path))?.[1] || "CreatorOS";

    return (
        <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between bg-white/80 backdrop-blur-md px-6 border-b border-border/50">
            <div>
                <h2 className="text-xl font-bold text-text-primary tracking-tight">{currentTitle}</h2>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-text-secondary hover:text-primary transition-colors">
                    <Bell className="size-5" />
                </Button>
                <Link href="/creator_os_dashboard/profile">
                    <div className="size-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white cursor-pointer hover:ring-primary/20 transition-all">
                        DU
                    </div>
                </Link>
            </div>
        </header>
    );
}
