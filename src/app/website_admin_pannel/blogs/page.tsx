"use client";

import { useState, useEffect } from "react";
import { dbService } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Plus, Search, Upload, Edit, Trash2, Eye, EyeOff, Download } from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";

import { runBlogSeed } from "@/app/actions/seed-actions";
import { toast } from "sonner";

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [seeding, setSeeding] = useState(false);

    useEffect(() => {
        loadBlogs();
    }, []);

    const handleSeed = async () => {
        setSeeding(true);
        const result = await runBlogSeed();
        setSeeding(false);
        if (result.success) {
            toast.success(result.message);
            loadBlogs();
        } else {
            toast.error(result.message);
        }
    };


    const loadBlogs = async () => {
        setLoading(true);
        const data = await dbService.getBlogs();
        setBlogs(data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;
        const success = await dbService.deleteBlog(id);
        if (success) {
            setBlogs(blogs.filter(b => b.id !== id));
        }
    };

    const handleTogglePublish = async (blog: any) => {
        const success = await dbService.updateBlog(blog.id, { published: !blog.published });
        if (success) {
            loadBlogs();
        }
    };

    const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const blogsToImport = jsonData.map((row: any) => ({
                title: row.Title || "",
                slug: row.Slug || row.Title?.toLowerCase().replace(/\s+/g, "-") || "",
                excerpt: row.Excerpt || "",
                content: row.Content || "",
                coverImage: row.CoverImage || "/blog-placeholder.jpg",
                author: {
                    name: row.Author || "HubSnap Team",
                    avatar: row.AuthorAvatar || ""
                },
                category: row.Category || "General",
                tags: row.Tags ? row.Tags.split(",").map((t: string) => t.trim()) : [],
                seo: {
                    metaTitle: row.MetaTitle || row.Title || "",
                    metaDescription: row.MetaDescription || row.Excerpt || "",
                    keywords: row.Keywords ? row.Keywords.split(",").map((k: string) => k.trim()) : [],
                    ogImage: row.OGImage || row.CoverImage || ""
                },
                readTime: parseInt(row.ReadTime) || 5,
                published: row.Published === "TRUE" || row.Published === true,
                featured: row.Featured === "TRUE" || row.Featured === true
            }));

            const result = await dbService.bulkImportBlogs(blogsToImport);
            alert(`Import complete! Success: ${result.success}, Failed: ${result.failed}`);
            loadBlogs();
        };
        reader.readAsArrayBuffer(file);
    };

    const handleExcelExport = () => {
        const exportData = blogs.map(blog => ({
            Title: blog.title,
            Slug: blog.slug,
            Excerpt: blog.excerpt,
            Content: blog.content,
            Category: blog.category,
            Tags: blog.tags?.join(", ") || "",
            Author: blog.author?.name || "",
            MetaTitle: blog.seo?.metaTitle || "",
            MetaDescription: blog.seo?.metaDescription || "",
            Keywords: blog.seo?.keywords?.join(", ") || "",
            ReadTime: blog.readTime,
            Published: blog.published ? "TRUE" : "FALSE",
            Featured: blog.featured ? "TRUE" : "FALSE",
            Views: blog.views || 0,
            CoverImage: blog.coverImage || ""
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Blogs");
        XLSX.writeFile(workbook, "blogs-export.xlsx");
    };

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === "all" || blog.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ["all", ...new Set(blogs.map(b => b.category).filter(Boolean))];

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Blog Management</h1>
                        <p className="text-slate-500 mt-1">Manage your blog posts and content</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleExcelExport}>
                            <Download className="size-4 mr-2" />
                            Export Excel
                        </Button>
                        <label>
                            <Button variant="outline" asChild>
                                <span>
                                    <Upload className="size-4 mr-2" />
                                    Import Excel
                                </span>
                            </Button>
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={handleExcelImport}
                            />
                        </label>
                        <Button variant="outline" onClick={handleSeed} disabled={seeding}>
                            <Upload className="size-4 mr-2" />
                            {seeding ? "Seeding..." : "Seed Samples"}
                        </Button>
                        <Link href="/website_admin_pannel/blogs/new">
                            <Button>
                                <Plus className="size-4 mr-2" />
                                New Blog Post
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <Card className="p-4 mb-6">
                    <div className="flex gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <Input
                                placeholder="Search blogs..."
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
                                >
                                    {cat === "all" ? "All" : cat}
                                </Button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <Card className="p-4">
                        <div className="text-sm text-slate-500">Total Blogs</div>
                        <div className="text-2xl font-bold">{blogs.length}</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-sm text-slate-500">Published</div>
                        <div className="text-2xl font-bold text-green-600">
                            {blogs.filter(b => b.published).length}
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-sm text-slate-500">Drafts</div>
                        <div className="text-2xl font-bold text-amber-600">
                            {blogs.filter(b => !b.published).length}
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-sm text-slate-500">Total Views</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {blogs.reduce((sum, b) => sum + (b.views || 0), 0)}
                        </div>
                    </Card>
                </div>

                {/* Blogs Table */}
                {loading ? (
                    <div className="text-center py-12">Loading blogs...</div>
                ) : filteredBlogs.length === 0 ? (
                    <Card className="p-12 text-center">
                        <p className="text-slate-500">No blogs found. Create your first blog post!</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredBlogs.map(blog => (
                            <Card key={blog.id} className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-lg">{blog.title}</h3>
                                            {blog.published ? (
                                                <Badge className="bg-green-100 text-green-700">Published</Badge>
                                            ) : (
                                                <Badge variant="outline">Draft</Badge>
                                            )}
                                            {blog.featured && (
                                                <Badge className="bg-amber-100 text-amber-700">Featured</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 mb-2">{blog.excerpt}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span>{blog.category}</span>
                                            <span>•</span>
                                            <span>{blog.readTime} min read</span>
                                            <span>•</span>
                                            <span>{blog.views || 0} views</span>
                                            <span>•</span>
                                            <span>{blog.author?.name || "Unknown"}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleTogglePublish(blog)}
                                        >
                                            {blog.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </Button>
                                        <Link href={`/website_admin_pannel/blogs/${blog.id}`}>
                                            <Button size="sm" variant="outline">
                                                <Edit className="size-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(blog.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
