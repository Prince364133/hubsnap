"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CHANNEL_IDEAS } from "@/lib/data";
import { generateChannelNames } from "@/lib/generators";
import { ArrowLeft, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { dbService } from "@/lib/firestore";
import { cn } from "@/lib/utils";

function ChannelNameSelectionContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const ideaId = searchParams.get("ideaId");
    const lang = searchParams.get("lang");

    const idea = CHANNEL_IDEAS.find(i => i.id === ideaId);

    const [loading, setLoading] = useState(true);
    const [generatedNames, setGeneratedNames] = useState<string[]>([]);
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (idea && lang) {
            setGeneratedNames(generateChannelNames(idea, lang));
            setLoading(false);
        }
    }, [idea, lang]);

    if (!idea) return <div>Invalid Idea</div>;

    const handleSelect = async (name: string) => {
        if (isChecking) return;
        setIsChecking(true);
        setError("");

        // Real Uniqueness Check
        const isUnique = await dbService.checkNameUnique(name);

        if (isUnique) {
            setSelectedName(name);
        } else {
            setError(`"${name}" is already taken. Please pick another.`);
            setSelectedName(null);
        }
        setIsChecking(false);
    };

    const handleContinue = async () => {
        if (selectedName) {
            // Lock the name permanently
            setIsChecking(true); // Re-use checking state for loading
            const locked = await dbService.lockChannelName("demo_user", selectedName);

            if (locked) {
                router.push(`/dashboard/logo-selection?ideaId=${ideaId}&lang=${lang}&name=${encodeURIComponent(selectedName)}`);
            } else {
                setError("Failed to reserve name. Try again.");
                setIsChecking(false);
            }
        }
    };

    if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-text-primary">Claim Your Channel Name</h1>
                <p className="text-text-secondary mt-2">These names are generated for you. Once selected, it's <strong>transferred to you forever</strong>.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-200">
                    {error}
                </div>
            )}

            <div className="grid gap-3">
                {generatedNames.map((name) => (
                    <div
                        key={name}
                        onClick={() => handleSelect(name)}
                        className={cn(
                            "p-4 rounded-lg border cursor-pointer flex justify-between items-center transition-all",
                            selectedName === name
                                ? "border-primary bg-primary/5 shadow-md transform scale-[1.01]"
                                : "border-gray-200 hover:border-primary/30 hover:bg-gray-50"
                        )}
                    >
                        <span className="font-semibold text-lg text-text-primary">{name}</span>
                        {selectedName === name ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full animate-in fade-in zoom-in">
                                <CheckCircle className="size-3" /> Available & Unique
                            </span>
                        ) : (
                            isChecking && selectedName === name ? <Loader2 className="size-4 animate-spin text-primary" /> : null
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end sticky bottom-4 z-10">
                <Button
                    size="lg"
                    disabled={!selectedName || isChecking}
                    onClick={handleContinue}
                    className="shadow-xl"
                >
                    {isChecking ? "Locking..." : "Lock This Name & Continue"} {!isChecking && <ArrowRight className="size-4 ml-2" />}
                </Button>
            </div>
        </div>
    );
}

export default function ChannelNamePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ChannelNameSelectionContent />
        </Suspense>
    );
}
