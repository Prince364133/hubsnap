import { onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import { nanoid } from 'nanoid';

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// Lazy initialization for RTDB to prevent crashes if not configured
let rtdbInstance: admin.database.Database | null = null;
function getRtdb() {
    if (rtdbInstance) return rtdbInstance;
    try {
        rtdbInstance = admin.database();
        return rtdbInstance;
    } catch (e) {
        console.warn('RTDB not configured, skipping realtime features.');
        return null;
    }
}

// ============================================
// ANALYTICS EVENT TRACKING
// ============================================

interface AnalyticsEvent {
    type: 'page_view' | 'session_start' | 'session_end' | 'scroll' | 'click' | 'custom';
    userId?: string;
    sessionId: string;
    page: string;
    referrer?: string;
    timestamp: admin.firestore.Timestamp;
    metadata: {
        scrollDepth?: number;
        timeOnPage?: number;
        deviceType: 'mobile' | 'desktop' | 'tablet';
        browser: string;
        os: string;
        screenSize: string;
        location?: {
            country: string;
            state?: string;
            city?: string;
        };
    };
}

/**
 * Extract device and location metadata from request
 */
function extractMetadata(req: any): Partial<AnalyticsEvent['metadata']> {
    const parser = new UAParser(req.headers['user-agent']);
    const device = parser.getDevice();
    const browser = parser.getBrowser();
    const os = parser.getOS();

    // Get IP address (handle proxies)
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection.remoteAddress;
    const geo = geoip.lookup(ip);

    let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (device.type === 'mobile') deviceType = 'mobile';
    else if (device.type === 'tablet') deviceType = 'tablet';

    return {
        deviceType,
        browser: browser.name || 'Unknown',
        os: os.name || 'Unknown',
        screenSize: '',
        location: geo ? {
            country: geo.country,
            state: geo.region,
            city: geo.city
        } : undefined
    };
}

/**
 * Track analytics event
 * Callable function from client
 */
export const trackEvent = onCall(async (request) => {
    const { type, userId, sessionId, page, referrer, metadata } = request.data;

    if (!sessionId || !page) {
        throw new Error('sessionId and page are required');
    }

    const extractedMetadata = extractMetadata(request);

    const event: AnalyticsEvent = {
        type: type || 'page_view',
        userId: userId || null,
        sessionId,
        page,
        referrer: referrer || null,
        timestamp: admin.firestore.Timestamp.now(),
        metadata: {
            ...extractedMetadata,
            ...metadata
        }
    };

    await db.collection('analytics_events').add(event);

    return { success: true };
});

/**
 * Start a new session
 */
export const startSession = onCall(async (request) => {
    const { userId } = request.data;
    const sessionId = `sess_${nanoid(16)}`;
    const metadata = extractMetadata(request);

    const session = {
        userId: userId || null,
        startTime: admin.firestore.Timestamp.now(),
        endTime: null,
        duration: null,
        pageViews: 0,
        pagesVisited: [],
        isActive: true,
        deviceInfo: {
            type: metadata.deviceType,
            browser: metadata.browser,
            os: metadata.os
        },
        location: metadata.location || null
    };

    await db.collection('analytics_sessions').doc(sessionId).set(session);

    // Update Realtime Database for presence
    const rtdb = getRtdb();
    if (rtdb) {
        if (userId) {
            await rtdb.ref(`presence/${userId}`).set({
                online: true,
                lastSeen: Date.now(),
                currentPage: '/',
                sessionId
            });
        }

        await rtdb.ref(`active_sessions/${sessionId}`).set({
            userId: userId || null,
            startTime: Date.now(),
            currentPage: '/',
            lastActivity: Date.now()
        });
    }

    return { sessionId };
});

/**
 * End session and calculate metrics
 */
export const endSession = onCall(async (request) => {
    const { sessionId, userId } = request.data;

    if (!sessionId) {
        throw new Error('sessionId is required');
    }

    const sessionRef = db.collection('analytics_sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
        throw new Error('Session not found');
    }

    const sessionData = sessionDoc.data();
    const startTime = sessionData?.startTime.toMillis();
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000); // seconds

    await sessionRef.update({
        endTime: admin.firestore.Timestamp.now(),
        duration,
        isActive: false
    });

    // Update presence in RTDB
    const rtdb = getRtdb();
    if (rtdb) {
        if (userId) {
            await rtdb.ref(`presence/${userId}`).update({
                online: false,
                lastSeen: Date.now()
            });
        }

        await rtdb.ref(`active_sessions/${sessionId}`).remove();
    }

    // Update user profile with activity stats
    if (userId) {
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            lastActive: admin.firestore.Timestamp.now(),
            totalSessions: admin.firestore.FieldValue.increment(1),
            avgSessionDuration: duration // Simplified; should calculate average
        });
    }

    return { success: true, duration };
});

/**
 * Track page view
 */
export const trackPageView = onCall(async (request) => {
    const { sessionId, page, userId, timeOnPage } = request.data;

    if (!sessionId || !page) {
        throw new Error('sessionId and page are required');
    }

    // Update session
    const sessionRef = db.collection('analytics_sessions').doc(sessionId);
    await sessionRef.update({
        pageViews: admin.firestore.FieldValue.increment(1),
        pagesVisited: admin.firestore.FieldValue.arrayUnion(page)
    });

    // Track event
    const metadata = extractMetadata(request);
    await db.collection('analytics_events').add({
        type: 'page_view',
        userId: userId || null,
        sessionId,
        page,
        timestamp: admin.firestore.Timestamp.now(),
        metadata: {
            ...metadata,
            timeOnPage: timeOnPage || null
        }
    });

    // Update RTDB presence
    const rtdb = getRtdb();
    if (rtdb) {
        await rtdb.ref(`active_sessions/${sessionId}`).update({
            currentPage: page,
            lastActivity: Date.now()
        });

        if (userId) {
            await rtdb.ref(`presence/${userId}`).update({
                currentPage: page,
                lastSeen: Date.now()
            });
        }
    }

    return { success: true };
});

