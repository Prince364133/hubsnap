"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { dbService } from "@/lib/firestore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader2, Bookmark, ExternalLink, Trash2, Search, Filter, Star, Sparkles, LayoutGrid, Heart, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

function SavedItemsContent() {
    const searchParams = useSearchParams();
    const initialFilter = searchParams.get("filter") || "all";

    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState(initialFilter);

    useEffect(() => {
        if (initialFilter) {
            setActiveFilter(initialFilter);
        }
    }, [initialFilter]);

    useEffect(() => {
        if (user) {
            loadItems(user.uid);
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const loadItems = async (userId: string) => {
        setLoading(true);
        const [savedData, usedBlogs] = await Promise.all([
            dbService.getSavedItems(userId),
            dbService.getUsedBlogs(userId)
        ]);

        const blogMap = new Map<string, any>();
        const otherItems: any[] = [];

        // 1. Process Saved Data
        savedData.forEach((item: any) => {
            if (item.type === 'blog') {
                const blogId = item.data.id;
                blogMap.set(blogId, {
                    ...item,
                    sortDate: item.savedAt, // Keep original savedAt
                    interactions: { saved: true, liked: false, commented: false }
                });
            } else {
                otherItems.push({ ...item, sortDate: item.savedAt });
            }
        });

        // 2. Merge Liked Blogs
        usedBlogs.liked.forEach((blog) => {
            if (blogMap.has(blog.id)) {
                const existing = blogMap.get(blog.id);
                existing.interactions.liked = true;
                // Keep the 'saved' type preference, or update if primarily looking for interaction?
                // existing.type is already 'blog' (saved)
            } else {
                blogMap.set(blog.id, {
                    id: `liked_${blog.id}`,
                    userId,
                    type: 'blog_interaction', // New type for non-saved interactions
                    data: blog,
                    sortDate: blog.createdAt,
                    interactions: { saved: false, liked: true, commented: false }
                });
            }
        });

        // 3. Merge Commented Blogs
        usedBlogs.commented.forEach((blog) => {
            if (blogMap.has(blog.id)) {
                const existing = blogMap.get(blog.id);
                existing.interactions.commented = true;
            } else {
                blogMap.set(blog.id, {
                    id: `commented_${blog.id}`,
                    userId,
                    type: 'blog_interaction',
                    data: blog,
                    sortDate: blog.createdAt,
                    interactions: { saved: false, liked: false, commented: true }
                });
            }
        });

        const mergedBlogs = Array.from(blogMap.values());
        const allItems = [...otherItems, ...mergedBlogs];

        // Sort by newest first
        const sortedData = allItems.sort((a: any, b: any) => {
            const dateA = a.sortDate?.toDate?.() || new Date(0);
            const dateB = b.sortDate?.toDate?.() || new Date(0);
            return dateB - dateA;
        });
        setItems(sortedData);
        setLoading(false);
    };

    const handleRemove = async (itemId: string) => {
        if (!user) return;
        const success = await dbService.deleteSavedItem(user.uid, itemId);
        if (success) {
            setItems(prev => prev.filter(i => i.id !== itemId));
        }
    };

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch =
                (item.data?.name || item.data?.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.data?.shortDesc || item.data?.content || "").toLowerCase().includes(searchQuery.toLowerCase());

            const matchesFilter =
                activeFilter === "all" ||
                (activeFilter === "tools" && item.type === "tool") ||
                (activeFilter === "ideas" && item.type === "guide") ||
                (activeFilter === "rated" && item.type === "rated_guide") ||
                (activeFilter === "blogs" && (item.interactions?.saved || item.type === 'blog')) ||
                (activeFilter === "liked" && item.interactions?.liked) ||
                (activeFilter === "commented" && item.interactions?.commented);

            return matchesSearch && matchesFilter;
        });
    }, [items, searchQuery, activeFilter]);

    if (loading || authLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="animate-spin size-10 text-primary mb-4" />
                <p className="text-slate-500 font-medium">Loading your collection...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <Bookmark className="size-8 text-primary fill-primary/10" />
                        Saved Items
                    </h1>
                    <p className="text-slate-500 font-medium">Manage your curated vault of tools and business insights.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="Search your vault..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 bg-white border-slate-200 shadow-sm focus:ring-primary/20"
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
                {[
                    { id: "all", label: "All Items", icon: LayoutGrid },
                    { id: "tools", label: "AI Tools", icon: Sparkles },
                    { id: "ideas", label: "Business Ideas", icon: Star },
                    { id: "rated", label: "Your Ratings", icon: Filter },
                    { id: "blogs", label: "Saved Blogs", icon: Bookmark },
                    { id: "liked", label: "Liked Blogs", icon: Heart },
                    { id: "commented", label: "Commented", icon: MessageCircle },
                ].map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border",
                            activeFilter === filter.id
                                ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        )}
                    >
                        <filter.icon className="size-4" />
                        {filter.label}
                    </button>
                ))}
            </div>

            {filteredItems.length === 0 ? (
                <Card className="p-16 text-center border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50">
                    <div className="size-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                        {searchQuery ? (
                            <Search className="size-10 text-slate-300" />
                        ) : (
                            <Bookmark className="size-10 text-slate-300" />
                        )}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        {searchQuery ? "No matches found" : "Your vault is empty"}
                    </h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                        {searchQuery
                            ? `We couldn't find anything matching "${searchQuery}" in your current view.`
                            : "Start exploring AI tools and digital business ideas to build your personal creator toolkit."}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/creator_os_dashboard/explore">
                            <Button className="h-12 px-8 rounded-xl font-bold gap-2">
                                <Sparkles className="size-4" /> Explore Tools
                            </Button>
                        </Link>
                        <Link href="/digital-business-ideas">
                            <Button variant="outline" className="h-12 px-8 rounded-xl font-bold">
                                Browse Ideas
                            </Button>
                        </Link>
                    </div>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    {filteredItems.map((item) => (
                        <Card key={item.id} className="group relative flex flex-col p-0 overflow-hidden border-slate-200 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full">
                            {/* Remove Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemove(item.id)}
                                className="absolute top-3 right-3 z-10 size-8 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="size-4" />
                            </Button>

                            <div className="p-6 flex flex-col h-full bg-gradient-to-b from-transparent to-white/50">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            {(item.type === 'blog' || item.type === 'blog_interaction') ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {item.interactions?.saved && (
                                                        <Badge variant="secondary" className="h-6 px-2 text-[10px] font-black uppercase tracking-widest rounded-md border bg-pink-50 text-pink-700 border-pink-100">
                                                            Saved
                                                        </Badge>
                                                    )}
                                                    {item.interactions?.liked && (
                                                        <Badge variant="secondary" className="h-6 px-2 text-[10px] font-black uppercase tracking-widest rounded-md border bg-red-50 text-red-700 border-red-100">
                                                            Liked
                                                        </Badge>
                                                    )}
                                                    {item.interactions?.commented && (
                                                        <Badge variant="secondary" className="h-6 px-2 text-[10px] font-black uppercase tracking-widest rounded-md border bg-blue-50 text-blue-700 border-blue-100">
                                                            Commented
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "h-6 px-2 text-[10px] font-black uppercase tracking-widest rounded-md border",
                                                        item.type === 'tool' ? "bg-sky-50 text-sky-700 border-sky-100" :
                                                            item.type === 'guide' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                                "bg-purple-50 text-purple-700 border-purple-100"
                                                    )}
                                                >
                                                    {item.type === 'tool' ? 'AI Tool' :
                                                        item.type === 'guide' ? 'Business Idea' :
                                                            'Rated Idea'}
                                                </Badge>
                                            )}
                                            {item.type === 'rated_guide' && (
                                                <div className="flex items-center gap-1 bg-yellow-400/10 px-1.5 py-0.5 rounded text-amber-500">
                                                    <Star className="size-3 fill-amber-400" />
                                                    <span className="text-[10px] font-black">{item.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-black text-xl text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                                            {item.data?.name || item.data?.title}
                                        </h3>
                                    </div>
                                </div>

                                <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-1 line-clamp-3 font-medium">
                                    {item.data?.shortDesc || item.data?.excerpt || item.data?.content?.replace(/<[^>]*>?/gm, '').slice(0, 150) || "No description available."}
                                    {(item.data?.content || item.data?.shortDesc) && (item.data.content || item.data.shortDesc).length > 150 && "..."}
                                </p>

                                <div className="pt-6 border-t border-slate-100 mt-auto">
                                    {item.type === 'tool' ? (
                                        <Link href={item.data?.website || '#'} target="_blank" className="block">
                                            <Button variant="default" className="w-full h-11 rounded-xl font-bold bg-slate-900 hover:bg-black gap-2 group-hover:scale-[1.02] transition-transform">
                                                Visit Tool <ExternalLink className="size-4" />
                                            </Button>
                                        </Link>
                                    ) : (item.type === 'blog' || item.type === 'blog_interaction') ? (
                                        <Link href={`/blog/${item.data?.slug}`} className="block">
                                            <Button variant="outline" className="w-full h-11 rounded-xl font-bold border-2 hover:bg-slate-50 gap-2 group-hover:scale-[1.02] transition-transform">
                                                Read Article <ExternalLink className="size-4" />
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link href={`/digital-business-ideas/${item.data?.id || item.data?.id}`} className="block">
                                            <Button variant="outline" className="w-full h-11 rounded-xl font-bold border-2 hover:bg-slate-50 gap-2 group-hover:scale-[1.02] transition-transform">
                                                Launch Guide <ExternalLink className="size-4" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SavedItemsPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="animate-spin size-10 text-primary mb-4" />
                <p className="text-slate-500 font-medium">Initializing your vault...</p>
            </div>
        }>
            <SavedItemsContent />
        </Suspense>
    );
}
