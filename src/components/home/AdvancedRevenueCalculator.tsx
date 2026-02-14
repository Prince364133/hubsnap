"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { DollarSign, TrendingUp, Users, Video, ShoppingBag, Award, Zap } from "lucide-react";

export function AdvancedRevenueCalculator() {
    const [followers, setFollowers] = useState(10000);
    const [videosPerMonth, setVideosPerMonth] = useState(4);
    const [avgProductPrice, setAvgProductPrice] = useState(50);
    const [monetizationPaths, setMonetizationPaths] = useState({
        adsense: true,
        sponsorships: true,
        affiliates: true,
        products: false,
        memberships: false,
        coaching: false
    });

    const [monthlyEarnings, setMonthlyEarnings] = useState(0);
    const [breakdown, setBreakdown] = useState<Record<string, number>>({});

    useEffect(() => {
        let total = 0;
        const newBreakdown: Record<string, number> = {};

        // 1. AdSense: ~$3-5 RPM (Revenue Per Mille)
        // Assumption: 20% of followers watch each video
        if (monetizationPaths.adsense) {
            const views = followers * 0.2 * videosPerMonth;
            const earnings = (views / 1000) * 4;
            total += earnings;
            newBreakdown.adsense = earnings;
        }

        // 2. Sponsorships: ~$15-25 per 1000 views
        // Assumption: Sponsor 50% of videos
        if (monetizationPaths.sponsorships) {
            const sponsoredVideos = Math.max(1, Math.floor(videosPerMonth / 2));
            const views = followers * 0.2 * sponsoredVideos;
            const earnings = (views / 1000) * 20;
            total += earnings;
            newBreakdown.sponsorships = earnings;
        }

        // 3. Affiliates: Conversion rate ~0.5% of viewers, $20 avg commission
        if (monetizationPaths.affiliates) {
            const views = followers * 0.2 * videosPerMonth;
            const conversions = views * 0.005;
            const earnings = conversions * 20;
            total += earnings;
            newBreakdown.affiliates = earnings;
        }

        // 4. Digital Products: ~1% conversion of followers per month (Email list etc)
        if (monetizationPaths.products) {
            const buyers = followers * 0.01;
            const earnings = buyers * avgProductPrice;
            total += earnings;
            newBreakdown.products = earnings;
        }

        // 5. Memberships: ~0.5% of followers subscribe at $5/mo
        if (monetizationPaths.memberships) {
            const members = followers * 0.005;
            const earnings = members * 5;
            total += earnings;
            newBreakdown.memberships = earnings;
        }

        // 6. Coaching: ~0.1% of followers, high ticket ($100/hr)
        if (monetizationPaths.coaching) {
            const clients = Math.max(1, followers * 0.001);
            const earnings = clients * 100;
            total += earnings;
            newBreakdown.coaching = earnings;
        }

        setMonthlyEarnings(Math.round(total));
        setBreakdown(newBreakdown);
    }, [followers, videosPerMonth, avgProductPrice, monetizationPaths]);

    const annualEarnings = monthlyEarnings * 12;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <section className="py-24 px-6 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-100/50 rounded-full blur-[120px] -z-10" />

            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-xs font-bold uppercase tracking-wider mb-2">
                        <TrendingUp className="size-3" /> Advanced Projection
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                        How much is your <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">Influence Worth?</span>
                    </h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        Calculate your potential earnings by combining multiple revenue streams powered by Creator OS.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Controls */}
                    <Card className="lg:col-span-7 p-8 bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-[2rem] space-y-8 ring-1 ring-white/50 relative z-10">
                        {/* Main Sliders */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="flex items-center gap-2 font-bold text-lg text-slate-800">
                                        <Users className="size-5 text-sky-500" />
                                        Total Followers
                                    </label>
                                    <span className="text-2xl font-bold text-slate-900 bg-slate-50 px-4 py-1 rounded-lg border border-slate-100">
                                        {followers.toLocaleString()}
                                    </span>
                                </div>
                                <Slider
                                    value={[followers]}
                                    min={1000}
                                    max={500000}
                                    step={1000}
                                    onValueChange={(val: any) => setFollowers(val[0])}
                                    className="py-2"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="flex items-center gap-2 font-bold text-sm text-slate-700">
                                            <Video className="size-4 text-cyan-500" />
                                            Videos / Month
                                        </label>
                                        <span className="font-bold text-cyan-700">{videosPerMonth}</span>
                                    </div>
                                    <Slider
                                        value={[videosPerMonth]}
                                        min={1}
                                        max={30}
                                        step={1}
                                        onValueChange={(val: any) => setVideosPerMonth(val[0])}
                                        className="py-2"
                                    />
                                </div>

                                {monetizationPaths.products && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                                        <div className="flex justify-between items-center">
                                            <label className="flex items-center gap-2 font-bold text-sm text-slate-700">
                                                <ShoppingBag className="size-4 text-purple-500" />
                                                Avg Product Price
                                            </label>
                                            <span className="font-bold text-purple-700">${avgProductPrice}</span>
                                        </div>
                                        <Slider
                                            value={[avgProductPrice]}
                                            min={10}
                                            max={500}
                                            step={5}
                                            onValueChange={(val: any) => setAvgProductPrice(val[0])}
                                            className="py-2"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Revenue Toggles */}
                        <div className="space-y-4 pt-6 border-t border-slate-100">
                            <label className="font-bold text-sm text-slate-500 uppercase tracking-widest block mb-4">
                                Activate Income Streams
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {[
                                    { id: 'adsense', label: 'Ad Revenue', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
                                    { id: 'sponsorships', label: 'Sponsorships', icon: Award, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                                    { id: 'affiliates', label: 'Affiliates', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                                    { id: 'products', label: 'Digital Products', icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
                                    { id: 'memberships', label: 'Memberships', icon: Users, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
                                    { id: 'coaching', label: 'Coaching', icon: Video, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
                                ].map((stream) => (
                                    <button
                                        key={stream.id}
                                        onClick={() => setMonetizationPaths(prev => ({ ...prev, [stream.id]: !prev[stream.id as keyof typeof monetizationPaths] }))}
                                        className={`p-3 rounded-xl border transition-all duration-200 flex items-center gap-3 text-left hover:-translate-y-1 ${monetizationPaths[stream.id as keyof typeof monetizationPaths]
                                            ? `${stream.bg} ${stream.border} ${stream.color} shadow-sm`
                                            : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <div className={`size-8 rounded-lg flex items-center justify-center bg-white/50 ${monetizationPaths[stream.id as keyof typeof monetizationPaths] ? '' : 'grayscale'}`}>
                                            <stream.icon className="size-4" />
                                        </div>
                                        <span className="font-bold text-sm">{stream.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Visualization / Results */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="p-8 bg-slate-900 text-white shadow-2xl rounded-[2rem] relative overflow-hidden border border-slate-700">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/20 rounded-full blur-[80px] pointer-events-none" />

                            <div className="relative z-10 text-center space-y-2 mb-8">
                                <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Estimated Annual Earnings</div>
                                <div className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-sky-400">
                                    {formatCurrency(annualEarnings)}
                                </div>
                                <div className="text-slate-400 font-medium">
                                    {formatCurrency(monthlyEarnings)} <span className="text-sm opacity-60">/ month</span>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Revenue Breakdown</div>
                                {Object.entries(breakdown).map(([key, value]) => {
                                    const percent = (value / monthlyEarnings) * 100;
                                    if (value === 0) return null;

                                    return (
                                        <div key={key} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="capitalize text-slate-300">{key === 'adsense' ? 'Ad Revenue' : key}</span>
                                                <span className="font-bold text-white">{formatCurrency(value)}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {!monthlyEarnings && (
                                <div className="text-center text-slate-500 text-sm py-4">
                                    Enable revenue streams to see projection
                                </div>
                            )}
                        </Card>

                        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6 text-sm text-sky-800 leading-relaxed shadow-sm">
                            <div className="flex gap-2 font-bold mb-2 items-center text-sky-600">
                                <TrendingUp className="size-4" />
                                Growth Insight
                            </div>
                            Most tailored monetization strategies yield <strong>3x more revenue</strong> than AdSense alone. Digital products and memberships scale your income without needing millions of views.
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
