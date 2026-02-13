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

// import { runBlogSeed } from "@/app/actions/seed-actions";
import { downloadBlogTemplate, parseBlogExcelFile } from "@/lib/excel-utils";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/Dialog";

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");


    const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; type: 'single' | 'bulk'; id?: string }>({ isOpen: false, type: 'single' });

    useEffect(() => {
        loadBlogs();
    }, []);

    const handleDownloadTemplate = () => {
        downloadBlogTemplate();
        toast.success("Template downloaded!");
    };

    const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const parsedBlogs = await parseBlogExcelFile(file);

            if (parsedBlogs.length === 0) {
                toast.warning("No valid blogs found in file");
                return;
            }

            let successCount = 0;
            let failCount = 0;

            for (const blog of parsedBlogs) {
                try {
                    if (!blog.title || !blog.content) {
                        failCount++;
                        continue;
                    }
                    await dbService.createBlog(blog as any);
                    successCount++;
                } catch (err) {
                    console.error("Error importing blog:", blog.title, err);
                    failCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully imported ${successCount} blogs!`);
                loadBlogs();
            }
            if (failCount > 0) {
                toast.warning(`Failed to import ${failCount} rows.`);
            }
        } catch (error) {
            console.error("Import error:", error);
            toast.error("Failed to parse Excel file");
        } finally {
            setLoading(false);
            e.target.value = "";
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedBlogs(filteredBlogs.map(b => b.id));
        } else {
            setSelectedBlogs([]);
        }
    };

    const handleSelectBlog = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedBlogs(prev => [...prev, id]);
        } else {
            setSelectedBlogs(prev => prev.filter(blogId => blogId !== id));
        }
    };

    const confirmDelete = async () => {
        if (deleteConfirmation.type === 'bulk') {
            const success = await dbService.batchDeleteBlogs(selectedBlogs);
            if (success) {
                toast.success(`${selectedBlogs.length} blogs deleted successfully`);
                setSelectedBlogs([]);
                loadBlogs();
            } else {
                toast.error("Failed to delete blogs");
            }
        } else if (deleteConfirmation.id) {
            const success = await dbService.deleteBlog(deleteConfirmation.id);
            if (success) {
                toast.success("Blog post deleted successfully");
                setBlogs(blogs.filter(b => b.id !== deleteConfirmation.id));
            } else {
                toast.error("Failed to delete blog post");
            }
        }
        setDeleteConfirmation({ isOpen: false, type: 'single' });
    };

    const handleBulkDelete = () => {
        setDeleteConfirmation({ isOpen: true, type: 'bulk' });
    };


    const loadBlogs = async () => {
        setLoading(true);
        const data = await dbService.getBlogs();
        setBlogs(data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
        setLoading(false);
    };

    const handleDelete = (id: string) => {
        setDeleteConfirmation({ isOpen: true, type: 'single', id });
    };


    // Derived State
    const categories = Array.from(new Set(blogs.map(b => b.category || "Uncategorized")));
    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === "all" || blog.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const handleTogglePublish = async (blog: any) => {
        const newStatus = !blog.published;
        // In a real app, update via dbService
        // For now, optimistic update
        const updatedBlogs = blogs.map(b => b.id === blog.id ? { ...b, published: newStatus } : b);
        setBlogs(updatedBlogs);
        await dbService.updateBlog(blog.id, { published: newStatus });
        toast.success(newStatus ? "Blog published" : "Blog unpublished");
    };

    const handleExcelExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(blogs);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Blogs");
        XLSX.writeFile(workbook, "blogs_export.xlsx");
    };

    return (
        <div className="space-y-8">
            <div className="max-w-7xl mx-auto">
                {/* Header and other UI elements remain the same */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Blog Management</h1>
                        <p className="text-slate-500 mt-1">Manage your blog posts and content</p>
                    </div>
                    <div className="flex gap-3">
                        {selectedBlogs.length > 0 && (
                            <Button
                                variant="destructive"
                                onClick={handleBulkDelete}
                                className="animate-in fade-in slide-in-from-right-4"
                            >
                                <Trash2 className="size-4 mr-2" />
                                Delete ({selectedBlogs.length})
                            </Button>
                        )}
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
                        <div className="flex gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="selectAll"
                                    checked={selectedBlogs.length === filteredBlogs.length && filteredBlogs.length > 0}
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
                            <Card key={blog.id} className={`p-4 hover:shadow-md transition-shadow ${selectedBlogs.includes(blog.id) ? 'border-primary ring-1 ring-primary' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedBlogs.includes(blog.id)}
                                        onChange={(e) => handleSelectBlog(blog.id, e.target.checked)}
                                        className="rounded border-slate-300 text-primary focus:ring-primary h-5 w-5"
                                    />
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

            <Dialog open={deleteConfirmation.isOpen} onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {deleteConfirmation.type === 'bulk' ? `${selectedBlogs.length} blogs` : 'this blog post'}?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
