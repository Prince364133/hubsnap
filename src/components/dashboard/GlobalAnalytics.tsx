"use client";

import { Card } from "@/components/ui/Card";
import { Channel } from "@/lib/firestore";
import { Users, Video, Activity, Calendar } from "lucide-react";

interface GlobalAnalyticsProps {
    channels: Channel[];
}

export function GlobalAnalytics({ channels }: GlobalAnalyticsProps) {
    // 1. Total Channels
    const totalChannels = channels.length;
    const ytCount = channels.filter(c => c.platform === "youtube").length;
    const instaCount = channels.filter(c => c.platform === "instagram").length;

    // 2. Total Content Generated (Mock for now, normally sum of posts)
    // In real app, we'd query a "posts" collection or sum stats.posts
    const totalContent = channels.reduce((acc, curr) => acc + (curr.stats?.posts || 0), 0);

    // 3. Avg Frequency
    const avgFreq = totalChannels > 0
        ? (channels.reduce((acc, curr) => acc + (curr.schedule?.frequency || 0), 0) / totalChannels).toFixed(1)
        : "0";

    // 4. Total Working Days (Unique days across all channels if overlapping, or just sum? 
    // Requirement says "Total working days", usually implies coverage. Let's show sum of unique days per channel to show workload)
    // Actually, "Total working days" might mean "How many days a week are you active?". 
    // Let's count unique days across all schedules.
    const allDays = new Set(channels.flatMap(c => c.schedule?.workingDays || []));
    const totalDaysActive = allDays.size;

    const stats = [
        {
            label: "Total Profiles",
            value: totalChannels,
            sub: `${ytCount} YT / ${instaCount} IG`,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "Content Generated",
            value: totalContent,
            sub: "All time",
            icon: Video,
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            label: "Avg. Frequency",
            value: avgFreq,
            sub: "Videos / Week",
            icon: Activity,
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            label: "Active Days",
            value: `${totalDaysActive}/7`,
            sub: "Weekly Schedule",
            icon: Calendar,
            color: "text-orange-600",
            bg: "bg-orange-50"
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
                <Card key={i} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className={`p-3 rounded-full ${stat.bg}`}>
                        <stat.icon className={`size-6 ${stat.color}`} />
                    </div>
                    <div>
                        <p className="text-text-secondary text-sm font-medium">{stat.label}</p>
                        <h4 className="text-2xl font-bold text-gray-900">{stat.value}</h4>
                        <p className="text-xs text-gray-400">{stat.sub}</p>
                    </div>
                </Card>
            ))}
        </div>
    );
}
