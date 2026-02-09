"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ExternalLink, Mic, Image, Video, Wand2, Search, Wrench } from "lucide-react";
import { dbService, Tool } from "@/lib/firestore";
import { Badge } from "@/components/ui/Badge";

export default function ToolsPage() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTools();
    }, []);

    const loadTools = async () => {
        setLoading(true);
        try {
            const data = await dbService.getTools(true);
            setTools(data);
        } catch (error) {
            console.error("Error loading tools:", error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (category: string) => {
        const lower = category.toLowerCase();
        if (lower.includes("video")) return Video;
        if (lower.includes("audio") || lower.includes("voice")) return Mic;
        if (lower.includes("image") || lower.includes("stock")) return Image;
        if (lower.includes("design") || lower.includes("thumbnail")) return Wand2;
        return Wrench;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-text-primary">Curated Toolkit</h1>
                <p className="text-text-secondary">The essential stack for modern creators. No fluff, just what works.</p>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-text-secondary">Loading tools...</p>
                </div>
            ) : tools.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-text-secondary">No tools found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tools.map((tool) => {
                        const Icon = getIcon(tool.categories?.[0] || "");
                        return (
                            <Card key={tool.id} className="p-6 hover:border-primary transition-colors flex gap-4">
                                <div className="size-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                                    <Icon className="size-6 text-gray-700" />
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">{tool.name}</h3>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {tool.categories?.slice(0, 2).map((cat, i) => (
                                                    <span key={i} className="text-xs font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded">
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {tool.website && (
                                            <a href={tool.website} target="_blank" rel="noopener noreferrer">
                                                <Button variant="ghost" size="icon" className="size-8">
                                                    <ExternalLink className="size-4 text-gray-400" />
                                                </Button>
                                            </a>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {tool.shortDesc}
                                    </p>

                                    <div className="pt-2 flex flex-wrap gap-2">
                                        <Badge variant={tool.pricingModel === "FREE" ? "default" : "secondary"} className="text-xs">
                                            {tool.pricingModel}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {tool.accessType}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
