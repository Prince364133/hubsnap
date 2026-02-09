"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, ExternalLink, Sparkles, Bookmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { dbService } from "@/lib/firestore";
import { FilterSidebar, type FilterState } from "@/components/explore/FilterSidebar";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { Tool } from "@/lib/firestore";
import { populateDB } from "@/lib/seed";

const ITEMS_PER_PAGE = 12;

export default function ExplorePage() {
    const [search, setSearch] = useState("");
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<FilterState>({
        categories: [],
        pricing: [],
        platforms: [],
        useCases: [],
        accessType: [],
        priceRange: [0, 10000]
    });
    const [filterOpen, setFilterOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
    const [loadingMore, setLoadingMore] = useState(false);

    // Load tools from Firestore
    useEffect(() => {
        loadTools();
    }, []);

    const loadTools = async () => {
        setLoading(true);
        try {
            const data = await dbService.getTools();
            setTools(data);
        } catch (error) {
            console.error("Error loading tools:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
        });
        return () => unsubscribe();
    }, []);

    // Enhanced filtering logic
    const filteredTools = useMemo(() => {
        return tools.filter(t => {
            // Enhanced search across multiple fields
            const searchLower = search.toLowerCase();
            const matchesSearch = search === '' ||
                t.name.toLowerCase().includes(searchLower) ||
                (t.shortDesc?.toLowerCase().includes(searchLower)) ||
                (t.fullDesc?.toLowerCase().includes(searchLower)) ||
                (t.categories?.some(c => c.toLowerCase().includes(searchLower))) ||
                (t.useCases?.some(u => u.toLowerCase().includes(searchLower))) ||
                (t.tags?.some(tag => tag.toLowerCase().includes(searchLower))) ||
                (t.company?.toLowerCase().includes(searchLower));

            const matchesCategory = filters.categories.length === 0 ||
                (t.categories?.some(c => filters.categories.includes(c)));

            const matchesPricing = filters.pricing.length === 0 ||
                filters.pricing.includes(t.pricingModel);

            const matchesPlatform = filters.platforms.length === 0 ||
                (t.platforms?.some(p => filters.platforms.includes(p)));

            const matchesUseCase = filters.useCases.length === 0 ||
                (t.useCases?.some(u => filters.useCases.includes(u)));

            const matchesAccessType = filters.accessType.length === 0 ||
                filters.accessType.includes(t.accessType);

            const matchesPriceRange =
                (t.price || 0) >= filters.priceRange[0] &&
                (t.price || 0) <= filters.priceRange[1];

            return matchesSearch && matchesCategory && matchesPricing &&
                matchesPlatform && matchesUseCase && matchesAccessType && matchesPriceRange;
        });
    }, [search, tools, filters]);

    // Paginated tools for lazy loading
    const displayedTools = useMemo(() => {
        return filteredTools.slice(0, displayCount);
    }, [filteredTools, displayCount]);

    const hasMore = displayedTools.length < filteredTools.length;

    // Load more function
    const loadMore = useCallback(() => {
        if (!hasMore || loadingMore) return;

        setLoadingMore(true);
        setTimeout(() => {
            setDisplayCount(prev => prev + ITEMS_PER_PAGE);
            setLoadingMore(false);
        }, 300);
    }, [hasMore, loadingMore]);

    // Infinite scroll hook
    const { targetRef } = useInfiniteScroll(loadMore, {
        threshold: 0.1,
        rootMargin: '100px'
    });

    const handleSave = async (e: React.MouseEvent, tool: any) => {
        e.stopPropagation();
        if (!user) {
            return;
        }
        await dbService.saveSavedItem(user.uid, {
            type: 'tool',
            data: tool
        });
        alert("Tool saved!");
    };

    const handleClearFilters = () => {
        setFilters({
            categories: [],
            pricing: [],
            platforms: [],
            useCases: [],
            accessType: [],
            priceRange: [0, 10000]
        });
    };

    // Reset display count when filters change
    useEffect(() => {
        setDisplayCount(ITEMS_PER_PAGE);
    }, [filters, search]);

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            <PublicHeader />

            <main className="pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Header */}
                    <div className="text-center space-y-6 mb-12">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                            Explore <span className="text-primary italic">AI Tools</span>
                        </h1>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                            Discover 1114+ AI tools to supercharge your workflow
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-3xl mx-auto mb-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                            <Input
                                placeholder="Search tools, categories, use cases..."
                                className="pl-12 h-14 rounded-xl border-slate-200 text-lg shadow-sm focus:ring-primary/20"
                                value={search}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Mobile Filter Button */}
                    <div className="lg:hidden mb-6">
                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-xl border-slate-200 gap-2"
                            onClick={() => setFilterOpen(true)}
                        >
                            <SlidersHorizontal className="size-4" /> Filters
                            {(filters.categories.length + filters.pricing.length + filters.platforms.length +
                                filters.useCases.length + filters.accessType.length) > 0 && (
                                    <Badge variant="default" className="bg-primary text-white">
                                        {filters.categories.length + filters.pricing.length + filters.platforms.length +
                                            filters.useCases.length + filters.accessType.length}
                                    </Badge>
                                )}
                        </Button>
                    </div>

                    {/* Main Content with Sidebar */}
                    <div className="flex gap-8">
                        {/* Filter Sidebar (handles both mobile and desktop) */}
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={setFilters}
                            onClearAll={handleClearFilters}
                            isOpen={filterOpen}
                            onClose={() => setFilterOpen(false)}
                        />

                        {/* Tools Grid */}
                        <div className="flex-1">
                            {/* Results Count */}
                            <div className="mb-6 flex items-center justify-between">
                                <p className="text-sm text-slate-600">
                                    Showing <span className="font-semibold text-slate-900">{displayedTools.length}</span> of{" "}
                                    <span className="font-semibold text-slate-900">{filteredTools.length}</span> tools
                                </p>
                            </div>

                            {loading ? (
                                <div className="text-center py-20">
                                    <div className="inline-block size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    <p className="mt-4 text-slate-500">Loading tools...</p>
                                </div>
                            ) : filteredTools.length === 0 ? (
                                <div className="text-center py-20">
                                    <Sparkles className="size-16 mx-auto text-slate-300 mb-4" />
                                    <p className="text-xl text-slate-400">No tools found. Try adjusting your filters.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {displayedTools.map((tool) => (
                                            <Card
                                                key={tool.id}
                                                className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-slate-200 cursor-pointer"
                                                onClick={() => window.open(tool.website, '_blank')}
                                            >
                                                <div className="p-0"> {/* Removed padding here to let image sit flush if we want, or adjust */}
                                                    {tool.imageUrl && (
                                                        <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
                                                            <img
                                                                src={tool.imageUrl}
                                                                alt={tool.name}
                                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="p-6 space-y-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">
                                                                    {tool.name}
                                                                </h3>
                                                                <Badge variant="secondary" className="mt-2 text-xs">
                                                                    {tool.categories?.[0] || "Tool"}
                                                                </Badge>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={(e) => handleSave(e, tool)}
                                                            >
                                                                <Bookmark className="size-4" />
                                                            </Button>
                                                        </div>

                                                        <p className="text-slate-600 text-sm line-clamp-2">
                                                            {tool.shortDesc || tool.fullDesc || "No description available"}
                                                        </p>

                                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                            <Badge
                                                                variant={tool.pricingModel === "FREE" ? "default" : "secondary"}
                                                                className={tool.pricingModel === "FREE" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}
                                                            >
                                                                {tool.pricingModel === "FREE" ? "Free" : tool.pricingModel === "PAID" ? "Paid" : "Freemium"}
                                                            </Badge>
                                                            <span className="text-xs text-slate-400 font-medium group-hover:text-primary transition-colors flex items-center gap-1">
                                                                Visit <ExternalLink className="size-3" />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Infinite Scroll Trigger */}
                                    {hasMore && (
                                        <div ref={targetRef} className="py-8 text-center">
                                            {loadingMore && (
                                                <div className="flex items-center justify-center gap-2 text-slate-500">
                                                    <Loader2 className="size-5 animate-spin" />
                                                    <span>Loading more tools...</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* End of Results */}
                                    {!hasMore && filteredTools.length > ITEMS_PER_PAGE && (
                                        <div className="py-8 text-center text-slate-500 text-sm">
                                            You've reached the end of the results
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main >

            <PublicFooter />
        </div >
    );
}
