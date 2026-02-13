import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analyticsService } from "@/lib/analytics-service";
import { useAuth } from "@/context/AuthContext";

export function usePageTracking() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const startTimeRef = useRef<number>(Date.now());
    const lastPathRef = useRef<string | null>(null);

    useEffect(() => {
        // Construct full URL path including query params (optional, but useful for detail)
        // For aggregation, usually pathname is better.
        const page = pathname;

        // Verify we actually changed pages (Next.js can sometimes trigger on hash changes)
        if (lastPathRef.current === page) return;

        // 1. Track the View
        analyticsService.trackPageView(page, user?.uid, document.referrer);

        // 2. Reset timer for "Time on Page"
        startTimeRef.current = Date.now();
        lastPathRef.current = page;

        // Optional: Track "Time on Previous Page" here if we stored the previous path?
        // Simpler to just handle "Session" logic in backend or via "unload" event.

    }, [pathname, searchParams, user]);
}
