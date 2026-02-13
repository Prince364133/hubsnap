"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Download, Upload, Pencil, Trash2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { dbService } from "@/lib/firestore";
import type { Guide } from "@/lib/firestore";
import { downloadGuideTemplate, parseGuidesExcelFile } from "@/lib/excel-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { GuideForm } from "@/components/admin/GuideForm";
import { toast } from "sonner"; // Add import

export default function AdminGuidesPage() {
    const [guides, setGuides] = useState<Guide[]>([]);
    const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [importing, setImporting] = useState(false);
    const [selectedGuides, setSelectedGuides] = useState<string[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>("all");

    useEffect(() => {
        loadGuides();
    }, []);

    useEffect(() => {
        filterGuides();
    }, [searchQuery, guides]);

    const loadGuides = async () => {
        setLoading(true);
        try {
            const data = await dbService.getGuides();
            // Sort guides by createdAt in descending order
            setGuides(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        } catch (error) {
            console.error("Error loading guides:", error);
            toast.error("Failed to load guides");
        } finally {
            setLoading(false);
        }
    };

    const filterGuides = () => {
        let currentFiltered = guides;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            currentFiltered = currentFiltered.filter(guide =>
                guide.title.toLowerCase().includes(query) ||
                guide.category.toLowerCase().includes(query) ||
                guide.type.toLowerCase().includes(query)
            );
        }

        if (filterCategory !== "all") {
            currentFiltered = currentFiltered.filter(guide => guide.category.toLowerCase() === filterCategory.toLowerCase());
        }

        setFilteredGuides(currentFiltered);
    };

    const categories = ["all", ...new Set(guides.map(g => g.category).filter(Boolean))];

    const handleDownloadTemplate = () => {
        downloadGuideTemplate();
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const parsedGuides = await parseGuidesExcelFile(file);

            // Basic validation
            const valid = parsedGuides.filter(g => g.title && g.content);

            if (valid.length === 0) {
                toast.error("No valid guides to import (Title and Content are required)");
                return;
            }

            // Import valid guides
            let successCount = 0;
            for (const guide of valid) {
                try {
                    await dbService.createGuide(guide as any);
                    successCount++;
                } catch (e) {
                    console.error("Failed to create guide:", guide.title, e);
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully imported ${successCount} guides!`);
                loadGuides();
            }
        } catch (error) {
            console.error("Import error:", error);
            toast.error("Failed to import guides: " + (error as Error).message);
        } finally {
            setImporting(false);
            event.target.value = '';
        }
    };

    // New batch selection functions
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedGuides(filteredGuides.map(g => g.id));
        } else {
            setSelectedGuides([]);
        }
    };

    const handleSelectGuide = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedGuides(prev => [...prev, id]);
        } else {
            setSelectedGuides(prev => prev.filter(guideId => guideId !== id));
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedGuides.length} guides? This action cannot be undone.`)) return;

        try {
            await dbService.batchDeleteGuides(selectedGuides);
            toast.success(`${selectedGuides.length} guides deleted successfully`);
            setSelectedGuides([]);
            loadGuides();
        } catch (error) {
            console.error("Bulk delete error:", error);
            toast.error("Failed to delete guides");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await dbService.deleteGuide(id);
            toast.success("Guide deleted successfully");
            loadGuides(); // Reload all guides to ensure consistency
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete guide");
        }
    };

    const handleTogglePremium = async (guide: Guide) => {
        try {
            await dbService.updateGuide(guide.id, { premium: !guide.premium });
            toast.success(`Guide "${guide.title}" updated to ${!guide.premium ? 'Premium' : 'Free'}`);
            loadGuides();
        } catch (error) {
            console.error("Toggle premium error:", error);
            toast.error("Failed to update premium status");
        }
    };

    const handleToggleVisibility = async (guide: Guide) => {
        try {
            await dbService.updateGuide(guide.id, { isPublic: !guide.isPublic });
            toast.success(`Guide "${guide.title}" updated to ${!guide.isPublic ? 'Public' : 'Private'}`);
            loadGuides();
        } catch (error) {
            console.error("Toggle visibility error:", error);
            toast.error("Failed to update visibility status");
        }
    };

    return (
        <div className="space-y-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Digital Business Ideas</h1>
                        <p className="text-slate-500 mt-1">Manage ideas, freelancing kits, and blueprints</p>
                    </div>
                    <div className="flex gap-3">
                        {selectedGuides.length > 0 && (
                            <Button
                                variant="destructive"
                                onClick={handleBulkDelete}
                                className="animate-in fade-in slide-in-from-right-4"
                            >
                                <Trash2 className="size-4 mr-2" />
                                Delete ({selectedGuides.length})
                            </Button>
                        )}
                        <Button variant="outline" onClick={handleDownloadTemplate}>
                            <Download className="size-4 mr-2" />
                            Template
                        </Button>
                        <label>
                            <Button variant="outline" asChild>
                                <span>
                                    <Upload className="size-4 mr-2" />
                                    Import
                                </span>
                            </Button>
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={handleImport}
                            />
                        </label>
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="size-4 mr-2" />
                            New Idea
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="p-4 mb-6">
                    <div className="flex gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <Input
                                placeholder="Search guides..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            {categories.map(cat => (
                                <Button
                                    key={cat}
                                    variant={filterCategory === cat ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setFilterCategory(cat)}
                                    className="capitalize"
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Guides Table */}
                <Card className="overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="mt-4 text-slate-500">Loading guides...</p>
                        </div>
                    ) : filteredGuides.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-slate-400">No guides found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedGuides.length === filteredGuides.length && filteredGuides.length > 0}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Visibility
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Premium
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {filteredGuides.map((guide) => (
                                        <tr key={guide.id} className={`hover:bg-slate-50 ${selectedGuides.includes(guide.id) ? 'bg-blue-50' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedGuides.includes(guide.id)}
                                                    onChange={(e) => handleSelectGuide(guide.id, e.target.checked)}
                                                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-slate-900">{guide.title}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant="secondary">{guide.category}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant="outline">{guide.type}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleVisibility(guide)}
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${guide.isPublic
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                        }`}
                                                >
                                                    {guide.isPublic ? "Public" : "Private"}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleTogglePremium(guide)}
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${guide.premium
                                                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                        }`}
                                                >
                                                    {guide.premium ? "Premium" : "Free"}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedGuide(guide);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedGuide(guide);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Idea</DialogTitle>
                    </DialogHeader>
                    <p className="text-slate-600">
                        Are you sure you want to delete <strong>{selectedGuide?.title}</strong>? This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => selectedGuide && handleDelete(selectedGuide.id)}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Guide Modal */}
            <GuideForm
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                guide={selectedGuide}
                onSuccess={loadGuides}
            />

            {/* Create Guide Modal */}
            <GuideForm
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                guide={null}
                onSuccess={loadGuides}
            />
        </div>
    );
}
