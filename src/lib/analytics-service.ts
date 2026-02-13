import { db } from "./firebase";
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    Timestamp,
    doc,
    setDoc,
    updateDoc,
    increment,
    getDoc,
    orderBy,
    limit,
    serverTimestamp
} from "firebase/firestore";
import { nanoid } from "nanoid";

// --- Interfaces ---

export interface AnalyticsEvent {
    type: string; // 'page_view', 'click', 'convert', etc.
    page: string;
    userId?: string;
    timestamp: any;
    metadata?: Record<string, any>; // Flexible metadata
}

export interface AnalyticsSession {
    id?: string;
    userId: string;
    startTime: any;
    endTime?: any;
    duration?: number; // in seconds
    pages: string[];
    device: string;
    browser: string;
    location?: string;
}

export interface ShortUrl {
    slug: string;
    targetUrl: string;
    clicks: number;
    createdAt: any;
    createdBy?: string;
    title?: string; // Optional title for dashboard
}

export interface UrlClick {
    slug: string;
    timestamp: any;
    referrer: string;
    location?: string;
    userAgent?: string;
}

// --- Service ---

export const analyticsService = {
    // --- Generic Event Tracking ---
    trackEvent: async (eventName: string, page: string, userId?: string, metadata?: Record<string, any>) => {
        try {
            await addDoc(collection(db, "analytics_events"), {
                type: eventName,
                page,
                userId: userId || null,
                timestamp: serverTimestamp(),
                metadata: metadata || {}
            } as AnalyticsEvent);
        } catch (e) {
            console.error("Error tracking event:", e);
        }
    },

    // --- Page View Tracking (Optimized) ---
    trackPageView: async (page: string, userId?: string, referrer?: string) => {
        try {
            // 1. Log the raw event for detailed analysis
            await analyticsService.trackEvent("page_view", page, userId, { referrer });

            // 2. Update specific page counters (for fast dashboard loading)
            // Use a daily shard or just a global counter based on scale. 
            // For 10k users, a single doc per page is fine for "Total Views",
            // but for "Daily Views", we might want simple aggregation.

            const pageRef = doc(db, "analytics_pages", page.replace(/\//g, "_") || "home");
            await setDoc(pageRef, {
                totalViews: increment(1),
                lastVisited: serverTimestamp()
            }, { merge: true });

        } catch (e) {
            console.error("Error tracking page view:", e);
        }
    },

    // --- URL Shortener ---
    createShortUrl: async (targetUrl: string, customAlias?: string, userId?: string): Promise<string | null> => {
        try {
            const slug = customAlias || nanoid(6); // 6 chars is enough for millions
            const docRef = doc(db, "short_urls", slug);

            // Check collision if custom alias
            if (customAlias) {
                const existing = await getDoc(docRef);
                if (existing.exists()) {
                    throw new Error("Alias already exists");
                }
            }

            await setDoc(docRef, {
                slug,
                targetUrl,
                clicks: 0,
                createdAt: serverTimestamp(),
                createdBy: userId || 'anonymous'
            } as ShortUrl);

            return slug;
        } catch (e) {
            console.error("Error creating short URL:", e);
            return null;
        }
    },

    getShortUrl: async (slug: string): Promise<ShortUrl | null> => {
        try {
            const docRef = doc(db, "short_urls", slug);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                return snap.data() as ShortUrl;
            }
            return null;
        } catch (e) {
            console.error("Error getting short URL:", e);
            return null;
        }
    },

    trackUrlClick: async (slug: string, referrer: string = 'direct', userAgent: string = '') => {
        try {
            // 1. Increment generic counter
            const docRef = doc(db, "short_urls", slug);
            await updateDoc(docRef, {
                clicks: increment(1)
            });

            // 2. Log detailed click
            await addDoc(collection(db, "url_clicks"), {
                slug,
                timestamp: serverTimestamp(),
                referrer,
                userAgent
            } as UrlClick);

        } catch (e) {
            console.error("Error tracking URL click:", e);
        }
    },

    getAllShortUrls: async (): Promise<ShortUrl[]> => {
        try {
            const q = query(collection(db, "short_urls"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            return snap.docs.map(doc => doc.data() as ShortUrl);
        } catch (e) {
            console.error("Error fetching short URLs:", e);
            return [];
        }
    },

    // --- Data Retrieval for Dashboard ---

    getRecentEvents: async (limitCount: number = 50) => {
        try {
            const q = query(collection(db, "analytics_events"), orderBy("timestamp", "desc"), limit(limitCount));
            const snap = await getDocs(q);
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Error fetching events:", e);
            return [];
        }
    },

    getTopPages: async () => {
        try {
            const q = query(collection(db, "analytics_pages"), orderBy("totalViews", "desc"), limit(10));
            const snap = await getDocs(q);
            return snap.docs.map(doc => ({ page: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Error fetching top pages:", e);
            return [];
        }
    }
};
