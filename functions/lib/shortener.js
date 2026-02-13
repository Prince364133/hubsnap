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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShortUrl = exports.updateShortUrl = exports.listShortUrls = exports.getUrlAnalytics = exports.redirectShortUrl = exports.createShortUrl = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const nanoid_1 = require("nanoid");
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const ua_parser_js_1 = require("ua-parser-js");
// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// Base62 alphabet for short codes
const generateShortCode = (0, nanoid_1.customAlphabet)('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6);
/**
 * Create a short URL
 * Admin-only function
 */
exports.createShortUrl = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    const { originalUrl, customAlias, title, description, tags } = request.data;
    // Check authentication
    const userId = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!userId) {
        throw new Error('Unauthorized');
    }
    const userDoc = await db.collection('users').doc(userId).get();
    if (((_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
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
    }
    else {
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
exports.redirectShortUrl = (0, https_1.onRequest)(async (req, res) => {
    var _a;
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
    const parser = new ua_parser_js_1.UAParser(req.headers['user-agent']);
    const device = parser.getDevice();
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : (forwardedFor === null || forwardedFor === void 0 ? void 0 : forwardedFor.split(',')[0]) || req.ip;
    const geo = ip ? geoip_lite_1.default.lookup(ip) : null;
    let deviceType = 'desktop';
    if (device.type === 'mobile')
        deviceType = 'mobile';
    else if (device.type === 'tablet')
        deviceType = 'tablet';
    // Determine referrer source
    const referrer = req.headers['referer'] || req.headers['referrer'] || 'direct';
    let referrerSource = 'direct';
    if (referrer.includes('whatsapp'))
        referrerSource = 'whatsapp';
    else if (referrer.includes('instagram'))
        referrerSource = 'instagram';
    else if (referrer.includes('facebook'))
        referrerSource = 'facebook';
    else if (referrer.includes('twitter') || referrer.includes('t.co'))
        referrerSource = 'twitter';
    else if (referrer.includes('linkedin'))
        referrerSource = 'linkedin';
    else if (referrer !== 'direct')
        referrerSource = 'other';
    // Track click analytics
    const clickData = {
        clickedAt: admin.firestore.Timestamp.now(),
        userId: null, // Will be updated if user logs in later
        sessionId: ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.sessionId) || null,
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
exports.getUrlAnalytics = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    const { urlId, startDate, endDate } = request.data;
    // Check authentication
    const userId = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!userId) {
        throw new Error('Unauthorized');
    }
    const userDoc = await db.collection('users').doc(userId).get();
    if (((_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
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
        analyticsQuery = analyticsQuery.where('clickedAt', '>=', admin.firestore.Timestamp.fromDate(new Date(startDate)));
    }
    if (endDate) {
        analyticsQuery = analyticsQuery.where('clickedAt', '<=', admin.firestore.Timestamp.fromDate(new Date(endDate)));
    }
    const analyticsSnapshot = await analyticsQuery.get();
    const clicks = analyticsSnapshot.docs.map(doc => doc.data());
    // Calculate metrics
    const totalClicks = clicks.length;
    const uniqueVisitors = new Set(clicks.filter(c => c.sessionId).map(c => c.sessionId)).size;
    // Referrer breakdown
    const referrerCounts = {};
    clicks.forEach(c => {
        referrerCounts[c.referrer] = (referrerCounts[c.referrer] || 0) + 1;
    });
    // Device breakdown
    const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };
    clicks.forEach(c => {
        const deviceType = c.deviceType;
        if (deviceType in deviceCounts) {
            deviceCounts[deviceType]++;
        }
    });
    // Location breakdown
    const locationCounts = {};
    clicks.forEach(c => {
        var _a;
        if ((_a = c.location) === null || _a === void 0 ? void 0 : _a.country) {
            locationCounts[c.location.country] = (locationCounts[c.location.country] || 0) + 1;
        }
    });
    // Clicks over time (daily)
    const clicksByDate = {};
    clicks.forEach(c => {
        const date = c.clickedAt.toDate().toISOString().split('T')[0];
        clicksByDate[date] = (clicksByDate[date] || 0) + 1;
    });
    return {
        url: {
            id: urlDoc.id,
            shortCode: urlData === null || urlData === void 0 ? void 0 : urlData.shortCode,
            originalUrl: urlData === null || urlData === void 0 ? void 0 : urlData.originalUrl,
            totalClicks: (urlData === null || urlData === void 0 ? void 0 : urlData.clicks) || 0
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
exports.listShortUrls = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    // Check authentication
    const userId = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!userId) {
        throw new Error('Unauthorized');
    }
    const userDoc = await db.collection('users').doc(userId).get();
    if (((_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
        throw new Error('Admin access required');
    }
    const urlsSnapshot = await db.collection('short_urls')
        .orderBy('createdAt', 'desc')
        .get();
    const urls = urlsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    return { urls };
});
/**
 * Update short URL (enable/disable, edit)
 * Admin-only
 */
exports.updateShortUrl = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    const { urlId, enabled, title, description, tags } = request.data;
    // Check authentication
    const userId = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!userId) {
        throw new Error('Unauthorized');
    }
    const userDoc = await db.collection('users').doc(userId).get();
    if (((_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
        throw new Error('Admin access required');
    }
    if (!urlId) {
        throw new Error('urlId is required');
    }
    const updates = {};
    if (enabled !== undefined)
        updates.enabled = enabled;
    if (title !== undefined)
        updates['metadata.title'] = title;
    if (description !== undefined)
        updates['metadata.description'] = description;
    if (tags !== undefined)
        updates['metadata.tags'] = tags;
    await db.collection('short_urls').doc(urlId).update(updates);
    return { success: true };
});
/**
 * Delete short URL
 * Admin-only
 */
exports.deleteShortUrl = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    const { urlId } = request.data;
    // Check authentication
    const userId = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!userId) {
        throw new Error('Unauthorized');
    }
    const userDoc = await db.collection('users').doc(userId).get();
    if (((_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
        throw new Error('Admin access required');
    }
    if (!urlId) {
        throw new Error('urlId is required');
    }
    await db.collection('short_urls').doc(urlId).delete();
    return { success: true };
});
//# sourceMappingURL=shortener.js.map