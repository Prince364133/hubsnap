

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { WhoIsThisFor } from "@/components/creator-os/WhoIsThisFor";
import { ProblemSolution } from "@/components/creator-os/ProblemSolution";
import { WhatMakesUsDifferent } from "@/components/creator-os/WhatMakesUsDifferent";
import { IncomePaths } from "@/components/creator-os/IncomePaths";
import { ToolsSection } from "@/components/creator-os/ToolsSection";
import { SampleOutput } from "@/components/creator-os/SampleOutput";
import { EarningPotentialCalculator } from "@/components/creator-os/EarningPotentialCalculator";
import { SuccessStories } from "@/components/creator-os/SuccessStories";
import { FAQ } from "@/components/creator-os/FAQ";
import CountdownTimer from "@/components/CountdownTimer";
import {
    Zap,
    TrendingUp,
    BarChart3,
    Sparkles,
    Video,
    Lightbulb,
    Bookmark,
    DollarSign,
    ArrowRight,
    CheckCircle2,
    Clock,
    Users,
    Rocket,
    Brain,
    Target,
    Wrench,
    MessageSquare,
    Mic,
    Type,
    Scissors,
    RefreshCw,
    TestTube,
    Calendar
} from "lucide-react";

import { Metadata } from "next";
import { AdvancedDashboardPreview } from "@/components/creator-os/AdvancedDashboardPreview";

export const metadata: Metadata = {
    title: "Creator OS - The Operating System for Top 1% Creators",
    description: "All-in-one dashboard research, content generation, and monetization. Analyze trends, generate scripts, and track income in one place.",
    keywords: ["creator os", "content management system", "creator dashboard", "youtube automation", "content repurposing"],
    openGraph: {
        title: "Creator OS - Scale Your Content Business",
        description: "The ultimate workflow tool for serious creators. Join the waitlist for early access.",
        images: ["/og-creator-os.png"],
    }
};

