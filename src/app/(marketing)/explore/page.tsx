"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { dbService, Tool } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
    Zap,
    Search,
    SlidersHorizontal,
    Sparkles,
    Grid3x3,
    List,
    Lock,
    ArrowRight,
    Compass
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PublicExplorePage() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [pricingFilter, setPricingFilter] = useState("All");
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        loadTools();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [tools, searchQuery, categoryFilter, pricingFilter]);

    const loadTools = async () => {
        setLoading(true);
        const data = await dbService.getTools();
        setTools(data);
        const uniqueCategories = Array.from(new Set(data.flatMap(t => t.categories || []))).sort();
        setCategories(uniqueCategories);
        setLoading(false);
    };

    const applyFilters = () => {
        let filtered = [...tools];
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(tool =>
                tool.name.toLowerCase().includes(query) ||
                tool.company?.toLowerCase().includes(query) ||
                tool.shortDesc?.toLowerCase().includes(query) ||
                tool.categories.some(c => c.toLowerCase().includes(query))
            );
        }
        if (categoryFilter !== "All") {
            filtered = filtered.filter(tool => tool.categories.includes(categoryFilter));
        }
        if (pricingFilter !== "All") {
            filtered = filtered.filter(tool => tool.pricingModel === pricingFilter);
        }
        setFilteredTools(filtered);
    };

    const surpriseMe = () => {
        if (filteredTools.length > 0) {
            const randomTool = filteredTools[Math.floor(Math.random() * filteredTools.length)];
            window.open(randomTool.website, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <PublicHeader />

            {/* Hero Section */}
            <section className="pt-32 pb-12 px-6">
                <div className="max-w-7xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-primary text-xs font-bold uppercase tracking-wider">
                        <Compass className="size-3" /> 650+ AI Tools
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                        Explore <span className="text-primary italic">AI Tools</span> Directory
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Discover the perfect AI tool for your workflow. Filter by category, pricing, and use case.
                    </p>
                </div>
            </section>

            {/* Search & Filters */}
            <section className="px-6 pb-12">
                <div className="max-w-7xl mx-auto space-y-4">
                    <Card className="p-4 border-slate-200">
                        <div className="flex gap-3 items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search AI tools, categories, or keywords..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <Button onClick={surpriseMe} variant="outline" className="whitespace-nowrap">
                                <Sparkles className="size-4 mr-2" />
                                Surprise Me
                            </Button>
                            <Button
                                onClick={() => setShowFilters(!showFilters)}
                                variant="outline"
                                className="whitespace-nowrap"
                            >
                                <SlidersHorizontal className="size-4 mr-2" />
                                Filters
                            </Button>
                        </div>
                    </Card>

                    {showFilters && (
                        <Card className="p-6 border-slate-200 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg">Filter Options</h3>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setCategoryFilter("All");
                                        setPricingFilter("All");
                                    }}
                                >
                                    Clear All
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Category</label>
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="All">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Pricing</label>
                                    <select
                                        value={pricingFilter}
                                        onChange={(e) => setPricingFilter(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="All">All Pricing</option>
                                        <option value="FREE">FREE</option>
                                        <option value="PAID">PAID</option>
                                        <option value="FREE_PAID">FREE + PAID</option>
                                    </select>
                                </div>
                            </div>
                        </Card>
                    )}

                    <div className="flex justify-between items-center">
                        <p className="text-slate-500 text-sm">
                            {filteredTools.length} tools found
                        </p>
                        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={cn(
                                    "p-2 rounded transition-colors",
                                    viewMode === "grid" ? "bg-primary text-white" : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                <Grid3x3 className="size-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "p-2 rounded transition-colors",
                                    viewMode === "list" ? "bg-primary text-white" : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                <List className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tools Grid */}
            <section className="px-6 pb-20">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="mt-4 text-slate-500">Loading AI tools...</p>
                        </div>
                    ) : filteredTools.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500">No tools found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className={cn(
                            "grid gap-6",
                            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                        )}>
                            {filteredTools.map(tool => (
                                <a
                                    key={tool.id}
                                    href={tool.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <Card className="p-6 border-slate-200 hover:border-primary hover:shadow-lg transition-all cursor-pointer h-full relative group">
                                        {tool.locked && (
                                            <div className="absolute top-4 right-4">
                                                <Lock className="size-5 text-yellow-500" />
                                            </div>
                                        )}
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="font-bold text-xl group-hover:text-primary transition-colors">
                                                    {tool.name}
                                                </h3>
                                                {tool.company && (
                                                    <p className="text-sm text-slate-500">{tool.company}</p>
                                                )}
                                            </div>
                                            {tool.shortDesc && (
                                                <p className="text-sm text-slate-600 line-clamp-2">
                                                    {tool.shortDesc}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap gap-2">
                                                {tool.categories.slice(0, 3).map(cat => (
                                                    <span
                                                        key={cat}
                                                        className="text-xs px-3 py-1 bg-blue-50 text-primary rounded-full font-medium"
                                                    >
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                <span className={cn(
                                                    "text-xs font-bold px-3 py-1 rounded-full",
                                                    tool.pricingModel === "FREE" ? "bg-green-50 text-green-700" :
                                                        tool.pricingModel === "PAID" ? "bg-blue-50 text-blue-700" :
                                                            "bg-purple-50 text-purple-700"
                                                )}>
                                                    {tool.pricingModel}
                                                </span>
                                                <ArrowRight className="size-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    </Card>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-slate-50">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl font-bold">Ready to supercharge your workflow?</h2>
                    <p className="text-slate-500 text-lg">
                        Join Creator OS to access exclusive AI tools, guides, and workflows designed for top creators.
                    </p>
                    <Link href="/signup">
                        <Button className="h-14 px-10 rounded-full text-lg font-bold shadow-xl shadow-primary/25">
                            Get Started for Free
                        </Button>
                    </Link>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
