"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserActivityTimeline = exports.updateAdminStats = exports.aggregateUserActivity = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
// ============================================
// USER ACTIVITY AGGREGATION
// ============================================
/**
 * Aggregate user activity from analytics_events
 * Runs hourly to update user activity summaries
 */
exports.aggregateUserActivity = (0, scheduler_1.onSchedule)({
    schedule: 'every 1 hours',
    memory: '512MiB',
    timeoutSeconds: 300
}, async (event) => {
    var _a, _b, _c;
    console.log('Starting user activity aggregation...');
    try {
        // Get all users
        const usersSnapshot = await db.collection('users').get();
        const now = admin.firestore.Timestamp.now();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        let processedCount = 0;
        // Process each user
        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            // Get user's sessions from last 30 days
            const sessionsSnapshot = await db.collection('analytics_sessions')
                .where('userId', '==', userId)
                .where('startTime', '>=', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
                .get();
            if (sessionsSnapshot.empty) {
                // No recent activity - mark as inactive
                await userDoc.ref.update({
                    status: 'inactive',
                    statusUpdatedAt: now,
                    'activitySummary.lastActive': ((_a = userDoc.data().activitySummary) === null || _a === void 0 ? void 0 : _a.lastActive) || null
                });
                continue;
            }
            // Calculate metrics
            const sessions = sessionsSnapshot.docs.map(doc => doc.data());
            const totalSessions = sessions.length;
            const sessionCount7d = sessions.filter(s => s.startTime.toDate() >= sevenDaysAgo).length;
            const sessionCount30d = totalSessions;
            // Calculate average session duration
            const durations = sessions
                .filter(s => s.duration)
                .map(s => s.duration);
            const avgSessionDuration = durations.length > 0
                ? durations.reduce((a, b) => a + b, 0) / durations.length
                : 0;
            // Get page views
            const pageViewsSnapshot = await db.collection('analytics_events')
                .where('userId', '==', userId)
                .where('type', '==', 'page_view')
                .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
                .get();
            const pageViews = pageViewsSnapshot.docs.map(doc => doc.data());
            const totalPageViews = pageViews.length;
            // Count page visits
            const pagesVisited = {};
            pageViews.forEach(pv => {
                const page = pv.page || 'unknown';
                pagesVisited[page] = (pagesVisited[page] || 0) + 1;
            });
            const mostVisitedPage = ((_b = Object.entries(pagesVisited)
                .sort(([, a], [, b]) => b - a)[0]) === null || _b === void 0 ? void 0 : _b[0]) || 'none';
            // Device breakdown
            const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };
            sessions.forEach(s => {
                var _a;
                const device = ((_a = s.deviceInfo) === null || _a === void 0 ? void 0 : _a.type) || 'desktop';
                if (device in deviceCounts) {
                    deviceCounts[device]++;
                }
            });
            const primaryDevice = ((_c = Object.entries(deviceCounts)
                .sort(([, a], [, b]) => b - a)[0]) === null || _c === void 0 ? void 0 : _c[0]) || 'desktop';
            // Location (most common)
            const locations = {};
            sessions.forEach(s => {
                var _a;
                const country = (_a = s.location) === null || _a === void 0 ? void 0 : _a.country;
                if (country) {
                    locations[country] = (locations[country] || 0) + 1;
                }
            });
            const topLocation = Object.entries(locations)
                .sort(([, a], [, b]) => b - a)[0];
            // Calculate engagement score (0-100)
            const engagementScore = Math.min(100, Math.round((sessionCount7d * 10) + // Recent sessions
                (Math.min(avgSessionDuration / 60, 10) * 5) + // Session duration
                (Math.min(totalPageViews / 10, 10) * 3) // Page views
            ));
            // Determine activity trend
            const previousPeriodSessions = sessions.filter(s => {
                const sessionDate = s.startTime.toDate();
                return sessionDate < sevenDaysAgo && sessionDate >= thirtyDaysAgo;
            }).length;
            let activityTrend = 'stable';
            if (sessionCount7d > previousPeriodSessions * 1.2) {
                activityTrend = 'growing';
            }
            else if (sessionCount7d < previousPeriodSessions * 0.8) {
                activityTrend = 'declining';
            }
            // Get last active timestamp
            const lastActive = sessions.length > 0
                ? sessions.sort((a, b) => b.startTime.toMillis() - a.startTime.toMillis())[0].startTime
                : null;
            // Classify user status
            const status = classifyUserStatus(sessionCount7d, sessionCount30d, lastActive);
            // Update user document
            await userDoc.ref.update({
                'activitySummary.lastActive': lastActive,
                'activitySummary.totalSessions': totalSessions,
                'activitySummary.avgSessionDuration': Math.round(avgSessionDuration),
                'activitySummary.totalPageViews': totalPageViews,
                'activitySummary.mostVisitedPage': mostVisitedPage,
                'activitySummary.deviceType': primaryDevice,
                'activitySummary.location': topLocation ? { country: topLocation[0] } : null,
                'activitySummary.engagementScore': engagementScore,
                'metrics.sessionCount7d': sessionCount7d,
                'metrics.sessionCount30d': sessionCount30d,
                'metrics.activityTrend': activityTrend,
                'metrics.lastSessionAt': lastActive,
                status: status,
                statusUpdatedAt: now
            });
            processedCount++;
        }
        console.log(`User activity aggregation complete. Processed ${processedCount} users.`);
    }
    catch (error) {
        console.error('Error aggregating user activity:', error);
        throw error;
    }
});
/**
 * Classify user status based on activity metrics
 */
