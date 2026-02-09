"use client";

import { useState, useEffect } from "react";
import { dbService } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function AdminHelpCenterPage() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        setLoading(true);
        const data = await dbService.getHelpArticles();
        setArticles(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this article?")) return;
        const success = await dbService.deleteHelpArticle(id);
        if (success) {
            setArticles(articles.filter(a => a.id !== id));
        }
    };

    const handleTogglePublish = async (article: any) => {
        const success = await dbService.updateHelpArticle(article.id, { published: !article.published });
        if (success) {
            loadArticles();
        }
    };

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === "all" || article.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ["all", "Getting Started", "Features", "Billing", "Technical"];

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Help Center Management</h1>
                        <p className="text-slate-500 mt-1">Manage help articles and documentation</p>
                    </div>
                    <Link href="/website_admin_pannel/help-center/new">
                        <Button>
                            <Plus className="size-4 mr-2" />
                            New Article
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="p-4 mb-6">
                    <div className="flex gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <Input
                                placeholder="Search articles..."
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
                        <div className="text-sm text-slate-500">Total Articles</div>
                        <div className="text-2xl font-bold">{articles.length}</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-sm text-slate-500">Published</div>
                        <div className="text-2xl font-bold text-green-600">
                            {articles.filter(a => a.published).length}
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-sm text-slate-500">Total Views</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {articles.reduce((sum, a) => sum + (a.views || 0), 0)}
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-sm text-slate-500">Helpful Votes</div>
                        <div className="text-2xl font-bold text-purple-600">
                            {articles.reduce((sum, a) => sum + (a.helpful || 0), 0)}
                        </div>
                    </Card>
                </div>

                {/* Articles List */}
                {loading ? (
                    <div className="text-center py-12">Loading articles...</div>
                ) : filteredArticles.length === 0 ? (
                    <Card className="p-12 text-center">
                        <p className="text-slate-500">No articles found. Create your first help article!</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredArticles.map(article => (
                            <Card key={article.id} className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-lg">{article.title}</h3>
                                            {article.published ? (
                                                <Badge className="bg-green-100 text-green-700">Published</Badge>
                                            ) : (
                                                <Badge variant="outline">Draft</Badge>
                                            )}
                                            <Badge variant="outline">{article.category}</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span>{article.views || 0} views</span>
                                            <span>•</span>
                                            <span>{article.helpful || 0} helpful</span>
                                            <span>•</span>
                                            <span>{article.notHelpful || 0} not helpful</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleTogglePublish(article)}
                                        >
                                            {article.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </Button>
                                        <Link href={`/admin/help-center/${article.id}`}>
                                            <Button size="sm" variant="outline">
                                                <Edit className="size-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(article.id)}
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
