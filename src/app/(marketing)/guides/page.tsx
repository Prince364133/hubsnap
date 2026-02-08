"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { dbService, Guide } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
    Zap,
    Search,
    SlidersHorizontal,
    Lock,
    BookOpen,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PublicGuidesPage() {
    const [guides, setGuides] = useState<Guide[]>([]);
    const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [typeFilter, setTypeFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [difficultyFilter, setDifficultyFilter] = useState("All");
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        loadGuides();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [guides, searchQuery, typeFilter, categoryFilter, difficultyFilter]);

    const loadGuides = async () => {
        setLoading(true);
        const data = await dbService.getGuides();
        setGuides(data);
        const uniqueCategories = Array.from(new Set(data.map(g => g.category))).sort();
        setCategories(uniqueCategories);
        setLoading(false);
    };

    const applyFilters = () => {
        let filtered = [...guides];
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(guide =>
                guide.title.toLowerCase().includes(query) ||
                guide.category.toLowerCase().includes(query) ||
                guide.content.toLowerCase().includes(query)
            );
        }
        if (typeFilter !== "All") {
            filtered = filtered.filter(guide => guide.type === typeFilter);
        }
        if (categoryFilter !== "All") {
            filtered = filtered.filter(guide => guide.category === categoryFilter);
        }
        if (difficultyFilter !== "All") {
            filtered = filtered.filter(guide => guide.difficulty === difficultyFilter);
        }
        setFilteredGuides(filtered);
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
        <div className="min-h-screen bg-white text-slate-900">
            <PublicHeader />

            {/* Hero Section */}
            <section className="pt-32 pb-12 px-6">
                <div className="max-w-7xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-primary text-xs font-bold uppercase tracking-wider">
                        <BookOpen className="size-3" /> Knowledge Base
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                        AI <span className="text-primary italic">Guides</span> & Templates
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Freelancing kits, templates, and blueprints to help you execute faster with AI.
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
                                    placeholder="Search guides, templates, blueprints..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
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
                                        setTypeFilter("All");
                                        setCategoryFilter("All");
                                        setDifficultyFilter("All");
                                    }}
                                >
                                    Clear All
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Type</label>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="All">All Types</option>
                                        <option value="Freelancing Kit">Freelancing Kits</option>
                                        <option value="Template">Templates</option>
                                        <option value="Blueprint">Blueprints</option>
                                    </select>
                                </div>
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
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Difficulty</label>
                                    <select
                                        value={difficultyFilter}
                                        onChange={(e) => setDifficultyFilter(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="All">All Levels</option>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>
                        </Card>
                    )}

                    <div className="flex justify-between items-center">
                        <p className="text-slate-500 text-sm">
                            {filteredGuides.length} guides found
                        </p>
                    </div>
                </div>
            </section>

            {/* Guides Grid */}
            <section className="px-6 pb-20">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="mt-4 text-slate-500">Loading guides...</p>
                        </div>
                    ) : filteredGuides.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500">No guides found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {filteredGuides.map(guide => (
                                <Link key={guide.id} href={guide.premium ? "/signup" : `/guides/${guide.id}`}>
                                    <Card className="p-6 border-slate-200 hover:border-primary hover:shadow-lg transition-all cursor-pointer h-full relative group">
                                        {guide.premium && (
                                            <div className="absolute top-4 right-4 flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">
                                                <Lock className="size-3" />
                                                Premium
                                            </div>
                                        )}
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <span className="text-3xl">{getTypeIcon(guide.type)}</span>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-xl group-hover:text-primary transition-colors line-clamp-2">
                                                        {guide.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 mt-1">{guide.type}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <span className="text-xs px-3 py-1 bg-blue-50 text-primary rounded-full font-medium">
                                                    {guide.category}
                                                </span>
                                                <span className={cn("text-xs px-3 py-1 rounded-full font-medium", getDifficultyColor(guide.difficulty))}>
                                                    {guide.difficulty}
                                                </span>
                                            </div>

                                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <BookOpen className="size-4" />
                                                    <span>Read Guide</span>
                                                </div>
                                                <ArrowRight className="size-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-slate-50">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl font-bold">Unlock Premium Guides</h2>
                    <p className="text-slate-500 text-lg">
                        Get access to exclusive freelancing kits, advanced templates, and premium blueprints.
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
