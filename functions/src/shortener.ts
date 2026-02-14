import { onCall, onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { customAlphabet } from 'nanoid';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// Base62 alphabet for short codes
const generateShortCode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6);

/**
 * Create a short URL
 * Admin-only function
 */
export const createShortUrl = onCall({
    memory: '512MiB',
    timeoutSeconds: 300
}, async (request) => {
    const { originalUrl, customAlias, title, description, tags } = request.data;

    // Check authentication
    const userId = request.auth?.uid;
    if (!userId) {
        throw new Error('Unauthorized');
    }

    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.data()?.role !== 'admin') {
        throw new Error('Admin access required');
    }

    if (!originalUrl) {
        throw new Error('originalUrl is required');
    }

    let shortCode = customAlias;

    // If custom alias provided, check availability
    if (customAlias) {
        const existingUrl = await db.collection('short_urls')
            .where('shortCode', '==', customAlias)
            .limit(1)
            .get();

        if (!existingUrl.empty) {
            throw new Error('Custom alias already in use');
        }
    } else {
        // Generate unique short code
        let isUnique = false;
        while (!isUnique) {
            shortCode = generateShortCode();
            const existing = await db.collection('short_urls')
                .where('shortCode', '==', shortCode)
                .limit(1)
                .get();
            isUnique = existing.empty;
        }
    }

    const shortUrlData = {
        shortCode,
        originalUrl,
        customAlias: customAlias || null,
        createdBy: userId,
        createdAt: admin.firestore.Timestamp.now(),
        enabled: true,
        clicks: 0,
        metadata: {
            title: title || null,
            description: description || null,
            tags: tags || []
        }
    };

    const docRef = await db.collection('short_urls').add(shortUrlData);

    return {
        id: docRef.id,
        shortCode,
        shortUrl: `https://hub-snap.web.app/s/${shortCode}`,
        originalUrl
    };
});

/**
 * Redirect short URL and track analytics
 * Public HTTP function
 */
export const redirectShortUrl = onRequest(async (req, res) => {
    const shortCode = req.path.split('/').pop();

    if (!shortCode) {
        res.status(400).send('Invalid short URL');
        return;
    }

    // Find short URL
    const urlSnapshot = await db.collection('short_urls')
        .where('shortCode', '==', shortCode)
        .limit(1)
        .get();

    if (urlSnapshot.empty) {
        res.status(404).send('Short URL not found');
        return;
    }

    const urlDoc = urlSnapshot.docs[0];
    const urlData = urlDoc.data();

    if (!urlData.enabled) {
        res.status(403).send('This short URL has been disabled');
        return;
    }

    // Extract metadata
    const parser = new UAParser(req.headers['user-agent']);
    const device = parser.getDevice();
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0] || req.ip;
    const geo = ip ? geoip.lookup(ip) : null;

    let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (device.type === 'mobile') deviceType = 'mobile';
    else if (device.type === 'tablet') deviceType = 'tablet';

    // Determine referrer source
    const referrer = req.headers['referer'] || req.headers['referrer'] || 'direct';
    let referrerSource = 'direct';

    if (referrer.includes('whatsapp')) referrerSource = 'whatsapp';
    else if (referrer.includes('instagram')) referrerSource = 'instagram';
    else if (referrer.includes('facebook')) referrerSource = 'facebook';
    else if (referrer.includes('twitter') || referrer.includes('t.co')) referrerSource = 'twitter';
    else if (referrer.includes('linkedin')) referrerSource = 'linkedin';
    else if (referrer !== 'direct') referrerSource = 'other';

    // Track click analytics
    const clickData = {
        clickedAt: admin.firestore.Timestamp.now(),
        userId: null, // Will be updated if user logs in later
        sessionId: req.cookies?.sessionId || null,
        referrer: referrerSource,
        deviceType,
        location: geo ? {
            country: geo.country,
            state: geo.region
        } : null
    };

    // Save analytics (async, don't wait)
    db.collection('short_urls').doc(urlDoc.id).collection('analytics').add(clickData);

    // Increment click count
    urlDoc.ref.update({
        clicks: admin.firestore.FieldValue.increment(1)
    });

    // Redirect
    res.redirect(302, urlData.originalUrl);
});

/**
 * Get analytics for a specific short URL
 * Admin-only
 */
