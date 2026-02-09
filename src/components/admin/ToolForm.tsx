"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import type { Tool } from "@/lib/firestore";
import { dbService } from "@/lib/firestore";

interface ToolFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tool?: Tool | null;
    onSuccess: () => void;
}

export function ToolForm({ open, onOpenChange, tool, onSuccess }: ToolFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        shortDesc: "",
        fullDesc: "",
        website: "",
        categories: "",
        useCases: "",
        pricingModel: "FREE" as "FREE" | "PAID" | "FREE_PAID",
        accessType: "FREE" as "FREE" | "SUBSCRIPTION" | "ONE_TIME_PURCHASE",
        platforms: "",
        price: "0",
        locked: false,
        isPublic: true
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (tool) {
            setFormData({
                name: tool.name || "",
                shortDesc: tool.shortDesc || "",
                fullDesc: tool.fullDesc || "",
                website: tool.website || "",
                categories: tool.categories?.join(", ") || "",
                useCases: tool.useCases?.join(", ") || "",
                pricingModel: tool.pricingModel || "FREE",
                accessType: tool.accessType || "FREE",
                platforms: tool.platforms?.join(", ") || "",
                price: tool.price?.toString() || "0",
                locked: tool.locked || false,
                isPublic: tool.isPublic ?? true
            });
        } else {
            // Reset form for new tool
            setFormData({
                name: "",
                shortDesc: "",
                fullDesc: "",
                website: "",
                categories: "",
                useCases: "",
                pricingModel: "FREE",
                accessType: "FREE",
                platforms: "",
                price: "0",
                locked: false,
                isPublic: true
            });
        }
    }, [tool, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const toolData = {
                name: formData.name.trim(),
                shortDesc: formData.shortDesc.trim(),
                fullDesc: formData.fullDesc.trim(),
                website: formData.website.trim(),
                categories: formData.categories.split(',').map(c => c.trim()).filter(Boolean),
                useCases: formData.useCases.split(',').map(u => u.trim()).filter(Boolean),
                pricingModel: formData.pricingModel,
                accessType: formData.accessType,
                platforms: formData.platforms.split(',').map(p => p.trim()).filter(Boolean),
                price: parseFloat(formData.price) || 0,
                locked: formData.locked,
                isPublic: formData.isPublic
            };

            if (tool) {
                // Update existing tool
                const success = await dbService.updateTool(tool.id, toolData);
                if (success) {
                    alert("Tool updated successfully!");
                    onSuccess();
                    onOpenChange(false);
                } else {
                    alert("Failed to update tool");
                }
            } else {
                // Create new tool
                const id = await dbService.createTool(toolData as any);
                if (id) {
                    alert("Tool created successfully!");
                    onSuccess();
                    onOpenChange(false);
                } else {
                    alert("Failed to create tool");
                }
            }
        } catch (error) {
            console.error("Error saving tool:", error);
            alert("An error occurred while saving the tool");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{tool ? "Edit Tool" : "Create New Tool"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-slate-700">Basic Information</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g., ChatGPT"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">Website *</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    required
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shortDesc">Short Description</Label>
                            <Input
                                id="shortDesc"
                                value={formData.shortDesc}
                                onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                                placeholder="Brief one-line description"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullDesc">Full Description</Label>
                            <Textarea
                                id="fullDesc"
                                value={formData.fullDesc}
                                onChange={(e) => setFormData({ ...formData, fullDesc: e.target.value })}
                                placeholder="Detailed description of the tool"
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Categories and Use Cases */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-slate-700">Classification</h3>

                        <div className="space-y-2">
                            <Label htmlFor="categories">Categories (comma-separated) *</Label>
                            <Input
                                id="categories"
                                value={formData.categories}
                                onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                                required
                                placeholder="Writing, Productivity, Coding"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="useCases">Use Cases (comma-separated)</Label>
                            <Input
                                id="useCases"
                                value={formData.useCases}
                                onChange={(e) => setFormData({ ...formData, useCases: e.target.value })}
                                placeholder="Content Creation, Code Generation, Research"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="platforms">Platforms (comma-separated)</Label>
                            <Input
                                id="platforms"
                                value={formData.platforms}
                                onChange={(e) => setFormData({ ...formData, platforms: e.target.value })}
                                placeholder="Web, App, API"
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-slate-700">Pricing</h3>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pricingModel">Pricing Model *</Label>
                                <select
                                    id="pricingModel"
                                    value={formData.pricingModel}
                                    onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                >
                                    <option value="FREE">Free</option>
                                    <option value="PAID">Paid</option>
                                    <option value="FREE_PAID">Freemium</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="accessType">Access Type *</Label>
                                <select
                                    id="accessType"
                                    value={formData.accessType}
                                    onChange={(e) => setFormData({ ...formData, accessType: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                >
                                    <option value="FREE">Free</option>
                                    <option value="SUBSCRIPTION">Subscription</option>
                                    <option value="ONE_TIME_PURCHASE">One-time Purchase</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Price ($)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-slate-700">Status</h3>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={formData.isPublic}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, isPublic: e.target.checked })}
                                    className="size-4 rounded border-slate-300"
                                />
                                <Label htmlFor="isPublic" className="cursor-pointer">
                                    Public (Visible to users)
                                </Label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="locked"
                                    checked={formData.locked}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, locked: e.target.checked })}
                                    className="size-4 rounded border-slate-300"
                                />
                                <Label htmlFor="locked" className="cursor-pointer">
                                    Locked (Requires premium)
                                </Label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? "Saving..." : tool ? "Update Tool" : "Create Tool"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
