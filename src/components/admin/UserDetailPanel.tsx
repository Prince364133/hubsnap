"use client";

import { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { X, User, Clock, BarChart3, Settings, TrendingUp, MapPin, Smartphone } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase';

type Tab = 'overview' | 'timeline' | 'analytics' | 'actions';

interface UserDetailPanelProps {
    user: UserProfile;
    onClose: () => void;
}

export default function UserDetailPanel({ user, onClose }: UserDetailPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loadingTimeline, setLoadingTimeline] = useState(false);

    const tabs = [
        { id: 'overview' as Tab, label: 'Overview', icon: User },
        { id: 'timeline' as Tab, label: 'Timeline', icon: Clock },
        { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
        { id: 'actions' as Tab, label: 'Actions', icon: Settings }
    ];

    useEffect(() => {
        if (activeTab === 'timeline' && timeline.length === 0) {
            fetchTimeline();
        }
    }, [activeTab]);

    const fetchTimeline = async () => {
        setLoadingTimeline(true);
        try {
            const functions = getFunctions(app);
            const getTimeline = httpsCallable(functions, 'getUserActivityTimeline');
            const result = await getTimeline({ userId: user.id, limit: 50 }) as any;
            setTimeline(result.data.events || []);
        } catch (error) {
            console.error('Error fetching timeline:', error);
        }
        setLoadingTimeline(false);
    };

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="border-b border-slate-200 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg uppercase">
                            {user.name?.[0] || user.email?.[0] || "?"}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{user.name || "Unknown User"}</h2>
                            <p className="text-sm text-slate-600">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="size-5 text-slate-600" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 px-6">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                                        ${isActive
                                            ? 'border-sky-500 text-sky-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                        }
                                    `}
                                >
                                    <Icon className={`size-4 ${isActive ? 'text-sky-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <Card className="p-4 border-slate-200">
                                    <p className="text-sm text-slate-600 mb-1">Engagement Score</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {user.activitySummary?.engagementScore || 0}
                                    </p>
                                    <div className="mt-2 bg-slate-200 rounded-full h-2">
                                        <div
                                            className="bg-sky-500 h-2 rounded-full"
                                            style={{ width: `${user.activitySummary?.engagementScore || 0}%` }}
                                        />
                                    </div>
                                </Card>
                                <Card className="p-4 border-slate-200">
                                    <p className="text-sm text-slate-600 mb-1">Total Sessions</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {user.activitySummary?.totalSessions || 0}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {user.metrics?.sessionCount7d || 0} in last 7 days
                                    </p>
                                </Card>
                                <Card className="p-4 border-slate-200">
                                    <p className="text-sm text-slate-600 mb-1">Avg Session</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {Math.round((user.activitySummary?.avgSessionDuration || 0) / 60)}m
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Duration</p>
                                </Card>
                            </div>

                            {/* User Info */}
                            <Card className="p-6 border-slate-200">
                                <h3 className="font-bold text-slate-900 mb-4">User Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-600 mb-1">Status</p>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.status === 'highly_active' ? 'bg-green-100 text-green-700' :
                                                user.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                                    user.status === 'at_risk' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-slate-100 text-slate-600'
                                            }`}>
                                            {user.status?.replace('_', ' ').toUpperCase() || 'INACTIVE'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-slate-600 mb-1">Plan</p>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.plan === 'pro_plus' ? 'bg-purple-100 text-purple-700' :
                                                user.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>
                                            {user.plan === 'pro_plus' ? 'Pro+' : user.plan?.toUpperCase() || 'FREE'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-slate-600 mb-1">Wallet Balance</p>
                                        <p className="font-mono font-medium text-slate-900">₹{user.walletBalance || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-600 mb-1">Referral Code</p>
                                        <code className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-900">
                                            {user.referralCode || "-"}
                                        </code>
                                    </div>
                                    <div>
                                        <p className="text-slate-600 mb-1">Joined</p>
                                        <p className="text-slate-900">
                                            {user.createdAt ? formatTimestamp(user.createdAt) : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-600 mb-1">Last Active</p>
                                        <p className="text-slate-900">
                                            {formatTimestamp(user.activitySummary?.lastActive)}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Activity Trend */}
                            <Card className="p-6 border-slate-200">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="size-5" />
                                    Activity Trend
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className={`px-3 py-2 rounded-lg ${user.metrics?.activityTrend === 'growing' ? 'bg-green-100 text-green-700' :
                                            user.metrics?.activityTrend === 'declining' ? 'bg-red-100 text-red-700' :
                                                'bg-slate-100 text-slate-700'
                                        }`}>
                                        {user.metrics?.activityTrend?.toUpperCase() || 'STABLE'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-600">
                                            Most visited: <span className="font-medium text-slate-900">{user.activitySummary?.mostVisitedPage || 'N/A'}</span>
                                        </p>
                                        <p className="text-sm text-slate-600 mt-1">
                                            Device: <span className="font-medium text-slate-900">{user.activitySummary?.deviceType || 'Unknown'}</span>
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Timeline Tab */}
                    {activeTab === 'timeline' && (
                        <div className="space-y-4">
                            {loadingTimeline ? (
                                <p className="text-center text-slate-500 py-8">Loading timeline...</p>
                            ) : timeline.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No activity recorded yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {timeline.map((event, index) => (
                                        <Card key={index} className="p-4 border-slate-200">
                                            <div className="flex items-start gap-3">
                                                <div className="size-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                                                    <Clock className="size-4 text-sky-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-900">{event.type?.replace('_', ' ').toUpperCase()}</p>
                                                    <p className="text-sm text-slate-600">{event.page || 'Unknown page'}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{formatTimestamp(event.timestamp)}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <Card className="p-6 border-slate-200">
                                <h3 className="font-bold text-slate-900 mb-4">Session Metrics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-600 mb-1">Last 7 Days</p>
                                        <p className="text-2xl font-bold text-slate-900">{user.metrics?.sessionCount7d || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 mb-1">Last 30 Days</p>
                                        <p className="text-2xl font-bold text-slate-900">{user.metrics?.sessionCount30d || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 mb-1">Total Page Views</p>
                                        <p className="text-2xl font-bold text-slate-900">{user.activitySummary?.totalPageViews || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 mb-1">Avg Session Duration</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {Math.round((user.activitySummary?.avgSessionDuration || 0) / 60)}m
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6 border-slate-200">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Smartphone className="size-5" />
                                    Device & Location
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-slate-600 mb-1">Primary Device</p>
                                        <p className="text-slate-900 font-medium capitalize">{user.activitySummary?.deviceType || 'Unknown'}</p>
                                    </div>
                                    {user.activitySummary?.location && (
                                        <div>
                                            <p className="text-sm text-slate-600 mb-1 flex items-center gap-1">
                                                <MapPin className="size-4" />
                                                Location
                                            </p>
                                            <p className="text-slate-900 font-medium">
                                                {user.activitySummary.location.state ?
                                                    `${user.activitySummary.location.state}, ${user.activitySummary.location.country}` :
                                                    user.activitySummary.location.country
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Actions Tab */}
                    {activeTab === 'actions' && (
                        <div className="space-y-4">
                            <Card className="p-6 border-slate-200">
                                <h3 className="font-bold text-slate-900 mb-4">User Actions</h3>
                                <div className="space-y-3">
                                    <Button className="w-full" variant="outline">
                                        Send Notification
                                    </Button>
                                    <Button className="w-full" variant="outline">
                                        Adjust Wallet Balance
                                    </Button>
                                    <Button className="w-full" variant="outline">
                                        Change Plan
                                    </Button>
                                    <Button className="w-full text-red-600 border-red-600 hover:bg-red-50" variant="outline">
                                        Suspend Account
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
