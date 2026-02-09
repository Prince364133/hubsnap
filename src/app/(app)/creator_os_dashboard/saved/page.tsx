"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { dbService } from "@/lib/firestore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader2, Bookmark, ExternalLink, Trash2 } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function SavedItemsPage() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                loadItems(currentUser.uid);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const loadItems = async (userId: string) => {
        const data = await dbService.getSavedItems(userId);
        // data structure from dbService.getSavedItems returns user saved items collection docs
        // each doc has { id, ...itemData, savedAt }
        setItems(data);
        setLoading(false);
    };

    const handleRemove = async (itemId: string) => {
        if (!user) return;
        const success = await dbService.deleteSavedItem(user.uid, itemId);
        if (success) {
            setItems(prev => prev.filter(i => i.id !== itemId));
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin size-8 text-primary" /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold">Saved Items</h1>
                <p className="text-slate-500">Your collection of tools and business ideas.</p>
            </div>

            {items.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 border-slate-200 shadow-none">
                    <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bookmark className="size-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold">No saved items yet</h3>
                    <p className="text-slate-500 mb-6">Explore tools and ideas to add them here.</p>
                    <div className="flex justify-center gap-4">
                        <Link href="/explore">
                            <Button variant="outline">Explore Tools</Button>
                        </Link>
                        <Link href="/digital-business-ideas">
                            <Button variant="outline">Browse Ideas</Button>
                        </Link>
                    </div>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <Card key={item.id} className="p-6 border-slate-200 relative group flex flex-col h-full">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemove(item.id)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove from saved"
                            >
                                <Trash2 className="size-4" />
                            </Button>

                            <div className="mb-4 pr-8">
                                <Badge variant="secondary" className="mb-2">
                                    {item.type === 'tool' ? 'AI Tool' : 'Business Idea'}
                                </Badge>
                                <h3 className="font-bold text-lg line-clamp-1">{item.data?.name || item.data?.title}</h3>
                            </div>

                            <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-1">
                                {item.data?.shortDesc || item.data?.content || "No description."}
                            </p>

                            {item.type === 'tool' ? (
                                <Link href={item.data?.website || '#'} target="_blank" className="w-full mt-auto">
                                    <Button variant="outline" size="sm" className="w-full gap-2">
                                        Visit Website <ExternalLink className="size-3" />
                                    </Button>
                                </Link>
                            ) : (
                                <Link href={`/digital-business-ideas/${item.data?.id}`} className="w-full mt-auto">
                                    <Button size="sm" className="w-full">View Details</Button>
                                </Link>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
