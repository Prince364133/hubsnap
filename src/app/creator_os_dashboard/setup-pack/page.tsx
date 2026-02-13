"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CHANNEL_IDEAS } from "@/lib/data";
import { Copy, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            variant="secondary"
            size="sm"
            className="h-8 gap-1.5"
            onClick={handleCopy}
        >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? "Copied" : "Copy"}
        </Button>
    );
}

function ChannelSetupContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const ideaId = searchParams.get("ideaId");
    const nicheId = searchParams.get("nicheId");
    const lang = searchParams.get("lang");
    const name = searchParams.get("name");
    // const logo = searchParams.get("logo");

    // Logic to handle both pre-set ideas and custom AI niches
    let description = "";
    let keywords = "";
    let hashtags = "";

    // Fallback name if missing (e.g. direct access)
    const activeName = name || "New Creator Channel";

    if (ideaId === "custom" && nicheId && activeName) {
        // It's a Niche Discovery flow
        description = `Welcome to the official home of ${activeName}. We cover the best tips and tricks to help you succeed. Subscribe for daily updates!`;
        keywords = `${activeName}, viral, shorts, 2026, new channel, learn`;
        hashtags = `#${activeName.replace(/\s/g, "")} #Trending #Education`;
    } else {
        // Legacy / Curated flow
        const idea = CHANNEL_IDEAS.find(i => i.id === ideaId) || CHANNEL_IDEAS[0];
        description = `Welcome to ${activeName}! On this channel, we explore ${idea.description.toLowerCase()} Subscribe for new videos every week!`;
        keywords = idea.name.split(" ").concat(["shorts", "viral", "2024", "new channel"]).join(", ");
        hashtags = `#${idea.name.replace(/\s/g, "")} #Shorts #Viral #Trending`;
    }

    // Always show something instead of "Invalid Context"
    // if (!name) return <div>Invalid Context</div>;

    const handleFinish = () => {
        // Navigate to Content Creation Mode
        // Pass nicheId if custom
        const base = `/creator_os_dashboard/content-mode?ideaId=${ideaId}&lang=${lang || "en"}&name=${encodeURIComponent(activeName)}`;
        const url = nicheId ? `${base}&nicheId=${nicheId}` : base;
        router.push(url);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 mb-20">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-text-primary">Your Channel Setup Pack</h1>
                <p className="text-text-secondary">Copy these details once. Use them for every video.</p>
            </div>

            <div className="grid gap-6">
                <Card className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold">Channel Description</h3>
                        <CopyButton text={description} />
                    </div>
                    <textarea
                        className="w-full p-3 border border-border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
                        defaultValue={description}
                    />
                    <p className="text-xs text-text-secondary">Paste this in your Channel &gt; About section.</p>
                </Card>

                <Card className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold">Channel Keywords</h3>
                        <CopyButton text={keywords} />
                    </div>
                    <div className="p-3 bg-gray-50 border border-border rounded-lg text-sm font-mono">
                        {keywords}
                    </div>
                    <p className="text-xs text-text-secondary">Paste this in YouTube Studio &gt; Settings &gt; Channel &gt; Keywords.</p>
                </Card>

                <Card className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold">Default Hashtags</h3>
                        <CopyButton text={hashtags} />
                    </div>
                    <div className="p-3 bg-gray-50 border border-border rounded-lg text-sm text-blue-600">
                        {hashtags}
                    </div>
                </Card>
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-border p-4 flex justify-end items-center gap-4 pr-10 z-10 md:pl-[260px]">
                <span className="text-sm text-text-secondary hidden md:inline-block">
                    Everything copied?
                </span>
                <Button size="lg" onClick={handleFinish} className="gap-2">
                    Setup Done & Continue <ArrowRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}

export default function SetupPackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ChannelSetupContent />
        </Suspense>
    );
}
