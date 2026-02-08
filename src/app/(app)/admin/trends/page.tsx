"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { dbService } from "@/lib/firestore";
import { Loader2, Plus, Zap } from "lucide-react";

export default function TrendInjectorPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const volume = formData.get("volume") as string;
        const category = formData.get("category") as string;

        if (!title || !description) return;

        try {
            await dbService.addTrend({
                title,
                description,
                volume: volume || "Unknown",
                category: category || "General",
                difficulty: "Medium"
            });
            setSuccess(true);
            (e.target as HTMLFormElement).reset();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <Zap className="text-yellow-400" /> Trend Injector
                </h1>
                <p className="text-slate-400">Manually force new viral topics into the user dashboard.</p>
            </div>

            <Card className="bg-slate-900 border-slate-800 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Trend Title (Hook)</label>
                        <input
                            name="title"
                            required
                            placeholder="e.g., 'AI just killed Coding?'"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Volume</label>
                            <input
                                name="volume"
                                placeholder="e.g., '1M+ Views'"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Category</label>
                            <select
                                name="category"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                <option value="Tech">Tech</option>
                                <option value="Finance">Finance</option>
                                <option value="Lifestyle">Lifestyle</option>
                                <option value="Gaming">Gaming</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Context / Description</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            placeholder="Why is it viral? What's the angle?"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500 outline-none"
                        />
                    </div>

                    <Button disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold">
                        {loading ? <Loader2 className="animate-spin" /> : "INJECT TREND NOW"}
                    </Button>

                    {success && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-center rounded-lg animate-in fade-in slide-in-from-bottom-2">
                            Trend Successfully Injected to Global Database.
                        </div>
                    )}
                </form>
            </Card>
        </div>
    );
}
