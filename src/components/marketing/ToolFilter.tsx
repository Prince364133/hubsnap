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
import { Checkbox } from "@/components/ui/Checkbox";

interface ToolFilterProps {
    filters: any;
    setFilters: (filters: any) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ToolFilter({ filters, setFilters, open, onOpenChange }: ToolFilterProps) {
    const categories = ["Writing", "Image", "Video", "Audio", "Coding", "Marketing", "Productivity"];
    const pricing = ["FREE", "PAID", "FREEMIUM"];
    const platforms = ["Web", "App", "Extension", "API"];

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
        setFilters({ categories: [], pricing: [], platforms: [] });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Filter Tools</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">

                    <div className="space-y-3">
                        <Label>Category</Label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
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
                        <Label>Pricing</Label>
                        <div className="flex flex-wrap gap-2">
                            {pricing.map((p) => (
                                <Badge
                                    key={p}
                                    variant={filters.pricing?.includes(p) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => toggleFilter("pricing", p)}
                                >
                                    {p}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Platform</Label>
                        <div className="flex flex-wrap gap-2">
                            {platforms.map((p) => (
                                <Badge
                                    key={p}
                                    variant={filters.platforms?.includes(p) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => toggleFilter("platforms", p)}
                                >
                                    {p}
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
