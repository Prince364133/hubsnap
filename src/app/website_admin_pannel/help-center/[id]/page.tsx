"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { dbService } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function HelpArticleEditorPage() {
    const router = useRouter();
    const params = useParams();
    const articleId = params?.id as string;
    const isNew = articleId === "new";

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: "Getting Started",
        published: false,
        order: 0
    });

    useEffect(() => {
        if (!isNew && articleId) {
            loadArticle();
        }
    }, [articleId, isNew]);

    const loadArticle = async () => {
        const article = await dbService.getHelpArticle(articleId);
        if (article) {
            setFormData({
                title: article.title || "",
                content: article.content || "",
                category: article.category || "Getting Started",
                published: article.published || false,
                order: article.order || 0
            });
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);

        const articleData = {
            title: formData.title,
            content: formData.content,
            category: formData.category,
            published: formData.published,
            order: formData.order,
            updatedAt: new Date()
        };

        let success;
        if (isNew) {
            success = await dbService.createHelpArticle(articleData);
        } else {
            success = await dbService.updateHelpArticle(articleId, articleData);
        }

        setSaving(false);
        if (success) {
            router.push("/website_admin_pannel/help-center");
        }
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    const categories = ["Getting Started", "Features", "Billing", "Technical", "Account Management"];

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/website_admin_pannel/help-center">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">{isNew ? "New Help Article" : "Edit Help Article"}</h1>
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="size-4 mr-2" />
                        {saving ? "Saving..." : "Save Article"}
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="col-span-2 space-y-4">
                        <Card className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Title *</label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="How to..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Content (Markdown) *</label>
                                    <textarea
                                        className="w-full border rounded-md p-4 font-mono text-sm min-h-[400px]"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Write article content in Markdown..."
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <Card className="p-6">
                            <h2 className="font-semibold mb-4">Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Category</label>
                                    <select
                                        className="w-full border rounded-md p-2"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Order (Sort Priority)</label>
                                    <Input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="pt-4 border-t">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.published}
                                            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                            className="size-4"
                                        />
                                        <span className="text-sm font-medium">Published</span>
                                    </label>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
