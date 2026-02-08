"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChannelIdea } from "@/lib/data";
import { X } from "lucide-react";

const LANGUAGES = [
    { id: "en", name: "English" },
    { id: "es", name: "Spanish" },
    { id: "fr", name: "French" },
    { id: "hi", name: "Hindi" },
    { id: "pt", name: "Portuguese" },
];

interface LanguageModalProps {
    isOpen: boolean;
    onClose: () => void;
    idea: ChannelIdea;
    onConfirm: (language: string) => void;
}

export function LanguageModal({ isOpen, onClose, idea, onConfirm }: LanguageModalProps) {
    const [selectedLang, setSelectedLang] = useState<string>("en");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-[420px] p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-semibold">Choose Content Language</h2>
                        <p className="text-sm text-text-secondary mt-1">
                            This affects scripts, tone, and keywords for <b>{idea.name}</b>.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <X className="size-5" />
                    </button>
                </div>

                <div className="space-y-3 mb-8">
                    {LANGUAGES.map((lang) => (
                        <div
                            key={lang.id}
                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${selectedLang === lang.id
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "border-border hover:bg-gray-50"
                                }`}
                            onClick={() => setSelectedLang(lang.id)}
                        >
                            <div className={`size-4 rounded-full border mr-3 flex items-center justify-center ${selectedLang === lang.id ? "border-primary" : "border-gray-400"
                                }`}>
                                {selectedLang === lang.id && <div className="size-2 rounded-full bg-primary" />}
                            </div>
                            <span className="font-medium text-sm">{lang.name}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => onConfirm(selectedLang)}>Continue</Button>
                </div>
            </Card>
        </div>
    );
}
