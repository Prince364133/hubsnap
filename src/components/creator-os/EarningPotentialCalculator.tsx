"use client";

import { useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { DollarSign, TrendingUp, Users, Video } from 'lucide-react';

export function EarningPotentialCalculator() {
    const [followers, setFollowers] = useState(10000);
    const [videosPerMonth, setVideosPerMonth] = useState(4);
    const [monetizationPaths, setMonetizationPaths] = useState({
        adsense: true,
        sponsorships: true,
        affiliates: true,
        products: false
    });

    // Estimates based on industry averages
    const calculateEarnings = () => {
        let monthly = 0;

        // AdSense: ~$3-5 RPM average
        if (monetizationPaths.adsense) {
            const views = followers * 0.2 * videosPerMonth; // Assumes 20% of followers watch
            monthly += (views / 1000) * 4;
        }

        // Sponsorships: ~$10-20 per 1000 views
        if (monetizationPaths.sponsorships) {
            const sponsoredVideos = Math.floor(videosPerMonth / 2); // Sponsor 50% of videos
            const views = followers * 0.2 * sponsoredVideos;
            monthly += (views / 1000) * 15;
        }

        // Affiliates: Conversion rate ~1% of viewers, $20 avg commission
        if (monetizationPaths.affiliates) {
            const views = followers * 0.2 * videosPerMonth;
            const conversions = views * 0.005; // 0.5% conversion
            monthly += conversions * 15;
        }

        // Digital Products: 0.1% conversion of followers per month, $50 avg price
        if (monetizationPaths.products) {
            const buyers = followers * 0.001;
            monthly += buyers * 47;
        }

        return Math.round(monthly);
    };

    const monthlyEarnings = calculateEarnings();
    const annualEarnings = monthlyEarnings * 12;

    return (
        <section className="py-20 px-6 bg-transparent overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-200/40 rounded-full blur-[120px] -z-10" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Uncover Your Earning Potential</h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        See how much you could earn by scaling your content with Creator OS.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Controls - Frozen Glass Card */}
                    <Card className="p-8 bg-white/40 border-white/60 backdrop-blur-xl shadow-xl rounded-3xl space-y-8 ring-1 ring-white/50">
                        {/* Followers/Subscribers */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="flex items-center gap-2 font-bold text-lg text-slate-800">
                                    <Users className="size-5 text-sky-500" />
                                    Audience Size
                                </label>
                                <span className="text-2xl font-bold text-sky-600">
                                    {followers.toLocaleString()}
                                </span>
                            </div>
                            <Slider
                                value={[followers]}
                                min={1000}
                                max={1000000}
                                step={1000}
                                onValueChange={(val: any) => setFollowers(val[0])}
                                className="py-4"
                            />
                            <p className="text-sm text-slate-500">Total followers across all platforms</p>
                        </div>

                        {/* Content Volume */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="flex items-center gap-2 font-bold text-lg text-slate-800">
                                    <Video className="size-5 text-cyan-500" />
                                    Monthly Videos
                                </label>
                                <span className="text-2xl font-bold text-cyan-600">
                                    {videosPerMonth}
                                </span>
                            </div>
                            <Slider
                                value={[videosPerMonth]}
                                min={1}
                                max={30}
                                step={1}
                                onValueChange={(val: any) => setVideosPerMonth(val[0])}
                                className="py-4"
                            />
                            <p className="text-sm text-slate-500">Number of long-form videos or deep content pieces</p>
                        </div>

                        {/* Revenue Streams */}
                        <div className="space-y-4">
                            <label className="font-bold text-lg flex items-center gap-2 text-slate-800">
                                <DollarSign className="size-5 text-sky-500" />
                                Revenue Streams
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(monetizationPaths).map(([key, enabled]) => (
                                    <button
                                        key={key}
                                        onClick={() => setMonetizationPaths(prev => ({ ...prev, [key]: !prev[key as keyof typeof monetizationPaths] }))}
                                        className={`p-4 rounded-xl border transition-all text-left shadow-sm ${enabled
                                            ? 'bg-sky-50/80 border-sky-200 text-sky-700'
                                            : 'bg-white/40 border-slate-200 text-slate-400 hover:bg-white/60'
                                            }`}
                                    >
                                        <div className="font-bold capitalize mb-1">{key}</div>
                                        <div className="text-xs opacity-80 font-medium">
                                            {enabled ? 'Active' : 'Enable'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Results */}
                    <div className="space-y-6 text-center lg:text-left">
                        <div className="inline-block p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-sm mb-4">
                            <TrendingUp className="size-8 text-sky-500" />
                        </div>
                        <h3 className="text-2xl text-slate-500 font-medium">Potential Annual Revenue</h3>
                        <div className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 drop-shadow-sm">
                            ${annualEarnings.toLocaleString()}
                        </div>
                        <div className="text-2xl text-slate-600 font-medium">
                            ~${monthlyEarnings.toLocaleString()} <span className="text-base text-slate-400 font-normal">/ month</span>
                        </div>
                        <p className="text-slate-500 max-w-md mx-auto lg:mx-0 pt-6 border-t border-slate-200">
                            *Estimates based on industry standards. Creator OS tools help you maximize engagement and conversion.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
