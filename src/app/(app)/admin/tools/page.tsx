"use client";

import { useState, useEffect } from "react";
import { dbService, Tool } from "@/lib/firestore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Edit, Trash2, Lock, Unlock } from "lucide-react";

export default function AdminToolsPage() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingTool, setEditingTool] = useState<Tool | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        shortDesc: "",
        fullDesc: "",
        website: "",
        launchYear: new Date().getFullYear(),
        categories: "",
        tags: "",
        useCases: "",
        platforms: "Web",
        pricingModel: "FREE" as "FREE" | "PAID" | "FREE_PAID",
        accessType: "FREE" as "FREE" | "SUBSCRIPTION" | "ONE_TIME_PURCHASE",
        price: 0,
        locked: false,
        lockReason: ""
    });

    useEffect(() => {
        loadTools();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [tools, searchQuery]);

    const loadTools = async () => {
        setLoading(true);
        const data = await dbService.getTools();
        setTools(data);
        setLoading(false);
    };

    const applyFilters = () => {
        let filtered = [...tools];
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(tool =>
                tool.name.toLowerCase().includes(query) ||
                tool.company?.toLowerCase().includes(query)
            );
        }
        setFilteredTools(filtered);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const toolData = {
            name: formData.name,
            company: formData.company || undefined,
            shortDesc: formData.shortDesc || undefined,
            fullDesc: formData.fullDesc || undefined,
            website: formData.website,
            launchYear: formData.launchYear || undefined,
            categories: formData.categories.split(",").map(c => c.trim()).filter(Boolean),
            tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
            useCases: formData.useCases ? formData.useCases.split(",").map(u => u.trim()).filter(Boolean) : undefined,
            platforms: formData.platforms.split(",").map(p => p.trim()).filter(Boolean),
            pricingModel: formData.pricingModel,
            accessType: formData.accessType,
            price: formData.price,
            locked: formData.locked,
            lockReason: formData.lockReason || undefined
        };

        try {
            if (editingTool) {
                await dbService.updateTool(editingTool.id, toolData);
            } else {
                await dbService.createTool(toolData);
            }
            setShowModal(false);
            resetForm();
            loadTools();
        } catch (error) {
            console.error("Error saving tool:", error);
            alert("Failed to save tool");
        }
    };

    const handleEdit = (tool: Tool) => {
        setEditingTool(tool);
        setFormData({
            name: tool.name,
            company: tool.company || "",
            shortDesc: tool.shortDesc || "",
            fullDesc: tool.fullDesc || "",
            website: tool.website,
            launchYear: tool.launchYear || new Date().getFullYear(),
            categories: tool.categories.join(", "),
            tags: tool.tags?.join(", ") || "",
            useCases: tool.useCases?.join(", ") || "",
            platforms: tool.platforms.join(", "),
            pricingModel: tool.pricingModel,
            accessType: tool.accessType,
            price: tool.price,
            locked: tool.locked,
            lockReason: tool.lockReason || ""
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this tool?")) {
            await dbService.deleteTool(id);
            loadTools();
        }
    };

    const toggleLock = async (tool: Tool) => {
        await dbService.toggleToolLock(tool.id, !tool.locked, tool.lockReason);
        loadTools();
    };

    const resetForm = () => {
        setEditingTool(null);
        setFormData({
            name: "",
            company: "",
            shortDesc: "",
            fullDesc: "",
            website: "",
            launchYear: new Date().getFullYear(),
            categories: "",
            tags: "",
            useCases: "",
            platforms: "Web",
            pricingModel: "FREE",
            accessType: "FREE",
            price: 0,
            locked: false,
            lockReason: ""
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Manage AI Tools</h1>
                    <p className="text-text-secondary">Add, edit, and manage tools in the directory</p>
                </div>
                <Button onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus className="size-4 mr-2" />
                    Add New Tool
                </Button>
            </div>

            {/* Search */}
            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search tools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </Card>

            {/* Tools Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surface-100 border-b border-border">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Company</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Pricing</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                                        Loading tools...
                                    </td>
                                </tr>
                            ) : filteredTools.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                                        No tools found
                                    </td>
                                </tr>
                            ) : (
                                filteredTools.map(tool => (
                                    <tr key={tool.id} className="hover:bg-surface-50">
                                        <td className="px-4 py-3 font-medium">{tool.name}</td>
                                        <td className="px-4 py-3 text-text-secondary">{tool.company || "-"}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                                {tool.categories[0] || "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-medium">{tool.pricingModel}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {tool.locked ? (
                                                <span className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full flex items-center gap-1 w-fit">
                                                    <Lock className="size-3" />
                                                    Locked
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">
                                                    Public
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => toggleLock(tool)}
                                                    className="p-2 hover:bg-surface-100 rounded transition-colors"
                                                    title={tool.locked ? "Unlock" : "Lock"}
                                                >
                                                    {tool.locked ? <Unlock className="size-4" /> : <Lock className="size-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(tool)}
                                                    className="p-2 hover:bg-surface-100 rounded transition-colors"
                                                >
                                                    <Edit className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tool.id)}
                                                    className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 space-y-4">
                            <h2 className="text-2xl font-bold">
                                {editingTool ? "Edit Tool" : "Add New Tool"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tool Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Company</label>
                                        <input
                                            type="text"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Short Description</label>
                                    <input
                                        type="text"
                                        maxLength={120}
                                        value={formData.shortDesc}
                                        onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                                        className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Website URL *</label>
                                    <input
                                        type="url"
                                        required
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Categories (comma-separated) *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Text, Image, Video"
                                        value={formData.categories}
                                        onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                                        className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Pricing Model</label>
                                        <select
                                            value={formData.pricingModel}
                                            onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value as any })}
                                            className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="FREE">FREE</option>
                                            <option value="PAID">PAID</option>
                                            <option value="FREE_PAID">FREE + PAID</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Access Type</label>
                                        <select
                                            value={formData.accessType}
                                            onChange={(e) => setFormData({ ...formData, accessType: e.target.value as any })}
                                            className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="FREE">FREE</option>
                                            <option value="SUBSCRIPTION">SUBSCRIPTION</option>
                                            <option value="ONE_TIME_PURCHASE">ONE-TIME</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="locked"
                                        checked={formData.locked}
                                        onChange={(e) => setFormData({ ...formData, locked: e.target.checked })}
                                        className="size-4"
                                    />
                                    <label htmlFor="locked" className="text-sm font-medium">Lock this tool (Premium content)</label>
                                </div>

                                {formData.locked && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Lock Reason</label>
                                        <input
                                            type="text"
                                            placeholder="Premium content - Subscribe to unlock"
                                            value={formData.lockReason}
                                            onChange={(e) => setFormData({ ...formData, lockReason: e.target.value })}
                                            className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                )}

                                <div className="flex gap-3 justify-end pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => { setShowModal(false); resetForm(); }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        {editingTool ? "Update Tool" : "Create Tool"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
