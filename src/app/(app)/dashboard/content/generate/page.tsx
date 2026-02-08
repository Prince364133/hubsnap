"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { generateDailyContentAction } from "@/app/actions";
import { DailyContent } from "@/lib/ai-logic";
import { Loader2, ArrowLeft, CheckCircle, FileText, Share2 } from "lucide-react";

export default function ContentGeneratorPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>}>
            <ContentGeneratorContent />
        </Suspense>
    );
}

function ContentGeneratorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const topic = searchParams.get("topic");
    const platform = searchParams.get("platform");

    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<DailyContent | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function generate() {
            if (!topic) return;

            // Real generation using topic via Server Action
            try {
                const generated = await generateDailyContentAction(topic);
                setContent(generated);
                setLoading(false);
            } catch (e: any) {
                console.error(e);
                setError(e.message || "Failed to generate content");
                setLoading(false);
            }
        }
        generate();
    }, [topic, platform]);

    if (!topic) return <div>Invalid Context</div>;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Loader2 className="size-10 animate-spin text-primary" />
                <p className="text-lg font-medium animate-pulse">Designing viral script for "{topic}"...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="p-6 border border-red-200 bg-red-50 rounded-lg text-center space-y-2 max-w-md">
                    <p className="text-red-600 font-semibold">Generation Failed</p>
                    <p className="text-sm text-red-500">{error}</p>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2 text-red-600 border-red-200 hover:bg-red-100">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="pl-0 gap-2">
                <ArrowLeft className="size-4" /> Back to Trends
            </Button>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Content Plan: {topic}</h1>
                    <p className="text-text-secondary">Optimized for {platform}</p>
                </div>
                <Button variant="outline">
                    <Share2 className="size-4 mr-2" /> Share / Export
                </Button>
            </div>

            {content && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <Card className="p-6 border-blue-200 bg-blue-50/50">
                            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <FileText className="size-5" /> The Script
                            </h3>
                            <div className="space-y-4 text-sm text-gray-800">
                                <div>
                                    <strong className="block text-xs uppercase text-blue-400 mb-1">Hook</strong>
                                    {content.script.hook}
                                </div>
                                <div>
                                    <strong className="block text-xs uppercase text-blue-400 mb-1">Body</strong>
                                    <span className="whitespace-pre-line">{content.script.body}</span>
                                </div>
                                <div>
                                    <strong className="block text-xs uppercase text-blue-400 mb-1">CTA</strong>
                                    {content.script.cta}
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="font-bold text-gray-900 mb-2">Monetization Strategy</h3>
                            <p className="text-sm font-medium mb-1">{content.monetization.instruction}</p>
                            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                                ⚠️ {content.monetization.ethicalWarning}
                            </p>
                        </Card>
                    </div>

                    <Card className="p-6 h-fit space-y-6">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Filming Checklist (SOP)</h3>
                            <div className="space-y-3">
                                {content.sop.shots.map((shot, i) => (
                                    <div key={i} className="flex gap-3 text-sm">
                                        <div className="size-5 rounded-full border border-gray-300 flex items-center justify-center shrink-0 text-xs text-gray-500">
                                            {i + 1}
                                        </div>
                                        <span className="text-text-secondary">{shot}</span>
                                    </div>
                                ))}
                                <div className="my-4 border-t" />
                                <span className="text-xs font-semibold text-gray-500 uppercase">Text Overlays</span>
                                {content.sop.textOverlays.map((txt, i) => (
                                    <div key={i} className="flex gap-3 text-sm">
                                        <CheckCircle className="size-5 text-green-500 shrink-0" />
                                        <span className="font-mono bg-gray-100 px-2 rounded text-gray-700">"{txt}"</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image Prompts Section */}
                        {typeof content.imagePrompts !== 'undefined' && content.imagePrompts.length > 0 && (
                            <div className="pt-4 border-t">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="size-4" /> Image Prompts
                                </h3>
                                <div className="space-y-3">
                                    {content.imagePrompts.map((prompt, i) => (
                                        <div key={i} className="bg-gray-50 p-3 rounded text-xs text-gray-600 group relative border border-gray-200">
                                            <p className="pr-6">{prompt}</p>
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
                                                <CheckCircle className="size-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white">
                            Mark Scriped & Ready
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
}
