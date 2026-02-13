import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, addDoc, getDocs, query, where, limit, writeBatch, doc, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export async function POST(request: NextRequest) {
    try {
        const db = getFirestore(app);
        const { name, subject, segment, content } = await request.json();

        if (!name || !subject || !content) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Fetch Target Users based on segment
        let usersQuery = query(collection(db, 'users'));

        if (segment === 'pro_users') {
            usersQuery = query(
                collection(db, 'users'),
                where('plan', 'in', ['pro', 'pro_plus']),
                limit(500)
            );
        } else if (segment === 'free_users') {
            usersQuery = query(
                collection(db, 'users'),
                where('plan', '==', 'free'),
                limit(500)
            );
        } else if (segment === 'all_users') {
            usersQuery = query(collection(db, 'users'), limit(500));
        } else {
            usersQuery = query(collection(db, 'users'), limit(100));
        }

        const targetUsersSnapshot = await getDocs(usersQuery);
        const targetUsers = targetUsersSnapshot.docs;

        // Create Campaign Document
        const campaignRef = await addDoc(collection(db, 'email_campaigns'), {
            name,
            subject,
            segment,
            templateHtml: content,
            status: 'sending',
            createdAt: Timestamp.now(),
            stats: {
                total: targetUsers.length,
                sent: 0,
                failed: 0,
                opened: 0
            }
        });

        // Batch Enqueue Emails
        const batch = writeBatch(db);
        let count = 0;

        for (const userDoc of targetUsers) {
            const userData = userDoc.data();
            if (!userData.email) continue;

            let personalizedHtml = content
                .replace(/{{name}}/g, userData.name || 'Friend')
                .replace(/{{email}}/g, userData.email);

            const emailRef = doc(collection(db, 'email_queue'));
            batch.set(emailRef, {
                to: userData.email,
                subject: subject,
                html: personalizedHtml,
                campaignId: campaignRef.id,
                status: 'pending',
                priority: 5,
                createdAt: Timestamp.now(),
                retryCount: 0
            });

            count++;

            // Firestore batch limit is 500
            if (count % 400 === 0) {
                await batch.commit();
            }
        }

        if (count % 400 !== 0) {
            await batch.commit();
        }

        return NextResponse.json({
            success: true,
            campaignId: campaignRef.id,
            usersQueued: count
        });
    } catch (error: any) {
        console.error('Failed to create campaign:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create campaign' },
            { status: 500 }
        );
    }
}
