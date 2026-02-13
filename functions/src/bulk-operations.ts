import { onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// ============================================
// BULK UPDATE USERS
// ============================================

interface BulkUpdateRequest {
    userIds: string[];
    updates: {
        plan?: string;
        status?: string;
        walletBalance?: number;
    };
}

export const batchUpdateUsers = onCall(async (request) => {
    // Check admin auth
    if (!request.auth || !request.auth.token.admin) {
        throw new Error('Unauthorized: Admin access required');
    }

    const { userIds, updates } = request.data as BulkUpdateRequest;

    if (!userIds || userIds.length === 0) {
        throw new Error('No user IDs provided');
    }

    if (!updates || Object.keys(updates).length === 0) {
        throw new Error('No updates provided');
    }

    const results = {
        success: 0,
        failed: 0,
        errors: [] as string[]
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
            } catch (error: any) {
                results.failed++;
                results.errors.push(`User ${userId}: ${error.message}`);
            }
        }

        await batch.commit();
    }

    return results;
});

// ============================================
// BULK EMAIL
// ============================================

interface BulkEmailRequest {
    userIds: string[];
    subject: string;
    body: string;
}

export const sendBulkEmail = onCall(async (request) => {
    // Check admin auth
    if (!request.auth || !request.auth.token.admin) {
        throw new Error('Unauthorized: Admin access required');
    }

    const { userIds, subject, body } = request.data as BulkEmailRequest;

    if (!userIds || userIds.length === 0) {
        throw new Error('No recipients provided');
    }

    if (!subject || !body) {
        throw new Error('Subject and body are required');
    }

    // Fetch user data
    const users = await Promise.all(
        userIds.map(async (id) => {
            const doc = await db.collection('users').doc(id).get();
            return { id, ...doc.data() };
        })
    );

    const results = {
        sent: 0,
        failed: 0,
        errors: [] as string[]
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

            const userData = user as any;
            const replacements: Record<string, string> = {
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
        } catch (error: any) {
            results.failed++;
            const userData = user as any;
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

import * as sgMail from '@sendgrid/mail';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

export const processEmailQueue = onDocumentCreated('emailQueue/{emailId}', async (event) => {
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
    } catch (error: any) {
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

// ============================================
// SERVER-SIDE EXPORT
// ============================================

interface ExportRequest {
    filters?: {
        status?: string;
        plan?: string;
        dateRange?: {
            start: string;
            end: string;
        };
    };
    format: 'csv' | 'json';
}

export const exportUsers = onCall(async (request) => {
    // Check admin auth
    if (!request.auth || !request.auth.token.admin) {
        throw new Error('Unauthorized: Admin access required');
    }

    const { filters, format } = request.data as ExportRequest;

    // Build query
    let query: admin.firestore.Query = db.collection('users');

    if (filters?.status) {
        query = query.where('status', '==', filters.status);
    }

    if (filters?.plan) {
        query = query.where('plan', '==', filters.plan);
    }

    if (filters?.dateRange?.start) {
        query = query.where('createdAt', '>=', new Date(filters.dateRange.start));
    }

    if (filters?.dateRange?.end) {
        query = query.where('createdAt', '<=', new Date(filters.dateRange.end));
    }

    // Fetch all users
    const snapshot = await query.get();
    const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    // Generate export data
    let exportData: string;
    let contentType: string;
    let filename: string;

    if (format === 'csv') {
        // Generate CSV
        const headers = ['ID', 'Name', 'Email', 'Plan', 'Status', 'Wallet Balance', 'Referral Code', 'Joined Date'];
        const rows = users.map(user => [
            user.id,
            (user as any).name || '',
            (user as any).email || '',
            (user as any).plan || 'free',
            (user as any).status || 'inactive',
            (user as any).walletBalance || 0,
            (user as any).referralCode || '',
            (user as any).createdAt ? new Date((user as any).createdAt.toDate()).toISOString() : ''
        ]);

        exportData = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        contentType = 'text/csv';
        filename = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    } else {
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

export const scheduledExport = onSchedule('0 0 * * *', async (event) => {
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
                let query: admin.firestore.Query = db.collection('users');

                if (schedule.filters?.status) {
                    query = query.where('status', '==', schedule.filters.status);
                }

                if (schedule.filters?.plan) {
                    query = query.where('plan', '==', schedule.filters.plan);
                }

                // Fetch users
                const snapshot = await query.get();
                const users = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Generate CSV
                const headers = ['ID', 'Name', 'Email', 'Plan', 'Status', 'Wallet Balance', 'Referral Code'];
                const rows = users.map(user => [
                    user.id,
                    (user as any).name || '',
                    (user as any).email || '',
                    (user as any).plan || 'free',
                    (user as any).status || 'inactive',
                    (user as any).walletBalance || 0,
                    (user as any).referralCode || ''
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
            } catch (error) {
                console.error(`Failed to run scheduled export ${scheduleDoc.id}:`, error);
            }
        }
    }
});

// ============================================
// CLEANUP OLD EXPORTS
// ============================================

export const cleanupOldExports = onSchedule('0 3 * * *', async (event) => {
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
        } catch (error) {
            console.error(`Failed to delete export ${exportData.filename}:`, error);
        }
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function checkSchedule(schedule: any, now: Date): boolean {
    if (!schedule.nextRun) return true;

    const nextRun = schedule.nextRun.toDate();
    return now >= nextRun;
}

function calculateNextRun(schedule: any): Date {
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
