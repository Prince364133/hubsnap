import { onCall } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

interface CreateCampaignRequest {
    name: string;
    subject: string;
    segment: string;
    content: string;
}

export const createCampaign = onCall(async (request) => {
    // 1. Auth Check
    const userId = request.auth?.uid;
    if (!userId) throw new Error('Unauthorized');

    // Check if admin
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.data()?.role !== 'admin') {
        throw new Error('Admin access required');
    }

    const { name, subject, segment, content } = request.data as CreateCampaignRequest;

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
    } else if (segment === 'free_users') {
        const snap = await usersQuery.where('plan', '==', 'free').get();
        targetUsers = snap.docs;
    } else if (segment === 'all_users') {
        // CAUTION: For large datasets, this will OOM. Use pagination or scheduled function for real bulk.
        // For now, limiting to 500 for safety, or assume <1000 users.
        const snap = await usersQuery.limit(500).get();
        targetUsers = snap.docs;
    } else {
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
        if (!userData.email) continue;

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
