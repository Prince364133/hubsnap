"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle2, Crown, Sparkles } from "lucide-react";
import { AdvancedDashboardPreview } from "@/components/creator-os/AdvancedDashboardPreview";

export function CreatorOSHighlight() {
    return (
        <section className="py-24 px-6 bg-transparent relative overflow-hidden">
            {/* Ambient Background Blobs */}
            <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-200/40 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 -z-10" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-700 text-sm font-bold uppercase tracking-wider shadow-sm">
                            <Crown className="size-4" />
                            Flagship Product
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black leading-tight text-slate-900 tracking-tight">
                            The Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">Top 1% Creators</span>
                        </h2>

                        <p className="text-xl text-slate-600 leading-relaxed font-medium">
                            Stop using 10 different tools. Creator OS gives you everything you need to research, create, and monetize content in one powerful dashboard.
                        </p>

                        <div className="space-y-4">
                            {[
                                "AI-Powered Niche Discovery & Trend Detection",
                                "Automated Video & Audiobook Generation",
                                "Multi-Platform Analytics & Income Tracking",
                                "Content Repurposing for 10x Reach"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="size-6 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="size-4 text-sky-600" />
                                    </div>
                                    <span className="text-slate-700 font-bold">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link href="/products/creator-os">
                                <Button className="h-14 px-8 rounded-full text-lg font-bold gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20 hover:scale-105 transition-all">
                                    Explore Creator OS <ArrowRight className="size-5" />
                                </Button>
                            </Link>
                            <Link href="/waitlist">
                                <Button variant="outline" className="h-14 px-8 rounded-full text-lg font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 bg-white/50 backdrop-blur-sm">
                                    <Sparkles className="size-5 mr-2 text-sky-500" /> Join Waitlist
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Visual representation - Advanced Dashboard Variant */}
                    <div className="relative group">
                        <div className="transform transition-transform duration-500 hover:scale-[1.02]">
                            <AdvancedDashboardPreview variant="home" />

                            {/* Floating badges */}
                            <div className="absolute -top-6 -right-6 bg-emerald-500 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 animate-bounce cursor-default hover:bg-emerald-600 transition-colors z-20">
                                +$4,250/mo
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-sky-500 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-sky-500/20 animate-bounce delay-700 cursor-default hover:bg-sky-600 transition-colors z-20">
                                +150k Views
                            </div>
                        </div>

                        {/* Glow behind container */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/30 to-cyan-400/30 blur-3xl -z-10 group-hover:blur-2xl transition-all duration-500" />
                    </div>
                </div>
            </div>
        </section>
    );
}
