"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Copy, Trash, ExternalLink, FileText, TrendingUp, Tag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { dbService } from "@/lib/firestore";

interface SavedItem {
    id: string;
    type: string;
    title: string;
    notes?: string;
    tags: string[];
    date?: string; // We might need to format timestamp
    savedAt?: any;
    originalData?: any;
}

export default function SavedPage() {
    const [items, setItems] = useState<SavedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        async function load() {
            const data = await dbService.getSavedItems("demo_user");
            // Normalize data
            const formatted = data.map((item: any) => ({
                id: item.id,
                type: item.type || "idea",
                title: item.title || "Untitled",
                notes: item.notes || "",
                tags: item.tags || [],
                date: item.savedAt ? new Date(item.savedAt.seconds * 1000).toLocaleDateString() : "Just now"
            }));
            setItems(formatted);
            setLoading(false);
        }
        load();
    }, []);

    const handleDelete = (id: string) => {
        // In real app: await dbService.deleteItem(id)
        setItems(prev => prev.filter(i => i.id !== id));
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="size-8 animate-spin text-primary" /></div>;

    const filteredItems = filter === "all" ? items : items.filter(i => i.type === filter);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Idea Vault</h1>
                    <p className="text-text-secondary">Your personal library of inspiration.</p>
                </div>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    {["all", "trend", "script", "idea"].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={cn("px-3 py-1 text-sm font-medium rounded-md capitalize transition-colors",
                                filter === type ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                    <Card key={item.id} className="p-5 flex flex-col group">
                        <div className="flex justify-between items-start mb-3">
                            <div className={cn("size-8 rounded-lg flex items-center justify-center",
                                item.type === "trend" ? "bg-blue-100 text-blue-600" :
                                    item.type === "script" ? "bg-purple-100 text-purple-600" : "bg-orange-100 text-orange-600"
                            )}>
                                {item.type === "trend" && <TrendingUp className="size-4" />}
                                {item.type === "script" && <FileText className="size-4" />}
                                {item.type === "idea" && <Tag className="size-4" />}
                            </div>
                            <span className="text-xs text-gray-400">{item.date}</span>
                        </div>

                        <h3 className="font-bold text-gray-900 mb-2 truncate" title={item.title}>{item.title}</h3>
                        <p className="text-sm text-text-secondary mb-4 line-clamp-2 min-h-[40px]">{item.notes}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {item.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded border border-gray-200">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        <div className="mt-auto flex gap-2 pt-4 border-t border-gray-100 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="flex-1 h-8">
                                Open
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                                <Trash className="size-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
