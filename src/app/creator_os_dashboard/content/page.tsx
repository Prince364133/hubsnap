"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dbService, ContentHistoryItem } from "@/lib/firestore";
import { getHistoryAnalyticsAction } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
    Search, Filter, Calendar, ArrowUpRight, FileText,
    Youtube, Instagram, Linkedin, Twitter,
    Clock, RefreshCw, BarChart3, TrendingUp, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Helper to format date
const formatDate = (date: any) => {
    if (!date) return "Unknown";
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
};

const getLast14Days = () => {
    const dates = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
};

export default function ContentDashboardPage() {
    const { user } = useAuth();
    const [history, setHistory] = useState<ContentHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [platformFilter, setPlatformFilter] = useState("all");
    const [stats, setStats] = useState<any>(null);

    // Fetch History & Analytics
    useEffect(() => {
        async function loadData() {
            if (!user) return;
            setLoading(true);
            try {
                // 1. Fetch simplified history list
                const items = await dbService.getContentHistory(user.uid);
                setHistory(items);

                // 2. Fetch analytics (Python)
                const payloadItems = items.map(i => ({
                    text: i.type === 'script' ? (i.content.script?.hook + " " + i.content.script?.body) : i.title,
                    date: i.createdAt?.toDate ? i.createdAt.toDate().toISOString() : new Date().toISOString(),
                    type: i.type
                }));

                if (payloadItems.length > 0) {
                    const analyticsData = await getHistoryAnalyticsAction(payloadItems);
                    if (analyticsData) setStats(analyticsData);
                }

            } catch (e) {
                console.error("Failed to load history data", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user]);

    // Filter Logic
    const filteredHistory = history.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.type && item.type.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = typeFilter === "all" || item.type === typeFilter;
        const matchesPlatform = platformFilter === "all" || item.platform === platformFilter;
        return matchesSearch && matchesType && matchesPlatform;
    });

    const getPlatformIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'youtube': return <Youtube className="size-4 text-red-600" />;
            case 'instagram': return <Instagram className="size-4 text-pink-600" />;
            case 'linkedin': return <Linkedin className="size-4 text-blue-700" />;
            case 'twitter': return <Twitter className="size-4 text-blue-400" />;
            default: return <FileText className="size-4 text-gray-500" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'script': return "bg-blue-100 text-blue-700";
            case 'idea': return "bg-yellow-100 text-yellow-700";
            case 'image_prompt': return "bg-purple-100 text-purple-700";
            case 'mixed': return "bg-green-100 text-green-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    // Visualization Data
    const last14Days = getLast14Days();
    const maxDailyCount = stats?.frequency_stats?.daily ? Math.max(...Object.values(stats.frequency_stats.daily).map((v: any) => Number(v)), 1) : 1;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Content Dashboard</h1>
                    <p className="text-gray-500">Analytics, history, and insights for your creative journey.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        <RefreshCw className="size-4 mr-2" /> Refresh Data
                    </Button>
                    <Link href="/creator_os_dashboard/content-mode">
                        <Button className="bg-primary text-white shadow-lg hover:shadow-xl transition-all">
                            <Zap className="size-4 mr-2" /> Create New
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Assets */}
                <Card className="p-5 flex items-center gap-4 border-l-4 border-l-blue-500">
                    <div className="size-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <FileText className="size-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Generated</p>
                        <h3 className="text-2xl font-black text-gray-900">{history.length}</h3>
                    </div>
                </Card>

                {/* Readability Score */}
                <Card className="p-5 flex items-center gap-4 border-l-4 border-l-purple-500">
                    <div className="size-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <ArrowUpRight className="size-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Avg. Readability</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats?.avg_readability || "--"}%</h3>
                    </div>
                </Card>

                {/* Top Keyword */}
                <Card className="p-5 flex items-center gap-4 border-l-4 border-l-orange-500">
                    <div className="size-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <TrendingUp className="size-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Top Theme</p>
                        <h3 className="text-xl font-black text-gray-900 capitalize truncate max-w-[120px]" title={stats?.top_keywords?.[0]}>
                            {stats?.top_keywords?.[0] || "--"}
                        </h3>
                    </div>
                </Card>

                {/* Last Activity */}
                <Card className="p-5 flex items-center gap-4 border-l-4 border-l-green-500">
                    <div className="size-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <Clock className="size-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Last Active</p>
                        <h3 className="text-lg font-bold text-gray-900">
                            {history.length > 0 ? formatDate(history[0].createdAt) : "-"}
                        </h3>
                    </div>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Frequency Chart - Daily (Last 14 Days) */}
                <Card className="p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <BarChart3 className="size-5 text-gray-500" />
                            Creation Frequency (Last 14 Days)
                        </h3>
                    </div>

                    {stats?.frequency_stats?.daily ? (
                        <div className="h-48 flex items-end justify-between gap-2 px-2">
                            {last14Days.map((date) => {
                                const count = stats.frequency_stats.daily[date] || 0;
                                const heightPercent = (count / maxDailyCount) * 100;
                                const dayLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });

                                return (
                                    <div key={date} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="relative w-full bg-gray-100 rounded-t-md overflow-hidden h-32 flex items-end">
                                            <div
                                                className="w-full bg-primary transition-all duration-300 group-hover:bg-primary/80"
                                                style={{ height: `${heightPercent}%` }}
                                            ></div>
                                            {/* Tooltip */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {count} items
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-500 uppercase font-bold">{dayLabel}</span>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                            Generate content to see your frequency data.
                        </div>
                    )}
                </Card>

                {/* Content Breakdown */}
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FileText className="size-5 text-gray-500" />
                        Type Breakdown
                    </h3>
                    {stats && stats.type_breakdown ? (
                        <div className="space-y-4">
                            {Object.entries(stats.type_breakdown).map(([type, count]: [string, any]) => {
                                const percentage = Math.round((count / stats.total) * 100);
                                return (
                                    <div key={type}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="capitalize font-medium text-gray-700">{type.replace('_', ' ')}</span>
                                            <span className="text-gray-500">{count} ({percentage}%)</span>
                                        </div>
                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full", getTypeColor(type).split(' ')[0].replace('bg-', 'bg-opacity-100 bg-'))}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-400 text-sm">No data available</div>
                    )}
                </Card>
            </div>

            {/* List Header */}
            <div className="flex items-center gap-2 mt-8">
                <h2 className="text-xl font-bold text-gray-900">Recent Content</h2>
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">{filteredHistory.length}</Badge>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                        placeholder="Search by title, topic, or keyword..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <select
                            className="h-10 pl-3 pr-8 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="script">Scripts</option>
                            <option value="idea">Ideas</option>
                            <option value="outline">Outlines</option>
                            <option value="image_prompt">Image Prompts</option>
                            <option value="mixed">Mixed Packs</option>
                        </select>
                    </div>
                    <div className="relative">
                        <select
                            className="h-10 pl-3 pr-8 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={platformFilter}
                            onChange={(e) => setPlatformFilter(e.target.value)}
                        >
                            <option value="all">All Platforms</option>
                            <option value="youtube">YouTube</option>
                            <option value="instagram">Instagram</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="twitter">Twitter</option>
                            <option value="blog">Blog</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content List & Empty State */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading your creative history...</p>
                </div>
            ) : filteredHistory.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <FileText className="size-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No content found</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">You haven't generated any content yet, or your filters are too restrictive.</p>
                    <Link href="/creator_os_dashboard/content-mode">
                        <Button>Generate Your First Piece</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHistory.map((item) => (
                        <Card key={item.id} className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary overflow-hidden cursor-pointer bg-white">
                            <div className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <Badge className={cn("capitalize px-2 py-0.5", getTypeColor(item.type))}>
                                        {item.type.replace('_', ' ')}
                                    </Badge>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        {getPlatformIcon(item.platform)}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 min-h-[48px]" title={item.title}>
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                        <Clock className="size-3" />
                                        {formatDate(item.createdAt)}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs font-mono text-gray-400 uppercase">
                                        {item.metadata?.lang || 'EN'} • {item.metadata?.mode || 'Auto'}
                                    </span>
                                    <Button size="sm" variant="ghost" className="h-8 text-primary hover:text-primary hover:bg-primary/10">
                                        View Details <ArrowUpRight className="size-3 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
