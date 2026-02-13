import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { app } from './firebase';

const functions = getFunctions(app);
const rtdb = getDatabase(app);

// Session management
let currentSessionId: string | null = null;
let sessionStartTime: number | null = null;
let lastPageView: string | null = null;

/**
 * Analytics Client SDK
 * Provides client-side tracking for the analytics system
 */
export const analyticsClient = {
    /**
     * Initialize a new session
     */
    async startSession(userId?: string): Promise<string> {
        try {
            const startSessionFn = httpsCallable(functions, 'startSession');
            const result = await startSessionFn({ userId });
            const data = result.data as { sessionId: string };

            currentSessionId = data.sessionId;
            sessionStartTime = Date.now();

            // Store in localStorage for persistence
            if (typeof window !== 'undefined') {
                localStorage.setItem('analyticsSessionId', currentSessionId);
                localStorage.setItem('analyticsSessionStart', sessionStartTime.toString());
            }

            return currentSessionId;
        } catch (error) {
            console.error('Failed to start session:', error);
            // Fallback to local session ID
            currentSessionId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            return currentSessionId;
        }
    },

    /**
     * Get current session ID (or create one if doesn't exist)
     */
    async getSessionId(userId?: string): Promise<string> {
        if (currentSessionId) return currentSessionId;

        // Try to restore from localStorage
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('analyticsSessionId');
            const storedStart = localStorage.getItem('analyticsSessionStart');

            // Check if session is still valid (less than 30 minutes old)
            if (stored && storedStart) {
                const age = Date.now() - parseInt(storedStart);
                if (age < 30 * 60 * 1000) { // 30 minutes
                    currentSessionId = stored;
                    sessionStartTime = parseInt(storedStart);
                    return currentSessionId;
                }
            }
        }

        // Start new session
        return await this.startSession(userId);
    },

    /**
     * End the current session
     */
    async endSession(userId?: string): Promise<void> {
        if (!currentSessionId) return;

        try {
            const endSessionFn = httpsCallable(functions, 'endSession');
            await endSessionFn({ sessionId: currentSessionId, userId });

            // Clear session data
            currentSessionId = null;
            sessionStartTime = null;

            if (typeof window !== 'undefined') {
                localStorage.removeItem('analyticsSessionId');
                localStorage.removeItem('analyticsSessionStart');
            }
        } catch (error) {
            console.error('Failed to end session:', error);
        }
    },

    /**
     * Track a page view
     */
    async trackPageView(page: string, userId?: string): Promise<void> {
        const sessionId = await this.getSessionId(userId);

        // Calculate time on previous page
        let timeOnPage: number | undefined;
        if (lastPageView && sessionStartTime) {
            timeOnPage = Math.floor((Date.now() - sessionStartTime) / 1000);
        }

        try {
            const trackPageViewFn = httpsCallable(functions, 'trackPageView');
            await trackPageViewFn({
                sessionId,
                page,
                userId,
                timeOnPage,
                screenSize: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : undefined
            });

            lastPageView = page;
            sessionStartTime = Date.now();
        } catch (error) {
            console.error('Failed to track page view:', error);
        }
    },

    /**
     * Track scroll depth
     */
    async trackScroll(depth: number, page: string, userId?: string): Promise<void> {
        const sessionId = await this.getSessionId(userId);

        try {
            const trackEventFn = httpsCallable(functions, 'trackEvent');
            await trackEventFn({
                type: 'scroll',
                sessionId,
                page,
                userId,
                metadata: {
                    scrollDepth: depth
                }
            });
        } catch (error) {
            console.error('Failed to track scroll:', error);
        }
    },

    /**
     * Track custom event
     */
    async trackEvent(type: string, page: string, metadata?: any, userId?: string): Promise<void> {
        const sessionId = await this.getSessionId(userId);

        try {
            const trackEventFn = httpsCallable(functions, 'trackEvent');
            await trackEventFn({
                type,
                sessionId,
                page,
                userId,
                metadata
            });
        } catch (error) {
            console.error('Failed to track event:', error);
        }
    },

    /**
     * Subscribe to active users count (real-time)
     * Admin only
     */
    subscribeToActiveUsers(callback: (count: number) => void): () => void {
        const activeSessionsRef = ref(rtdb, 'active_sessions');

        const listener = onValue(activeSessionsRef, (snapshot) => {
            const sessions = snapshot.val() || {};
            const count = Object.keys(sessions).length;
            callback(count);
        });

        // Return unsubscribe function
        return () => off(activeSessionsRef, 'value', listener);
    },

    /**
     * Subscribe to online users (real-time)
     * Admin only
     */
    subscribeToOnlineUsers(callback: (users: any[]) => void): () => void {
        const presenceRef = ref(rtdb, 'presence');

        const listener = onValue(presenceRef, (snapshot) => {
            const presence = snapshot.val() || {};
            const onlineUsers = Object.entries(presence)
                .filter(([_, data]: [string, any]) => data.online)
                .map(([userId, data]: [string, any]) => ({
                    userId,
                    currentPage: data.currentPage,
                    lastSeen: data.lastSeen,
                    sessionId: data.sessionId
                }));
            callback(onlineUsers);
        });

        // Return unsubscribe function
        return () => off(presenceRef, 'value', listener);
    }
};

/**
 * Hook for automatic page view tracking
 * Call this in your layout or page component
 */
export function usePageTracking(userId?: string) {
    if (typeof window === 'undefined') return;

    const currentPath = window.location.pathname;

    // Track page view on mount
    analyticsClient.trackPageView(currentPath, userId);

    // Track scroll depth
    let maxScrollDepth = 0;
    const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        const depth = Math.floor((scrolled / scrollHeight) * 100);

        if (depth > maxScrollDepth && depth >= 25) {
            maxScrollDepth = Math.floor(depth / 25) * 25; // Round to 25, 50, 75, 100
            analyticsClient.trackScroll(maxScrollDepth, currentPath, userId);
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
}

/**
 * Hook for session management
 * Call this in your root layout
 */
export function useSessionManagement(userId?: string) {
    if (typeof window === 'undefined') return;

    // Start session on mount
    analyticsClient.getSessionId(userId);

    // End session on beforeunload
    const handleBeforeUnload = () => {
        analyticsClient.endSession(userId);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
}
