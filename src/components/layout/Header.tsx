"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";

const TITLES: Record<string, string> = {
    "/dashboard/home": "Dashboard",
    "/dashboard/trends": "Trend Discovery",
    "/dashboard/channel-ideas": "Channel Ideas",
    "/dashboard/content": "Content Engine",
    "/dashboard/saved": "Idea Vault",
    "/dashboard/tools": "AI Tools",
    "/dashboard/income-sources": "Income Streams",
    "/dashboard/youtube-analytics": "Analytics",
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
                <div className="size-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white cursor-pointer hover:ring-primary/20 transition-all">
                    DU
                </div>
            </div>
        </header>
    );
}
