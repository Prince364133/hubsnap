"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { dbService, Channel } from "@/lib/firestore";
import { Loader2, ArrowLeft, Youtube, Instagram, Calendar, Activity, Zap, Settings, Trash2, Link as LinkIcon, Lock, CheckCircle, Save, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DailyContentWidget } from "@/components/features/DailyContentWidget";
import { Button } from "@/components/ui/Button";

// Simple Modal Component
function Modal({ isOpen, onClose, title, children }: any) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose}><X className="size-6 text-gray-400 hover:text-gray-600" /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default function ChannelDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [channel, setChannel] = useState<Channel | null>(null);
    const [loading, setLoading] = useState(true);

    // UI States
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Edit States
    const [editName, setEditName] = useState("");
    const [editFreq, setEditFreq] = useState(3);

    useEffect(() => {
        loadChannel();
    }, [params.id]);

    async function loadChannel() {
        if (params.id) {
            const data = await dbService.getChannel("demo_user", params.id as string);
            setChannel(data);
            if (data) {
                setEditName(data.name);
                setEditFreq(data.schedule?.frequency || 3);
            }
        }
        setLoading(false);
    }

    const handleConnect = async () => {
        if (!channel) return;
        setIsConnecting(true);
        // Simulate API Connection
        setTimeout(async () => {
            await dbService.updateChannel("demo_user", channel.id, {
                connected: true,
                ytStats: {
                    subscribers: Math.floor(Math.random() * 10000),
                    totalViews: Math.floor(Math.random() * 500000),
                    recentVideos: [
                        { title: "Review of " + channel.details?.niche?.[0], views: 1200 },
                        { title: "How to start " + channel.details?.topics?.[0], views: 800 },
                        { title: "My Journey", views: 3000 }
                    ],
                    monetized: Math.random() > 0.5
                }
            });
            await loadChannel(); // Refresh
            setIsConnecting(false);
        }, 2000);
    };

    const handleSaveSettings = async () => {
        if (!channel) return;
        await dbService.updateChannel("demo_user", channel.id, {
            name: editName,
            schedule: { ...channel.schedule, frequency: editFreq }
        });
        setIsSettingsOpen(false);
        loadChannel();
    };

    const handleDelete = async () => {
        if (!channel) return;
        if (confirm("Are you sure? This is PERMANENT and cannot be undone.")) {
            await dbService.deleteChannel("demo_user", channel.id);
            router.push("/dashboard/home");
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;
    }

    if (!channel) return <div className="p-8 text-center text-red-500">Channel Not Found</div>;

    const isYoutube = channel.platform === 'youtube';
    const Icon = isYoutube ? Youtube : Instagram;
    const colorClass = isYoutube ? "text-red-600" : "text-pink-600";
    const bgClass = isYoutube ? "bg-red-50" : "bg-pink-50";

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-surface-100 transition-colors">
                        <ArrowLeft className="size-6 text-text-secondary" />
                    </button>
                    <div className={`rounded-xl p-3 ${bgClass} ${colorClass} bg-opacity-20`}>
                        <Icon className="size-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">{channel.name}</h1>
                        <p className="text-text-secondary flex items-center gap-2">
                            {channel.handle}
                            {channel.connected && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="size-3" /> Linked</span>}
                        </p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="size-4 mr-2" /> Settings
                </Button>
            </div>

            {/* Detailed Stats Grid - Locked/Unlocked State */}
            {!channel.connected ? (
                <div className="bg-gradient-to-r from-gray-50 to-white border border-dashed rounded-2xl p-10 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                        <Lock className="size-8 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Connect {isYoutube ? "YouTube Studio" : "Instagram Insights"}</h2>
                        <p className="text-text-secondary max-w-md mx-auto">Unlock real-time analytics, subscriber growth, and view counts directly from your platform.</p>
                    </div>
                    <Button onClick={handleConnect} disabled={isConnecting} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                        {isConnecting ? <Loader2 className="animate-spin mr-2" /> : <LinkIcon className="mr-2 size-4" />}
                        {isConnecting ? "Connecting..." : "Connect Account"}
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in">
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="size-5 text-primary" />
                            <h3 className="font-medium text-text-secondary">Subscribers</h3>
                        </div>
                        <p className="text-3xl font-bold text-text-primary">{channel.ytStats?.subscribers.toLocaleString()}</p>
                        <p className="text-sm text-text-secondary">Real-time Count</p>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Zap className="size-5 text-yellow-500" />
                            <h3 className="font-medium text-text-secondary">Tot. Views</h3>
                        </div>
                        <p className="text-3xl font-bold text-text-primary">{channel.ytStats?.totalViews.toLocaleString()}</p>
                        <p className="text-sm text-text-secondary">Lifetime Views</p>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="size-5 text-green-500" />
                            <h3 className="font-medium text-text-secondary">Monetization</h3>
                        </div>
                        <p className="text-3xl font-bold text-text-primary">{channel.ytStats?.monetized ? "Active" : "Eligible"}</p>
                        <p className="text-sm text-text-secondary">{channel.ytStats?.monetized ? "Earning Revenue" : "Not yet enabled"}</p>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-surface-100 to-white">
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="size-5 text-purple-500" />
                            <h3 className="font-medium text-text-secondary">Latest Video</h3>
                        </div>
                        <p className="text-sm font-bold text-text-primary line-clamp-2">
                            {channel.ytStats?.recentVideos[0]?.title || "No videos"}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">{channel.ytStats?.recentVideos[0]?.views} views</p>
                    </Card>
                </div>
            )}

            {/* Settings Modal */}
            <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Channel Settings">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Channel Name</label>
                        <input className="w-full border rounded-lg p-3" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Target Frequency (per week)</label>
                        <select className="w-full border rounded-lg p-3" value={editFreq} onChange={(e) => setEditFreq(Number(e.target.value))}>
                            <option value={1}>1 Video / Week</option>
                            <option value={3}>3 Videos / Week</option>
                            <option value={5}>5 Videos / Week</option>
                            <option value={7}>Daily</option>
                        </select>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <Button onClick={handleSaveSettings} className="w-full"><Save className="size-4 mr-2" /> Save Changes</Button>
                    </div>
                    <div className="border-t pt-4">
                        <Button variant="ghost" onClick={handleDelete} className="w-full text-red-600 hover:bg-red-50 hover:text-red-700">
                            <Trash2 className="size-4 mr-2" /> Permanently Delete Channel
                        </Button>
                        <p className="text-xs text-center text-red-400 mt-2">Warning: This cannot be undone.</p>
                    </div>
                </div>
            </Modal>

            {/* Content Generation Section */}
            <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-text-primary">Generate Content</h2>
                    <span className="text-sm text-text-secondary">AI-Powered</span>
                </div>
                {/* Reusing existing widget but ideally customized for this channel */}
                <DailyContentWidget userNiche={channel.name + " (" + channel.platform + ")"} />
            </div>
        </div>
    );
}
