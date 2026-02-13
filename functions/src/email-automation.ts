import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

/**
 * On User Created -> Send Welcome Email
 */
export const onUserCreated = functions.firestore.onDocumentCreated('users/{userId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const user = snapshot.data();
    const userId = event.params.userId;
    const email = user.email;
    const name = user.name || 'Creator';

    if (!email) {
        console.log(`User ${userId} has no email. Skipping welcome email.`);
        return;
    }

    // 1. Fetch Welcome Template
    // In a real app, fetch from 'email_templates' collection.
    // Here we use a hardcoded fallback or fetch.
    let subject = 'Welcome to CreatorOS!';
    let html = `<h1>Welcome, ${name}!</h1><p>We are excited to have you on board.</p>`;

    try {
        const templateDoc = await db.collection('email_templates').doc('welcome-email').get();
        if (templateDoc.exists) {
            const template = templateDoc.data();
            subject = template?.subject || subject;
            html = template?.bodyHtml || html;

            // Simple variable substitution
            html = html.replace(/{{name}}/g, name).replace(/{{email}}/g, email);
        }
    } catch (e) {
        console.warn('Failed to fetch welcome template, using default.', e);
    }

    // 2. Add to Email Queue
    await db.collection('email_queue').add({
        to: email,
        subject: subject,
        html: html,
        status: 'pending',
        priority: 1, // High priority
        createdAt: admin.firestore.Timestamp.now(),
        retryCount: 0,
        metadata: {
            userId,
            trigger: 'signup'
        }
    });

    console.log(`Enqueued welcome email for ${email}`);
});
