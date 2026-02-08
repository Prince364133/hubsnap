"use client";

import { useState, useEffect } from "react";
import { dbService, Tool } from "@/lib/firestore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, SlidersHorizontal, Sparkles, Grid3x3, List, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ExplorePage() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Filters
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

        // Extract unique categories
        const uniqueCategories = Array.from(
            new Set(data.flatMap(t => t.categories || []))
        ).sort();
        setCategories(uniqueCategories);

        setLoading(false);
    };

    const applyFilters = () => {
        let filtered = [...tools];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(tool =>
                tool.name.toLowerCase().includes(query) ||
                tool.company?.toLowerCase().includes(query) ||
                tool.shortDesc?.toLowerCase().includes(query) ||
                tool.categories.some(c => c.toLowerCase().includes(query))
            );
        }

        // Category filter
        if (categoryFilter !== "All") {
            filtered = filtered.filter(tool =>
                tool.categories.includes(categoryFilter)
            );
        }

        // Pricing filter
        if (pricingFilter !== "All") {
            filtered = filtered.filter(tool => tool.pricingModel === pricingFilter);
        }

        setFilteredTools(filtered);
    };

    const surpriseMe = () => {
        if (filteredTools.length > 0) {
            const randomTool = filteredTools[Math.floor(Math.random() * filteredTools.length)];
            window.location.href = `/dashboard/explore/${randomTool.id}`;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                    Explore AI Tools
                </h1>
                <p className="text-text-secondary">
                    Discover 650+ AI tools to supercharge your workflow
                </p>
            </div>

            {/* Search & Controls */}
            <Card className="p-4">
                <div className="flex gap-3 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search AI tools, categories, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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

            {/* Advanced Filters */}
            {showFilters && (
                <Card className="p-6 space-y-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Category
                            </label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="All">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Pricing
                            </label>
                            <select
                                value={pricingFilter}
                                onChange={(e) => setPricingFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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

            {/* Results Count & View Toggle */}
            <div className="flex justify-between items-center">
                <p className="text-text-secondary text-sm">
                    {filteredTools.length} tools found
                </p>
                <div className="flex gap-2 bg-surface-100 p-1 rounded-lg border border-border">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={cn(
                            "p-2 rounded transition-colors",
                            viewMode === "grid" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
                        )}
                    >
                        <Grid3x3 className="size-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "p-2 rounded transition-colors",
                            viewMode === "list" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
                        )}
                    >
                        <List className="size-4" />
                    </button>
                </div>
            </div>

            {/* Tools Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-text-secondary">Loading AI tools...</p>
                </div>
            ) : filteredTools.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-text-secondary">No tools found matching your criteria.</p>
                </div>
            ) : (
                <div className={cn(
                    "grid gap-4",
                    viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                    {filteredTools.map(tool => (
                        <Link key={tool.id} href={`/dashboard/explore/${tool.id}`}>
                            <Card className="p-5 hover:border-primary transition-all cursor-pointer h-full relative group">
                                {tool.locked && (
                                    <div className="absolute top-3 right-3">
                                        <Lock className="size-5 text-yellow-500" />
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                            {tool.name}
                                        </h3>
                                        {tool.company && (
                                            <p className="text-sm text-text-secondary">{tool.company}</p>
                                        )}
                                    </div>
                                    {tool.shortDesc && (
                                        <p className="text-sm text-text-secondary line-clamp-2">
                                            {tool.shortDesc}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {tool.categories.slice(0, 3).map(cat => (
                                            <span
                                                key={cat}
                                                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-border">
                                        <span className={cn(
                                            "text-xs font-medium px-2 py-1 rounded",
                                            tool.pricingModel === "FREE" ? "bg-green-50 text-green-700" :
                                                tool.pricingModel === "PAID" ? "bg-blue-50 text-blue-700" :
                                                    "bg-purple-50 text-purple-700"
                                        )}>
                                            {tool.pricingModel}
                                        </span>
                                        {tool.launchYear && (
                                            <span className="text-xs text-text-secondary">
                                                {tool.launchYear}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
