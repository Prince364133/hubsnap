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
    Youtube, Instagram, Linkedin, Twitter, MoreHorizontal,
    Clock, RefreshCw, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns"; // Make sure date-fns is installed, or use native Intl

// Helper to format date if date-fns is missing or we want native
const formatDate = (date: any) => {
    if (!date) return "Unknown";
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
};

export default function ContentHistoryPage() {
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
                // We map items to a format lightweight enough for the payload
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

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Content History</h1>
                    <p className="text-gray-500">Track and manage all your generated content assets.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        <RefreshCw className="size-4 mr-2" /> Refresh
                    </Button>
                    <Link href="/creator_os_dashboard/content-mode">
                        <Button>+ New Content</Button>
                    </Link>
                </div>
            </div>

            {/* Stats Overview (Mock for now, will connect to Python logic later) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-4">
                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <FileText className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Total Assets</p>
                        <h3 className="text-xl font-bold">{history.length}</h3>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="size-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <Clock className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Last Generated</p>
                        <h3 className="text-sm font-bold">{history.length > 0 ? formatDate(history[0].createdAt) : "-"}</h3>
                    </div>
                </Card>
                {/* Placeholder stats for analytics task */}
                <Card className="p-4 flex items-center gap-4">
                    <div className="size-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <ArrowUpRight className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary font-medium uppercase">Avg. Readability</p>
                        <h3 className="text-xl font-bold">{stats?.avg_readability || "--"}%</h3>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="size-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <Calendar className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary font-medium uppercase">Top Keyword</p>
                        <h3 className="text-xl font-bold capitalize">{stats?.top_keywords?.[0] || "--"}</h3>
                    </div>
                </Card>
            </div>

            {/* Analytics Visuals (Expandable if data exists) */}
            {stats && stats.type_breakdown && (
                <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Content Mix</h3>
                    <div className="space-y-3">
                        {Object.entries(stats.type_breakdown).map(([type, count]: [string, any]) => {
                            const percentage = Math.round((count / stats.total) * 100);
                            return (
                                <div key={type} className="flex items-center gap-4">
                                    <div className="w-24 text-sm font-medium text-gray-600 capitalize">{type.replace('_', ' ')}</div>
                                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-500", getTypeColor(type).split(' ')[0].replace('bg-', 'bg-opacity-100 bg-'))}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-12 text-xs text-gray-500 text-right">{count} ({percentage}%)</div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                        placeholder="Search primarily by title..."
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

            {/* Content List */}
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
                        <Card key={item.id} className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary overflow-hidden cursor-pointer">
                            <div className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <Badge className={cn("capitalize px-2 py-0.5", getTypeColor(item.type))}>
                                        {item.type.replace('_', ' ')}
                                    </Badge>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        {getPlatformIcon(item.platform)}
                                        {/* <MoreHorizontal className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" /> */}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1" title={item.title}>
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
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
