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
exports.createCampaign = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
exports.createCampaign = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    // 1. Auth Check
    const userId = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!userId)
        throw new Error('Unauthorized');
    // Check if admin
    const userDoc = await db.collection('users').doc(userId).get();
    if (((_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
        throw new Error('Admin access required');
    }
    const { name, subject, segment, content } = request.data;
    if (!name || !subject || !content) {
        throw new Error('Missing required fields');
    }
    console.log(`Creating campaign: ${name} for segment: ${segment}`);
    // 2. Fetch Target Users
    let usersQuery = db.collection('users');
    let targetUsers = [];
    // Simple segmentation logic
    if (segment === 'pro_users') {
        const snap = await usersQuery.where('plan', 'in', ['pro', 'pro_plus']).get();
        targetUsers = snap.docs;
    }
    else if (segment === 'free_users') {
        const snap = await usersQuery.where('plan', '==', 'free').get();
        targetUsers = snap.docs;
    }
    else if (segment === 'all_users') {
        // CAUTION: For large datasets, this will OOM. Use pagination or scheduled function for real bulk.
        // For now, limiting to 500 for safety, or assume <1000 users.
        const snap = await usersQuery.limit(500).get();
        targetUsers = snap.docs;
    }
    else {
        const snap = await usersQuery.limit(100).get(); // Default safety
        targetUsers = snap.docs;
    }
    // 3. Create Campaign Doc
    const campaignRef = await db.collection('email_campaigns').add({
        name,
        subject,
        segment,
        templateHtml: content,
        status: 'sending',
        createdAt: admin.firestore.Timestamp.now(),
        createdBy: userId,
        stats: {
            total: targetUsers.length,
            sent: 0,
            failed: 0,
            opened: 0
        }
    });
    // 4. Batch Enqueue Emails
    // We'll create batches of 500 (Firestore limit)
    const queueBatch = db.batch();
    let count = 0;
    for (const userDoc of targetUsers) {
        const userData = userDoc.data();
        if (!userData.email)
            continue;
        // Personalize content
        let personalizedHtml = content
            .replace(/{{name}}/g, userData.name || 'Friend')
            .replace(/{{email}}/g, userData.email);
        const emailRef = db.collection('email_queue').doc();
        queueBatch.set(emailRef, {
            to: userData.email,
            subject: subject,
            html: personalizedHtml,
            campaignId: campaignRef.id,
            status: 'pending',
            priority: 5, // Lower priority for bulk
            createdAt: admin.firestore.Timestamp.now(),
            retryCount: 0
        });
        count++;
        // Commit every 400 to be safe
        if (count % 400 === 0) {
            await queueBatch.commit();
        }
    }
    if (count % 400 !== 0) {
        await queueBatch.commit();
    }
    return {
        success: true,
        campaignId: campaignRef.id,
        usersQueued: count
    };
});
//# sourceMappingURL=email-campaigns.js.map