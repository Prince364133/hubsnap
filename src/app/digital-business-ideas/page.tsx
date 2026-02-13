"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { dbService, Guide } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
    Search,
    Lock,
    ArrowRight,
    SlidersHorizontal,
    Sparkles,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { BusinessFilterSidebar, type BusinessFilterState } from "@/components/business/BusinessFilterSidebar";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

const ITEMS_PER_PAGE = 12;

export default function PublicGuidesPage() {
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<BusinessFilterState>({ types: [], categories: [], difficulties: [] });
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        loadGuides();
    }, []);

    const loadGuides = async () => {
        setLoading(true);
        const data = await dbService.getGuides();
        setGuides(data);
        const uniqueCategories = Array.from(new Set(data.map(g => g.category))).sort();
        setAvailableCategories(uniqueCategories as string[]);
        setLoading(false);
    };

    const filteredGuides = useMemo(() => {
        return guides.filter(guide => {
            const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                guide.category.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = filters.types.length === 0 || filters.types.includes(guide.type as never);
            const matchesCategory = filters.categories.length === 0 || filters.categories.includes(guide.category as never);
            const matchesDifficulty = filters.difficulties.length === 0 || filters.difficulties.includes(guide.difficulty as never);

            return matchesSearch && matchesType && matchesCategory && matchesDifficulty;
        });
    }, [guides, searchQuery, filters]);

    // Paginated guides for lazy loading
    const displayedGuides = useMemo(() => {
        return filteredGuides.slice(0, displayCount);
    }, [filteredGuides, displayCount]);

    const hasMore = displayedGuides.length < filteredGuides.length;

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

    // Reset display count when filters change
    useEffect(() => {
        setDisplayCount(ITEMS_PER_PAGE);
    }, [filters, searchQuery]);

    const handleClearFilters = () => {
        setFilters({ types: [], categories: [], difficulties: [] });
        setSearchQuery("");
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "Beginner": return "bg-green-50 text-green-700";
            case "Intermediate": return "bg-yellow-50 text-yellow-700";
            case "Advanced": return "bg-red-50 text-red-700";
            default: return "bg-gray-50 text-gray-700";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "Freelancing Kit": return "💼";
            case "Template": return "📄";
            case "Blueprint": return "📐";
            default: return "📚";
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            <PublicHeader />

            {/* Hero Section */}
            <section className="pt-32 pb-12 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto text-center space-y-6">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
                        Digital <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent italic">Business Ideas</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Discover profitable digital business opportunities, freelancing kits, and execution blueprints.
                    </p>
                </div>
            </section>

            {/* Search Bar */}
            <section className="px-6 mb-8">
                <div className="max-w-3xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                        <Input
                            placeholder="Search business ideas, kits, blueprints..."
                            className="pl-12 h-14 rounded-xl border-slate-200 text-lg shadow-sm focus:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* Mobile Filter Button */}
            <div className="lg:hidden px-6 mb-6">
                <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl border-slate-200 gap-2"
                    onClick={() => setShowFilters(true)}
                >
                    <SlidersHorizontal className="size-4" /> Filters
                    {(filters.types.length + filters.categories.length + filters.difficulties.length) > 0 && (
                        <Badge variant="default" className="bg-primary text-white">
                            {filters.types.length + filters.categories.length + filters.difficulties.length}
                        </Badge>
                    )}
                </Button>
            </div>

            {/* Main Content with Sidebar */}
            <section className="px-6 pb-20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex gap-8">
                        {/* Filter Sidebar (handles both mobile and desktop) */}
                        <BusinessFilterSidebar
                            filters={filters}
                            onFilterChange={setFilters}
                            onClearAll={handleClearFilters}
                            isOpen={showFilters}
                            onClose={() => setShowFilters(false)}
                            availableCategories={availableCategories}
                        />

                        {/* Guides Grid */}
                        <div className="flex-1">
                            {/* Results Count */}
                            <div className="mb-6 flex items-center justify-between">
                                <p className="text-sm text-slate-600">
                                    Showing <span className="font-semibold text-slate-900">{displayedGuides.length}</span> of{" "}
                                    <span className="font-semibold text-slate-900">{filteredGuides.length}</span> guides
                                </p>
                            </div>

                            {loading ? (
                                <div className="text-center py-20">
                                    <div className="inline-block size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    <p className="mt-4 text-slate-500">Loading guides...</p>
                                </div>
                            ) : filteredGuides.length === 0 ? (
                                <div className="text-center py-20">
                                    <Sparkles className="size-16 mx-auto text-slate-300 mb-4" />
                                    <p className="text-xl text-slate-400">No guides found. Try adjusting your filters.</p>
                                    <Button variant="ghost" onClick={handleClearFilters} className="text-primary mt-4 hover:underline">
                                        Clear All Filters
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                                        {displayedGuides.map(guide => (
                                            <Link key={guide.id} href={`/digital-business-ideas/${guide.id}`}>
                                                <Card className="p-6 border-slate-200 hover:border-primary hover:shadow-[0_8px_30px_rgba(14,165,233,0.15)] transition-all cursor-pointer h-full relative group flex flex-col">
                                                    {guide.premium && (
                                                        <div className="absolute top-4 right-4 flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold z-10">
                                                            <Lock className="size-3" />
                                                            Premium
                                                        </div>
                                                    )}
                                                    <div className="space-y-4 flex-1">
                                                        <div className="flex items-start gap-4">
                                                            <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl shadow-sm border border-slate-100">
                                                                {getTypeIcon(guide.type)}
                                                            </div>
                                                            <div className="flex-1 pr-16">
                                                                <h3 className="font-bold text-xl group-hover:text-primary transition-colors line-clamp-2">
                                                                    {guide.title}
                                                                </h3>
                                                                <p className="text-sm text-slate-500 mt-1">{guide.type}</p>
                                                            </div>
                                                        </div>

                                                        <p className="text-slate-500 text-sm line-clamp-2">
                                                            {guide.content}
                                                        </p>
                                                    </div>

                                                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                                                        <div className="flex gap-2">
                                                            <Badge variant="secondary" className="text-xs bg-slate-100 font-normal text-slate-600">
                                                                {guide.category}
                                                            </Badge>
                                                            <span className={cn("text-xs px-2 py-0.5 rounded-md font-bold flex items-center", getDifficultyColor(guide.difficulty))}>
                                                                {guide.difficulty}
                                                            </span>
                                                        </div>
                                                        <ArrowRight className="size-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Infinite Scroll Trigger */}
                                    {hasMore && (
                                        <div ref={targetRef} className="py-8 text-center">
                                            {loadingMore && (
                                                <div className="flex items-center justify-center gap-2 text-slate-500">
                                                    <Loader2 className="size-5 animate-spin" />
                                                    <span>Loading more guides...</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* End of Results */}
                                    {!hasMore && filteredGuides.length > ITEMS_PER_PAGE && (
                                        <div className="py-8 text-center text-slate-500 text-sm">
                                            You've reached the end of the results
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-slate-50">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl font-bold">Unlock Premium Guides</h2>
                    <p className="text-slate-500 text-lg">
                        Get access to exclusive freelancing kits, advanced templates, and premium blueprints.
                    </p>
                    <Link href="/signup">
                        <Button className="h-14 px-10 rounded-full text-lg font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-xl shadow-sky-500/25 text-white border-0">
                            Get Started for Free
                        </Button>
                    </Link>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
