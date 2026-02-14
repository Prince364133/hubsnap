"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "sonner";
import { Loader2, Save, ExternalLink, ImageIcon, Layout } from "lucide-react";
import { websiteConfigService, WebsiteConfig } from "@/lib/website-config";

export default function WebsiteManagementPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<WebsiteConfig | null>(null);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        setLoading(true);
        const data = await websiteConfigService.getConfig();
        setConfig(data);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        const success = await websiteConfigService.updateConfig(config);
        if (success) {
            toast.success("Website settings updated successfully!");
        } else {
            toast.error("Failed to update settings");
        }
        setSaving(false);
    };

    if (loading || !config) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin size-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Website Management</h1>
                    <p className="text-slate-500">Manage your homepage content and branding assets</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-6">
                {/* Hero Section Config */}
                <Card className="p-6 border-slate-200">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Layout className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Hero Section</h2>
                            <p className="text-sm text-slate-500">Customize the main landing area</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>Headline</Label>
                            <Input
                                value={config.hero.headline}
                                onChange={(e) => setConfig({
                                    ...config,
                                    hero: { ...config.hero, headline: e.target.value }
                                })}
                                placeholder="Enter main headline"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Subheadline</Label>
                            <Textarea
                                value={config.hero.subheadline}
                                onChange={(e) => setConfig({
                                    ...config,
                                    hero: { ...config.hero, subheadline: e.target.value }
                                })}
                                placeholder="Enter subheadline text"
                                rows={3}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>CTA Button Text</Label>
                                <Input
                                    value={config.hero.ctaText}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        hero: { ...config.hero, ctaText: e.target.value }
                                    })}
                                    placeholder="Start For Free"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Hero Image URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={config.hero.imageUrl}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            hero: { ...config.hero, imageUrl: e.target.value }
                                        })}
                                        placeholder="/hero.png"
                                    />
                                    {config.hero.imageUrl && (
                                        <Button variant="ghost" size="icon" asChild>
                                            <a href={config.hero.imageUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="size-4" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400">
                                    Use a full URL (https://...) or path in public folder (/hero.png)
                                </p>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="mt-4 p-4 text-center rounded-xl bg-slate-100 border border-slate-200">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Image Preview</p>
                            <img
                                src={config.hero.imageUrl}
                                alt="Hero Preview"
                                className="max-h-48 mx-auto rounded-lg shadow-sm"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                        </div>
                    </div>
                </Card>

                {/* Branding Config */}
                <Card className="p-6 border-slate-200">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <ImageIcon className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Branding Assets</h2>
                            <p className="text-sm text-slate-500">Manage site logos</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Header Logo URL (GIF/PNG)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={config.branding.headerLogoUrl}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            branding: { ...config.branding, headerLogoUrl: e.target.value }
                                        })}
                                        placeholder="/logo.gif"
                                    />
                                    {config.branding.headerLogoUrl && (
                                        <Button variant="ghost" size="icon" asChild title="Preview Logo">
                                            <a href={config.branding.headerLogoUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="size-4" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                                <div className="mt-2 p-4 text-center rounded-xl bg-slate-100 border border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Header Logo Preview</p>
                                    <img
                                        src={config.branding.headerLogoUrl}
                                        alt="Header Logo Preview"
                                        className="h-12 mx-auto rounded shadow-sm"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Footer Logo URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={config.branding.footerLogoUrl}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            branding: { ...config.branding, footerLogoUrl: e.target.value }
                                        })}
                                        placeholder="/logo.jpeg"
                                    />
                                    {config.branding.footerLogoUrl && (
                                        <Button variant="ghost" size="icon" asChild title="Preview Logo">
                                            <a href={config.branding.footerLogoUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="size-4" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                                <div className="mt-2 p-4 text-center rounded-xl bg-slate-100 border border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Footer Logo Preview</p>
                                    <img
                                        src={config.branding.footerLogoUrl}
                                        alt="Footer Logo Preview"
                                        className="h-10 mx-auto rounded shadow-sm grayscale opacity-50"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Favicon / Shortcut Icon URL</Label>
                            <Input
                                value={config.branding.faviconUrl}
                                onChange={(e) => setConfig({
                                    ...config,
                                    branding: { ...config.branding, faviconUrl: e.target.value }
                                })}
                                placeholder="/favicon.ico"
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
