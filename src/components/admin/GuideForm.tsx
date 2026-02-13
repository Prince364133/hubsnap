"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { dbService } from "@/lib/firestore";
import type { Guide } from "@/lib/firestore";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface GuideFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guide?: Guide | null;
    onSuccess: () => void;
}

export function GuideForm({ open, onOpenChange, guide, onSuccess }: GuideFormProps) {
    const [formData, setFormData] = useState({
        title: "",
        type: "Template" as "Freelancing Kit" | "Template" | "Blueprint",
        category: "",
        content: "",
        difficulty: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
        premium: false,
        isPublic: true,
        accessType: "FREE" as "FREE" | "SUBSCRIPTION" | "ONE_TIME_PURCHASE",
        tags: "",
        externalUrl: "",
        whatYouWillLearn: [] as string[],
        includes: [] as string[]
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (guide) {
            setFormData({
                title: guide.title || "",
                type: guide.type || "Template",
                category: guide.category || "",
                content: guide.content || "",
                difficulty: guide.difficulty || "Beginner",
                premium: guide.premium || false,
                isPublic: guide.isPublic ?? true,
                accessType: guide.accessType || "FREE",
                tags: guide.tags?.join(", ") || "",
                externalUrl: guide.externalUrl || "",
                whatYouWillLearn: guide.whatYouWillLearn || [],
                includes: guide.includes || []
            });
        } else {
            // Reset form
            setFormData({
                title: "",
                type: "Template",
                category: "",
                content: "",
                difficulty: "Beginner",
                premium: false,
                isPublic: true,
                accessType: "FREE",
                tags: "",
                externalUrl: "",
                whatYouWillLearn: [],
                includes: []
            });
        }
    }, [guide, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const guideData = {
                title: formData.title.trim(),
                type: formData.type,
                category: formData.category.trim(),
                content: formData.content.trim(),
                difficulty: formData.difficulty,
                premium: formData.premium,
                isPublic: formData.isPublic,
                accessType: formData.accessType,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                externalUrl: formData.externalUrl.trim(),
                whatYouWillLearn: formData.whatYouWillLearn.filter(item => item.trim()),
                includes: formData.includes.filter(item => item.trim())
            };

            if (guide) {
                const success = await dbService.updateGuide(guide.id, guideData);
                if (success) {
                    toast.success("Guide updated successfully!");
                    onSuccess();
                    onOpenChange(false);
                } else {
                    toast.error("Failed to update guide");
                }
            } else {
                const id = await dbService.createGuide(guideData as any);
                if (id) {
                    toast.success("Guide created successfully!");
                    onSuccess();
                    onOpenChange(false);
                } else {
                    toast.error("Failed to create guide");
                }
            }
        } catch (error) {
            console.error("Error saving guide:", error);
            toast.error("An error occurred while saving the guide");
        } finally {
            setSaving(false);
        }
    };

    const handleAddItem = (field: 'whatYouWillLearn' | 'includes') => {
        setFormData({
            ...formData,
            [field]: [...formData[field], ""]
        });
    };

    const handleRemoveItem = (field: 'whatYouWillLearn' | 'includes', index: number) => {
        const newItems = [...formData[field]];
        newItems.splice(index, 1);
        setFormData({
            ...formData,
            [field]: newItems
        });
    };

    const handleItemChange = (field: 'whatYouWillLearn' | 'includes', index: number, value: string) => {
        const newItems = [...formData[field]];
        newItems[index] = value;
        setFormData({
            ...formData,
            [field]: newItems
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{guide ? "Edit Digital Business Idea" : "Add New Idea"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-slate-700">Basic Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="e.g., Notion Freelancer Kit"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type *</Label>
                                <select
                                    id="type"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                >
                                    <option value="Freelancing Kit">Freelancing Kit</option>
                                    <option value="Template">Template</option>
                                    <option value="Blueprint">Blueprint</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Input
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                    placeholder="Business, Design, Tech"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input
                                id="tags"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="notion, productivity, freelance"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="externalUrl">External Resource URL (Start Reading Link)</Label>
                            <Input
                                id="externalUrl"
                                value={formData.externalUrl}
                                onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                                placeholder="https://notion.so/..."
                            />
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-slate-700">Content Details</h3>

                        {/* What You'll Learn */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>What You'll Learn</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAddItem('whatYouWillLearn')}
                                    className="text-primary hover:text-primary-dark"
                                >
                                    <Plus className="size-4 mr-1" /> Add Item
                                </Button>
                            </div>
                            {formData.whatYouWillLearn.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={item}
                                        onChange={(e) => handleItemChange('whatYouWillLearn', index, e.target.value)}
                                        placeholder="e.g. How to structure your portfolio"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveItem('whatYouWillLearn', index)}
                                        className="text-slate-400 hover:text-red-500"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}
                            {formData.whatYouWillLearn.length === 0 && (
                                <p className="text-xs text-slate-400 italic">No learning points added yet.</p>
                            )}
                        </div>

                        {/* Includes */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Includes</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAddItem('includes')}
                                    className="text-primary hover:text-primary-dark"
                                >
                                    <Plus className="size-4 mr-1" /> Add Item
                                </Button>
                            </div>
                            {formData.includes.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={item}
                                        onChange={(e) => handleItemChange('includes', index, e.target.value)}
                                        placeholder="e.g. 5 Email Templates"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveItem('includes', index)}
                                        className="text-slate-400 hover:text-red-500"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}
                            {formData.includes.length === 0 && (
                                <p className="text-xs text-slate-400 italic">No inclusions added yet.</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Markdown Content *</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                required
                                placeholder="# Introduction..."
                                rows={8}
                                className="font-mono text-sm"
                            />
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-slate-700">Settings</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="difficulty">Difficulty</Label>
                                <select
                                    id="difficulty"
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="accessType">Access Type</Label>
                                <select
                                    id="accessType"
                                    value={formData.accessType}
                                    onChange={(e) => setFormData({ ...formData, accessType: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="FREE">Free</option>
                                    <option value="SUBSCRIPTION">Subscription</option>
                                    <option value="ONE_TIME_PURCHASE">One-time Purchase</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pt-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={formData.isPublic}
                                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                    className="size-4 rounded border-slate-300"
                                />
                                <Label htmlFor="isPublic" className="cursor-pointer">Public (Visible)</Label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="premium"
                                    checked={formData.premium}
                                    onChange={(e) => setFormData({ ...formData, premium: e.target.checked })}
                                    className="size-4 rounded border-slate-300"
                                />
                                <Label htmlFor="premium" className="cursor-pointer">Premium Only</Label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? "Saving..." : guide ? "Update Idea" : "Create Idea"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
