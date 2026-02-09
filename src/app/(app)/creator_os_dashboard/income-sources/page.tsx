"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress"; // Assuming Progress component exists or I'll implement a simple one if not
import { DollarSign, ExternalLink, TrendingUp, Target, ArrowUpRight, Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const INCOME_STREAMS = [
    {
        id: "amazon-associates",
        name: "Amazon Associates",
        desc: "Earn commissions by recommending products.",
        time: "1-2 Months",
        risk: "Low",
        difficulty: "Easy",
        potential: "$500 - $5,000/mo",
        status: "Active"
    },
    {
        id: "youtube-adsense",
        name: "YouTube AdSense",
        desc: "Get paid for views on your videos.",
        time: "6-12 Months",
        risk: "Medium",
        difficulty: "Hard",
        potential: "$1,000 - $10,000/mo",
        status: "Locked"
    },
    {
        id: "brand-sponsorships",
        name: "Brand Sponsorships",
        desc: "Partner with brands to promote their products.",
        time: "6+ Months",
        risk: "High",
        difficulty: "Hard",
        potential: "$2,000 - $20,000/deal",
        status: "Locked"
    },
    {
        id: "digital-products",
        name: "Digital Products",
        desc: "Sell templates, ebooks, or courses.",
        time: "1-3 Months",
        risk: "Medium",
        difficulty: "Medium",
        potential: "$1,000 - $50,000/mo",
        status: "Locked"
    },
    {
        id: "affiliate-marketing",
        name: "Software Affiliate",
        desc: "Recurring revenue from software referrals.",
        time: "2-4 Months",
        risk: "Low",
        difficulty: "Medium",
        potential: "$500 - $5,000/mo",
        status: "Locked"
    }
];

export default function IncomeSourcesPage() {
    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Income Hub</h1>
                <p className="text-slate-500 mt-2 text-lg">Track your revenue and unlock high-value streams.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 border-slate-200 bg-gradient-to-br from-white to-slate-50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                            <DollarSign className="size-5" />
                        </div>
                        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Earnings</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900">$0.00</div>
                    <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                        <TrendingUp className="size-3 text-green-500" />
                        <span className="text-green-600 font-medium">+0%</span> this month
                    </div>
                </Card>

                <Card className="p-6 border-slate-200 bg-gradient-to-br from-white to-slate-50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <Target className="size-5" />
                        </div>
                        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Monthly Goal</span>
                    </div>
                    <div className="flex items-end justify-between mb-2">
                        <div className="text-3xl font-black text-slate-900">$1,000</div>
                        <div className="text-sm text-slate-500 mb-1">0%</div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[0%] rounded-full"></div>
                    </div>
                </Card>

                <Card className="p-6 border-slate-200 bg-gradient-to-br from-white to-slate-50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                            <Lock className="size-5" />
                        </div>
                        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Streams</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900">1 <span className="text-lg text-slate-400 font-normal">/ 5</span></div>
                    <p className="mt-2 text-xs text-slate-400">Unlock more by growing your audience.</p>
                </Card>
            </div>

            {/* Main Content Info */}
            <div className="grid md:grid-cols-3 gap-8">
                {/* Available Streams List */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="size-5 text-primary" />
                        Income Streams
                    </h2>

                    <div className="space-y-4">
                        {INCOME_STREAMS.map((stream) => (
                            <Link href={stream.status === "Locked" ? "#" : `/dashboard/income-sources/${stream.id}`} key={stream.id} className={cn(stream.status === "Locked" ? "cursor-not-allowed" : "")}>
                                <Card className={cn(
                                    "p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all group",
                                    stream.status === "Locked" ? "bg-slate-50 border-slate-100 opacity-70" : "bg-white hover:border-primary/50 hover:shadow-md cursor-pointer"
                                )}>
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            "size-12 rounded-xl flex items-center justify-center shrink-0",
                                            stream.status === "Locked" ? "bg-slate-200 text-slate-400" : "bg-blue-50 text-primary"
                                        )}>
                                            {stream.status === "Locked" ? <Lock className="size-5" /> : <DollarSign className="size-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{stream.name}</h4>
                                                {stream.status === "Locked" && <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-bold">LOCKED</span>}
                                            </div>
                                            <p className="text-sm text-slate-500 mb-2">{stream.desc}</p>

                                            <div className="flex flex-wrap gap-3 text-xs">
                                                <span className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded">
                                                    ⏱ {stream.time}
                                                </span>
                                                <span className={cn(
                                                    "flex items-center gap-1 px-2 py-1 rounded font-medium",
                                                    stream.difficulty === "Easy" ? "bg-green-50 text-green-700" :
                                                        stream.difficulty === "Medium" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"
                                                )}>
                                                    ⚡ {stream.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:text-right flex flex-row md:flex-col justify-between items-center md:items-end gap-2 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                                        <div className="text-sm font-bold text-slate-700">{stream.potential}</div>
                                        {stream.status !== "Locked" && (
                                            <div className="text-primary text-xs font-bold flex items-center gap-1 group-hover:underline">
                                                View Details <ArrowUpRight className="size-3" />
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Sidebar / Tips */}
                <div className="space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-lg">
                        <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
                        <p className="text-blue-100 text-sm leading-relaxed mb-4">
                            Don't try to unlock everything at once. Focus on <b>Amazon Associates</b> first—it's the easiest way to make your first $1 online.
                        </p>
                        <Button variant="secondary" size="sm" className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold border-none">
                            Read Guide
                        </Button>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-bold mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            <div className="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-lg border border-dashed">
                                No activity yet. <br /> Start your first stream!
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
