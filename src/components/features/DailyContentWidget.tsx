import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { generateDailyContentAction } from "@/app/actions";
import { DailyContent } from "@/lib/ai-types";
import { dbService } from "@/lib/firestore";
import { toast } from "sonner";
import { Loader2, Play, FileText, CheckCircle, Check, Music, Video, Image as ImageIcon, Mic, RefreshCw, Bookmark, Clock, ArrowRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyContentWidgetProps {
    userNiche: string;
}

type Tab = "new" | "saved" | "history";

export function DailyContentWidget({ userNiche }: DailyContentWidgetProps) {
    const [activeTab, setActiveTab] = useState<Tab>("new");
    const [loading, setLoading] = useState(false);

    // Data
    const [ideas, setIdeas] = useState<DailyContent[]>([]);
    const [selectedIdea, setSelectedIdea] = useState<DailyContent | null>(null);
    const [savedContent, setSavedContent] = useState<DailyContent[]>([]);
    const [history, setHistory] = useState<DailyContent[]>([]);

    const [error, setError] = useState<string | null>(null);

    // Initial Load
    useEffect(() => {
        if (userNiche) {
            handleGenerateNewIdeas();
            // TODO: Load saved/history from DB
        }
    }, [userNiche]);

    const handleGenerateNewIdeas = async () => {
        setLoading(true);
        try {
            // Generate 3 ideas concurrently for speed (mock is instant anyway)
            // In real prod, might want a specific "generateIdeas" endpoint, but generic content gen works for now if we just take topics
            const newIdeas = await Promise.all([
                generateDailyContentAction(userNiche + " Trend 1"),
                generateDailyContentAction(userNiche + " Tip"),
                generateDailyContentAction(userNiche + " Secret")
            ]);
            setIdeas(newIdeas);
            setSelectedIdea(null);
        } catch (e) {
            console.error(e);
            setError("Failed to generate ideas.");
        }
        setLoading(false);
    };

    const handleAction = async (action: "complete" | "save", content: DailyContent) => {
        // In real app, save to Firestore here
        if (action === "save") {
            setSavedContent(prev => [...prev, content]);
            setIdeas(prev => prev.filter(i => i.id !== content.id));
            toast.success("Content Saved for Later!");
        } else {
            setHistory(prev => [...prev, content]);
            setIdeas(prev => prev.filter(i => i.id !== content.id));
            await dbService.logEarnings("demo_user", 10, "Posted: " + content.topic);
            toast.success("Content Marked Complete! +$10 Earnings");
        }
        setSelectedIdea(null);
    };

    const LinkButton = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded bg-surface-50 hover:bg-surface-100 border transition-colors text-sm text-text-secondary">
            <Icon className="size-4" />
            <span>{label}</span>
            <ArrowRight className="size-3 ml-auto opacity-50" />
        </a>
    );

    if (loading && ideas.length === 0) {
        return <div className="p-12 text-center"><Loader2 className="size-8 animate-spin mx-auto text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            {/* Tabs & Stats */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {(["new", "saved", "history"] as Tab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors",
                                activeTab === tab ? "bg-primary text-white" : "bg-surface-100 text-text-secondary hover:bg-surface-200"
                            )}
                        >
                            {tab}
                            {tab === "saved" && savedContent.length > 0 && <span className="ml-2 bg-white/20 px-1.5 rounded text-xs">{savedContent.length}</span>}
                        </button>
                    ))}
                </div>
                <div className="text-right text-sm text-text-secondary">
                    <p>Generated: <span className="font-bold text-primary">{history.length + savedContent.length + ideas.length}</span></p>
                </div>
            </div>

            {/* List View */}
            {!selectedIdea && (
                <div className="grid gap-4 animate-in fade-in">
                    {activeTab === "new" && (
                        <>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg">Today's Top Ideas</h3>
                                <Button size="sm" variant="outline" onClick={handleGenerateNewIdeas} disabled={loading}>
                                    <RefreshCw className={cn("size-4 mr-2", loading && "animate-spin")} /> Refresh
                                </Button>
                            </div>
                            {ideas.map(idea => (
                                <Card key={idea.id} className="p-5 flex justify-between items-center group cursor-pointer hover:border-primary transition-all" onClick={() => {
                                    setSelectedIdea(idea);
                                    // Trigger Replacement Logic: Fetch 3 new ideas in background to keep the pipeline full
                                    // In a real app, we'd debounce this or check if queue is low.
                                    handleGenerateNewIdeas();
                                }}>
                                    <div>
                                        <h4 className="font-bold text-lg">{idea.topic}</h4>
                                        <p className="text-text-secondary text-sm line-clamp-1">{idea.script.hook}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100">{idea.monetization.type}</span>
                                            {idea.seo?.keywords?.slice(0, 2).map(k => (
                                                <span key={k} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">#{k}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <Button size="sm">Create <ArrowRight className="ml-1 size-4" /></Button>
                                </Card>
                            ))}
                        </>
                    )}

                    {activeTab === "saved" && savedContent.map(idea => (
                        <Card key={idea.id} className="p-4 flex justify-between items-center" onClick={() => setSelectedIdea(idea)}>
                            <span className="font-bold">{idea.topic}</span>
                            <Button size="sm" variant="secondary">Resume</Button>
                        </Card>
                    ))}
                    {activeTab === "saved" && savedContent.length === 0 && <p className="text-center py-10 text-text-secondary">No saved content.</p>}

                    {activeTab === "history" && history.map(idea => (
                        <Card key={idea.id} className="p-4 flex justify-between items-center opacity-75">
                            <span className="line-through text-gray-500">{idea.topic}</span>
                            <span className="text-xs text-green-600 font-bold flex items-center"><Check className="size-3 mr-1" /> Posted</span>
                        </Card>
                    ))}
                    {activeTab === "history" && history.length === 0 && <p className="text-center py-10 text-text-secondary">No history yet.</p>}
                </div>
            )}

            {/* Detail View (Content Pack) */}
            {selectedIdea && (
                <div className="animate-in slide-in-from-right space-y-6">
                    <Button variant="ghost" onClick={() => setSelectedIdea(null)} className="pl-0 hover:pl-2 transition-all">
                        ← Back to List
                    </Button>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Left Col: Script & SEO */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="p-6 border-l-4 border-l-primary">
                                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    <FileText className="text-primary" /> Video Script
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-surface-50 p-4 rounded-lg border">
                                        <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Hook (0-3s)</span>
                                        <p className="text-lg font-medium mt-1">{selectedIdea.script.hook}</p>
                                    </div>
                                    <div className="p-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Body</span>
                                        <p className="whitespace-pre-line mt-1">{selectedIdea.script.body}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                        <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Call to Action</span>
                                        <p className="font-medium mt-1 text-green-800">{selectedIdea.script.cta}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="font-bold text-lg mb-4">SEO & Metadata</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                                        <div className="font-medium bg-gray-50 p-2 rounded border mt-1">{selectedIdea.seo?.title || selectedIdea.topic}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Description / Caption</label>
                                        <div className="text-sm bg-gray-50 p-2 rounded border mt-1 max-h-32 overflow-y-auto">{selectedIdea.seo?.description}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Hashtags</label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {selectedIdea.seo?.hashtags?.map(tag => (
                                                <span key={tag} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Right Col: Tools & SOP */}
                        <div className="space-y-6">
                            <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Video className="text-yellow-400" /> Production Tools
                                </h3>
                                <div className="space-y-3">
                                    <LinkButton href={selectedIdea.tools?.voiceover} icon={Mic} label="Generate Voiceover" />
                                    <LinkButton href={selectedIdea.tools?.imageGen} icon={ImageIcon} label="Create Thumbnails/AI" />
                                    <LinkButton href={selectedIdea.tools?.stockVideo} icon={Video} label="Find Stock Footage" />
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-700">
                                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-gray-300">
                                        <Music className="size-4" /> Background Music
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedIdea.tools?.music?.map((link, i) => (
                                            <a key={i} href={link} target="_blank" className="block text-xs text-blue-300 hover:text-blue-200 truncate underline">
                                                {new URL(link).hostname}
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {selectedIdea.research && (
                                    <div className="mt-6 pt-4 border-t border-gray-700">
                                        <h4 className="font-bold text-sm mb-3 text-gray-300">Search Keywords (Copy)</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedIdea.research.stockTerms?.map((term: string, i: number) => (
                                                <button key={i} onClick={() => navigator.clipboard.writeText(term)} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white">
                                                    {term}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>

                            <Card className="p-6">
                                <h3 className="font-bold text-lg mb-4">Filming SOP</h3>
                                <ul className="space-y-3">
                                    {selectedIdea.sop.shots.map((shot, i) => (
                                        <li key={i} className="text-sm flex gap-3">
                                            <span className="flex-shrink-0 size-6 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs">{i + 1}</span>
                                            <span className="text-gray-600">{shot}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button variant="outline" className="w-full mt-4" onClick={() => toast.success("SOP Downloaded (Mock)")}>
                                    <Download className="size-4 mr-2" /> Download SOP
                                </Button>
                            </Card>

                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="w-full" onClick={() => handleAction("save", selectedIdea)}>
                                    <Bookmark className="size-4 mr-2" /> Save
                                </Button>
                                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleAction("complete", selectedIdea)}>
                                    <CheckCircle className="size-4 mr-2" /> Posted
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
