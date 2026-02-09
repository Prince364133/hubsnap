"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface BusinessFilterState {
    types: string[];
    categories: string[];
    difficulties: string[];
}

interface BusinessFilterSidebarProps {
    filters: BusinessFilterState;
    onFilterChange: (filters: BusinessFilterState) => void;
    onClearAll: () => void;
    isOpen: boolean;
    onClose: () => void;
    availableCategories: string[];
}

const TYPES = ["Freelancing Kit", "Template", "Blueprint"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

export function BusinessFilterSidebar({
    filters,
    onFilterChange,
    onClearAll,
    isOpen,
    onClose,
    availableCategories
}: BusinessFilterSidebarProps) {
    const [expandedSections, setExpandedSections] = useState({
        types: true,
        categories: true,
        difficulties: true
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleArrayFilter = (key: keyof BusinessFilterState, value: string) => {
        const currentValues = filters[key];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onFilterChange({ ...filters, [key]: newValues });
    };

    const activeFilterCount =
        filters.types.length +
        filters.categories.length +
        filters.difficulties.length;

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
                    {/* Types */}
                    <FilterSection
                        title="Type"
                        isExpanded={expandedSections.types}
                        onToggle={() => toggleSection('types')}
                        count={filters.types.length}
                    >
                        <div className="space-y-2">
                            {TYPES.map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.types.includes(type)}
                                        onChange={() => toggleArrayFilter('types', type)}
                                        className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900">
                                        {type}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </FilterSection>

                    {/* Categories */}
                    <FilterSection
                        title="Categories"
                        isExpanded={expandedSections.categories}
                        onToggle={() => toggleSection('categories')}
                        count={filters.categories.length}
                    >
                        <div className="space-y-2">
                            {availableCategories.map(category => (
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

                    {/* Difficulty */}
                    <FilterSection
                        title="Difficulty"
                        isExpanded={expandedSections.difficulties}
                        onToggle={() => toggleSection('difficulties')}
                        count={filters.difficulties.length}
                    >
                        <div className="space-y-2">
                            {DIFFICULTIES.map(difficulty => (
                                <label key={difficulty} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.difficulties.includes(difficulty)}
                                        onChange={() => toggleArrayFilter('difficulties', difficulty)}
                                        className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900">
                                        {difficulty}
                                    </span>
                                </label>
                            ))}
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
