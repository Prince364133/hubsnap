
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { db } from '@/lib/firebase'; // Ensure this points to your firebase config
import { collection, query, where, getDocs, orderBy, Timestamp, limit } from 'firebase/firestore';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Loader2, Users, Clock, Globe, Smartphone, Activity, ArrowUpRight } from 'lucide-react';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

interface PageDetailModalProps {
    page: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface PageHistoryData {
    date: string; // YYYY-MM-DD
    views: number;
    visitors: number;
}

interface ActiveSession {
    sessionId: string;
    userId: string | null;
    startTime: number;
    lastActivity: number;
}

export default function PageDetailModal({ page, open, onOpenChange }: PageDetailModalProps) {
    const [loading, setLoading] = useState(true);
    const [historyData, setHistoryData] = useState<PageHistoryData[]>([]);
    const [deviceStats, setDeviceStats] = useState<{ name: string; value: number }[]>([]);
    const [locationStats, setLocationStats] = useState<{ name: string; value: number }[]>([]);
    const [liveSessions, setLiveSessions] = useState<ActiveSession[]>([]);
    const [metrics, setMetrics] = useState({
        totalViews30d: 0,
        avgTimeOnPage: 0,
        uniqueVisitors30d: 0
    });

    useEffect(() => {
        if (open && page) {
            fetchHistoricalData();
            subscribeToLiveTraffic();
        }

        return () => {
            // Cleanup live listener
            const database = getDatabase();
            const sessionsRef = ref(database, 'active_sessions');
            off(sessionsRef);
        };
    }, [open, page]);

    const subscribeToLiveTraffic = () => {
        const database = getDatabase();
        const sessionsRef = ref(database, 'active_sessions');

        onValue(sessionsRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                setLiveSessions([]);
                return;
            }

            const sessions: ActiveSession[] = Object.entries(data)
                .map(([key, val]: [string, any]) => ({
                    sessionId: key,
                    ...val
                }))
                .filter(s => s.currentPage === page); // Client-side filtering because RTDB query capabilities are limited for this structure

            setLiveSessions(sessions);
        });
    };

    const fetchHistoricalData = async () => {
        setLoading(true);
        try {
            const endDate = new Date();
            const startDate = subDays(endDate, 30); // Last 30 days

            // 1. Fetch Events
            // Note: In production, querying purely by page might become slow without a composite index on [page, timestamp]
            const eventsRef = collection(db, 'analytics_events');
            const q = query(
                eventsRef,
                where('page', '==', page),
                where('timestamp', '>=', Timestamp.fromDate(startDate)),
                orderBy('timestamp', 'asc')
            );

            const snapshot = await getDocs(q);
            const events = snapshot.docs.map(doc => ({ ...doc.data(), timestamp: doc.data().timestamp.toDate() }));

            // 2. Aggregate Daily Stats
            const dailyMap = new Map<string, { views: number; sessions: Set<string> }>();

            // Initialize last 30 days with 0
            for (let i = 0; i <= 30; i++) {
                const d = subDays(endDate, 30 - i);
                const dateStr = format(d, 'yyyy-MM-dd');
                dailyMap.set(dateStr, { views: 0, sessions: new Set() });
            }

            let totalTime = 0;
            let timeCount = 0;
            const deviceMap: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
            const locationMap: Record<string, number> = {};

            events.forEach((event: any) => {
                const dateStr = format(event.timestamp, 'yyyy-MM-dd');

                if (dailyMap.has(dateStr)) {
                    const entry = dailyMap.get(dateStr)!;
                    entry.views++;
                    entry.sessions.add(event.sessionId);
                }

                if (event.metadata?.timeOnPage) {
                    totalTime += event.metadata.timeOnPage;
                    timeCount++;
                }

                const device = event.metadata?.deviceType || 'unknown';
                if (device in deviceMap) deviceMap[device]++;

                const country = event.metadata?.location?.country;
                if (country) {
                    locationMap[country] = (locationMap[country] || 0) + 1;
                }
            });

            const chartData: PageHistoryData[] = Array.from(dailyMap.entries()).map(([date, data]) => ({
                date,
                views: data.views,
                visitors: data.sessions.size
            }));

            // 3. Set Device Stats
            const deviceChartData = Object.entries(deviceMap)
                .filter(([, val]) => val > 0)
                .map(([name, value]) => ({ name, value }));

            // 4. Set Location Stats
            const locationChartData = Object.entries(locationMap)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5) // Top 5
                .map(([name, value]) => ({ name, value }));

            setHistoryData(chartData);
            setDeviceStats(deviceChartData);
            setLocationStats(locationChartData);

            // 5. Calculate Summary Metrics
            const totalViews = events.length;
            const uniqueVisitors = new Set(events.map((e: any) => e.sessionId)).size;
            const avgTime = timeCount > 0 ? Math.round(totalTime / timeCount) : 0;

            setMetrics({
                totalViews30d: totalViews,
                uniqueVisitors30d: uniqueVisitors,
                avgTimeOnPage: avgTime
            });

        } catch (error) {
            console.error("Error fetching page details:", error);
        } finally {
            setLoading(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-slate-200 shadow-md rounded-lg text-sm">
                    <p className="font-semibold mb-1">{format(new Date(label), 'PPP')}</p>
                    <p className="text-sky-600">Views: {payload[0].value}</p>
                    <p className="text-emerald-600">Visitors: {payload[1].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl flex items-center gap-2">
                                <span className="font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded text-base">{page}</span>
                                Analytics
                            </DialogTitle>
                            <DialogDescription className="mt-1 flex items-center gap-4">
                                <span className="flex items-center gap-1 text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                                    <Activity className="size-3" />
                                    {liveSessions.length} Live Now
                                </span>
                                <a href={page} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-sky-500 transition-colors">
                                    Open Page <ArrowUpRight className="size-3" />
                                </a>
                            </DialogDescription>
                        </div>
                        {/* Tab trigger or extra actions could go here */}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="p-4 bg-white border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <Users className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Unique Visitors (30d)</p>
                                    <h3 className="text-2xl font-bold">{metrics.uniqueVisitors30d.toLocaleString()}</h3>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 bg-white border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <Globe className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Total Views (30d)</p>
                                    <h3 className="text-2xl font-bold">{metrics.totalViews30d.toLocaleString()}</h3>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 bg-white border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                    <Clock className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Avg. Time on Page</p>
                                    <h3 className="text-2xl font-bold">{Math.floor(metrics.avgTimeOnPage / 60)}m {metrics.avgTimeOnPage % 60}s</h3>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Traffic Chart */}
                        <Card className="col-span-2 p-6 border-slate-200 bg-white">
                            <h3 className="font-bold text-slate-900 mb-4">Traffic History (30 Days)</h3>
                            {loading ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <Loader2 className="size-8 animate-spin text-slate-300" />
                                </div>
                            ) : (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={historyData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(str) => format(new Date(str), 'MMM d')}
                                                fontSize={12}
                                                stroke="#94A3B8"
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                fontSize={12}
                                                stroke="#94A3B8"
                                                dx={-10}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeWidth: 2 }} />
                                            <Line
                                                type="monotone"
                                                dataKey="views"
                                                stroke="#0EA5E9"
                                                strokeWidth={3}
                                                dot={false}
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                                name="Page Views"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="visitors"
                                                stroke="#10B981"
                                                strokeWidth={3}
                                                dot={false}
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                                name="Unique Visitors"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </Card>

                        {/* Live Sessions List */}
                        <Card className="p-6 border-slate-200 bg-white flex flex-col h-[400px]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                    Live Visitors
                                </h3>
                                <span className="font-mono text-lg font-bold text-slate-900">{liveSessions.length}</span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                {liveSessions.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <Users className="size-10 mb-2 opacity-20" />
                                        <p className="text-sm">No active visitors right now</p>
                                    </div>
                                ) : (
                                    liveSessions.map((session) => {
                                        const duration = Math.floor((Date.now() - session.startTime) / 1000);
                                        const mins = Math.floor(duration / 60);

                                        return (
                                            <div key={session.sessionId} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                                                        {session.userId ? 'U' : 'G'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">
                                                            {session.userId ? 'Logged User' : 'Guest Visitor'}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            Active for {mins}m {duration % 60}s
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Breakdown Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                        <Card className="p-6 border-slate-200 bg-white">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Smartphone className="size-4 text-slate-500" /> Devices
                            </h3>
                            <div className="space-y-4">
                                {deviceStats.map((stat) => (
                                    <div key={stat.name} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="capitalize">{stat.name}</span>
                                            <span className="font-medium">{stat.value}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full"
                                                style={{ width: `${(stat.value / metrics.totalViews30d) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-6 border-slate-200 bg-white">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Globe className="size-4 text-slate-500" /> Top Locations
                            </h3>
                            <div className="space-y-4">
                                {locationStats.map((stat) => (
                                    <div key={stat.name} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>{stat.name}</span>
                                            <span className="font-medium">{stat.value}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full"
                                                style={{ width: `${(stat.value / metrics.totalViews30d) * 100}%` }} // Approximate percentage
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
