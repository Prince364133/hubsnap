"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
    Zap,
    TrendingUp,
    BarChart3,
    Sparkles,
    Compass,
    BookOpen,
    DollarSign,
    Video,
    Lightbulb,
    ArrowRight,
    CheckCircle2,
    Rocket,
    Brain,
    Target
} from "lucide-react";

export default function FeaturesPage() {
    const features = [
        {
            icon: Brain,
            title: "AI-Powered Content Generation",
            description: "Generate high-retention scripts, video ideas, and content packs using advanced AI models trained on millions of viral videos.",
            color: "text-purple-500",
            bg: "bg-purple-50"
        },
        {
            icon: TrendingUp,
            title: "Real-Time Trend Detection",
            description: "Spot viral topics 48 hours before they peak. Stay ahead of the curve and maximize your content's reach.",
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            icon: BarChart3,
            title: "Advanced Analytics Dashboard",
            description: "Deep insights into audience behavior, retention metrics, and performance analytics across all your channels.",
            color: "text-green-500",
            bg: "bg-green-50"
        },
        {
            icon: Compass,
            title: "650+ AI Tools Directory",
            description: "Curated collection of the best AI tools for creators. Filter by category, pricing, and use case to find your perfect match.",
            color: "text-amber-500",
            bg: "bg-amber-50"
        },
        {
            icon: BookOpen,
            title: "Knowledge Base & Guides",
            description: "Freelancing kits, templates, and blueprints to help you execute faster. Learn from proven strategies and frameworks.",
            color: "text-pink-500",
            bg: "bg-pink-50"
        },
        {
            icon: DollarSign,
            title: "Income Tracking",
            description: "Monitor all your revenue streams in one place. Track affiliate earnings, sponsorships, and ad revenue effortlessly.",
            color: "text-emerald-500",
            bg: "bg-emerald-50"
        },
        {
            icon: Lightbulb,
            title: "Channel Ideas Generator",
            description: "Discover profitable niche ideas with AI-powered suggestions. Get complete channel blueprints with monetization strategies.",
            color: "text-indigo-500",
            bg: "bg-indigo-50"
        },
        {
            icon: Video,
            title: "Multi-Platform Support",
            description: "Manage content for YouTube, TikTok, Instagram, and more from a single dashboard. Cross-platform analytics included.",
            color: "text-red-500",
            bg: "bg-red-50"
        }
    ];

    const products = [
        {
            name: "Creator OS",
            description: "The operating system for top 1% creators. AI-powered workflows, trend detection, and content generation.",
            link: "/products/creator-os",
            badge: "Flagship Product"
        },
        {
            name: "AI Tools Directory",
            description: "Explore 650+ curated AI tools for creators. Find the perfect tool for every task in your workflow.",
            link: "/explore",
            badge: "650+ Tools"
        },
        {
            name: "Knowledge Base",
            description: "Freelancing kits, templates, and blueprints. Learn proven strategies from successful creators.",
            link: "/guides",
            badge: "Premium Guides"
        }
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <PublicHeader />

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-6">
                <div className="max-w-7xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-primary text-xs font-bold uppercase tracking-wider">
                        <Rocket className="size-3" />
                        All Features
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                        Everything You Need to <span className="text-primary italic">Scale</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
                        HubSnap provides creators with AI-powered tools, real-time insights, and proven frameworks to build sustainable media businesses.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, i) => (
                            <Card key={i} className="p-6 border-slate-200 hover:border-primary hover:shadow-lg transition-all group">
                                <div className={`size-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.bg}`}>
                                    <feature.icon className={`size-6 ${feature.color}`} />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products Showcase */}
            <section className="py-20 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-3">Our Products</h2>
                        <p className="text-slate-500 text-lg">Powerful tools designed for modern creators</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {products.map((product, i) => (
                            <Link key={i} href={product.link}>
                                <Card className="p-8 border-slate-200 hover:border-primary hover:shadow-xl transition-all cursor-pointer h-full group">
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{product.name}</h3>
                                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-bold">{product.badge}</span>
                                        </div>
                                        <p className="text-slate-600">{product.description}</p>
                                        <div className="flex items-center gap-2 text-primary font-medium pt-2">
                                            Learn More <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose HubSnap */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-3">Why Choose HubSnap?</h2>
                        <p className="text-slate-500 text-lg">Built by creators, for creators</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { icon: Target, title: "Data-Driven Decisions", desc: "Stop guessing. Use real-time analytics and AI insights to create content that performs." },
                            { icon: Rocket, title: "Faster Execution", desc: "Generate scripts, find trends, and plan content in minutes instead of hours." },
                            { icon: Brain, title: "AI-Powered Workflows", desc: "Leverage cutting-edge AI to automate repetitive tasks and focus on creativity." },
                            { icon: CheckCircle2, title: "All-in-One Platform", desc: "Everything you need in one place. No more juggling between dozens of tools." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <item.icon className="size-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                    <p className="text-slate-600">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-black text-white">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <h2 className="text-4xl font-bold">Ready to Level Up?</h2>
                    <p className="text-slate-400 text-lg">
                        Join thousands of creators using HubSnap to build smarter, faster, and more profitably.
                    </p>
                    <Link href="/signup">
                        <Button className="h-14 px-10 rounded-full text-lg font-bold bg-white text-black hover:bg-slate-100 shadow-2xl">
                            Start Free Today
                        </Button>
                    </Link>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
