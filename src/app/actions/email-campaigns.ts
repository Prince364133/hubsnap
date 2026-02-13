'use server';

import { db } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

interface CreateCampaignData {
    name: string;
    subject: string;
    segment: string;
    content: string;
}

export async function createEmailCampaign(formData: CreateCampaignData) {
    try {
        const { name, subject, segment, content } = formData;

        if (!name || !subject || !content) {
            throw new Error('Missing required fields');
        }

        // Fetch Target Users based on segment
        let usersQuery = db.collection('users');
        let targetUsersSnapshot;

        if (segment === 'pro_users') {
            targetUsersSnapshot = await usersQuery.where('plan', 'in', ['pro', 'pro_plus']).get();
        } else if (segment === 'free_users') {
            targetUsersSnapshot = await usersQuery.where('plan', '==', 'free').get();
        } else if (segment === 'all_users') {
            targetUsersSnapshot = await usersQuery.limit(500).get();
        } else {
            targetUsersSnapshot = await usersQuery.limit(100).get();
        }

        const targetUsers = targetUsersSnapshot.docs;

        // Create Campaign Document
        const campaignRef = await db.collection('email_campaigns').add({
            name,
            subject,
            segment,
            templateHtml: content,
            status: 'sending',
            createdAt: new Date(),
            stats: {
                total: targetUsers.length,
                sent: 0,
                failed: 0,
                opened: 0
            }
        });

        // Batch Enqueue Emails
        const batch = db.batch();
        let count = 0;

        for (const userDoc of targetUsers) {
            const userData = userDoc.data();
            if (!userData.email) continue;

            let personalizedHtml = content
                .replace(/{{name}}/g, userData.name || 'Friend')
                .replace(/{{email}}/g, userData.email);

            const emailRef = db.collection('email_queue').doc();
            batch.set(emailRef, {
                to: userData.email,
                subject: subject,
                html: personalizedHtml,
                campaignId: campaignRef.id,
                status: 'pending',
                priority: 5,
                createdAt: new Date(),
                retryCount: 0
            });

            count++;

            if (count % 400 === 0) {
                await batch.commit();
            }
        }

        if (count % 400 !== 0) {
            await batch.commit();
        }

        revalidatePath('/website_admin_pannel/email/campaigns');

        return {
            success: true,
            campaignId: campaignRef.id,
            usersQueued: count
        };
    } catch (error: any) {
        console.error('Failed to create campaign:', error);
        throw new Error(error.message || 'Failed to create campaign');
    }
}
