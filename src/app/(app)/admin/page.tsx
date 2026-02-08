"use client";

import { Card } from "@/components/ui/Card";
import { Users, TrendingUp, DollarSign, Activity } from "lucide-react";

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">System Overview</h1>
                    <p className="text-slate-400">Real-time platform metrics.</p>
                </div>
                <div className="flex item-center gap-2">
                    <span className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-mono border border-green-500/20">
                        <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                        SYSTEM OPERATIONAL
                    </span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Users", value: "12,403", change: "+12% this week", icon: Users, color: "text-blue-400" },
                    { label: "Active Trends", value: "84", change: "+5 today", icon: TrendingUp, color: "text-purple-400" },
                    { label: "Revenue (MRR)", value: "₹4.2L", change: "+8% vs last month", icon: DollarSign, color: "text-green-400" },
                    { label: "Server Load", value: "24%", change: "Stable", icon: Activity, color: "text-amber-400" },
                ].map((stat, i) => (
                    <Card key={i} className="bg-slate-900 border-slate-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
                            <stat.icon className={`size-5 ${stat.color}`} />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs text-slate-500">{stat.change}</div>
                    </Card>
                ))}
            </div>

            {/* Recent Activity Mock */}
            <Card className="bg-slate-900 border-slate-800 p-6">
                <h3 className="text-lg font-bold text-white mb-6">Live Activity Stream</h3>
                <div className="space-y-4">
                    {[
                        { user: "alex_creator", action: "Generated a script for 'AI Coding'", time: "2 mins ago" },
                        { user: "sarah_vlogs", action: "Upgraded to Pro Plan", time: "15 mins ago" },
                        { user: "tech_guru", action: "Logged earnings: ₹2,500", time: "1 hour ago" },
                        { user: "system", action: "Daily Trends Refresh Complete", time: "4 hours ago" },
                    ].map((log, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/50 px-4 -mx-4 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                                    {log.user[0].toUpperCase()}
                                </div>
                                <span className="text-sm">
                                    <span className="font-semibold text-slate-200">{log.user}</span>
                                    <span className="text-slate-500 mx-2">→</span>
                                    <span className="text-slate-400">{log.action}</span>
                                </span>
                            </div>
                            <span className="text-xs font-mono text-slate-600">{log.time}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
