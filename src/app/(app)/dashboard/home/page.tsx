"use client";

import { useEffect, useState } from "react";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ChannelCard } from "@/components/dashboard/ChannelCard";
import { AddChannelButton } from "@/components/dashboard/AddChannelButton";
import { dbService, UserProfile, Channel, ChannelStats } from "@/lib/firestore";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            // Demo user ID
            const userId = "demo_user";
            const profileData = await dbService.getUserProfile(userId);
            const channelsData = await dbService.getChannels(userId);

            setProfile(profileData);
            setChannels(channelsData);
            setLoading(false);
        }
        loadData();
    }, []);

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
        totalFollowers: channels.reduce((acc, c) => acc + c.stats.followers, 0),
        totalPosts: channels.reduce((acc, c) => acc + c.stats.posts, 0)
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
                <p className="text-text-secondary mt-2">Overview of your creator empire.</p>
            </div>

            <DashboardStats stats={stats} />

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-text-primary">Your Profiles</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {channels.map((channel) => (
                        <ChannelCard key={channel.id} channel={channel} />
                    ))}
                    <AddChannelButton />
                </div>
            </div>

            {/* Fallback/Empty State if needed, but AddChannelButton handles it physically in the grid */}
        </div>
    );
}
