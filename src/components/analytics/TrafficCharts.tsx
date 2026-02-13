"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, Eye } from 'lucide-react';

interface AggregateData {
    date: string;
    totalVisitors: number;
    uniqueVisitors: number;
    newUsers: number;
    returningUsers: number;
    totalPageViews: number;
    avgSessionDuration: number;
}

export default function TrafficCharts() {
    const [data, setData] = useState<AggregateData[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

    useEffect(() => {
        fetchAggregates();
    }, [dateRange]);

    const fetchAggregates = async () => {
        setLoading(true);
        try {
            const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const aggregatesRef = collection(db, 'analytics_aggregates');
            const q = query(
                aggregatesRef,
                where('period', '==', 'daily'),
                where('date', '>=', startDate.toISOString().split('T')[0])
            );

            const snapshot = await getDocs(q);
            const aggregates = snapshot.docs
                .map(doc => doc.data() as AggregateData)
                .sort((a, b) => a.date.localeCompare(b.date));

            setData(aggregates);
        } catch (error) {
            console.error('Failed to fetch aggregates:', error);
        }
        setLoading(false);
    };

    // Calculate growth rates
    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    const todayData = data[data.length - 1];
    const yesterdayData = data[data.length - 2];
    const weekAgoData = data[data.length - 8];

    const dailyGrowth = todayData && yesterdayData
        ? calculateGrowth(todayData.totalVisitors, yesterdayData.totalVisitors)
        : 0;

    const weeklyGrowth = todayData && weekAgoData
        ? calculateGrowth(todayData.totalVisitors, weekAgoData.totalVisitors)
        : 0;

    const totalVisitors = data.reduce((sum, d) => sum + d.totalVisitors, 0);
    const totalPageViews = data.reduce((sum, d) => sum + d.totalPageViews, 0);
    const avgDuration = data.length > 0
        ? Math.floor(data.reduce((sum, d) => sum + d.avgSessionDuration, 0) / data.length)
        : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Traffic & Growth</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setDateRange('7d')}
                        className={`px-3 py-1 text-sm rounded ${dateRange === '7d' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                        7 Days
                    </button>
                    <button
                        onClick={() => setDateRange('30d')}
                        className={`px-3 py-1 text-sm rounded ${dateRange === '30d' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                        30 Days
                    </button>
                    <button
                        onClick={() => setDateRange('90d')}
                        className={`px-3 py-1 text-sm rounded ${dateRange === '90d' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                        90 Days
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 border-slate-200">
                    <p className="text-sm text-slate-500">Total Visitors</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                        {loading ? '...' : totalVisitors.toLocaleString()}
                    </h3>
                    <div className="flex items-center gap-1 mt-2">
                        {dailyGrowth >= 0 ? (
                            <TrendingUp className="size-4 text-green-600" />
                        ) : (
                            <TrendingDown className="size-4 text-red-600" />
                        )}
                        <span className={`text-xs font-medium ${dailyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {dailyGrowth.toFixed(1)}% vs yesterday
                        </span>
                    </div>
                </Card>

                <Card className="p-4 border-slate-200">
                    <p className="text-sm text-slate-500">Page Views</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                        {loading ? '...' : totalPageViews.toLocaleString()}
                    </h3>
                </Card>

                <Card className="p-4 border-slate-200">
                    <p className="text-sm text-slate-500">Avg Session</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                        {loading ? '...' : `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s`}
                    </h3>
                </Card>

                <Card className="p-4 border-slate-200">
                    <p className="text-sm text-slate-500">Weekly Growth</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                        {loading ? '...' : `${weeklyGrowth >= 0 ? '+' : ''}${weeklyGrowth.toFixed(1)}%`}
                    </h3>
                </Card>
            </div>

            {/* Visitors Over Time */}
            <Card className="p-6 border-slate-200">
                <h3 className="font-bold text-lg mb-4">Visitors Over Time</h3>
                {loading ? (
                    <p className="text-slate-500">Loading...</p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="totalVisitors" stroke="#0ea5e9" name="Total Visitors" />
                            <Line type="monotone" dataKey="uniqueVisitors" stroke="#8b5cf6" name="Unique Visitors" />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </Card>

            {/* New vs Returning Users */}
            <Card className="p-6 border-slate-200">
                <h3 className="font-bold text-lg mb-4">New vs Returning Users</h3>
                {loading ? (
                    <p className="text-slate-500">Loading...</p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="newUsers" fill="#10b981" name="New Users" />
                            <Bar dataKey="returningUsers" fill="#f59e0b" name="Returning Users" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Card>
        </div>
    );
}
