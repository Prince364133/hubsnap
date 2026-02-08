"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { trendsInfo, Trend } from "@/lib/trends";
import { dbService } from "@/lib/firestore";
import { Loader2, TrendingUp, Zap, Youtube, Save } from "lucide-react";

export default function TrendsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [trends, setTrends] = useState<any[]>([]); // Using any for hybrid static/dynamic for now
    const [userNiche, setUserNiche] = useState("General");

    useEffect(() => {
        async function loadTrends() {
            // Fetch real user niche
            const profile = await dbService.getUserProfile("demo_user");
            const niche = profile?.onboarding?.interests?.[0] || "General";
            setUserNiche(niche);

            const staticTrends = await trendsInfo.fetchTrends(niche);

            // Merge Dynamic (Firestore) + Static
            const dynamicTrends = await dbService.getTrends().catch(() => []);

            // Normalize Dynamic Trends to match Trend interface if needed
            const normalizedDynamic = dynamicTrends.map(t => ({
                id: t.id,
                keyword: t.title,
                relevance: t.description,
                platform: "Youtube", // Default
                volume: t.volume,
                difficulty: t.difficulty,
                freshness: "New", // Default
                category: t.category
            }));

            setTrends([...normalizedDynamic, ...staticTrends]);
            setLoading(false);
        }
        loadTrends();
    }, []);

    const handleGenerate = (trend: Trend) => {
        // Redirect to Day 1 Content Pack generator with this trend as the prompt
        // We'll use the existing page but pass params
        router.push(`/dashboard/content/day-1?ideaId=${encodeURIComponent(trend.id)}&name=${encodeURIComponent(trend.keyword)}&mode=trend`);
    };

    const handleSave = async (trend: Trend) => {
        const success = await dbService.saveSavedItem("demo_user", {
            type: "trend",
            title: trend.keyword,
            notes: `Freshness: ${trend.freshness} | Platform: ${trend.platform}`,
            tags: [userNiche, "Trend"],
            originalData: trend
        });
        if (success) {
            alert(`Saved "${trend.keyword}" to vault!`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-20">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Trend Finder</h1>
                    <p className="text-text-secondary">Real-time opportunities for <strong>{userNiche}</strong>.</p>
                </div>
                <div className="text-sm text-text-secondary flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live Data
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trends.map((trend) => (
                    <Card key={trend.id} className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${trend.freshness === "New" ? "bg-green-100 text-green-700" :
                                    trend.freshness === "Rising" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                                    }`}>
                                    {trend.freshness}
                                </span>
                                <TrendingUp className="size-4 text-gray-400" />
                            </div>

                            <h3 className="text-lg font-bold mb-2">{trend.keyword}</h3>
                            <p className="text-sm text-text-secondary mb-4">{trend.relevance}</p>

                            <div className="flex items-center gap-2 text-xs text-text-secondary mb-6">
                                <Youtube className="size-3" />
                                {trend.platform} • {trend.volume} Vol
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button className="flex-1 gap-2" onClick={() => handleGenerate(trend)}>
                                <Zap className="size-4" /> Generate
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleSave(trend)}>
                                <Save className="size-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
