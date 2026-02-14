import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = () => getFirestore(app);

// POST: Submit waitlist entry
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            name,
            email,
            phone,
            currentRole,
            contentType,
            platforms,
            monthlyContentVolume,
            currentTools,
            painPoints,
            interestedFeatures,
            expectedUsage,
            budget
        } = body;

        // Validation
        if (!name || !email || !currentRole || !monthlyContentVolume || !expectedUsage || !budget) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingQuery = query(
            collection(db(), 'waitlist'),
            where('email', '==', email)
        );
        const existingDocs = await getDocs(existingQuery);

        if (!existingDocs.empty) {
            return NextResponse.json(
                { error: 'Email already registered on waitlist' },
                { status: 400 }
            );
        }

        // Calculate qualification score (0-100)
        let score = 0;

        // Content volume (0-25 points)
        const volumeScores: Record<string, number> = {
            '1-5': 10,
            '6-10': 15,
            '11-20': 20,
            '20+': 25
        };
        score += volumeScores[monthlyContentVolume] || 0;

        // Expected usage (0-20 points)
        const usageScores: Record<string, number> = {
            'Daily': 20,
            'Weekly': 15,
            'Monthly': 10,
            'Occasionally': 5
        };
        score += usageScores[expectedUsage] || 0;

        // Budget (0-25 points)
        const budgetScores: Record<string, number> = {
            'Free': 5,
            '$10-50': 15,
            '$50-100': 20,
            '$100+': 25
        };
        score += budgetScores[budget] || 0;

        // Number of platforms (0-15 points)
        score += Math.min(platforms.length * 3, 15);

        // Number of pain points (0-15 points)
        score += Math.min(painPoints.length * 2.5, 15);

        // Get source from referrer
        const referrer = request.headers.get('referer') || '';
        let source = 'direct';
        if (referrer.includes('/products/creator-os')) source = 'creator-os-page';
        else if (referrer.includes('/features')) source = 'features-page';
        else if (referrer) source = 'header';

        // Create waitlist entry
        const waitlistEntry = {
            name,
            email,
            phone: phone || null,
            currentRole,
            contentType: contentType || [],
            platforms: platforms || [],
            monthlyContentVolume,
            currentTools: currentTools || '',
            painPoints: painPoints || [],
            interestedFeatures: interestedFeatures || [],
            expectedUsage,
            budget,
            qualificationScore: Math.round(score),
            status: 'pending',
            source,
            createdAt: Timestamp.now(),
            notes: ''
        };

        const docRef = await addDoc(collection(db(), 'waitlist'), waitlistEntry);

        return NextResponse.json({
            success: true,
            id: docRef.id,
            qualificationScore: Math.round(score)
        });

    } catch (error) {
        console.error('Waitlist submission error:', error);
        return NextResponse.json(
            { error: 'Failed to submit waitlist entry' },
            { status: 500 }
        );
    }
}

// GET: Retrieve waitlist entries (admin only)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '100');

        let q = query(
            collection(db(), 'waitlist'),
            orderBy('createdAt', 'desc')
        );

        if (status) {
            q = query(
                collection(db(), 'waitlist'),
                where('status', '==', status),
                orderBy('createdAt', 'desc')
            );
        }

        const snapshot = await getDocs(q);
        const entries = snapshot.docs.slice(0, limit).map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
        }));

        // Calculate analytics
        const analytics = {
            total: snapshot.size,
            byStatus: {
                pending: 0,
                approved: 0,
                rejected: 0,
                contacted: 0
            },
            avgQualificationScore: 0,
            topPainPoints: {} as Record<string, number>,
            platformDistribution: {} as Record<string, number>,
            budgetDistribution: {} as Record<string, number>
        };

        let totalScore = 0;
        snapshot.docs.forEach(doc => {
            const data = doc.data();

            // Status count
            analytics.byStatus[data.status as keyof typeof analytics.byStatus]++;

            // Average score
            totalScore += data.qualificationScore || 0;

            // Pain points
            (data.painPoints || []).forEach((pain: string) => {
                analytics.topPainPoints[pain] = (analytics.topPainPoints[pain] || 0) + 1;
            });

            // Platforms
            (data.platforms || []).forEach((platform: string) => {
                analytics.platformDistribution[platform] = (analytics.platformDistribution[platform] || 0) + 1;
            });

            // Budget
            if (data.budget) {
                analytics.budgetDistribution[data.budget] = (analytics.budgetDistribution[data.budget] || 0) + 1;
            }
        });

        analytics.avgQualificationScore = snapshot.size > 0 ? Math.round(totalScore / snapshot.size) : 0;

        return NextResponse.json({
            entries,
            analytics
        });

    } catch (error) {
        console.error('Waitlist retrieval error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve waitlist entries' },
            { status: 500 }
        );
    }
}
