"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Video, Mic, Sparkles, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

function ContentModeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const ideaId = searchParams.get("ideaId");
    const lang = searchParams.get("lang");
    const name = searchParams.get("name");

    const options = [
        {
            id: "face",
            title: "Face Video",
            description: "You on camera talking to the audience.",
            icon: Video,
            color: "bg-blue-100 text-blue-600"
        },
        {
            id: "voice",
            title: "Voice + Visuals",
            description: "Your voice with stock footage or screen recording.",
            icon: Mic,
            color: "bg-green-100 text-green-600"
        },
        {
            id: "ai",
            title: "Fully AI Visuals",
            description: "AI avatar or pure text-to-video generation.",
            icon: Sparkles,
            color: "bg-purple-100 text-purple-600"
        }
    ];

    const handleSelect = (modeId: string) => {
        // Navigate to Day 1 Video Idea
        router.push(`/creator_os_dashboard/content/day-1?ideaId=${ideaId}&lang=${lang}&name=${encodeURIComponent(name || "")}&mode=${modeId}`);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 mt-10">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-text-primary">How will you create videos?</h1>
                <p className="text-text-secondary">This decides your script structure and asset checklist.</p>
                <div className="pt-2">
                    <Link href="/creator_os_dashboard/content/history">
                        <Button variant="ghost" className="text-sm text-text-secondary hover:text-primary">
                            <Clock className="size-4 mr-2" /> View Content History
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {options.map((option) => (
                    <Card
                        key={option.id}
                        className="p-6 flex flex-col items-center text-center cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                        onClick={() => handleSelect(option.id)}
                    >
                        <div className={cn("size-14 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110", option.color)}>
                            <option.icon className="size-7" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                        <p className="text-sm text-text-secondary">{option.description}</p>
                        <div className="mt-6 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" className="w-full">Select</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default function ContentModePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ContentModeContent />
        </Suspense>
    );
}
