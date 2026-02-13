"use client";

import { useState, useEffect } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { dbService } from "@/lib/firestore";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Search, Clock, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function BlogPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        loadBlogs();
    }, []);

    const loadBlogs = async () => {
        const data = await dbService.getBlogs({ published: true });
        setBlogs(data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
        setLoading(false);
    };

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || blog.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ["all", ...new Set(blogs.map(b => b.category).filter(Boolean))];
    const featuredBlog = blogs.find(b => b.featured);

    return (
        <div className="min-h-screen bg-white">
            <PublicHeader />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Hero */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-black mb-4">
                            Creator <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Blog</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Insights, tutorials, and guides to help you grow your content creation business
                        </p>
                    </div>

                    {/* Featured Blog */}
                    {featuredBlog && (
                        <Link href={`/blog/${featuredBlog.slug}`}>
                            <Card className="mb-12 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="relative h-64 md:h-auto">
                                        <Image
                                            src={featuredBlog.coverImage || "/blog-placeholder.jpg"}
                                            alt={featuredBlog.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="p-8 flex flex-col justify-center">
                                        <Badge className="w-fit mb-3 bg-amber-100 text-amber-700">Featured</Badge>
                                        <h2 className="text-3xl font-bold mb-3">{featuredBlog.title}</h2>
                                        <p className="text-slate-600 mb-4">{featuredBlog.excerpt}</p>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span>{featuredBlog.author?.name}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="size-4" />
                                                {featuredBlog.readTime} min read
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="size-4" />
                                                {featuredBlog.views || 0} views
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    )}

                    {/* Search & Filters */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                                <Input
                                    placeholder="Search blog posts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-12"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat
                                        ? "bg-primary text-white"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                        }`}
                                >
                                    {cat === "all" ? "All Posts" : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Blog Grid */}
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                            <p className="mt-4 text-slate-500">Loading blog posts...</p>
                        </div>
                    ) : filteredBlogs.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-slate-500">No blog posts found.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBlogs.map(blog => (
                                <Link key={blog.id} href={`/blog/${blog.slug}`}>
                                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                                        <div className="relative h-48">
                                            <Image
                                                src={blog.coverImage || "/blog-placeholder.jpg"}
                                                alt={blog.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="p-6">
                                            <Badge variant="outline" className="mb-3">{blog.category}</Badge>
                                            <h3 className="font-bold text-lg mb-2 line-clamp-2">{blog.title}</h3>
                                            <p className="text-slate-600 text-sm mb-4 line-clamp-3">{blog.excerpt}</p>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span>{blog.author?.name}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="size-3" />
                                                    {blog.readTime} min
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
