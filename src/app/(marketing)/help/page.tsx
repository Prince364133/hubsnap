"use client";

import { useState, useEffect } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { dbService } from "@/lib/firestore";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Search, BookOpen, ThumbsUp, ThumbsDown } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function HelpCenterPage() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        const data = await dbService.getHelpArticles();
        setArticles(data.filter(a => a.published).sort((a, b) => (a.order || 0) - (b.order || 0)));
        setLoading(false);
    };

    const handleHelpful = async (articleId: string, type: 'helpful' | 'notHelpful') => {
        await dbService.incrementHelpfulCount(articleId, type);
        loadArticles();
    };

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.content?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ["all", "Getting Started", "Features", "Billing", "Technical"];

    return (
        <div className="min-h-screen bg-white">
            <PublicHeader />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Hero */}
                    <div className="text-center mb-12">
                        <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="size-8 text-primary" />
                        </div>
                        <h1 className="text-5xl font-black mb-4">
                            Help <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Center</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Find answers to common questions and learn how to get the most out of Creator OS
                        </p>
                    </div>

                    {/* Search */}
                    <div className="mb-8">
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                            <Input
                                placeholder="Search for help..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-14 text-lg"
                            />
                        </div>

                        {/* Category Tabs */}
                        <div className="flex gap-2 flex-wrap justify-center">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat
                                        ? "bg-primary text-white"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                        }`}
                                >
                                    {cat === "all" ? "All Articles" : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Articles */}
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                            <p className="mt-4 text-slate-500">Loading help articles...</p>
                        </div>
                    ) : filteredArticles.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-slate-500">No help articles found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredArticles.map(article => (
                                <Card key={article.id} className="overflow-hidden">
                                    <button
                                        onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                                        className="w-full p-6 text-left hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-lg">{article.title}</h3>
                                                    <Badge variant="outline" className="text-xs">{article.category}</Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <span>{article.views || 0} views</span>
                                                    <span>•</span>
                                                    <span>{article.helpful || 0} found helpful</span>
                                                </div>
                                            </div>
                                            <div className="text-slate-400">
                                                {expandedArticle === article.id ? "−" : "+"}
                                            </div>
                                        </div>
                                    </button>

                                    {expandedArticle === article.id && (
                                        <div className="px-6 pb-6 border-t">
                                            <div className="prose prose-slate max-w-none mt-6 mb-6">
                                                <ReactMarkdown>{article.content}</ReactMarkdown>
                                            </div>

                                            {/* Helpful Buttons */}
                                            <div className="flex items-center gap-4 pt-4 border-t">
                                                <span className="text-sm text-slate-600">Was this helpful?</span>
                                                <button
                                                    onClick={() => handleHelpful(article.id, 'helpful')}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-green-50 hover:border-green-300 transition-colors"
                                                >
                                                    <ThumbsUp className="size-4" />
                                                    <span className="text-sm">Yes ({article.helpful || 0})</span>
                                                </button>
                                                <button
                                                    onClick={() => handleHelpful(article.id, 'notHelpful')}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-red-50 hover:border-red-300 transition-colors"
                                                >
                                                    <ThumbsDown className="size-4" />
                                                    <span className="text-sm">No ({article.notHelpful || 0})</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Contact Support */}
                    <Card className="mt-12 p-8 text-center bg-gradient-to-br from-primary/5 to-blue-500/5">
                        <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
                        <p className="text-slate-600 mb-4">Can't find what you're looking for? Contact our support team.</p>
                        <a
                            href="mailto:support@hubsnap.com"
                            className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Contact Support
                        </a>
                    </Card>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
