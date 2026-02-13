"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AdminDashboardStats } from '@/lib/firestore';
import { Card } from '@/components/ui/Card';
import { Users, TrendingUp, Activity, AlertTriangle } from 'lucide-react';

export default function AdminStatsCards() {
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const statsDoc = await getDoc(doc(db, 'admin_stats', 'user_management'));
                if (statsDoc.exists()) {
                    setStats(statsDoc.data() as AdminDashboardStats);
                }
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            }
            setLoading(false);
        };

        fetchStats();

        // Refresh stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="p-6 border-slate-200 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                    </Card>
                ))}
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    const statCards = [
        {
            label: 'New Users Today',
            value: stats.usersJoinedToday,
            subtext: `${stats.usersJoinedThisWeek} this week`,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            trend: stats.usersJoinedToday > 0 ? 'up' : 'neutral',
            trendValue: stats.usersJoinedThisWeek > 0 ?
                `+${Math.round((stats.usersJoinedToday / (stats.usersJoinedThisWeek / 7)) * 100)}%` : '0%'
        },
        {
            label: 'Active Users',
            value: stats.activeUsersToday,
            subtext: `${stats.activeUsersThisWeek} this week`,
            icon: Activity,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            trend: stats.activeUsersToday > (stats.activeUsersThisWeek / 7) ? 'up' : 'down',
            trendValue: stats.activeUsersThisWeek > 0 ?
                `${Math.round((stats.activeUsersToday / (stats.activeUsersThisWeek / 7) - 1) * 100)}%` : '0%'
        },
        {
            label: 'Retention Rate',
            value: `${stats.retentionRate7d}%`,
            subtext: `${stats.retentionRate30d}% (30d)`,
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            trend: stats.retentionRate7d >= 50 ? 'up' : stats.retentionRate7d >= 30 ? 'neutral' : 'down',
            trendValue: stats.retentionRate7d >= stats.retentionRate30d ? 'Improving' : 'Declining'
        },
        {
            label: 'At Risk Users',
            value: stats.churnWarnings,
            subtext: `${stats.statusDistribution.inactive} inactive`,
            icon: AlertTriangle,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
            trend: stats.churnWarnings > 10 ? 'down' : 'up',
            trendValue: `${Math.round((stats.churnWarnings / stats.totalUsers) * 100)}% of total`
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                const trendIcon = stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→';
                const trendColor = stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-slate-600';

                return (
                    <Card key={index} className="p-6 border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-600 mb-1">
                                    {stat.label}
                                </p>
                                <p className="text-3xl font-bold text-slate-900 mb-1">
                                    {stat.value}
                                </p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-slate-500">
                                        {stat.subtext}
                                    </p>
                                    <span className={`text-xs font-medium ${trendColor} flex items-center gap-1`}>
                                        <span className="text-base">{trendIcon}</span>
                                        {stat.trendValue}
                                    </span>
                                </div>
                            </div>
                            <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                                <Icon className="size-6" />
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
