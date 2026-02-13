"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { dbService, Guide } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { ArrowLeft, Check, Lock, Star, Clock, Calendar, Bookmark, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GuideDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const { user, loading: authLoading } = useAuth();
    const [guide, setGuide] = useState<Guide | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (id) {
            loadGuide();
        }
    }, [id]);

    const loadGuide = async () => {
        setLoading(true);
        const data = await dbService.getGuide(id);
        setGuide(data);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!user) {
            toast.error("Please login to save this idea");
            router.push("/login?redirect=/digital-business-ideas/" + id);
            return;
        }
        if (!guide) return;

        setSaving(true);
        const success = await dbService.saveSavedItem(user.uid, {
            type: 'guide',
            data: guide
        });
        setSaving(false);
        if (success) {
            setSaved(true);
            toast.success("Saved to your dashboard!");
        }
    };

    const handleRate = async (rating: number) => {
        if (!user) {
            toast.error("Please login to rate this idea");
            router.push("/login?redirect=/digital-business-ideas/" + id);
            return;
        }
        if (!guide) return;

        const success = await dbService.rateGuide(guide.id, rating, user.uid, guide);
        if (success) {
            toast.success("Thank you for your rating!");
            loadGuide();
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-white text-slate-900 flex flex-col">
                <PublicHeader />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <PublicFooter />
            </div>
        );
    }

    if (!guide) {
        return (
            <div className="min-h-screen bg-white text-slate-900 flex flex-col">
                <PublicHeader />
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <h1 className="text-4xl font-bold">Guide Not Found</h1>
                    <p className="text-slate-500">The business idea you are looking for does not exist.</p>
                    <Link href="/digital-business-ideas">
                        <Button variant="outline">Back to Ideas</Button>
                    </Link>
                </div>
                <PublicFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            <PublicHeader />

            <main className="pt-32 pb-24 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Breadcrumbs / Back */}
                    <Link href="/digital-business-ideas" className="inline-flex items-center text-slate-500 hover:text-primary mb-8 transition-colors">
                        <ArrowLeft className="size-4 mr-2" />
                        Back to Ideas
                    </Link>

                    {/* Header */}
                    <div className="space-y-6 mb-12">
                        <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-blue-50 text-primary border-blue-100 uppercase tracking-wide">
                                {guide.type}
                            </Badge>
                            <Badge variant="outline" className={cn(
                                "uppercase tracking-wide",
                                guide.difficulty === "Beginner" ? "bg-green-50 text-green-700 border-green-100" :
                                    guide.difficulty === "Intermediate" ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                                        "bg-red-50 text-red-700 border-red-100"
                            )}>
                                {guide.difficulty} Level
                            </Badge>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-slate-900">
                            {guide.title}
                        </h1>

                        <div className="flex items-center gap-6 text-slate-500 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => handleRate(star)}
                                            className="hover:scale-110 transition-transform"
                                        >
                                            <Star
                                                className={cn(
                                                    "size-4",
                                                    star <= (guide.averageRating || 0)
                                                        ? "text-amber-400 fill-amber-400"
                                                        : "text-slate-300"
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <span>{guide.averageRating || "No"} Rating ({guide.ratingCount || 0} reviews)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="size-4" />
                                <span>Updated {guide.updatedAt?.toDate?.() ? guide.updatedAt.toDate().toLocaleDateString() : "recently"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Content Column */}
                        <div className="md:col-span-2 space-y-8">
                            <Card className="p-8 border-slate-200 shadow-sm">
                                <h3 className="text-2xl font-bold mb-6">Overview</h3>
                                <div className="prose prose-slate max-w-none">
                                    {/* Render markdown content safely later - for now just text */}
                                    <p className="whitespace-pre-wrap leading-relaxed text-slate-600">
                                        {guide.content || "No content available for this guide."}
                                    </p>
                                </div>
                            </Card>

                            <Card className="p-8 border-slate-200 shadow-sm">
                                <h3 className="text-xl font-bold mb-6">What You'll Learn</h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {[
                                        "Validation Strategies",
                                        "Monetization Models",
                                        "Growth Tactics",
                                        "Operational Setup",
                                        "Tool Stack Recommendations",
                                        "Common Pitfalls"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="mt-1 size-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                                <Check className="size-3 stroke-[3]" />
                                            </div>
                                            <span className="text-slate-600 font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card className="p-6 border-slate-200 bg-slate-50/50 sticky top-32">
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Access Type</p>
                                        <p className="text-2xl font-bold flex items-center gap-2">
                                            {guide.premium ? (
                                                <>
                                                    <Lock className="size-5 text-amber-500" /> Platinum
                                                </>
                                            ) : (
                                                <span className="text-green-600">Free Access</span>
                                            )}
                                        </p>
                                    </div>

                                    {guide.premium ? (
                                        <Link href="/pricing">
                                            <Button className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20">
                                                Unlock Full Guide
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button
                                            className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20"
                                            onClick={() => {
                                                if (guide.externalUrl) {
                                                    window.open(guide.externalUrl, '_blank');
                                                } else {
                                                    toast.info("No external link provided for this guide.");
                                                }
                                            }}
                                        >
                                            Start Reading
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline"
                                        className="w-full h-12 gap-2"
                                        onClick={handleSave}
                                        disabled={saving || saved}
                                    >
                                        {saving ? <Loader2 className="animate-spin size-4" /> : <Bookmark className={cn("size-4", saved && "fill-current text-primary")} />}
                                        {saved ? "Saved to Dashboard" : "Save for Later"}
                                    </Button>

                                    <div className="pt-6 border-t border-slate-200 space-y-3">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Includes</p>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <div className="size-1.5 rounded-full bg-slate-300" />
                                            Step-by-step Execution Plan
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <div className="size-1.5 rounded-full bg-slate-300" />
                                            Resource Checklist
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <div className="size-1.5 rounded-full bg-slate-300" />
                                            Monetization Sheet
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
