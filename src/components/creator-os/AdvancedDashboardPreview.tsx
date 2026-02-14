"use client";

import {
    LayoutDashboard, PieChart, TrendingUp, Users, Settings,
    Search, Bell, Plus, Video, Mic, Type, MoreHorizontal,
    ArrowUpRight, Calendar, BarChart3, Globe, Zap
} from "lucide-react";

export function AdvancedDashboardPreview({ variant = 'home' }: { variant?: 'home' | 'product' }) {
    return (
        <div className="relative w-full aspect-video bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl ring-1 ring-white/50 overflow-hidden text-slate-800 font-sans">
            <div className="flex h-full">
                {/* Sidebar */}
                <div className="w-16 md:w-20 bg-white/50 border-r border-white/40 flex flex-col items-center py-6 gap-6">
                    <div className="size-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-sky-500/20">
                        <Zap className="size-6 fill-white" />
                    </div>
                    <div className="flex-1 flex flex-col gap-4 w-full px-2">
                        {[LayoutDashboard, PieChart, TrendingUp, Users, Video, Calendar].map((Icon, i) => (
                            <div key={i} className={`p-3 rounded-xl flex items-center justify-center transition-all cursor-pointer ${i === 0 ? 'bg-white shadow-sm text-sky-600' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}>
                                <Icon className="size-5" />
                            </div>
                        ))}
                    </div>
                    <div className="p-3 text-slate-400 hover:text-slate-600 cursor-pointer">
                        <Settings className="size-5" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-white/30">
                    {/* Top Bar */}
                    <div className="h-16 border-b border-white/40 flex items-center justify-between px-6 bg-white/40">
                        <div className="flex items-center gap-4 flex-1">
                            <h2 className="font-bold text-lg text-slate-800 hidden md:block">
                                {variant === 'home' ? 'Overview' : 'Content Studio'}
                            </h2>
                            <div className="max-w-md w-full bg-white/50 h-9 rounded-lg border border-white/50 flex items-center px-3 text-slate-400 gap-2 text-sm">
                                <Search className="size-4" />
                                <span>Search tools, analytics...</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="size-9 rounded-full bg-white/60 flex items-center justify-center text-slate-500 border border-white/50">
                                <Bell className="size-4" />
                            </div>
                            <div className="flex items-center gap-2 pl-2 border-l border-white/30">
                                <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                                <div className="hidden md:block text-sm font-medium">Alex Creator</div>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="flex-1 p-6 overflow-hidden relative">
                        {variant === 'home' ? (
                            // Home Variant: High-level overview
                            <div className="grid grid-cols-3 gap-6 h-full">
                                {/* Left Col: Stats */}
                                <div className="col-span-2 space-y-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { label: "Total Revenue", val: "$12,450", change: "+12%", icon: BarChart3, color: "text-emerald-600", bg: "bg-emerald-50" },
                                            { label: "Active Subs", val: "1,240", change: "+8%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                                            { label: "Content Reach", val: "850k", change: "+24%", icon: Globe, color: "text-purple-600", bg: "bg-purple-50" },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                                        <stat.icon className="size-4" />
                                                    </div>
                                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <ArrowUpRight className="size-3" /> {stat.change}
                                                    </span>
                                                </div>
                                                <div className="text-2xl font-bold text-slate-800">{stat.val}</div>
                                                <div className="text-xs text-slate-500">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Main Chart Area */}
                                    <div className="bg-white/60 rounded-2xl border border-white/50 p-5 shadow-sm flex-1 h-[200px] flex flex-col">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-slate-700">Earnings Overview</h3>
                                            <div className="flex gap-2">
                                                {['1D', '1W', '1M', '1Y'].map(t => (
                                                    <button key={t} className={`px-3 py-1 text-xs rounded-lg ${t === '1M' ? 'bg-sky-500 text-white' : 'bg-white text-slate-500'}`}>{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-1 flex items-end gap-2 px-2">
                                            {[30, 45, 35, 60, 50, 75, 65, 80, 70, 90, 85, 95].map((h, i) => (
                                                <div key={i} className="flex-1 bg-gradient-to-t from-sky-500 to-sky-300 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Col: Active Tools */}
                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-700 px-1">Quick Actions</h3>
                                    {[
                                        { title: "New Script", icon: Type, bg: "bg-indigo-50", color: "text-indigo-600" },
                                        { title: "Record Audio", icon: Mic, bg: "bg-pink-50", color: "text-pink-600" },
                                        { title: "Upload Video", icon: Video, bg: "bg-orange-50", color: "text-orange-600" },
                                    ].map((action, i) => (
                                        <div key={i} className="bg-white/60 p-3 rounded-xl border border-white/50 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-white/80 transition-colors">
                                            <div className={`p-2 rounded-lg ${action.bg} ${action.color}`}>
                                                <action.icon className="size-5" />
                                            </div>
                                            <div className="font-medium text-sm text-slate-700">{action.title}</div>
                                            <Plus className="size-4 ml-auto text-slate-400" />
                                        </div>
                                    ))}

                                    <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-sky-500/20 mt-4">
                                        <div className="text-xs font-medium opacity-80 mb-1">Pro Tip</div>
                                        <div className="text-sm font-bold mb-3">Optimize your content reach with AI suggestions.</div>
                                        <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold backdrop-blur-sm transition-colors">
                                            View Insights
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Product Variant: Detailed Tool View
                            <div className="flex flex-col h-full gap-6">
                                {/* Tool Header */}
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800">Content Studio</h3>
                                        <p className="text-slate-500 text-sm">Manage and repurpose your creative assets</p>
                                    </div>
                                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-colors">
                                        <Plus className="size-4" /> Create New
                                    </button>
                                </div>

                                {/* Kanban / Grid */}
                                <div className="grid grid-cols-3 gap-6 h-full">
                                    {/* Column 1: Ideas */}
                                    <div className="bg-white/40 rounded-2xl p-4 border border-white/40 flex flex-col gap-3">
                                        <div className="flex justify-between items-center mb-2 px-2">
                                            <span className="text-sm font-bold text-slate-600">Ideas</span>
                                            <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">4</span>
                                        </div>
                                        {[
                                            { title: "AI VS Code", type: "Video Concept", tag: "Tech" },
                                            { title: "Morning Routine", type: "Shorts", tag: "Lifestyle" },
                                        ].map((card, i) => (
                                            <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-grab">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded mr-2">{card.tag}</span>
                                                    <MoreHorizontal className="size-4 text-slate-400" />
                                                </div>
                                                <div className="font-bold text-sm text-slate-800 mb-1">{card.title}</div>
                                                <div className="text-xs text-slate-500">{card.type}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Column 2: In Progress */}
                                    <div className="bg-white/40 rounded-2xl p-4 border border-white/40 flex flex-col gap-3">
                                        <div className="flex justify-between items-center mb-2 px-2">
                                            <span className="text-sm font-bold text-sky-600">In Progress</span>
                                            <span className="bg-sky-100 text-sky-600 text-[10px] px-2 py-0.5 rounded-full font-bold">2</span>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                            <div className="w-full h-24 bg-slate-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="size-8 rounded-full bg-white flex items-center justify-center">
                                                        <Video className="size-4 text-slate-900" />
                                                    </div>
                                                </div>
                                                <Video className="size-8 text-slate-300" />
                                            </div>
                                            <div className="font-bold text-sm text-slate-800 mb-2">React Tutorial.mp4</div>
                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-sky-500 w-[60%] rounded-full" />
                                            </div>
                                            <div className="flex justify-between mt-2 text-[10px] text-slate-500">
                                                <span>Rendering...</span>
                                                <span>60%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 3: Completed */}
                                    <div className="bg-white/40 rounded-2xl p-4 border border-white/40 flex flex-col gap-3">
                                        <div className="flex justify-between items-center mb-2 px-2">
                                            <span className="text-sm font-bold text-emerald-600">Ready</span>
                                            <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold">12</span>
                                        </div>
                                        {[1, 2, 3].map((_, i) => (
                                            <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                                                <div className="size-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                                    <CheckCircle2 className="size-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-sm text-slate-800 truncate">Sponsorship_Final.pdf</div>
                                                    <div className="text-[10px] text-slate-500">Just now</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none rounded-3xl" />
        </div>
    );
}

// Helper for CheckCircle2 (Icon alias handling)
import { CheckCircle2 } from "lucide-react";
