"use client";

import { useState, useEffect } from "react";
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
            setGuides(data);
        } catch (error) {
            console.error("Error loading guides:", error);
            alert("Failed to load guides");
        } finally {
            setLoading(false);
        }
    };

    const filterGuides = () => {
        if (!searchQuery.trim()) {
            setFilteredGuides(guides);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = guides.filter(guide =>
            guide.title.toLowerCase().includes(query) ||
            guide.category.toLowerCase().includes(query) ||
            guide.type.toLowerCase().includes(query)
        );
        setFilteredGuides(filtered);
    };

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
                alert("No valid guides to import (Title and Content are required)");
                return;
            }

            // Import valid guides
            for (const guide of valid) {
                await dbService.createGuide(guide as any);
            }

            alert(`Successfully imported ${valid.length} guides!`);
            loadGuides();
        } catch (error) {
            console.error("Import error:", error);
            alert("Failed to import guides: " + (error as Error).message);
        } finally {
            setImporting(false);
            event.target.value = '';
        }
    };

    const handleDelete = async () => {
        if (!selectedGuide) return;

        try {
            await dbService.deleteGuide(selectedGuide.id);
            alert("Guide deleted successfully!");
            setIsDeleteModalOpen(false);
            setSelectedGuide(null);
            loadGuides();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete guide");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Digital Business Ideas</h1>
                        <p className="text-slate-500 mt-1">Manage idea vault and guides</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleDownloadTemplate}
                            className="gap-2"
                        >
                            <Download className="size-4" />
                            Download Template
                        </Button>
                        <label>
                            <Button
                                variant="outline"
                                className="gap-2 cursor-pointer"
                                disabled={importing}
                            >
                                <Upload className="size-4" />
                                {importing ? "Importing..." : "Import from Excel"}
                            </Button>
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleImport}
                                className="hidden"
                                disabled={importing}
                            />
                        </label>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="gap-2"
                        >
                            <Plus className="size-4" />
                            Add Idea
                        </Button>
                    </div>
                </div>

                {/* Search and Stats */}
                <Card className="p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                            <Input
                                placeholder="Search by title, category, or type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-4 text-sm">
                            <div className="text-slate-600">
                                Total: <span className="font-bold text-slate-900">{guides.length}</span>
                            </div>
                            <div className="text-slate-600">
                                Showing: <span className="font-bold text-slate-900">{filteredGuides.length}</span>
                            </div>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Type / Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Visibility
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Access
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {filteredGuides.map((guide) => (
                                        <tr key={guide.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-slate-900">{guide.title}</div>
                                                <div className="text-sm text-slate-500 truncate max-w-xs">
                                                    {guide.difficulty}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-900">{guide.type}</div>
                                                <Badge variant="secondary" className="text-xs mt-1">
                                                    {guide.category}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={async () => {
                                                        const newStatus = !guide.isPublic;
                                                        await dbService.updateGuide(guide.id, { isPublic: newStatus });
                                                        loadGuides();
                                                    }}
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${guide.isPublic
                                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                        }`}
                                                >
                                                    {guide.isPublic ? "Public" : "Private"}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge
                                                    variant={guide.premium ? "secondary" : "default"}
                                                    className={guide.premium ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-green-100 text-green-700 border-green-200"}
                                                >
                                                    {guide.premium ? "Premium" : "Free"}
                                                </Badge>
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
                        <Button variant="destructive" onClick={handleDelete}>
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
