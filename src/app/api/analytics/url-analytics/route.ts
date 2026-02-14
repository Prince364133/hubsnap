import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = () => getFirestore(app);

// GET - Get analytics for a specific short URL
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const urlId = searchParams.get('urlId');

        if (!urlId) {
            return NextResponse.json(
                { error: 'urlId is required' },
                { status: 400 }
            );
        }

        // Get all clicks for this URL
        const clicksQuery = query(
            collection(db(), 'url_clicks'),
            where('urlId', '==', urlId),
            orderBy('timestamp', 'desc'),
            limit(1000) // Last 1000 clicks
        );

        const clicksSnapshot = await getDocs(clicksQuery);
        const clicks = clicksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Aggregate analytics
        const analytics = {
            totalClicks: clicks.length,
            clicksBySource: {} as Record<string, number>,
            clicksByCountry: {} as Record<string, number>,
            clicksByDevice: {} as Record<string, number>,
            clicksByBrowser: {} as Record<string, number>,
            clicksOverTime: [] as Array<{ date: string; count: number }>,
            recentClicks: clicks.slice(0, 10).map((click: any) => ({
                timestamp: click.timestamp,
                referrer: click.referrer || 'Direct',
                country: click.country || 'Unknown',
                device: click.device || 'Unknown',
                browser: click.browser || 'Unknown'
            }))
        };

        // Process clicks
        clicks.forEach((click: any) => {
            // By source/referrer
            const source = click.referrer || 'Direct';
            analytics.clicksBySource[source] = (analytics.clicksBySource[source] || 0) + 1;

            // By country
            const country = click.country || 'Unknown';
            analytics.clicksByCountry[country] = (analytics.clicksByCountry[country] || 0) + 1;

            // By device
            const device = click.device || 'Unknown';
            analytics.clicksByDevice[device] = (analytics.clicksByDevice[device] || 0) + 1;

            // By browser
            const browser = click.browser || 'Unknown';
            analytics.clicksByBrowser[browser] = (analytics.clicksByBrowser[browser] || 0) + 1;
        });

        // Clicks over time (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
        });

        const clicksByDate: Record<string, number> = {};
        clicks.forEach((click: any) => {
            if (click.timestamp?.seconds) {
                const date = new Date(click.timestamp.seconds * 1000).toISOString().split('T')[0];
                clicksByDate[date] = (clicksByDate[date] || 0) + 1;
            }
        });

        analytics.clicksOverTime = last7Days.map(date => ({
            date,
            count: clicksByDate[date] || 0
        }));

        return NextResponse.json(analytics);
    } catch (error: any) {
        console.error('Failed to get URL analytics:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get analytics' },
            { status: 500 }
        );
    }
}

// POST - Track a click
export async function POST(request: NextRequest) {
    try {
        const { urlId, referrer, userAgent, ip } = await request.json();

        if (!urlId) {
            return NextResponse.json(
                { error: 'urlId is required' },
                { status: 400 }
            );
        }

        // Parse user agent for device and browser info
        const device = userAgent?.includes('Mobile') ? 'Mobile' :
            userAgent?.includes('Tablet') ? 'Tablet' : 'Desktop';

        let browser = 'Unknown';
        if (userAgent?.includes('Chrome')) browser = 'Chrome';
        else if (userAgent?.includes('Firefox')) browser = 'Firefox';
        else if (userAgent?.includes('Safari')) browser = 'Safari';
        else if (userAgent?.includes('Edge')) browser = 'Edge';

        // Get country from IP using ipapi.co free API
        let country = 'Unknown';
        try {
            // Get client IP from request headers
            const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                request.headers.get('x-real-ip') ||
                'unknown';

            // Only lookup if we have a valid IP (not localhost)
            if (clientIp && clientIp !== 'unknown' && !clientIp.startsWith('127.') && !clientIp.startsWith('::')) {
                const geoResponse = await fetch(`https://ipapi.co/${clientIp}/json/`, {
                    headers: { 'User-Agent': 'HubSnap-Analytics/1.0' }
                });

                if (geoResponse.ok) {
                    const geoData = await geoResponse.json();
                    country = geoData.country_name || 'Unknown';
                }
            }
        } catch (error) {
            console.error('GeoIP lookup failed:', error);
            // Continue with Unknown country
        }

        const clickData = {
            urlId,
            referrer: referrer || 'Direct',
            device,
            browser,
            country,
            userAgent: userAgent || '',
            timestamp: Timestamp.now()
        };

        await addDoc(collection(db(), 'url_clicks'), clickData);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to track click:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to track click' },
            { status: 500 }
        );
    }
}
