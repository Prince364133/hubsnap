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
exports.cleanupOldExports = exports.scheduledExport = exports.exportUsers = exports.processEmailQueue = exports.sendBulkEmail = exports.batchUpdateUsers = void 0;
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.batchUpdateUsers = (0, https_1.onCall)({
    memory: '512MiB',
    timeoutSeconds: 300
}, async (request) => {
    // Check admin auth
    if (!request.auth || !request.auth.token.admin) {
        throw new Error('Unauthorized: Admin access required');
    }
    const { userIds, updates } = request.data;
    if (!userIds || userIds.length === 0) {
        throw new Error('No user IDs provided');
    }
    if (!updates || Object.keys(updates).length === 0) {
        throw new Error('No updates provided');
    }
    const results = {
        success: 0,
        failed: 0,
        errors: []
    };
    // Process in batches of 500 (Firestore limit)
    const batchSize = 500;
    for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = db.batch();
        const batchUserIds = userIds.slice(i, i + batchSize);
        for (const userId of batchUserIds) {
            try {
                const userRef = db.collection('users').doc(userId);
                batch.update(userRef, updates);
                results.success++;
            }
            catch (error) {
                results.failed++;
                results.errors.push(`User ${userId}: ${error.message}`);
            }
        }
        await batch.commit();
    }
    return results;
});
exports.sendBulkEmail = (0, https_1.onCall)({
    memory: '512MiB',
    timeoutSeconds: 300
}, async (request) => {
    // Check admin auth
    if (!request.auth || !request.auth.token.admin) {
        throw new Error('Unauthorized: Admin access required');
    }
    const { userIds, subject, body } = request.data;
    if (!userIds || userIds.length === 0) {
        throw new Error('No recipients provided');
    }
    if (!subject || !body) {
        throw new Error('Subject and body are required');
    }
    // Fetch user data
    const users = await Promise.all(userIds.map(async (id) => {
        const doc = await db.collection('users').doc(id).get();
        return Object.assign({ id }, doc.data());
    }));
    const results = {
        sent: 0,
        failed: 0,
        errors: []
    };
    // Create email log
    const emailLogRef = db.collection('emailLogs').doc();
    await emailLogRef.set({
        subject,
        body,
        recipientCount: userIds.length,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'sending',
        results: {
            sent: 0,
            failed: 0
        }
    });
    // Send emails (this would integrate with SendGrid or similar)
    // For now, we'll just log the emails
    for (const user of users) {
        try {
            // Render template with user data
            let renderedSubject = subject;
            let renderedBody = body;
            const userData = user;
            const replacements = {
                name: userData.name || 'User',
                email: userData.email || '',
                plan: userData.plan || 'free',
                walletBalance: String(userData.walletBalance || 0),
                referralCode: userData.referralCode || ''
            };
            for (const [key, value] of Object.entries(replacements)) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                renderedSubject = renderedSubject.replace(regex, value);
                renderedBody = renderedBody.replace(regex, value);
            }
            // TODO: Integrate with SendGrid or Firebase Email Extension
            // await sendEmail(userData.email, renderedSubject, renderedBody);
            // For now, store in Firestore queue
            await db.collection('emailQueue').add({
                to: userData.email,
                subject: renderedSubject,
                body: renderedBody,
                userId: user.id,
                logId: emailLogRef.id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            });
            results.sent++;
        }
        catch (error) {
            results.failed++;
            const userData = user;
            results.errors.push(`${userData.email}: ${error.message}`);
        }
    }
    // Update email log
    await emailLogRef.update({
        status: 'completed',
        results,
        completedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return results;
});
// ============================================
// EMAIL QUEUE PROCESSOR
// ============================================
const sgMail = __importStar(require("@sendgrid/mail"));
const firestore_1 = require("firebase-functions/v2/firestore");
exports.processEmailQueue = (0, firestore_1.onDocumentCreated)({
    document: 'emailQueue/{emailId}',
    memory: '512MiB',
    timeoutSeconds: 300
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        return;
    }
    const emailData = snapshot.data();
    if (emailData.status !== 'pending') {
        return;
    }
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
        console.error('SendGrid API key not configured');
        await snapshot.ref.update({ status: 'failed', error: 'Missing API Key' });
        return;
    }
    sgMail.setApiKey(apiKey);
    try {
        await sgMail.send({
            to: emailData.to,
            from: process.env.SENDGRID_FROM_EMAIL || 'noreply@hubsnap.com', // Configure sender
            subject: emailData.subject,
            html: emailData.body, // Assuming body is HTML
        });
        await snapshot.ref.update({
            status: 'sent',
            sentAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Update parent log stats
        if (emailData.logId) {
            await db.collection('emailLogs').doc(emailData.logId).update({
                'results.sent': admin.firestore.FieldValue.increment(1)
            });
        }
    }
    catch (error) {
        console.error(`Failed to send email to ${emailData.to}:`, error);
        await snapshot.ref.update({
            status: 'failed',
            error: error.message,
            failedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        if (emailData.logId) {
            await db.collection('emailLogs').doc(emailData.logId).update({
                'results.failed': admin.firestore.FieldValue.increment(1)
            });
        }
    }
});
exports.exportUsers = (0, https_1.onCall)({
    memory: '512MiB',
    timeoutSeconds: 300
}, async (request) => {
    var _a, _b;
    // Check admin auth
    if (!request.auth || !request.auth.token.admin) {
        throw new Error('Unauthorized: Admin access required');
    }
    const { filters, format } = request.data;
    // Build query
    let query = db.collection('users');
    if (filters === null || filters === void 0 ? void 0 : filters.status) {
        query = query.where('status', '==', filters.status);
    }
    if (filters === null || filters === void 0 ? void 0 : filters.plan) {
        query = query.where('plan', '==', filters.plan);
    }
    if ((_a = filters === null || filters === void 0 ? void 0 : filters.dateRange) === null || _a === void 0 ? void 0 : _a.start) {
        query = query.where('createdAt', '>=', new Date(filters.dateRange.start));
    }
    if ((_b = filters === null || filters === void 0 ? void 0 : filters.dateRange) === null || _b === void 0 ? void 0 : _b.end) {
        query = query.where('createdAt', '<=', new Date(filters.dateRange.end));
    }
    // Fetch all users
    const snapshot = await query.get();
    const users = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    // Generate export data
    let exportData;
    let contentType;
    let filename;
    if (format === 'csv') {
        // Generate CSV
        const headers = ['ID', 'Name', 'Email', 'Plan', 'Status', 'Wallet Balance', 'Referral Code', 'Joined Date'];
        const rows = users.map(user => [
            user.id,
            user.name || '',
            user.email || '',
            user.plan || 'free',
            user.status || 'inactive',
            user.walletBalance || 0,
            user.referralCode || '',
            user.createdAt ? new Date(user.createdAt.toDate()).toISOString() : ''
        ]);
        exportData = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        contentType = 'text/csv';
        filename = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    }
    else {
        // Generate JSON
        exportData = JSON.stringify(users, null, 2);
        contentType = 'application/json';
        filename = `users-export-${new Date().toISOString().split('T')[0]}.json`;
    }
    // Upload to Cloud Storage
    const bucket = admin.storage().bucket();
    const file = bucket.file(`exports/${filename}`);
    await file.save(exportData, {
        contentType,
        metadata: {
            contentDisposition: `attachment; filename="${filename}"`
        }
    });
    // Generate signed URL (expires in 24 hours)
    const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 24 * 60 * 60 * 1000
    });
    // Log export
    await db.collection('exportHistory').add({
        filename,
        format,
        filters: filters || {},
        userCount: users.length,
        fileSize: Buffer.byteLength(exportData),
        downloadUrl: url,
        createdBy: request.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    return {
        downloadUrl: url,
        filename,
        userCount: users.length,
        fileSize: Buffer.byteLength(exportData),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
});
// ============================================
// SCHEDULED EXPORT
// ============================================
exports.scheduledExport = (0, scheduler_1.onSchedule)({
    schedule: '0 0 * * *',
    memory: '512MiB',
    timeoutSeconds: 300
}, async (event) => {
    var _a, _b;
    // Fetch all active export schedules
    const schedulesSnapshot = await db.collection('exportSchedules')
        .where('enabled', '==', true)
        .get();
    for (const scheduleDoc of schedulesSnapshot.docs) {
        const schedule = scheduleDoc.data();
        const now = new Date();
        // Check if it's time to run this schedule
        const shouldRun = checkSchedule(schedule, now);
        if (shouldRun) {
            try {
                // Build query based on filters
                let query = db.collection('users');
                if ((_a = schedule.filters) === null || _a === void 0 ? void 0 : _a.status) {
                    query = query.where('status', '==', schedule.filters.status);
                }
                if ((_b = schedule.filters) === null || _b === void 0 ? void 0 : _b.plan) {
                    query = query.where('plan', '==', schedule.filters.plan);
                }
                // Fetch users
                const snapshot = await query.get();
                const users = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
                // Generate CSV
                const headers = ['ID', 'Name', 'Email', 'Plan', 'Status', 'Wallet Balance', 'Referral Code'];
                const rows = users.map(user => [
                    user.id,
                    user.name || '',
                    user.email || '',
                    user.plan || 'free',
                    user.status || 'inactive',
                    user.walletBalance || 0,
                    user.referralCode || ''
                ]);
                const csvData = [
                    headers.join(','),
                    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
                ].join('\n');
                const filename = `scheduled-export-${schedule.name}-${now.toISOString().split('T')[0]}.csv`;
                // Upload to Cloud Storage
                const bucket = admin.storage().bucket();
                const file = bucket.file(`exports/scheduled/${filename}`);
                await file.save(csvData, {
                    contentType: 'text/csv',
                    metadata: {
                        contentDisposition: `attachment; filename="${filename}"`
                    }
                });
                // Generate signed URL
                const [url] = await file.getSignedUrl({
                    action: 'read',
                    expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
                });
                // Send email to recipients
                for (const recipient of schedule.emailRecipients || []) {
                    await db.collection('emailQueue').add({
                        to: recipient,
                        subject: `Scheduled Export: ${schedule.name}`,
                        body: `Your scheduled export is ready.\n\nExport: ${schedule.name}\nUsers: ${users.length}\nDownload: ${url}\n\nThis link expires in 7 days.`,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        status: 'pending'
                    });
                }
                // Update schedule
                await scheduleDoc.ref.update({
                    lastRun: admin.firestore.FieldValue.serverTimestamp(),
                    nextRun: calculateNextRun(schedule)
                });
                // Log export
                await db.collection('exportHistory').add({
                    filename,
                    format: 'csv',
                    scheduleId: scheduleDoc.id,
                    scheduleName: schedule.name,
                    userCount: users.length,
                    downloadUrl: url,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });
            }
            catch (error) {
                console.error(`Failed to run scheduled export ${scheduleDoc.id}:`, error);
            }
        }
    }
});
// ============================================
// CLEANUP OLD EXPORTS
// ============================================
exports.cleanupOldExports = (0, scheduler_1.onSchedule)({
    schedule: '0 3 * * *',
    memory: '512MiB',
    timeoutSeconds: 300
}, async (event) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    // Find expired exports
    const expiredExports = await db.collection('exportHistory')
        .where('expiresAt', '<', sevenDaysAgo)
        .get();
    const bucket = admin.storage().bucket();
    for (const exportDoc of expiredExports.docs) {
        const exportData = exportDoc.data();
        try {
            // Delete file from Cloud Storage
            const file = bucket.file(`exports/${exportData.filename}`);
            await file.delete();
            // Delete Firestore record
            await exportDoc.ref.delete();
            console.log(`Deleted expired export: ${exportData.filename}`);
        }
        catch (error) {
            console.error(`Failed to delete export ${exportData.filename}:`, error);
        }
    }
});
// ============================================
// HELPER FUNCTIONS
// ============================================
function checkSchedule(schedule, now) {
    if (!schedule.nextRun)
        return true;
    const nextRun = schedule.nextRun.toDate();
    return now >= nextRun;
}
function calculateNextRun(schedule) {
    const now = new Date();
    switch (schedule.frequency) {
        case 'daily':
            return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        case 'weekly':
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        case 'monthly':
            const nextMonth = new Date(now);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            return nextMonth;
        default:
            return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
}
//# sourceMappingURL=bulk-operations.js.map