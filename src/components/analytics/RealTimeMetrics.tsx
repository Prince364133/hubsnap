"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Users, Activity, Clock, Eye } from 'lucide-react';
import { analyticsClient } from '@/lib/analytics-client';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase';

interface ActiveUserData {
    totalActive: number;
    loggedInUsers: number;
    anonymousUsers: number;
    sessions: Array<{
        sessionId: string;
        userId: string | null;
        currentPage: string;
        startTime: number;
        lastActivity: number;
    }>;
    onlineUsers: Array<{
        userId: string;
        currentPage: string;
        lastSeen: number;
        sessionId: string;
    }>;
}

export default function RealTimeMetrics() {
    const [activeData, setActiveData] = useState<ActiveUserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to active users count
        const unsubscribe = analyticsClient.subscribeToActiveUsers((count) => {
            // Fetch full active user data
            fetchActiveUsers();
        });

        // Initial fetch
        fetchActiveUsers();

        // Refresh every 10 seconds
        const interval = setInterval(fetchActiveUsers, 10000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const fetchActiveUsers = async () => {
        try {
            const functions = getFunctions(app);
            const getActiveUsersFn = httpsCallable(functions, 'getActiveUsers');
            const result = await getActiveUsersFn({});
            setActiveData(result.data as ActiveUserData);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch active users:', error);
            setLoading(false);
        }
    };

    // Calculate page distribution
    const pageDistribution = activeData?.sessions.reduce((acc, session) => {
        const page = session.currentPage || '/';
        acc[page] = (acc[page] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    const topPages = Object.entries(pageDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    // Calculate average session duration
    const avgDuration = activeData?.sessions.length
        ? Math.floor(
            activeData.sessions.reduce((sum, s) => {
                const duration = (Date.now() - s.startTime) / 1000;
                return sum + duration;
            }, 0) / activeData.sessions.length
        )
        : 0;

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Real-Time Metrics</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Active Visitors</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                {loading ? '...' : activeData?.totalActive || 0}
                            </h3>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <Activity className="size-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Logged In</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                {loading ? '...' : activeData?.loggedInUsers || 0}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Users className="size-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Anonymous</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                {loading ? '...' : activeData?.anonymousUsers || 0}
                            </h3>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Eye className="size-6 text-purple-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Avg Duration</p>
                            <h3 className="text-lg font-bold text-slate-900 mt-1">
                                {loading ? '...' : formatDuration(avgDuration)}
                            </h3>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <Clock className="size-6 text-orange-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Current Page Distribution */}
            <Card className="p-6 border-slate-200">
                <h3 className="font-bold text-lg mb-4">Current Page Distribution</h3>
                {loading ? (
                    <p className="text-slate-500">Loading...</p>
                ) : topPages.length === 0 ? (
                    <p className="text-slate-500">No active sessions</p>
                ) : (
                    <div className="space-y-3">
                        {topPages.map(([page, count]) => (
                            <div key={page} className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="font-medium text-sm text-slate-700">{page}</p>
                                    <div className="mt-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-sky-500 h-full transition-all"
                                            style={{
                                                width: `${(count / (activeData?.totalActive || 1)) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                                <span className="ml-4 text-sm font-bold text-slate-900">{count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Active Sessions List */}
            <Card className="p-6 border-slate-200">
                <h3 className="font-bold text-lg mb-4">Active Sessions</h3>
                {loading ? (
                    <p className="text-slate-500">Loading...</p>
                ) : !activeData?.sessions.length ? (
                    <p className="text-slate-500">No active sessions</p>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {activeData.sessions.map((session) => {
                            const duration = Math.floor((Date.now() - session.startTime) / 1000);
                            const isIdle = (Date.now() - session.lastActivity) > 60000; // 1 minute

                            return (
                                <div
                                    key={session.sessionId}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`size-2 rounded-full ${isIdle ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">
                                                {session.userId ? `User: ${session.userId.slice(0, 8)}...` : 'Anonymous'}
                                            </p>
                                            <p className="text-xs text-slate-500">{session.currentPage}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500">{formatDuration(duration)}</p>
                                        {isIdle && <p className="text-xs text-yellow-600">Idle</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
}
