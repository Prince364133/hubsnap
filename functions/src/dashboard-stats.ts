import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

/**
 * Aggregate Dashboard Stats (Runs hourly)
 * Calculating complex metrics that are too expensive for real-time reads
 */
export const aggregateDashboardStats = onSchedule('0 * * * *', async (event) => {
    console.log('Starting dashboard aggregation...');

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. New Users Counts
    const newUsersTodaySnapshot = await db.collection('users')
        .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(new Date(now.setHours(0, 0, 0, 0))))
        .count()
        .get();

    const newUsers7dSnapshot = await db.collection('users')
        .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
        .count()
        .get();

    // 2. Active Users (Last 24h)
    // Note: This relies on 'activitySummary.lastActive' being updated on session end
    const activeUsers24hSnapshot = await db.collection('users')
        .where('activitySummary.lastActive', '>=', admin.firestore.Timestamp.fromDate(twentyFourHoursAgo))
        .count()
        .get();

    // 3. Revenue Readiness
    // Criteria: Free plan AND (High Engagement OR Existing Wallet Balance)
    // Complex query: Firestore limits OR queries, so we might need to split or use a simpler proxy.
    // Let's count High Engagement separately first.
    const highEngagementSnapshot = await db.collection('users')
        .where('plan', '==', 'free')
        .where('activitySummary.engagementScore', '>', 50)
        .count()
        .get();

    const walletBalanceSnapshot = await db.collection('users')
        .where('plan', '==', 'free')
        .where('walletBalance', '>', 0)
        .count()
        .get();

    // This is an approximation since sets might overlap, but for "Readiness" indicator it's okay to be slightly loose or just pick one strong signal.
    // Better approximation: Users who logged in recently AND are free.

    // 4. At Risk Users (Pro users inactive > 7 days)
    const atRiskProSnapshot = await db.collection('users')
        .where('plan', 'in', ['pro', 'pro_plus'])
        .where('activitySummary.lastActive', '<', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
        .count()
        .get();

    // 5. Total Revenue (MRR Approximation)
    // In a real app, sum subscriptions. Here we count active pro users * price.
    const proUsersSnapshot = await db.collection('users').where('plan', '==', 'pro').count().get();
    const proPlusUsersSnapshot = await db.collection('users').where('plan', '==', 'pro_plus').count().get();

    // Approx MRR: Pro(999) + ProPlus(2499) - customize based on actual pricing
    const mrr = (proUsersSnapshot.data().count * 999) + (proPlusUsersSnapshot.data().count * 2499);

    // Construct the Dashboard Cache Object
    const dashboardStats = {
        metrics: {
            activeUsers24h: activeUsers24hSnapshot.data().count,
            newUsersToday: newUsersTodaySnapshot.data().count,
            newUsers7d: newUsers7dSnapshot.data().count,
            revenueReadiness: highEngagementSnapshot.data().count + walletBalanceSnapshot.data().count, // Rough sum
            mrr,
            atRiskProUsers: atRiskProSnapshot.data().count,
        },
        meta: {
            lastUpdated: admin.firestore.Timestamp.now(),
            totalPro: proUsersSnapshot.data().count,
            totalProPlus: proPlusUsersSnapshot.data().count
        }
    };

    // Save to Cache
    await db.collection('dashboard_cache').doc('latest').set(dashboardStats);

    // Also save history for trending charts
    await db.collection('dashboard_snapshots').add({
        ...dashboardStats,
        timestamp: admin.firestore.Timestamp.now()
    });

    console.log('Dashboard stats aggregated successfully.');
});