export default function CreatorOSPage() {
    const coreFeatures = [
        {
            icon: Lightbulb,
            title: "Channel Ideas Generator",
            description: "AI-powered niche discovery with complete monetization blueprints. Get 10 profitable channel ideas in seconds.",
            status: "Live"
        },
        {
            icon: TrendingUp,
            title: "Trend Detector",
            description: "Spot viral topics 48 hours before they peak. Real-time trend analysis across all major platforms.",
            status: "Live"
        },
        {
            icon: Video,
            title: "Content Pack Generator",
            description: "Generate complete content packs with AI scripts, SOPs, image prompts, and research keywords.",
            status: "Live"
        },
        {
            icon: BarChart3,
            title: "YouTube Analytics",
            description: "Deep insights into your channel performance, audience behavior, and retention metrics.",
            status: "Live"
        },
        {
            icon: DollarSign,
            title: "Income Tracker",
            description: "Monitor all revenue streams - affiliate earnings, sponsorships, ad revenue, and more.",
            status: "Live"
        },
        {
            icon: Bookmark,
            title: "Saved Ideas Library",
            description: "Organize and save your best ideas. Never lose a great content concept again.",
            status: "Live"
        },
        // New Creator OS Features
        {
            icon: MessageSquare,
            title: "Audience Insight Engine",
            description: "Analyze real audience comments to discover what your audience actually wants. Evidence-based content ideas from Instagram, YouTube, and competitor channels.",
            status: "Coming Soon"
        },
        {
            icon: Mic,
            title: "AI Audiobook Studio",
            description: "Convert written content into professional audiobook videos automatically. Background rendering with preset editing styles.",
            status: "Coming Soon"
        },
        {
            icon: Type,
            title: "Textography Reels Generator",
            description: "Create engaging text-based Instagram Reels in under 2 minutes. No face, no voice, just viral content with animated text and music.",
            status: "Coming Soon"
        },
        {
            icon: Scissors,
            title: "Snap Clipper",
            description: "Extract best moments from long videos into viral short clips automatically. AI-powered moment detection with vertical format conversion.",
            status: "Coming Soon"
        },
        {
            icon: RefreshCw,
            title: "Content Lifespan Optimizer",
            description: "Transform one content idea into multiple platform-specific formats. Maximize reach by repurposing across all platforms.",
            status: "Coming Soon"
        },
        {
            icon: TestTube,
            title: "Hook Effectiveness Tester",
            description: "Score your content hooks before posting. Get AI-powered improvement suggestions based on curiosity, clarity, and emotional pull.",
            status: "Coming Soon"
        },
        {
            icon: Calendar,
            title: "Creator Consistency Tracker",
            description: "Track creative momentum and prevent burnout. Monitor streaks, active days, and consistency scores with gentle, supportive insights.",
            status: "Coming Soon"
        }
    ];

    const upcomingFeatures = [
        {
            icon: Users,
            title: "Multi-Platform Support",
            description: "Manage TikTok, Instagram, and Twitter content from one dashboard.",
            timeline: "Q2 2026"
        },
        {
            icon: Brain,
            title: "Advanced AI Models",
            description: "GPT-4, Claude, and custom-trained models for even better content generation.",
            timeline: "Q2 2026"
        },
        {
            icon: Wrench,
            title: "Collaboration Tools",
            description: "Team workspaces, shared libraries, and collaborative content planning.",
            timeline: "Q3 2026"
        },
        {
            icon: Target,
            title: "White-Label Options",
            description: "Rebrand Creator OS for your agency or team with custom branding.",
            timeline: "Q3 2026"
        }
    ];

    const howItWorks = [
        {
            step: "1",
            title: "Discover Your Niche",
            description: "Use AI to find profitable niches with low competition and high monetization potential."
        },
        {
            step: "2",
            title: "Spot Trends Early",
            description: "Get real-time alerts on trending topics before they go viral. Stay ahead of the curve."
        },
        {
            step: "3",
            title: "Generate Content",
            description: "Create complete content packs with scripts, SOPs, and research in minutes."
        },
        {
            step: "4",
            title: "Track & Optimize",
            description: "Monitor performance, analyze what works, and scale your winning content."
        }
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <PublicHeader />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-primary text-xs font-bold uppercase tracking-wider">
                            <Sparkles className="size-3" /> Now with AI Script Generation
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                            The Operating System for <span className="text-primary italic">Top 1%</span> Creators
                        </h1>
                        <p className="text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Stop guessing. Use real-time trends, deep analytics, and AI-powered workflows to build your media empire faster.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                            <Link href="/signup">
                                <Button className="h-14 px-8 rounded-full text-lg font-bold gap-2 group shadow-xl shadow-primary/25">
                                    Start For Free <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/creator_os_dashboard/home">
                                <Button variant="outline" className="h-14 px-8 rounded-full text-lg font-bold border-2">
                                    Live Demo
                                </Button>
                            </Link>
                        </div>
                        <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="size-4 text-green-500" /> No Card Required
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="size-4 text-green-500" /> Start in 60s
                            </div>
                        </div>
                    </div>


                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-purple-500/10 blur-3xl rounded-full" />
                        <div className="relative transform hover:scale-[1.02] transition-transform duration-500">
                            <AdvancedDashboardPreview variant="product" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Launch Countdown Timer */}
            <CountdownTimer />

            {/* Core Features */}
            <section className="py-20 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-3">Core Features</h2>
                        <p className="text-slate-500 text-lg">Everything you need to create, analyze, and monetize</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coreFeatures.map((feature, i) => (
                            <Card key={i} className="p-6 border-slate-200 hover:border-primary hover:shadow-lg transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <feature.icon className="size-6 text-primary" />
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full font-bold">{feature.status}</span>
                                </div>
                                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-3">How It Works</h2>
                        <p className="text-slate-500 text-lg">Your path to creator success in 4 simple steps</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {howItWorks.map((item, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="size-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shrink-0">
                                    {item.step}
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                                    <p className="text-slate-600">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Upcoming Features */}
            <section className="py-20 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-3">Coming Soon</h2>
                        <p className="text-slate-500 text-lg">Exciting features on our roadmap</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {upcomingFeatures.map((feature, i) => (
                            <Card key={i} className="p-6 border-slate-200 hover:border-primary hover:shadow-lg transition-all group">
                                <div className="size-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <feature.icon className="size-6 text-purple-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="size-4 text-slate-400" />
                                    <span className="text-xs text-slate-500 font-medium">{feature.timeline}</span>
                                </div>
                                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* New Conversion-Focused Sections */}
            <WhoIsThisFor />
            <EarningPotentialCalculator />
            <ProblemSolution />
            <SuccessStories />
            <WhatMakesUsDifferent />
            <SampleOutput />
            <IncomePaths />
            <ToolsSection />
            <FAQ />

            {/* Pricing CTA */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl font-bold mb-3">Simple, Transparent Pricing</h2>
                    <p className="text-slate-500 text-lg mb-8">
                        Start free, upgrade when you're ready. No hidden fees, cancel anytime.
                    </p>
                    <Link href="/pricing">
                        <Button className="h-14 px-10 rounded-full text-lg font-bold gap-2 shadow-xl shadow-primary/25">
                            View Detailed Pricing <ArrowRight className="size-5" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-white text-slate-900 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
                    {/* Frosted glass container */}
                    <div className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-12 shadow-[0_10px_40px_rgba(0,0,0,0.15)] animate-fade-in">
                        <h2 className="text-4xl font-bold mb-4 text-slate-900 animate-slide-up">Ready to join the top 1%?</h2>
                        <p className="text-slate-600 text-lg mb-8 animate-slide-up animation-delay-200">
                            Stop burning hours on manual research. Let Creator OS handle the data so you can handle the art.
                        </p>
                        <Link href="/signup">
                            <Button className="h-14 px-10 rounded-full text-lg font-bold gap-2 shadow-xl shadow-primary/25 bg-primary hover:bg-primary-dark text-white transition-all duration-300 animate-slide-up animation-delay-400">
                                Start Creating Smarter <ArrowRight className="size-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
