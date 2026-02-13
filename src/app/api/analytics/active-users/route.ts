import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export async function GET(request: NextRequest) {
    try {
        const db = getFirestore(app);

        // Get active sessions (last activity within 5 minutes)
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

        const sessionsQuery = query(
            collection(db, 'analytics_sessions'),
            where('lastActivity', '>=', fiveMinutesAgo)
        );

        const sessionsSnapshot = await getDocs(sessionsQuery);
        const sessions = sessionsSnapshot.docs.map(doc => ({
            sessionId: doc.id,
            ...doc.data()
        }));

        // Count logged in vs anonymous
        let loggedInUsers = 0;
        let anonymousUsers = 0;
        const onlineUsers: any[] = [];

        sessions.forEach((session: any) => {
            if (session.userId) {
                loggedInUsers++;
                onlineUsers.push({
                    userId: session.userId,
                    currentPage: session.currentPage || '/',
                    lastSeen: session.lastActivity,
                    sessionId: session.sessionId
                });
            } else {
                anonymousUsers++;
            }
        });

        return NextResponse.json({
            totalActive: sessions.length,
            loggedInUsers,
            anonymousUsers,
            sessions,
            onlineUsers
        });
    } catch (error: any) {
        console.error('Failed to get active users:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get active users' },
            { status: 500 }
        );
    }
}
