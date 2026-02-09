"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";

interface BusinessFilterProps {
    filters: any;
    setFilters: (filters: any) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableCategories: string[];
}

export function BusinessFilter({ filters, setFilters, open, onOpenChange, availableCategories }: BusinessFilterProps) {
    const types = ["Freelancing Kit", "Template", "Blueprint"];
    const difficulties = ["Beginner", "Intermediate", "Advanced"];

    const toggleFilter = (type: string, value: string) => {
        setFilters((prev: any) => {
            const current = prev[type] || [];
            const updated = current.includes(value)
                ? current.filter((item: string) => item !== value)
                : [...current, value];
            return { ...prev, [type]: updated };
        });
    };

    const clearFilters = () => {
        setFilters({ categories: [], types: [], difficulties: [] });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Filter Business Ideas</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">

                    <div className="space-y-3">
                        <Label>Type</Label>
                        <div className="flex flex-wrap gap-2">
                            {types.map((type) => (
                                <Badge
                                    key={type}
                                    variant={filters.types?.includes(type) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => toggleFilter("types", type)}
                                >
                                    {type}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Category</Label>
                        <div className="flex flex-wrap gap-2">
                            {availableCategories.map((cat) => (
                                <Badge
                                    key={cat}
                                    variant={filters.categories?.includes(cat) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => toggleFilter("categories", cat)}
                                >
                                    {cat}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Difficulty</Label>
                        <div className="flex flex-wrap gap-2">
                            {difficulties.map((diff) => (
                                <Badge
                                    key={diff}
                                    variant={filters.difficulties?.includes(diff) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => toggleFilter("difficulties", diff)}
                                >
                                    {diff}
                                </Badge>
                            ))}
                        </div>
                    </div>

                </div>
                <div className="flex justify-between">
                    <Button variant="ghost" onClick={clearFilters}>Clear All</Button>
                    <Button onClick={() => onOpenChange(false)}>Apply Filters</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
