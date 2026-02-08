"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CHANNEL_IDEAS } from "@/lib/data";
import { generateDailyContentAction } from "@/app/actions";
import { DailyContent } from "@/lib/ai-logic";
import {
    Copy, Camera, CheckSquare, Upload, FileText, Music,
    Image as ImageIcon, Video, CheckCircle, AlertTriangle, Loader2, Check
} from "lucide-react";
import { cn } from "@/lib/utils";

function Section({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
    return (
        <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
                    <Icon className="size-4" />
                </div>
                <h3 className="font-semibold text-lg">{title}</h3>
            </div>
            <div className="pt-2">
                {children}
            </div>
        </Card>
    );
}

function Day1Content() {
    const searchParams = useSearchParams();
    const ideaId = searchParams.get("ideaId");
    const paramName = searchParams.get("name");
    const mode = searchParams.get("mode");

    // Try to find in static DB, OR create a transient idea object from params
    const staticIdea = CHANNEL_IDEAS.find(i => i.id === ideaId);

    // Construct a usable Idea object even if static lookup fails
    const idea = staticIdea || (paramName ? {
        id: ideaId || "custom",
        name: paramName,
        description: "Custom generated trend",
        contentType: "Mixed",
        growthPattern: "Fast",
        skillLevel: "Medium"
    } : null);

    const [activeTab, setActiveTab] = useState<"pack" | "progress">("pack");

    // AI State
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<DailyContent | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadContent() {
            if (!idea) return;
            try {
                // Generate fresh content for this idea
                const generated = await generateDailyContentAction(idea.name);
                setContent(generated);
                setLoading(false);
            } catch (e: any) {
                console.error(e);
                setError(e.message || "Failed to generate pack");
                setLoading(false);
            }
        }
        loadContent();
    }, [idea, mode]);

    if (!idea) return <div className="p-10 text-center text-red-500">Invalid Context: Missing Topic Data</div>;

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto space-y-8 mb-20 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="size-10 animate-spin text-primary" />
                <p className="text-text-secondary animate-pulse">Generating your Day 1 Content Pack with AI...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-5xl mx-auto p-10 text-center text-red-500 border border-red-200 bg-red-50 rounded-lg">
                <p className="font-bold">Generation Failed</p>
                <p className="text-sm pb-4">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    if (!content) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-8 mb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Day 1 Challenge</span>
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary">Your First Video: "{idea.name} 101"</h1>
                    <p className="text-text-secondary">Execute this packet today. Don't overthink it.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-100 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Est. Time: ~45 Mins
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab("pack")}
                            className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all", activeTab === "pack" ? "bg-white shadow-sm text-text-primary" : "text-text-secondary hover:text-text-primary")}
                        >
                            Content Pack
                        </button>
                        <button
                            onClick={() => setActiveTab("progress")}
                            className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all", activeTab === "progress" ? "bg-white shadow-sm text-text-primary" : "text-text-secondary hover:text-text-primary")}
                        >
                            Tracker
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {activeTab === "pack" ? (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Content Assets */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Script Section */}
                        <Card className="p-6 border-l-4 border-l-primary">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <FileText className="size-5 text-gray-400" />
                                The Script
                            </h2>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg border border-border">
                                    <span className="text-xs font-bold text-red-500 uppercase block mb-1">The Hook</span>
                                    <p className="text-sm font-medium">{content.script.hook}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-border">
                                    <span className="text-xs font-bold text-blue-500 uppercase block mb-1">The Body</span>
                                    <p className="text-sm text-gray-700 whitespace-pre-line">{content.script.body}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-border">
                                    <span className="text-xs font-bold text-green-500 uppercase block mb-1">Call to Action</span>
                                    <p className="text-sm font-medium">{content.script.cta}</p>
                                </div>
                            </div>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Section title="Image Prompts" icon={ImageIcon}>
                                <div className="space-y-3">
                                    {content.imagePrompts?.map((prompt, i) => (
                                        <div key={i} className="bg-gray-50 p-2 rounded text-xs text-gray-600 group relative border border-gray-200">
                                            <p className="pr-6 line-clamp-3 hover:line-clamp-none">{prompt}</p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(prompt);
                                                    alert("Prompt copied!");
                                                }}
                                            >
                                                <Check className="size-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    {(!content.imagePrompts || content.imagePrompts.length === 0) && (
                                        <p className="text-xs text-text-secondary">No specific prompts generated.</p>
                                    )}
                                </div>
                                <p className="text-xs text-center text-gray-400 mt-2">Copy to external generator.</p>
                            </Section>

                            <Section title="Stock Video Search" icon={Video}>
                                <ul className="list-disc list-inside space-y-2 text-sm text-text-secondary">
                                    {content.sop.shots.slice(0, 3).map((shot, i) => (
                                        <li key={i}>{shot}</li>
                                    ))}
                                </ul>
                            </Section>
                        </div>

                        <Section title="Monetization" icon={Music}>
                            <div className="space-y-2">
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <span className="block text-xs uppercase text-green-600 font-bold mb-1">{content.monetization.type}</span>
                                    <p className="text-sm font-medium">{content.monetization.instruction}</p>
                                </div>
                                <p className="text-xs text-amber-600">⚠️ {content.monetization.ethicalWarning}</p>
                            </div>
                        </Section>
                    </div>

                    {/* Right Column: Mistakes & Tips */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="p-6 border-red-100 bg-red-50/20">
                            <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                                <AlertTriangle className="size-4 text-red-500" /> Production SOP
                            </h3>
                            <ul className="space-y-2 text-sm text-red-800">
                                {content.sop.textOverlays.map((overlay, i) => (
                                    <li key={i} className="flex gap-2">
                                        <CheckCircle className="size-4 shrink-0" />
                                        <span>Use overlay: "{overlay}"</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <div className="p-4 bg-gray-100 rounded-lg text-center">
                            <p className="text-sm text-gray-500 mb-2">Need a fresh start?</p>
                            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 border-gray-300">
                                Regenerate Pack
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 max-w-2xl mx-auto">
                    <Card className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="size-10 rounded-full border-2 border-gray-200 flex items-center justify-center">
                            <CheckSquare className="size-5 text-gray-300" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium">Save Script & Assets</h4>
                            <p className="text-xs text-text-secondary">Gather everything you need before starting.</p>
                        </div>
                        <Button variant="outline" size="sm">Mark Done</Button>
                    </Card>
                    <Card className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="size-10 rounded-full border-2 border-gray-200 flex items-center justify-center">
                            <Camera className="size-5 text-gray-300" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium">Record / Generate Footage</h4>
                            <p className="text-xs text-text-secondary">Shoot your A-roll or generate AI clips.</p>
                        </div>
                        <Button variant="outline" size="sm">Mark Done</Button>
                    </Card>
                    <Card className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="size-10 rounded-full border-2 border-gray-200 flex items-center justify-center">
                            <Upload className="size-5 text-gray-300" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium">Edit & Upload</h4>
                            <p className="text-xs text-text-secondary">Put it together and hit publish.</p>
                        </div>
                        <Button variant="outline" size="sm">Mark Done</Button>
                    </Card>

                    <Card className="p-6 mt-8 bg-green-50 border-green-100">
                        <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                            <CheckCircle className="size-5 text-green-600" /> Progress
                        </h3>
                        <div className="h-2 w-full bg-green-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-600 w-[10%]"></div>
                        </div>
                        <p className="text-xs text-green-700 mt-2 text-right">10% Complete</p>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default function Day1ContentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Day1Content />
        </Suspense>
    );
}