function classifyUserStatus(sessionCount7d, sessionCount30d, lastActive) {
    if (!lastActive)
        return 'inactive';
    const daysSinceActive = (Date.now() - lastActive.toMillis()) / (1000 * 60 * 60 * 24);
    // Inactive: No activity in 7+ days
    if (daysSinceActive >= 7)
        return 'inactive';
    // Highly Active: 5+ sessions in last 7 days
    if (sessionCount7d >= 5)
        return 'highly_active';
    // Active: 2+ sessions in last 7 days
    if (sessionCount7d >= 2)
        return 'active';
    // At Risk: Some activity but declining
    if (sessionCount7d >= 1 && daysSinceActive >= 3)
        return 'at_risk';
    return 'at_risk';
}
// ============================================
// ADMIN DASHBOARD STATISTICS
// ============================================
/**
 * Update admin dashboard statistics
 * Runs every 5 minutes for real-time insights
 */
exports.updateAdminStats = (0, scheduler_1.onSchedule)({
    schedule: 'every 5 minutes',
    memory: '512MiB',
    timeoutSeconds: 300
}, async (event) => {
    console.log('Updating admin dashboard statistics...');
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        // Get all users
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        // Count users joined
        const usersJoinedToday = users.filter(u => u.createdAt && u.createdAt.toDate() >= todayStart).length;
        const usersJoinedThisWeek = users.filter(u => u.createdAt && u.createdAt.toDate() >= weekStart).length;
        const usersJoinedThisMonth = users.filter(u => u.createdAt && u.createdAt.toDate() >= monthStart).length;
        // Count active users
        const activeUsersToday = users.filter(u => {
            var _a;
            return ((_a = u.activitySummary) === null || _a === void 0 ? void 0 : _a.lastActive) &&
                u.activitySummary.lastActive.toDate() >= todayStart;
        }).length;
        const activeUsersThisWeek = users.filter(u => {
            var _a;
            return ((_a = u.activitySummary) === null || _a === void 0 ? void 0 : _a.lastActive) &&
                u.activitySummary.lastActive.toDate() >= weekStart;
        }).length;
        const activeUsersThisMonth = users.filter(u => {
            var _a;
            return ((_a = u.activitySummary) === null || _a === void 0 ? void 0 : _a.lastActive) &&
                u.activitySummary.lastActive.toDate() >= monthStart;
        }).length;
        // Status distribution
        const statusDistribution = {
            highly_active: users.filter(u => u.status === 'highly_active').length,
            active: users.filter(u => u.status === 'active').length,
            at_risk: users.filter(u => u.status === 'at_risk').length,
            inactive: users.filter(u => u.status === 'inactive').length
        };
        // Calculate retention (users who joined 7/30 days ago and are still active)
        const joined7DaysAgo = users.filter(u => u.createdAt &&
            u.createdAt.toDate() >= new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000) &&
            u.createdAt.toDate() < new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
        const retained7d = joined7DaysAgo.filter(u => {
            var _a;
            return ((_a = u.activitySummary) === null || _a === void 0 ? void 0 : _a.lastActive) &&
                u.activitySummary.lastActive.toDate() >= weekStart;
        }).length;
        const retentionRate7d = joined7DaysAgo.length > 0
            ? Math.round((retained7d / joined7DaysAgo.length) * 100)
            : 0;
        const joined30DaysAgo = users.filter(u => u.createdAt &&
            u.createdAt.toDate() >= new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000) &&
            u.createdAt.toDate() < new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
        const retained30d = joined30DaysAgo.filter(u => {
            var _a;
            return ((_a = u.activitySummary) === null || _a === void 0 ? void 0 : _a.lastActive) &&
                u.activitySummary.lastActive.toDate() >= monthStart;
        }).length;
        const retentionRate30d = joined30DaysAgo.length > 0
            ? Math.round((retained30d / joined30DaysAgo.length) * 100)
            : 0;
        // Churn warnings (at-risk users)
        const churnWarnings = statusDistribution.at_risk;
        // Update admin stats document
        await db.collection('admin_stats').doc('user_management').set({
            usersJoinedToday,
            usersJoinedThisWeek,
            usersJoinedThisMonth,
            totalUsers: users.length,
            activeUsersToday,
            activeUsersThisWeek,
            activeUsersThisMonth,
            statusDistribution,
            retentionRate7d,
            retentionRate30d,
            churnWarnings,
            lastUpdated: admin.firestore.Timestamp.now()
        });
        console.log('Admin dashboard statistics updated successfully');
    }
    catch (error) {
        console.error('Error updating admin stats:', error);
        throw error;
    }
});
// ============================================
// USER ACTIVITY TIMELINE (CALLABLE)
// ============================================
/**
 * Get detailed activity timeline for a specific user
 * Used in User Detail Panel
 */
