"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ExternalLink, Mic, Image, Video, Wand2, Search } from "lucide-react";

const TOOLS = [
    {
        name: "Google AI Studio",
        category: "Research & Text",
        icon: Search,
        problem: "Need fast research or script polishing.",
        usage: "Paste your raw notes and ask for a YouTube script format.",
        link: "https://aistudio.google.com/"
    },
    {
        name: "Pexels / Pixabay",
        category: "Stock Assets",
        icon: Image,
        problem: "Need free b-roll or images without copyright issues.",
        usage: "Search for 'office work' or 'nature' for background clips.",
        link: "https://www.pexels.com/"
    },
    {
        name: "CapCut",
        category: "Video Editing",
        icon: Video,
        problem: "Need professional editing on mobile/desktop for free.",
        usage: "Best for adding auto-captions and trending effects.",
        link: "https://www.capcut.com/"
    },
    {
        name: "Canva",
        category: "Thumbnails",
        icon: Wand2,
        problem: "Need a high CTR thumbnail.",
        usage: "Use their 'YouTube Thumbnail' templates as a base.",
        link: "https://www.canva.com/"
    },
    {
        name: "ElevenLabs",
        category: "Voice Gen",
        icon: Mic,
        problem: "Need a professional voiceover but have no mic.",
        usage: "Paste your script to get a realistic AI narration.",
        link: "https://elevenlabs.io/"
    },
];

export default function ToolsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-text-primary">Curated Toolkit</h1>
                <p className="text-text-secondary">The essential stack for modern creators. No fluff, just what works.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TOOLS.map((tool) => (
                    <Card key={tool.name} className="p-6 hover:border-primary transition-colors flex gap-4">
                        <div className="size-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                            <tool.icon className="size-6 text-gray-700" />
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{tool.name}</h3>
                                    <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded">
                                        {tool.category}
                                    </span>
                                </div>
                                <a href={tool.link} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="icon" className="size-8">
                                        <ExternalLink className="size-4 text-gray-400" />
                                    </Button>
                                </a>
                            </div>

                            <div className="space-y-1 pt-2">
                                <p className="text-sm text-gray-800">
                                    <strong>Solves:</strong> {tool.problem}
                                </p>
                                <p className="text-sm text-text-secondary">
                                    <span className="text-xs uppercase font-bold text-gray-400 mr-1">Use When:</span>
                                    {tool.usage}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
