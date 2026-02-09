"use client";

import { useState, useEffect } from "react";
import { dbService, Guide } from "@/lib/firestore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, SlidersHorizontal, Lock, BookOpen, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function GuidesPage() {
    const [guides, setGuides] = useState<Guide[]>([]);
    const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Filters
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
        const data = await dbService.getGuides(true);
        setGuides(data);

        // Extract unique categories
        const uniqueCategories = Array.from(
            new Set(data.map(g => g.category))
        ).sort();
        setCategories(uniqueCategories);

        setLoading(false);
    };

    const applyFilters = () => {
        let filtered = [...guides];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(guide =>
                guide.title.toLowerCase().includes(query) ||
                guide.category.toLowerCase().includes(query) ||
                guide.content.toLowerCase().includes(query)
            );
        }

        // Type filter
        if (typeFilter !== "All") {
            filtered = filtered.filter(guide => guide.type === typeFilter);
        }

        // Category filter
        if (categoryFilter !== "All") {
            filtered = filtered.filter(guide => guide.category === categoryFilter);
        }

        // Difficulty filter
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
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                    Digital Business Ideas & Blueprints
                </h1>
                <p className="text-text-secondary max-w-2xl mx-auto">
                    Proven business models, freelancing kits, and execution blueprints powered by AI
                </p>
            </div>

            {/* Search & Controls */}
            <Card className="p-4">
                <div className="flex gap-3 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search business ideas, kits, blueprints..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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

            {/* Advanced Filters */}
            {showFilters && (
                <Card className="p-6 space-y-4">
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
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Type
                            </label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="All">All Types</option>
                                <option value="Freelancing Kit">Freelancing Kits</option>
                                <option value="Template">Templates</option>
                                <option value="Blueprint">Blueprints</option>
                            </select>
                        </div>
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
                                Difficulty
                            </label>
                            <select
                                value={difficultyFilter}
                                onChange={(e) => setDifficultyFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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

            {/* Results Count */}
            <div className="flex justify-between items-center">
                <p className="text-text-secondary text-sm">
                    {filteredGuides.length} ideas found
                </p>
            </div>

            {/* Guides Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-text-secondary">Loading ideas...</p>
                </div>
            ) : filteredGuides.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-text-secondary">No ideas found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredGuides.map(guide => (
                        <Link key={guide.id} href={`/dashboard/digital-business-ideas/${guide.id}`}>
                            <Card className="p-5 hover:border-primary transition-all cursor-pointer h-full relative group">
                                {guide.premium && (
                                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                                        <Lock className="size-3" />
                                        Premium
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <span className="text-3xl">{getTypeIcon(guide.type)}</span>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2">
                                                {guide.title}
                                            </h3>
                                            <p className="text-sm text-text-secondary mt-1">{guide.type}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                            {guide.category}
                                        </span>
                                        <span className={cn("text-xs px-2 py-1 rounded-full", getDifficultyColor(guide.difficulty))}>
                                            {guide.difficulty}
                                        </span>
                                    </div>

                                    <div className="pt-3 border-t border-border">
                                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                                            <BookOpen className="size-4" />
                                            <span>View Blueprint</span>
                                        </div>
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
