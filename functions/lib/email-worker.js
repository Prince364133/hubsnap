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
exports.processEmailQueueWorker = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
const email_core_1 = require("./email-core");
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Process Email Queue (Runs every minute)
 * Fetches pending emails and sends them via SMTP
 */
exports.processEmailQueueWorker = (0, scheduler_1.onSchedule)({
    schedule: '*/1 * * * *',
    memory: '512MiB',
    timeoutSeconds: 300
}, async (event) => {
    console.log('Starting email queue processing...');
    // 1. Fetch pending emails
    // Order by priority (1=High) and then creation time
    const snapshot = await db.collection('email_queue')
        .where('status', '==', 'pending')
        .orderBy('priority', 'asc')
        .orderBy('createdAt', 'asc')
        .limit(20) // Rate limit: 20 emails per minute
        .get();
    if (snapshot.empty) {
        console.log('No pending emails in queue.');
        return;
    }
    console.log(`Processing ${snapshot.size} emails...`);
    const batch = db.batch();
    const results = [];
    // 2. Process each email
    for (const doc of snapshot.docs) {
        const emailData = doc.data();
        const { to, subject, html, text, retryCount = 0 } = emailData;
        try {
            // Mark as processing to prevent other workers from picking it up (if multiple)
            // Ideally should be done in a transaction, but for this scale, it's okay-ish with scheduled functions
            // Better: update status to 'processing' first. But here we just process and update result.
            const info = await (0, email_core_1.sendEmailCore)(to, subject, html, text);
            // Update status to 'sent'
            batch.update(doc.ref, {
                status: 'sent',
                sentAt: admin.firestore.Timestamp.now(),
                messageId: info.messageId,
                response: info.response,
                error: null
            });
            // Log success
            results.push({ id: doc.id, status: 'sent' });
            // Create entry in email_logs
            const logRef = db.collection('email_logs').doc();
            batch.set(logRef, {
                emailId: doc.id,
                to,
                subject,
                status: 'sent',
                timestamp: admin.firestore.Timestamp.now(),
                campaignId: emailData.campaignId || null
            });
        }
        catch (error) {
            console.error(`Failed to send email to ${to}:`, error);
            const newRetryCount = retryCount + 1;
            const status = newRetryCount >= 3 ? 'failed' : 'pending'; // Retry up to 3 times
            batch.update(doc.ref, {
                status: status,
                retryCount: newRetryCount,
                lastError: error.message || 'Unknown error',
                nextRetryAt: admin.firestore.Timestamp.fromMillis(Date.now() + 5 * 60 * 1000) // Retry in 5 mins
            });
            results.push({ id: doc.id, status: 'failed', error: error.message });
            // Log failure
            if (status === 'failed') {
                const logRef = db.collection('email_logs').doc();
                batch.set(logRef, {
                    emailId: doc.id,
                    to,
                    subject,
                    status: 'failed',
                    error: error.message,
                    timestamp: admin.firestore.Timestamp.now(),
                    campaignId: emailData.campaignId || null
                });
            }
        }
    }
    // 3. Commit batch updates
    await batch.commit();
    console.log('Email processing complete:', results);
});
//# sourceMappingURL=email-worker.js.map