import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import { sendEmailCore } from './email-core';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

/**
 * Process Email Queue (Runs every minute)
 * Fetches pending emails and sends them via SMTP
 */
export const processEmailQueueWorker = onSchedule('*/1 * * * *', async (event) => {
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
    const results: any[] = [];

    // 2. Process each email
    for (const doc of snapshot.docs) {
        const emailData = doc.data();
        const { to, subject, html, text, retryCount = 0 } = emailData;

        try {
            // Mark as processing to prevent other workers from picking it up (if multiple)
            // Ideally should be done in a transaction, but for this scale, it's okay-ish with scheduled functions
            // Better: update status to 'processing' first. But here we just process and update result.

            const info = await sendEmailCore(to, subject, html, text);

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

        } catch (error: any) {
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
