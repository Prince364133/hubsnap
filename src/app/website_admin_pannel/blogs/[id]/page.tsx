"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { dbService } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function BlogEditorPage() {
    const router = useRouter();
    const params = useParams();
    const blogId = params?.id as string;
    const isNew = blogId === "new";

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        coverImage: "",
        category: "AI Tools",
        tags: "",
        authorName: "HubSnap Team",
        metaTitle: "",
        metaDescription: "",
        keywords: "",
        readTime: 5,
        published: false,
        featured: false
    });

    useEffect(() => {
        if (!isNew && blogId) {
            loadBlog();
        }
    }, [blogId, isNew]);

    const loadBlog = async () => {
        const blog = await dbService.getBlog(blogId);
        if (blog) {
            setFormData({
                title: blog.title || "",
                slug: blog.slug || "",
                excerpt: blog.excerpt || "",
                content: blog.content || "",
                coverImage: blog.coverImage || "",
                category: blog.category || "AI Tools",
                tags: blog.tags?.join(", ") || "",
                authorName: blog.author?.name || "HubSnap Team",
                metaTitle: blog.seo?.metaTitle || "",
                metaDescription: blog.seo?.metaDescription || "",
                keywords: blog.seo?.keywords?.join(", ") || "",
                readTime: blog.readTime || 5,
                published: blog.published || false,
                featured: blog.featured || false
            });
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);

        const blogData = {
            title: formData.title,
            slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
            excerpt: formData.excerpt,
            content: formData.content,
            coverImage: formData.coverImage || "/blog-placeholder.jpg",
            author: {
                name: formData.authorName,
                avatar: ""
            },
            category: formData.category,
            tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
            seo: {
                metaTitle: formData.metaTitle || formData.title,
                metaDescription: formData.metaDescription || formData.excerpt,
                keywords: formData.keywords.split(",").map(k => k.trim()).filter(Boolean),
                ogImage: formData.coverImage
            },
            readTime: formData.readTime,
            published: formData.published,
            featured: formData.featured
        };

        let success;
        if (isNew) {
            success = await dbService.createBlog(blogData);
        } else {
            success = await dbService.updateBlog(blogId, blogData);
        }

        setSaving(false);
        if (success) {
            router.push("/website_admin_pannel/blogs");
        }
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/website_admin_pannel/blogs">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">{isNew ? "New Blog Post" : "Edit Blog Post"}</h1>
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="size-4 mr-2" />
                        {saving ? "Saving..." : "Save Blog"}
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="col-span-2 space-y-4">
                        <Card className="p-6">
                            <h2 className="font-semibold mb-4">Basic Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Title *</label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter blog title"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Slug (URL)</label>
                                    <Input
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="auto-generated-from-title"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Excerpt *</label>
                                    <textarea
                                        className="w-full border rounded-md p-3 min-h-[80px]"
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                        placeholder="Short description (150-160 characters)"
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="font-semibold mb-4">Content (Markdown)</h2>
                            <textarea
                                className="w-full border rounded-md p-4 font-mono text-sm min-h-[400px]"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Write your blog content in Markdown..."
                            />
                        </Card>

                        <Card className="p-6">
                            <h2 className="font-semibold mb-4">SEO Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Meta Title</label>
                                    <Input
                                        value={formData.metaTitle}
                                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                        placeholder="SEO title (60 characters)"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Meta Description</label>
                                    <textarea
                                        className="w-full border rounded-md p-3 min-h-[80px]"
                                        value={formData.metaDescription}
                                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                        placeholder="SEO description (150-160 characters)"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Keywords (comma-separated)</label>
                                    <Input
                                        value={formData.keywords}
                                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                        placeholder="ai tools, content creation, youtube"
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
                                        <option>AI Tools</option>
                                        <option>YouTube Growth</option>
                                        <option>Content Creation</option>
                                        <option>Digital Business</option>
                                        <option>Tutorials</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
                                    <Input
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="ai, tools, youtube"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Read Time (minutes)</label>
                                    <Input
                                        type="number"
                                        value={formData.readTime}
                                        onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 5 })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Author Name</label>
                                    <Input
                                        value={formData.authorName}
                                        onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="font-semibold mb-4">Cover Image</h2>
                            <Input
                                value={formData.coverImage}
                                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                placeholder="Image URL"
                            />
                        </Card>

                        <Card className="p-6">
                            <h2 className="font-semibold mb-4">Publish Settings</h2>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.published}
                                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                        className="size-4"
                                    />
                                    <span className="text-sm">Published</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                        className="size-4"
                                    />
                                    <span className="text-sm">Featured</span>
                                </label>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