export const getUrlAnalytics = onCall({
    memory: '512MiB',
    timeoutSeconds: 300
}, async (request) => {
    const { urlId, startDate, endDate } = request.data;

    // Check authentication
    const userId = request.auth?.uid;
    if (!userId) {
        throw new Error('Unauthorized');
    }

    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.data()?.role !== 'admin') {
        throw new Error('Admin access required');
    }

    if (!urlId) {
        throw new Error('urlId is required');
    }

    // Get URL data
    const urlDoc = await db.collection('short_urls').doc(urlId).get();
    if (!urlDoc.exists) {
        throw new Error('Short URL not found');
    }

    const urlData = urlDoc.data();

    // Get analytics
    let analyticsQuery = db.collection('short_urls').doc(urlId).collection('analytics');

    if (startDate) {
        analyticsQuery = analyticsQuery.where('clickedAt', '>=', admin.firestore.Timestamp.fromDate(new Date(startDate))) as any;
    }
    if (endDate) {
        analyticsQuery = analyticsQuery.where('clickedAt', '<=', admin.firestore.Timestamp.fromDate(new Date(endDate))) as any;
    }

    const analyticsSnapshot = await analyticsQuery.get();
    const clicks = analyticsSnapshot.docs.map(doc => doc.data());

    // Calculate metrics
    const totalClicks = clicks.length;
    const uniqueVisitors = new Set(clicks.filter(c => c.sessionId).map(c => c.sessionId)).size;

    // Referrer breakdown
    const referrerCounts: { [key: string]: number } = {};
    clicks.forEach(c => {
        referrerCounts[c.referrer] = (referrerCounts[c.referrer] || 0) + 1;
    });

    // Device breakdown
    const deviceCounts: { mobile: number; desktop: number; tablet: number } = { mobile: 0, desktop: 0, tablet: 0 };
    clicks.forEach(c => {
        const deviceType = c.deviceType as 'mobile' | 'desktop' | 'tablet';
        if (deviceType in deviceCounts) {
            deviceCounts[deviceType]++;
        }
    });

    // Location breakdown
    const locationCounts: { [country: string]: number } = {};
    clicks.forEach(c => {
        if (c.location?.country) {
            locationCounts[c.location.country] = (locationCounts[c.location.country] || 0) + 1;
        }
    });

    // Clicks over time (daily)
    const clicksByDate: { [date: string]: number } = {};
    clicks.forEach(c => {
        const date = c.clickedAt.toDate().toISOString().split('T')[0];
        clicksByDate[date] = (clicksByDate[date] || 0) + 1;
    });

    return {
        url: {
            id: urlDoc.id,
            shortCode: urlData?.shortCode,
            originalUrl: urlData?.originalUrl,
            totalClicks: urlData?.clicks || 0
        },
        analytics: {
            totalClicks,
            uniqueVisitors,
            referrerBreakdown: Object.entries(referrerCounts).map(([referrer, count]) => ({ referrer, count })),
            deviceBreakdown: deviceCounts,
            locationBreakdown: Object.entries(locationCounts).map(([country, count]) => ({ country, count })),
            clicksByDate: Object.entries(clicksByDate).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date))
        }
    };
});

/**
 * List all short URLs
 * Admin-only
 */
export const listShortUrls = onCall({
    memory: '512MiB',
    timeoutSeconds: 300
}, async (request) => {
    // Check authentication
    const userId = request.auth?.uid;
    if (!userId) {
        throw new Error('Unauthorized');
    }

    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.data()?.role !== 'admin') {
        throw new Error('Admin access required');
    }

    const urlsSnapshot = await db.collection('short_urls')
        .orderBy('createdAt', 'desc')
        .get();

    const urls = urlsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return { urls };
});

/**
 * Update short URL (enable/disable, edit)
 * Admin-only
 */
export const updateShortUrl = onCall({
    memory: '512MiB',
    timeoutSeconds: 300
}, async (request) => {
    const { urlId, enabled, title, description, tags } = request.data;

    // Check authentication
    const userId = request.auth?.uid;
    if (!userId) {
        throw new Error('Unauthorized');
    }

    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.data()?.role !== 'admin') {
        throw new Error('Admin access required');
    }

    if (!urlId) {
        throw new Error('urlId is required');
    }

    const updates: any = {};
    if (enabled !== undefined) updates.enabled = enabled;
    if (title !== undefined) updates['metadata.title'] = title;
    if (description !== undefined) updates['metadata.description'] = description;
    if (tags !== undefined) updates['metadata.tags'] = tags;

    await db.collection('short_urls').doc(urlId).update(updates);

    return { success: true };
});

/**
 * Delete short URL
 * Admin-only
 */
export const deleteShortUrl = onCall({
    memory: '512MiB',
    timeoutSeconds: 300
}, async (request) => {
    const { urlId } = request.data;

    // Check authentication
    const userId = request.auth?.uid;
    if (!userId) {
        throw new Error('Unauthorized');
    }

    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.data()?.role !== 'admin') {
        throw new Error('Admin access required');
    }

    if (!urlId) {
        throw new Error('urlId is required');
    }

    await db.collection('short_urls').doc(urlId).delete();

    return { success: true };
});
