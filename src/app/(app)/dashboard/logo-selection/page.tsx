"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CHANNEL_IDEAS } from "@/lib/data";
import { generateLogos } from "@/lib/generators";
import { ArrowLeft, CheckCircle, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function LogoSelectionContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const ideaId = searchParams.get("ideaId");
    const lang = searchParams.get("lang");
    const name = searchParams.get("name");

    const idea = CHANNEL_IDEAS.find(i => i.id === ideaId);

    const [logos, setLogos] = useState<string[]>([]);
    const [selectedLogo, setSelectedLogo] = useState<string | null>(null);

    useEffect(() => {
        if (idea) {
            setLogos(generateLogos(idea));
        }
    }, [idea]);

    if (!idea || !name) return <div>Invalid Context</div>;

    const handleContinue = () => {
        if (selectedLogo) {
            router.push(`/dashboard/setup-pack?ideaId=${ideaId}&lang=${lang}&name=${encodeURIComponent(name)}&logo=${encodeURIComponent(selectedLogo)}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-2">
                <Button variant="ghost" className="pl-0 gap-2 mb-2" onClick={() => router.back()}>
                    <ArrowLeft className="size-4" /> Back
                </Button>
                <h1 className="text-2xl font-bold text-text-primary">Choose Your Channel Logo</h1>
                <p className="text-text-secondary">Keep it simple. Thumbnails matter more than logos.</p>
            </div>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-6">
                Creating logo for: <strong>{name}</strong>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {logos.map((logo, index) => (
                    <div
                        key={logo}
                        className={cn(
                            "aspect-square rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden bg-white",
                            selectedLogo === logo
                                ? "border-primary ring-2 ring-primary shadow-md"
                                : "border-border hover:border-gray-300"
                        )}
                        onClick={() => setSelectedLogo(logo)}
                    >
                        {/* Mock Logo Visual */}
                        <div className={`size-16 rounded-full flex items-center justify-center mb-2 ${["bg-blue-100", "bg-green-100", "bg-purple-100", "bg-orange-100", "bg-pink-100"][index % 5]
                            }`}>
                            <ImageIcon className="size-8 text-gray-500" />
                        </div>
                        <span className="text-xs font-mono text-gray-400">Option {index + 1}</span>

                        {selectedLogo === logo && (
                            <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                                <CheckCircle className="size-4 text-white" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    size="lg"
                    disabled={!selectedLogo}
                    onClick={handleContinue}
                >
                    Continue to Setup Pack
                </Button>
            </div>
        </div>
    );
}

export default function LogoSelectionPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LogoSelectionContent />
        </Suspense>
    );
}
