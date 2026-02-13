import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { ArrowUpDown, ExternalLink, Activity } from 'lucide-react';
import PageDetailModal from './PageDetailModal';

interface PageMetrics {
    page: string;
    views: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
    bounceRate: number;
    liveVisitors?: number; // Added
}

// Define main pages to ensure they appear in the list even with 0 views
const STATIC_PAGES = [
    '/',
    '/login',
    '/signup',
    '/pricing',
    '/about',
    '/contact',
    '/blog',
    '/creator_os_dashboard',
    '/creator_os_dashboard/content',
    '/creator_os_dashboard/channel-ideas',
    '/creator_os_dashboard/saved',
    '/creator_os_dashboard/settings',
    '/creator_os_dashboard/profile',
    '/creator_os_dashboard/income-sources',
    '/creator_os_dashboard/trends',
    '/creator_os_dashboard/tools',
    '/website_admin_pannel',
    '/website_admin_pannel/analytics',
    '/website_admin_pannel/users'
];

export default function PageAnalytics() {
    const [pages, setPages] = useState<PageMetrics[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'views' | 'uniqueVisitors' | 'avgTimeOnPage'>('views');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Modal State
    const [selectedPage, setSelectedPage] = useState<string | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    useEffect(() => {
        fetchPageMetrics();

        // Subscribe to live traffic
        const database = getDatabase();
        const sessionsRef = ref(database, 'active_sessions');

        const unsubscribe = onValue(sessionsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const liveCounts: Record<string, number> = {};
                Object.values(data).forEach((session: any) => {
                    const p = session.currentPage;
                    if (p) liveCounts[p] = (liveCounts[p] || 0) + 1;
                });

                setPages(prevPages => prevPages.map(page => ({
                    ...page,
                    liveVisitors: liveCounts[page.page] || 0
                })));
            } else {
                setPages(prevPages => prevPages.map(page => ({ ...page, liveVisitors: 0 })));
            }
        });

        return () => off(sessionsRef);
    }, []);

    const fetchPageMetrics = async () => {
        // setLoading(true); // Don't reset loading on simple refresh if live data is flowing? 
        // Actually keep it simple

        try {
            // Get last 7 days of data
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const eventsRef = collection(db, 'analytics_events');
            const q = query(
                eventsRef,
                where('type', '==', 'page_view'),
                where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo))
            );

            const snapshot = await getDocs(q);
            const events = snapshot.docs.map(doc => doc.data());

            // Aggregate by page
            const pageMap: {
                [page: string]: {
                    views: number;
                    sessions: Set<string>;
                    totalTime: number;
                    timeCount: number;
                }
            } = {};

            // Initialize with static pages
            STATIC_PAGES.forEach(page => {
                pageMap[page] = {
                    views: 0,
                    sessions: new Set(),
                    totalTime: 0,
                    timeCount: 0
                };
            });

            events.forEach((event: any) => {
                const page = event.page;
                if (!pageMap[page]) {
                    pageMap[page] = {
                        views: 0,
                        sessions: new Set(),
                        totalTime: 0,
                        timeCount: 0
                    };
                }

                pageMap[page].views++;
                pageMap[page].sessions.add(event.sessionId);

                if (event.metadata?.timeOnPage) {
                    pageMap[page].totalTime += event.metadata.timeOnPage;
                    pageMap[page].timeCount++;
                }
            });

            // Convert to array and calculate metrics
            const pageMetrics: PageMetrics[] = Object.entries(pageMap).map(([page, data]) => ({
                page,
                views: data.views,
                uniqueVisitors: data.sessions.size,
                avgTimeOnPage: data.timeCount > 0 ? Math.floor(data.totalTime / data.timeCount) : 0,
                bounceRate: 0,
                liveVisitors: 0 // Will be updated by live listener
            }));

            setPages(pageMetrics);
        } catch (error) {
            console.error('Failed to fetch page metrics:', error);
        }
        setLoading(false);
    };

    const sortedPages = [...pages].sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    const toggleSort = (column: typeof sortBy) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePageClick = (page: string) => {
        setSelectedPage(page);
        setDetailModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Page-Level Analytics</h2>
                <Button onClick={fetchPageMetrics} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            <Card className="border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-6">
                        <p className="text-slate-500">Loading page analytics...</p>
                    </div>
                ) : pages.length === 0 ? (
                    <div className="p-6">
                        <p className="text-slate-500">No page data available</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Page
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                                        onClick={() => toggleSort('views')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Views
                                            <ArrowUpDown className="size-3" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                                        onClick={() => toggleSort('uniqueVisitors')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Unique Visitors
                                            <ArrowUpDown className="size-3" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                                        onClick={() => toggleSort('avgTimeOnPage')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Avg Time
                                            <ArrowUpDown className="size-3" />
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {sortedPages.map((page) => (
                                    <tr
                                        key={page.page}
                                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                                        onClick={() => handlePageClick(page.page)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-slate-900">{page.page}</span>
                                                    {page.liveVisitors && page.liveVisitors > 0 ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 animate-pulse">
                                                            <Activity className="size-3" /> {page.liveVisitors}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <ExternalLink className="size-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                            {page.views.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                            {page.uniqueVisitors.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                            {formatDuration(page.avgTimeOnPage)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {selectedPage && (
                <PageDetailModal
                    page={selectedPage}
                    open={detailModalOpen}
                    onOpenChange={setDetailModalOpen}
                />
            )}
        </div>
    );
}
