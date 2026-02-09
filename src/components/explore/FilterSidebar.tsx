"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface FilterState {
    categories: string[];
    pricing: string[];
    platforms: string[];
    useCases: string[];
    accessType: string[];
    priceRange: [number, number];
}

interface FilterSidebarProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onClearAll: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORIES = [
    "Writing", "Productivity", "Coding", "Design", "Video Editing",
    "Audio & Voice", "Image Generation", "Data Analysis", "SEO & Marketing",
    "Customer Service", "Text Generation", "YouTube & Instagram"
];

const PRICING_OPTIONS = ["FREE", "PAID", "FREE_PAID"];
const PLATFORMS = ["Web", "App", "API", "Desktop", "Mobile"];
const USE_CASES = [
    "Content Creation", "Code Generation", "Research", "Video Production",
    "Image Editing", "Audio Processing", "Data Visualization", "Marketing",
    "Customer Support", "Automation"
];
const ACCESS_TYPES = ["FREE", "SUBSCRIPTION", "ONE_TIME_PURCHASE"];

export function FilterSidebar({ filters, onFilterChange, onClearAll, isOpen, onClose }: FilterSidebarProps) {
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        pricing: true,
        platforms: false,
        useCases: false,
        accessType: false,
        priceRange: false
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleArrayFilter = (key: keyof Pick<FilterState, 'categories' | 'pricing' | 'platforms' | 'useCases' | 'accessType'>, value: string) => {
        const currentValues = filters[key];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onFilterChange({ ...filters, [key]: newValues });
    };

    const activeFilterCount =
        filters.categories.length +
        filters.pricing.length +
        filters.platforms.length +
        filters.useCases.length +
        filters.accessType.length +
        (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 ? 1 : 0);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:sticky top-0 left-0 h-screen lg:h-auto
                w-80 lg:w-72 bg-white border-r border-slate-200
                overflow-y-auto z-50 transition-transform duration-300
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="size-5 text-slate-700" />
                        <h2 className="font-semibold text-lg text-slate-900">Filters</h2>
                        {activeFilterCount > 0 && (
                            <Badge variant="default" className="bg-primary text-white">
                                {activeFilterCount}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {activeFilterCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClearAll}
                                className="text-xs text-slate-600 hover:text-slate-900"
                            >
                                Clear All
                            </Button>
                        )}
                        <button
                            onClick={onClose}
                            className="lg:hidden p-1 hover:bg-slate-100 rounded"
                        >
                            <X className="size-5" />
                        </button>
                    </div>
                </div>

                {/* Filter Sections */}
                <div className="p-4 space-y-4">
                    {/* Categories */}
                    <FilterSection
                        title="Categories"
                        isExpanded={expandedSections.categories}
                        onToggle={() => toggleSection('categories')}
                        count={filters.categories.length}
                    >
                        <div className="space-y-2">
                            {CATEGORIES.map(category => (
                                <label key={category} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.categories.includes(category)}
                                        onChange={() => toggleArrayFilter('categories', category)}
                                        className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900">
                                        {category}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </FilterSection>

                    {/* Pricing */}
                    <FilterSection
                        title="Pricing Model"
                        isExpanded={expandedSections.pricing}
                        onToggle={() => toggleSection('pricing')}
                        count={filters.pricing.length}
                    >
                        <div className="space-y-2">
                            {PRICING_OPTIONS.map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.pricing.includes(option)}
                                        onChange={() => toggleArrayFilter('pricing', option)}
                                        className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900">
                                        {option === 'FREE_PAID' ? 'Freemium' : option.charAt(0) + option.slice(1).toLowerCase()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </FilterSection>

                    {/* Platforms */}
                    <FilterSection
                        title="Platforms"
                        isExpanded={expandedSections.platforms}
                        onToggle={() => toggleSection('platforms')}
                        count={filters.platforms.length}
                    >
                        <div className="space-y-2">
                            {PLATFORMS.map(platform => (
                                <label key={platform} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.platforms.includes(platform)}
                                        onChange={() => toggleArrayFilter('platforms', platform)}
                                        className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900">
                                        {platform}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </FilterSection>

                    {/* Use Cases */}
                    <FilterSection
                        title="Use Cases"
                        isExpanded={expandedSections.useCases}
                        onToggle={() => toggleSection('useCases')}
                        count={filters.useCases.length}
                    >
                        <div className="space-y-2">
                            {USE_CASES.map(useCase => (
                                <label key={useCase} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.useCases.includes(useCase)}
                                        onChange={() => toggleArrayFilter('useCases', useCase)}
                                        className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900">
                                        {useCase}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </FilterSection>

                    {/* Access Type */}
                    <FilterSection
                        title="Access Type"
                        isExpanded={expandedSections.accessType}
                        onToggle={() => toggleSection('accessType')}
                        count={filters.accessType.length}
                    >
                        <div className="space-y-2">
                            {ACCESS_TYPES.map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.accessType.includes(type)}
                                        onChange={() => toggleArrayFilter('accessType', type)}
                                        className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900">
                                        {type === 'ONE_TIME_PURCHASE' ? 'One-time Purchase' : type.charAt(0) + type.slice(1).toLowerCase()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </FilterSection>

                    {/* Price Range */}
                    <FilterSection
                        title="Price Range"
                        isExpanded={expandedSections.priceRange}
                        onToggle={() => toggleSection('priceRange')}
                        count={filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 ? 1 : 0}
                    >
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={filters.priceRange[0]}
                                    onChange={(e) => onFilterChange({
                                        ...filters,
                                        priceRange: [Number(e.target.value), filters.priceRange[1]]
                                    })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                                    placeholder="Min"
                                    min="0"
                                />
                                <span className="text-slate-500">-</span>
                                <input
                                    type="number"
                                    value={filters.priceRange[1]}
                                    onChange={(e) => onFilterChange({
                                        ...filters,
                                        priceRange: [filters.priceRange[0], Number(e.target.value)]
                                    })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                                    placeholder="Max"
                                    min="0"
                                />
                            </div>
                            <p className="text-xs text-slate-500">
                                ${filters.priceRange[0]} - ${filters.priceRange[1] === 10000 ? '∞' : filters.priceRange[1]}
                            </p>
                        </div>
                    </FilterSection>
                </div>
            </div>
        </>
    );
}

interface FilterSectionProps {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    count?: number;
    children: React.ReactNode;
}

function FilterSection({ title, isExpanded, onToggle, count = 0, children }: FilterSectionProps) {
    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-slate-900">{title}</span>
                    {count > 0 && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                            {count}
                        </Badge>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronUp className="size-4 text-slate-600" />
                ) : (
                    <ChevronDown className="size-4 text-slate-600" />
                )}
            </button>
            {isExpanded && (
                <div className="p-4 bg-white">
                    {children}
                </div>
            )}
        </div>
    );
}