exports.getUserActivityTimeline = (0, https_1.onCall)({
    memory: '512MiB',
    timeoutSeconds: 300
}, async (request) => {
    var _a, _b;
    const { userId, limit = 50, startAfter } = request.data;
    // Check admin authentication
    const adminUid = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!adminUid) {
        throw new Error('Unauthorized');
    }
    const adminDoc = await db.collection('users').doc(adminUid).get();
    if (((_b = adminDoc.data()) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
        throw new Error('Admin access required');
    }
    if (!userId) {
        throw new Error('userId is required');
    }
    try {
        // Get user's events
        let eventsQuery = db.collection('analytics_events')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(limit);
        if (startAfter) {
            eventsQuery = eventsQuery.startAfter(startAfter);
        }
        const eventsSnapshot = await eventsQuery.get();
        const events = eventsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        // Get user's sessions
        const sessionsSnapshot = await db.collection('analytics_sessions')
            .where('userId', '==', userId)
            .orderBy('startTime', 'desc')
            .limit(20)
            .get();
        const sessions = sessionsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        return {
            events,
            sessions,
            hasMore: eventsSnapshot.docs.length === limit
        };
    }
    catch (error) {
        console.error('Error fetching user activity timeline:', error);
        throw new Error(`Failed to fetch timeline: ${error.message}`);
    }
});
//# sourceMappingURL=user-analytics.js.map