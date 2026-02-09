"use client";

import { useState, useEffect, useMemo } from "react";
import { dbService, Tool } from "@/lib/firestore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import {
    Search, SlidersHorizontal, Sparkles, Grid3x3, List, Lock,
    X, Filter, ChevronDown, Check, ArrowUpDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter
} from "@/components/ui/Sheet";
import { Label } from "@/components/ui/Label";

export default function ExplorePage() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // --- Filter States ---
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
    const [selectedPricing, setSelectedPricing] = useState<string[]>([]); // FREE, PAID, FREE_PAID
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]); // Web, App, API
    const [sortBy, setSortBy] = useState<"newest" | "popularity">("popularity");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- Derived Data ---
    const allCategories = useMemo(() => {
        return Array.from(new Set(tools.flatMap(t => t.categories || []))).sort();
    }, [tools]);

    const allUseCases = useMemo(() => {
        return Array.from(new Set(tools.flatMap(t => t.useCases || []))).sort();
    }, [tools]);

    const allPlatforms = useMemo(() => {
        return Array.from(new Set(tools.flatMap(t => t.platforms || []))).sort();
    }, [tools]);

    useEffect(() => {
        loadTools();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [
        tools, searchQuery,
        selectedCategories, selectedUseCases, selectedPricing, selectedPlatforms,
        sortBy
    ]);

    const loadTools = async () => {
        setLoading(true);
        const data = await dbService.getTools();
        setTools(data);
        setLoading(false);
    };

    const applyFilters = () => {
        let result = [...tools];

        // 1. Search (Name, Desc, Company)
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(tool =>
                tool.name.toLowerCase().includes(q) ||
                tool.company?.toLowerCase().includes(q) ||
                tool.shortDesc?.toLowerCase().includes(q) ||
                tool.categories.some(c => c.toLowerCase().includes(q))
            );
        }

        // 2. Categories (OR logic within category, AND logic with others)
        if (selectedCategories.length > 0) {
            result = result.filter(tool =>
                tool.categories.some(cat => selectedCategories.includes(cat))
            );
        }

        // 3. Use Cases
        if (selectedUseCases.length > 0) {
            result = result.filter(tool =>
                tool.useCases?.some(uc => selectedUseCases.includes(uc))
            );
        }

        // 4. Pricing
        if (selectedPricing.length > 0) {
            result = result.filter(tool =>
                selectedPricing.includes(tool.pricingModel)
            );
        }

        // 5. Platforms
        if (selectedPlatforms.length > 0) {
            result = result.filter(tool =>
                tool.platforms?.some(p => selectedPlatforms.includes(p))
            );
        }

        // 6. Sorting
        result.sort((a, b) => {
            if (sortBy === "popularity") {
                return (b.views || 0) - (a.views || 0);
            } else {
                // Newest
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

        setFilteredTools(result);
    };

    const toggleFilter = (
        list: string[],
        setList: (l: string[]) => void,
        item: string
    ) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedUseCases([]);
        setSelectedPricing([]);
        setSelectedPlatforms([]);
        setSearchQuery("");
    };

    const activeFilterCount =
        selectedCategories.length +
        selectedUseCases.length +
        selectedPricing.length +
        selectedPlatforms.length;

    const surpriseMe = () => {
        if (filteredTools.length > 0) {
            const randomTool = filteredTools[Math.floor(Math.random() * filteredTools.length)];
            window.location.href = `/dashboard/explore/${randomTool.id}`;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                        Explore AI Tools
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Discover {tools.length}+ tools to supercharge your workflow
                    </p>
                </div>
                <Button onClick={surpriseMe} variant="outline" className="hidden md:flex">
                    <Sparkles className="size-4 mr-2" />
                    Surprise Me
                </Button>
            </div>

            {/* Search & Mobile Filter Trigger */}
            <Card className="p-2 flex gap-2 items-center sticky top-4 z-10 shadow-sm border-slate-200">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search tools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-transparent text-sm focus:outline-none"
                    />
                </div>

                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                    <SheetTrigger asChild>
                        <Button variant={activeFilterCount > 0 ? "default" : "outline"} size="sm" className="gap-2">
                            <SlidersHorizontal className="size-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:w-[400px] overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Filters</SheetTitle>
                            <SheetDescription>
                                Refine your search results.
                            </SheetDescription>
                        </SheetHeader>

                        <div className="py-6 space-y-8">
                            {/* Sort By */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm text-slate-900">Sort By</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant={sortBy === "popularity" ? "default" : "outline"}
                                        size="sm"
                                        className="justify-start"
                                        onClick={() => setSortBy("popularity")}
                                    >
                                        🔥 Popularity
                                    </Button>
                                    <Button
                                        variant={sortBy === "newest" ? "default" : "outline"}
                                        size="sm"
                                        className="justify-start"
                                        onClick={() => setSortBy("newest")}
                                    >
                                        ✨ Newest
                                    </Button>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm text-slate-900">Pricing</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['FREE', 'PAID', 'FREE_PAID'].map(price => (
                                        <div key={price} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`price-${price}`}
                                                checked={selectedPricing.includes(price)}
                                                onCheckedChange={() => toggleFilter(selectedPricing, setSelectedPricing, price)}
                                            />
                                            <label
                                                htmlFor={`price-${price}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {price === 'FREE_PAID' ? 'Freemium' : price.charAt(0) + price.slice(1).toLowerCase()}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm text-slate-900">Categories</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {allCategories.map(cat => (
                                        <div key={cat} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`cat-${cat}`}
                                                checked={selectedCategories.includes(cat)}
                                                onCheckedChange={() => toggleFilter(selectedCategories, setSelectedCategories, cat)}
                                            />
                                            <label htmlFor={`cat-${cat}`} className="text-sm leading-none cursor-pointer truncate max-w-[120px]" title={cat}>
                                                {cat}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Platforms */}
                            {allPlatforms.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm text-slate-900">Platform</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {allPlatforms.map(p => (
                                            <div key={p} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`plat-${p}`}
                                                    checked={selectedPlatforms.includes(p)}
                                                    onCheckedChange={() => toggleFilter(selectedPlatforms, setSelectedPlatforms, p)}
                                                />
                                                <label htmlFor={`plat-${p}`} className="text-sm leading-none cursor-pointer">
                                                    {p}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Use Cases */}
                            {allUseCases.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm text-slate-900">Use Case</h4>
                                    <div className="flex flex-col gap-2">
                                        {allUseCases.slice(0, 8).map(uc => (
                                            <div key={uc} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`uc-${uc}`}
                                                    checked={selectedUseCases.includes(uc)}
                                                    onCheckedChange={() => toggleFilter(selectedUseCases, setSelectedUseCases, uc)}
                                                />
                                                <label htmlFor={`uc-${uc}`} className="text-sm leading-none cursor-pointer">
                                                    {uc}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100">
                            <Button variant="outline" onClick={clearFilters} className="w-full mb-2">
                                Clear All
                            </Button>
                            <Button onClick={() => setIsSidebarOpen(false)} className="w-full">
                                Show {filteredTools.length} Results
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>

                <div className="border-l border-slate-200 h-6 mx-2 hidden md:block"></div>

                {/* View Toggle (Desktop) */}
                <div className="hidden md:flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={cn(
                            "p-1.5 rounded transition-colors",
                            viewMode === "grid" ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <Grid3x3 className="size-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "p-1.5 rounded transition-colors",
                            viewMode === "list" ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <List className="size-4" />
                    </button>
                </div>
            </Card>

            {/* Results */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-4 text-sm text-slate-400">Loading tools...</p>
                </div>
            ) : filteredTools.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <Filter className="size-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="font-medium text-slate-900">No matching tools found</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-4">Try adjusting your filters or search query.</p>
                    <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
                </div>
            ) : (
                <div className={cn(
                    "grid gap-4",
                    viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                    {filteredTools.map(tool => (
                        <a key={tool.id} href={tool.website} target="_blank" rel="noopener noreferrer" className="block h-full">
                            <Card className={cn(
                                "group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-md h-full",
                                viewMode === "grid" ? "p-5 flex flex-col" : "p-4 flex gap-4 items-start"
                            )}>
                                {tool.locked && (
                                    <div className="absolute top-3 right-3 z-10">
                                        <Lock className="size-4 text-yellow-500" />
                                    </div>
                                )}

                                <div className="flex-1 space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            {tool.company && (
                                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    {tool.company}
                                                </span>
                                            )}
                                            {(tool.views || 0) > 0 && (
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    🔥 {tool.views}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
                                            {tool.name}
                                        </h3>
                                    </div>

                                    {tool.shortDesc && (
                                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                            {tool.shortDesc}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {tool.categories.slice(0, 3).map(cat => (
                                            <span key={cat} className="text-[10px] font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className={cn(
                                    "flex items-center justify-between pt-3 border-t border-slate-100 mt-auto w-full",
                                    viewMode === "list" && "flex-col items-end gap-2 border-t-0 p-0 w-32 shrink-0"
                                )}>
                                    <span className={cn(
                                        "text-xs font-bold px-2 py-0.5 rounded",
                                        tool.pricingModel === "FREE" ? "bg-green-100 text-green-700" :
                                            tool.pricingModel === "PAID" ? "bg-blue-100 text-blue-700" :
                                                "bg-purple-100 text-purple-700"
                                    )}>
                                        {tool.pricingModel === 'FREE_PAID' ? 'FREEMIUM' : tool.pricingModel}
                                    </span>

                                    {tool.platforms && tool.platforms.length > 0 && (
                                        <span className="text-xs text-slate-400">
                                            {tool.platforms[0]}
                                        </span>
                                    )}
                                </div>
                            </Card>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
