"use client";

import { useState, useEffect } from "react";
import { Plus, Download, Upload, Pencil, Trash2, Search, Filter, Lock, Unlock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { dbService } from "@/lib/firestore";
import type { Tool } from "@/lib/firestore";
import { downloadTemplate, exportToolsToExcel, parseExcelFile, validateToolsBatch } from "@/lib/excel-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { ToolForm } from "@/components/admin/ToolForm";
import { toast } from "sonner"; // Add import

export default function AdminToolsPage() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [importing, setImporting] = useState(false);
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>("all");

    useEffect(() => {
        loadTools();
    }, []);

    useEffect(() => {
        filterTools();
    }, [searchQuery, tools]);

    const loadTools = async () => {
        setLoading(true);
        try {
            const data = await dbService.getTools();
            setTools(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))); // Added sort
        } catch (error) {
            console.error("Error loading tools:", error);
            toast.error("Failed to load tools");
        } finally {
            setLoading(false);
        }
    };

    const filterTools = () => {
        let currentFiltered = tools;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            currentFiltered = currentFiltered.filter(tool =>
                tool.name.toLowerCase().includes(query) ||
                tool.shortDesc?.toLowerCase().includes(query) ||
                tool.categories?.some(c => c.toLowerCase().includes(query))
            );
        }

        if (filterCategory !== "all") {
            currentFiltered = currentFiltered.filter(tool =>
                tool.categories?.includes(filterCategory)
            );
        }
        setFilteredTools(currentFiltered);
    };

    const categories = ["all", ...new Set(tools.flatMap(t => t.categories).filter(Boolean))];

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedTools(filteredTools.map(t => t.id));
        } else {
            setSelectedTools([]);
        }
    };

    const handleSelectTool = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedTools(prev => [...prev, id]);
        } else {
            setSelectedTools(prev => prev.filter(toolId => toolId !== id));
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedTools.length} tools? This action cannot be undone.`)) return;

        try {
            await dbService.batchDeleteTools(selectedTools); // Assuming dbService has batchDeleteTools
            toast.success(`${selectedTools.length} tools deleted successfully`);
            setSelectedTools([]);
            loadTools();
        } catch (error) {
            console.error("Batch delete error:", error);
            toast.error("Failed to delete tools");
        }
    };

    const handleExport = () => {
        exportToolsToExcel(tools);
    };

    const handleDownloadTemplate = () => {
        downloadTemplate();
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const parsedTools = await parseExcelFile(file);
            const { valid, invalid } = validateToolsBatch(parsedTools);

            if (invalid.length > 0) {
                console.warn("Invalid rows found:", invalid);
                toast.warning(`Skipping ${invalid.length} invalid rows. Check console for details.`);
            }

            if (valid.length === 0) {
                toast.error("No valid tools found to import");
                return;
            }

            // Import valid tools
            let successCount = 0;
            for (const tool of valid) {
                try {
                    await dbService.createTool(tool as any); // Type assertion for now
                    successCount++;
                } catch (e) {
                    console.error("Failed to create tool:", tool.name, e);
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully imported ${successCount} tools!`);
                loadTools();
            }
        } catch (error) {
            console.error("Import error:", error);
            toast.error("Failed to import tools: " + (error as Error).message);
        } finally {
            setImporting(false);
            // Reset file input
            event.target.value = '';
        }
    };

    const handleDelete = async (id: string) => { // Modified handleDelete to take id directly
        try {
            await dbService.deleteTool(id);
            toast.success("Tool deleted successfully!");
            setIsDeleteModalOpen(false); // Close modal if it was opened for a single tool
            setSelectedTool(null);
            loadTools();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete tool");
        }
    };

    const handleTogglePublic = async (tool: Tool) => {
        try {
            await dbService.updateTool(tool.id, { isPublic: !tool.isPublic });
            toast.success(`Tool visibility updated to ${!tool.isPublic ? 'Public' : 'Private'}`);
            loadTools();
        } catch (error) {
            console.error("Toggle public error:", error);
            toast.error("Failed to update tool visibility");
        }
    };

    return (
        <div className="space-y-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Tools Management</h1>
                        <p className="text-slate-500 mt-1">Manage AI tools database</p>
                    </div>
                    <div className="flex gap-2">
                        {selectedTools.length > 0 && (
                            <Button
                                variant="destructive"
                                onClick={handleBulkDelete}
                                className="gap-2 animate-in fade-in slide-in-from-right-4"
                            >
                                <Trash2 className="size-4" />
                                Delete ({selectedTools.length})
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={handleDownloadTemplate}
                            className="gap-2"
                        >
                            <Download className="size-4" />
                            Download Template
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            className="gap-2"
                        >
                            <Download className="size-4" />
                            Export to Excel
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
                            Add Tool
                        </Button>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card className="p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                            <Input
                                placeholder="Search tools by name, description, or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-4 text-sm items-center">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="selectAll"
                                    checked={selectedTools.length === filteredTools.length && filteredTools.length > 0}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                                />
                                <label htmlFor="selectAll" className="text-sm font-medium text-slate-700 cursor-pointer">
                                    Select All
                                </label>
                            </div>
                            <div className="flex gap-2">
                                {categories.map(cat => (
                                    <Button
                                        key={cat}
                                        variant={filterCategory === cat ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setFilterCategory(cat)}
                                    >
                                        {cat === "all" ? "All" : cat}
                                    </Button>
                                ))}
                            </div>
                            <div className="text-slate-600">
                                Total: <span className="font-bold text-slate-900">{tools.length}</span>
                            </div>
                            <div className="text-slate-600">
                                Showing: <span className="font-bold text-slate-900">{filteredTools.length}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Tools Table */}
                <Card className="overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="mt-4 text-slate-500">Loading tools...</p>
                        </div>
                    ) : filteredTools.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-slate-400">No tools found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={selectedTools.length === filteredTools.length && filteredTools.length > 0}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Categories
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Visibility
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Pricing
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Website
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {filteredTools.map((tool) => (
                                        <tr key={tool.id} className={`hover:bg-slate-50 ${selectedTools.includes(tool.id) ? 'bg-blue-50' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTools.includes(tool.id)}
                                                    onChange={(e) => handleSelectTool(tool.id, e.target.checked)}
                                                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-slate-900">{tool.name}</div>
                                                <div className="text-sm text-slate-500 truncate max-w-xs">
                                                    {tool.shortDesc}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {tool.categories?.slice(0, 2).map((cat, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs">
                                                            {cat}
                                                        </Badge>
                                                    ))}
                                                    {(tool.categories?.length || 0) > 2 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{(tool.categories?.length || 0) - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleTogglePublic(tool)}
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${tool.isPublic
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                        }`}
                                                >
                                                    {tool.isPublic ? "Public" : "Private"}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge
                                                    variant={tool.pricingModel === "FREE" ? "default" : "secondary"}
                                                    className={tool.pricingModel === "FREE" ? "bg-green-100 text-green-700" : ""}
                                                >
                                                    {tool.pricingModel}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <a
                                                    href={tool.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline text-sm"
                                                >
                                                    {(() => {
                                                        try {
                                                            return new URL(tool.website).hostname;
                                                        } catch {
                                                            return tool.website;
                                                        }
                                                    })()}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedTool(tool);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedTool(tool);
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
                        <DialogTitle>Delete Tool</DialogTitle>
                    </DialogHeader>
                    <p className="text-slate-600">
                        Are you sure you want to delete <strong>{selectedTool?.name}</strong>? This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => selectedTool && handleDelete(selectedTool.id)}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Tool Modal */}
            <ToolForm
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                tool={selectedTool}
                onSuccess={loadTools}
            />

            {/* Create Tool Modal */}
            <ToolForm
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                tool={null}
                onSuccess={loadTools}
            />
        </div>
    );
}
