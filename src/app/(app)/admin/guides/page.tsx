"use client";

import { useState, useEffect } from "react";
import { dbService, Guide } from "@/lib/firestore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Edit, Trash2, Lock, Unlock } from "lucide-react";

export default function AdminGuidesPage() {
    const [guides, setGuides] = useState<Guide[]>([]);
    const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingGuide, setEditingGuide] = useState<Guide | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        type: "Template" as "Freelancing Kit" | "Template" | "Blueprint",
        category: "",
        content: "",
        difficulty: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
        premium: false,
        accessType: "FREE" as "FREE" | "SUBSCRIPTION" | "ONE_TIME_PURCHASE",
        tags: ""
    });

    useEffect(() => {
        loadGuides();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [guides, searchQuery]);

    const loadGuides = async () => {
        setLoading(true);
        const data = await dbService.getGuides();
        setGuides(data);
        setLoading(false);
    };

    const applyFilters = () => {
        let filtered = [...guides];
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(guide =>
                guide.title.toLowerCase().includes(query) ||
                guide.category.toLowerCase().includes(query)
            );
        }
        setFilteredGuides(filtered);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const guideData = {
            title: formData.title,
            type: formData.type,
            category: formData.category,
            content: formData.content,
            difficulty: formData.difficulty,
            premium: formData.premium,
            accessType: formData.accessType,
            tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined
        };

        try {
            if (editingGuide) {
                await dbService.updateGuide(editingGuide.id, guideData);
            } else {
                await dbService.createGuide(guideData);
            }
            setShowModal(false);
            resetForm();
            loadGuides();
        } catch (error) {
            console.error("Error saving guide:", error);
            alert("Failed to save guide");
        }
    };

    const handleEdit = (guide: Guide) => {
        setEditingGuide(guide);
        setFormData({
            title: guide.title,
            type: guide.type,
            category: guide.category,
            content: guide.content,
            difficulty: guide.difficulty,
            premium: guide.premium,
            accessType: guide.accessType,
            tags: guide.tags?.join(", ") || ""
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this guide?")) {
            await dbService.deleteGuide(id);
            loadGuides();
        }
    };

    const togglePremium = async (guide: Guide) => {
        await dbService.toggleGuidePremium(guide.id, !guide.premium);
        loadGuides();
    };

    const resetForm = () => {
        setEditingGuide(null);
        setFormData({
            title: "",
            type: "Template",
            category: "",
            content: "",
            difficulty: "Beginner",
            premium: false,
            accessType: "FREE",
            tags: ""
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Manage Guides</h1>
                    <p className="text-text-secondary">Add, edit, and manage guides and templates</p>
                </div>
                <Button onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus className="size-4 mr-2" />
                    Add New Guide
                </Button>
            </div>

            {/* Search */}
            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search guides..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </Card>

            {/* Guides Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surface-100 border-b border-border">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Difficulty</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                                        Loading guides...
                                    </td>
                                </tr>
                            ) : filteredGuides.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                                        No guides found
                                    </td>
                                </tr>
                            ) : (
                                filteredGuides.map(guide => (
                                    <tr key={guide.id} className="hover:bg-surface-50">
                                        <td className="px-4 py-3 font-medium">{guide.title}</td>
                                        <td className="px-4 py-3 text-text-secondary">{guide.type}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                                {guide.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{guide.difficulty}</td>
                                        <td className="px-4 py-3">
                                            {guide.premium ? (
                                                <span className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full flex items-center gap-1 w-fit">
                                                    <Lock className="size-3" />
                                                    Premium
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">
                                                    Free
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => togglePremium(guide)}
                                                    className="p-2 hover:bg-surface-100 rounded transition-colors"
                                                    title={guide.premium ? "Make Free" : "Make Premium"}
                                                >
                                                    {guide.premium ? <Unlock className="size-4" /> : <Lock className="size-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(guide)}
                                                    className="p-2 hover:bg-surface-100 rounded transition-colors"
                                                >
                                                    <Edit className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(guide.id)}
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
                                {editingGuide ? "Edit Guide" : "Add New Guide"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Type *</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                            className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="Freelancing Kit">Freelancing Kit</option>
                                            <option value="Template">Template</option>
                                            <option value="Blueprint">Blueprint</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Category *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Content (Markdown) *</label>
                                    <textarea
                                        required
                                        rows={10}
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                                        placeholder="# Guide Title&#10;&#10;Your markdown content here..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Difficulty</label>
                                        <select
                                            value={formData.difficulty}
                                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                                            className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
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
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="premium"
                                        checked={formData.premium}
                                        onChange={(e) => setFormData({ ...formData, premium: e.target.checked })}
                                        className="size-4"
                                    />
                                    <label htmlFor="premium" className="text-sm font-medium">Mark as Premium content</label>
                                </div>

                                <div className="flex gap-3 justify-end pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => { setShowModal(false); resetForm(); }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        {editingGuide ? "Update Guide" : "Create Guide"}
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