// ============================================
// PRESENCE TRACKING
// ============================================

/**
 * Get currently active users
 */
export const getActiveUsers = onCall(async (request) => {
    // Check if user is admin
    const userId = request.auth?.uid;
    if (!userId) {
        throw new Error('Unauthorized');
    }

    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.data()?.role !== 'admin') {
        throw new Error('Admin access required');
    }

    // Get active sessions from RTDB
    const rtdb = getRtdb();
    const sessionsSnapshot = rtdb ? await rtdb.ref('active_sessions').once('value') : null;
    const sessions = sessionsSnapshot?.val() || {};

    const activeSessions = Object.entries(sessions).map(([sessionId, data]: [string, any]) => ({
        sessionId,
        userId: data.userId,
        currentPage: data.currentPage,
        startTime: data.startTime,
        lastActivity: data.lastActivity
    }));

    // Get presence data
    const presenceSnapshot = rtdb ? await rtdb.ref('presence').once('value') : null;
    const presence = presenceSnapshot?.val() || {};

    const onlineUsers = Object.entries(presence)
        .filter(([_, data]: [string, any]) => data.online)
        .map(([userId, data]: [string, any]) => ({
            userId,
            currentPage: data.currentPage,
            lastSeen: data.lastSeen,
            sessionId: data.sessionId
        }));

    return {
        totalActive: activeSessions.length,
        loggedInUsers: onlineUsers.length,
        anonymousUsers: activeSessions.length - onlineUsers.length,
        sessions: activeSessions,
        onlineUsers
    };
});

// ============================================
// DATA AGGREGATION (Scheduled Functions)
// ============================================

/**
 * Aggregate daily analytics
 * Runs at midnight UTC
 */
export const aggregateDailyStats = onSchedule('0 0 * * *', async (event: any) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date(yesterday);
    today.setDate(today.getDate() + 1);

    // Query events from yesterday
    const eventsSnapshot = await db.collection('analytics_events')
        .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(yesterday))
        .where('timestamp', '<', admin.firestore.Timestamp.fromDate(today))
        .get();

    const events = eventsSnapshot.docs.map(doc => doc.data());

    // Calculate metrics
    const totalPageViews = events.filter(e => e.type === 'page_view').length;
    const uniqueVisitors = new Set(events.map(e => e.sessionId)).size;
    const uniqueUsers = new Set(events.filter(e => e.userId).map(e => e.userId)).size;

    // Page breakdown
    const pageViews: { [page: string]: { views: number; visitors: Set<string> } } = {};
    events.filter(e => e.type === 'page_view').forEach(e => {
        if (!pageViews[e.page]) {
            pageViews[e.page] = { views: 0, visitors: new Set() };
        }
        pageViews[e.page].views++;
        pageViews[e.page].visitors.add(e.sessionId);
    });

    const topPages = Object.entries(pageViews)
        .map(([page, data]) => ({
            page,
            views: data.views,
            uniqueVisitors: data.visitors.size
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

    // Device breakdown
    const deviceCounts: { mobile: number; desktop: number; tablet: number } = { mobile: 0, desktop: 0, tablet: 0 };
    events.forEach(e => {
        const deviceType = e.metadata?.deviceType as 'mobile' | 'desktop' | 'tablet' | undefined;
        if (deviceType && deviceType in deviceCounts) {
            deviceCounts[deviceType]++;
        }
    });

    // Location breakdown
    const locationCounts: { [country: string]: number } = {};
    events.forEach(e => {
        const country = e.metadata?.location?.country;
        if (country) {
            locationCounts[country] = (locationCounts[country] || 0) + 1;
        }
    });

    const locationBreakdown = Object.entries(locationCounts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Get sessions data for avg duration
    const sessionsSnapshot = await db.collection('analytics_sessions')
        .where('startTime', '>=', admin.firestore.Timestamp.fromDate(yesterday))
        .where('startTime', '<', admin.firestore.Timestamp.fromDate(today))
        .get();

    const sessions = sessionsSnapshot.docs.map(doc => doc.data());
    const completedSessions = sessions.filter(s => s.duration);
    const avgSessionDuration = completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + s.duration, 0) / completedSessions.length
        : 0;

    // Determine new vs returning users (simplified)
    const newUsers = uniqueUsers; // Would need to check user creation date

    // Save aggregate
    const dateStr = yesterday.toISOString().split('T')[0];
    await db.collection('analytics_aggregates').doc(`daily_${dateStr}`).set({
        period: 'daily',
        date: dateStr,
        totalVisitors: uniqueVisitors,
        uniqueVisitors,
        newUsers,
        returningUsers: uniqueVisitors - newUsers,
        totalPageViews,
        avgSessionDuration: Math.round(avgSessionDuration),
        topPages,
        deviceBreakdown: deviceCounts,
        locationBreakdown,
        updatedAt: admin.firestore.Timestamp.now()
    });

    console.log(`Aggregated stats for ${dateStr}`);
});

/**
 * Cleanup old events (older than 90 days)
 * Runs weekly
 */
export const cleanupOldEvents = onSchedule('0 2 * * 0', async (event: any) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    const oldEventsSnapshot = await db.collection('analytics_events')
        .where('timestamp', '<', admin.firestore.Timestamp.fromDate(cutoffDate))
        .limit(500) // Process in batches
        .get();

    const batch = db.batch();
    oldEventsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${oldEventsSnapshot.size} old events`);
});
