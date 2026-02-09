"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { populateDB } from "@/lib/seed";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function SeedPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState("");

    const handleSeed = async () => {
        setStatus('loading');
        try {
            const success = await populateDB();
            if (success) {
                setStatus('success');
                setMessage("Database seeded successfully! Tools, Guides, and Blogs have been added.");
            } else {
                setStatus('error');
                setMessage("Failed to seed database. Check console for details.");
            }
        } catch (e: any) {
            setStatus('error');
            setMessage(e.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6">Database Seeder</h1>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-600 mb-6">
                    Click the button below to populate the Firestore database with initial data for Tools, Guides, and Blogs.
                    This will only add data if the collections are empty.
                </p>

                <Button
                    onClick={handleSeed}
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full h-12 text-lg"
                >
                    {status === 'loading' && <Loader2 className="animate-spin mr-2" />}
                    {status === 'success' ? "Seeding Complete" : "Run Seed Script"}
                </Button>

                {status === 'success' && (
                    <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-start gap-3">
                        <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
                        <p>{message}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
                        <AlertCircle className="size-5 shrink-0 mt-0.5" />
                        <p>{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
