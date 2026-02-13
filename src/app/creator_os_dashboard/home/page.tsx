"use client";

import { useEffect, useState } from "react";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ChannelCard } from "@/components/dashboard/ChannelCard";
import { AddChannelButton } from "@/components/dashboard/AddChannelButton";
import { dbService, UserProfile, Channel, ChannelStats } from "@/lib/firestore";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
    const { user, profile } = useAuth();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [filterPlatform, setFilterPlatform] = useState<'all' | 'youtube' | 'instagram'>('all');
    const [loading, setLoading] = useState(true);
    const [historyCount, setHistoryCount] = useState(0);

    useEffect(() => {
        async function loadData() {
            if (user) {
                const [channelsData, historyData] = await Promise.all([
                    dbService.getChannels(user.uid),
                    dbService.getContentHistory(user.uid)
                ]);
                setChannels(channelsData);
                setHistoryCount(historyData.length);
                setLoading(false);
            }
        }
        if (user !== undefined) {
            loadData();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    // Calculate aggregated stats
    const stats: ChannelStats = {
        totalChannels: channels.length,
        youtubeChannels: channels.filter(c => c.platform === 'youtube').length,
        instagramPages: channels.filter(c => c.platform === 'instagram').length,
        totalFollowers: channels.reduce((acc, c) => acc + c.stats.followers, 0),
        totalPosts: channels.reduce((acc, c) => acc + (c.stats.posts || 0), 0) + historyCount
    };

    const filteredChannels = filterPlatform === 'all'
        ? channels
        : channels.filter(c => c.platform === filterPlatform);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
                <p className="text-text-secondary mt-2">Overview of your creator empire.</p>
            </div>

            <DashboardStats
                stats={stats}
                activePlatform={filterPlatform}
                onPlatformSelect={setFilterPlatform}
            />

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-text-primary">Your Profiles</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredChannels.map((channel) => (
                        <ChannelCard key={channel.id} channel={channel} />
                    ))}
                    {filterPlatform === 'all' && <AddChannelButton />}
                </div>
            </div>

            {/* Fallback/Empty State if needed, but AddChannelButton handles it physically in the grid */}
        </div>
    );
}
