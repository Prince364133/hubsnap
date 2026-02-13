"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    DollarSign,
    Activity,
    Zap,
    TrendingUp,
    AlertTriangle,
    Clock
} from "lucide-react";
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    getDoc,
    doc
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // Make sure this import is correct

import { StatCard } from "@/components/admin/StatCard";
import { GrowthChart, FeatureUsageChart, DeviceSplitChart } from "@/components/admin/DashboardCharts";
import { RecentSignupsList, AtRiskUsersList } from "@/components/admin/DashboardLists";
import { UserProfile } from "@/lib/firestore";

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    // Dashboard State
    const [pulseMetrics, setPulseMetrics] = useState({
        activeUsers24h: 0,
        newUsersToday: 0,
        revenueReadiness: 0,
        mrr: 0,
        atRiskProUsers: 0
    });

    interface TrendData {
        growthData: { date: string; uniqueVisitors: number; newUsers: number }[];
        featureUsage: { path: string; visits: number }[];
        deviceSplit: { mobile: number; desktop: number; tablet: number };
    }

    const [trends, setTrends] = useState<TrendData>({
        growthData: [],
        featureUsage: [],
        deviceSplit: { mobile: 0, desktop: 0, tablet: 0 }
    });

    const [lists, setLists] = useState({
        recentSignups: [] as UserProfile[],
        atRiskUsers: [] as UserProfile[]
    });

    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Aggregated Stats (From Cache)
                const cacheDoc = await getDoc(doc(db, 'dashboard_cache', 'latest'));
                if (cacheDoc.exists()) {
                    const data = cacheDoc.data();
                    setPulseMetrics(data.metrics || {
                        activeUsers24h: 0,
                        newUsersToday: 0,
                        revenueReadiness: 0,
                        mrr: 0,
                        atRiskProUsers: 0
                    });
                    setLastUpdated(data.meta?.lastUpdated?.toDate() || new Date());
                } else {
                    // Fallback to simpler queries if cache is empty
                    console.warn("Dashboard cache not found. Triggering aggregation...");
                    // You might want to trigger the cloud function here manually if possible
                }

                // 2. Fetch Historical Data (For Charts)
                // We'll use analytics_aggregates for the last 30 days
                const now = new Date();
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

                const historyQuery = query(
                    collection(db, 'analytics_aggregates'),
                    where('date', '>=', thirtyDaysAgo.toISOString().split('T')[0]),
                    orderBy('date', 'asc')
                );

                const historySnapshot = await getDocs(historyQuery);
                const growthData = historySnapshot.docs.map(doc => ({
                    date: doc.data().date,
                    uniqueVisitors: doc.data().uniqueVisitors || 0,
                    newUsers: doc.data().newUsers || 0
                }));

                // Aggregate top pages from history (last entry or sum)
                // Taking the most recent daily stats for feature usage snapshot
                const latestStats = historySnapshot.docs[historySnapshot.docs.length - 1]?.data();
                const featureUsage = latestStats?.topPages?.slice(0, 5) || [];
                const deviceSplit = latestStats?.deviceBreakdown || { mobile: 0, desktop: 0 };

                setTrends({
                    growthData,
                    featureUsage,
                    deviceSplit
                });

                // 3. Fetch Real-time Lists (Tier 3)
                // Recent Signups
                const recentQuery = query(
                    collection(db, 'users'),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                );
                const recentSnapshot = await getDocs(recentQuery);
                const recentSignups = recentSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile));

                // At Risk Pro Users (Example query, adjust as needed)
                // Note: Compound queries might need indexes
                const atRiskQuery = query(
                    collection(db, 'users'),
                    where('status', '==', 'at_risk'),
                    where('plan', 'in', ['pro', 'pro_plus']),
                    limit(5)
                );
                // Getting docs might fail if index missing, handle gracefully
                let atRiskUsers: UserProfile[] = [];
                try {
                    const atRiskSnapshot = await getDocs(atRiskQuery);
                    atRiskUsers = atRiskSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile));
                } catch (e) {
                    console.error("At risk query failed (likely index missing)", e);
                }

                setLists({
                    recentSignups,
                    atRiskUsers
                });

                setLoading(false);
            } catch (error) {
                console.error("Dashboard fetch failed:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading SaaS Command Center...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">SaaS Command Center</h1>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="size-3" />
                        Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Just now'}
                    </p>
                </div>
                {/* Add manual refresh button here if needed */}
            </div>

            {/* TIER 1: THE PULSE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Users (24h)"
                    value={pulseMetrics.activeUsers24h}
                    icon={Activity}
                    color="blue"
                    description="Users active recently"
                    onClick={() => router.push('/website_admin_pannel/users?sort=lastActive')}
                />
                <StatCard
                    title="New Users (Today)"
                    value={pulseMetrics.newUsersToday}
                    icon={Users}
                    color="green"
                    trend="up"
                    trendValue="vs yesterday" // You can calculate this if you fetch yesterday's stats
                    onClick={() => router.push('/website_admin_pannel/users?sort=createdAt')}
                />
                <StatCard
                    title="Revenue Readiness"
                    value={pulseMetrics.revenueReadiness}
                    icon={Zap}
                    color="orange"
                    description="Free users ready to upgrade"
                    onClick={() => router.push('/website_admin_pannel/users?filter=ready_to_buy')}
                />
                <StatCard
                    title="Recurring Revenue"
                    value={`₹${pulseMetrics.mrr.toLocaleString()}`}
                    icon={DollarSign}
                    color="purple"
                    description="Estimated MRR"
                    trend="up"
                    trendValue="5%" // Placeholder
                />
            </div>

            {/* TIER 2: TRENDS & BEHAVIOR */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <TrendingUp className="size-5 text-blue-600" />
                            Growth & Activity (30 Days)
                        </h3>
                        <GrowthChart data={trends.growthData} />
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Device Split</h3>
                        <DeviceSplitChart data={trends.deviceSplit} />
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Top Features</h3>
                        <FeatureUsageChart data={trends.featureUsage} />
                    </div>
                </div>
            </div>

            {/* TIER 3: QUALITY & RISK LISTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">Recent Signups</h3>
                        <button
                            className="text-sm text-blue-600 hover:underline"
                            onClick={() => router.push('/website_admin_pannel/users')}
                        >
                            View All
                        </button>
                    </div>
                    <RecentSignupsList users={lists.recentSignups} />
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <AlertTriangle className="size-5 text-red-500" />
                            At Risk Users
                        </h3>
                        <button
                            className="text-sm text-red-600 hover:underline"
                            onClick={() => router.push('/website_admin_pannel/users?status=at_risk')}
                        >
                            View All
                        </button>
                    </div>
                    <AtRiskUsersList users={lists.atRiskUsers} />
                </div>
            </div>
        </div>
    );
}
