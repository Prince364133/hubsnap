"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CHANNEL_IDEAS, ChannelIdea } from "@/lib/data";
import { ChannelIdeaCard } from "@/components/features/ChannelIdeaCard";
import { LanguageModal } from "@/components/features/LanguageModal";

export default function ChannelIdeasPage() {
    const router = useRouter();
    const [selectedIdea, setSelectedIdea] = useState<ChannelIdea | null>(null);

    const handleSelect = (idea: ChannelIdea) => {
        setSelectedIdea(idea);
    };

    const handleLanguageConfirm = (language: string) => {
        if (selectedIdea) {
            // Navigate to name selection with params
            router.push(`/creator_os_dashboard/channel-name?ideaId=${selectedIdea.id}&lang=${language}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-text-primary">Pick a proven channel style</h1>
                    <p className="text-text-secondary">Launch your first video today. No experience needed.</p>
                </div>      </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CHANNEL_IDEAS.map((idea) => (
                    <ChannelIdeaCard key={idea.id} idea={idea} onLaunch={handleSelect} />
                ))}
            </div>

            {selectedIdea && (
                <LanguageModal
                    isOpen={!!selectedIdea}
                    onClose={() => setSelectedIdea(null)}
                    idea={selectedIdea}
                    onConfirm={handleLanguageConfirm}
                />
            )}
        </div>
    );
}
