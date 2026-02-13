"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dbService, UserProfile } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    User, MapPin, Briefcase, GraduationCap, Globe, Wallet, Star, Bookmark,
    Info, Rocket, Settings2, Shield, Bell, CreditCard, LogOut, Loader2,
    Crown, Zap, Award, Edit3, LayoutDashboard
} from "lucide-react";

// --- Components for Tabs ---

const OverviewTab = ({ profile, stats }: { profile: Partial<UserProfile>, stats: any }) => {
    // Gamification Logic
    const xp = (stats.savedCount * 10) + (stats.ratedCount * 50) + (profile.walletBalance ? profile.walletBalance / 10 : 0);
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const nextLevelXp = 100 * Math.pow(level, 2);
    const progress = Math.min(100, Math.round((xp / nextLevelXp) * 100));

    return (
        <div className="space-y-6">
            {/* Gamification Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                        <div className="size-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border-4 border-white/30">
                            <Crown className="size-12 text-yellow-300 fill-yellow-300" />
                        </div>
                        <Badge className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 border-2 border-white px-2 py-0.5 text-xs font-black">
                            LVL {level}
                        </Badge>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h2 className="text-3xl font-black tracking-tight">{profile.name || "Creator"}'s Journey</h2>
                        <div className="flex items-center gap-2 justify-center md:justify-start text-indigo-100 font-medium">
                            <Zap className="size-4" /> {Math.floor(xp)} XP Total
                        </div>
                        <div className="w-full max-w-md bg-black/20 rounded-full h-3 mt-4 overflow-hidden backdrop-blur-sm mx-auto md:mx-0">
                            <div className="bg-yellow-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-xs text-indigo-200 mt-1">{Math.floor(nextLevelXp - xp)} XP to Level {level + 1}</p>
                    </div>
                    <div className="hidden md:block text-right">
                        <div className="text-4xl font-black text-white">{stats.savedCount}</div>
                        <div className="text-indigo-200 text-sm font-medium uppercase tracking-wider">Saved Items</div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Wallet", value: `$${profile.walletBalance || 0}`, icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Ratings", value: stats.ratedCount, icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Plan", value: profile.plan === 'pro' ? 'PRO' : 'FREE', icon: Rocket, color: "text-purple-500", bg: "bg-purple-50" },
                    { label: "Role", value: profile.occupation || "Creator", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-50" },
                ].map((stat, i) => (
                    <Card key={i} className="p-4 flex flex-col items-center justify-center text-center gap-2 hover:shadow-lg transition-all cursor-default group">
                        <div className={cn("size-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                            <stat.icon className="size-5" />
                        </div>
                        <div>
                            <div className="text-xl font-black text-slate-800">{stat.value}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Bio & Details */}
            <Card className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <User className="size-5 text-slate-400" /> About Me
                    </h3>
                </div>
                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 leading-relaxed italic">
                        "{profile.bio || "No bio added yet. Go to Edit Profile to tell your story."}"
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-slate-600">
                        <Globe className="size-4 text-primary" />
                        <span className="font-medium">@{profile.pageName || "username"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                        <MapPin className="size-4 text-primary" />
                        <span className="font-medium">{profile.location || "Earth"}</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const EditProfileTab = ({ profile, setProfile, handleSave, saving }: any) => {
    return (
        <form onSubmit={handleSave} className="space-y-8">
            <Card className="p-8 space-y-6">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                    <p className="text-sm text-slate-500">Update your public identity.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input value={profile.name || ""} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Your Name" />
                    </div>
                    <div className="space-y-2">
                        <Label>Page Name (Handle)</Label>
                        <Input value={profile.pageName || ""} onChange={e => setProfile({ ...profile, pageName: e.target.value })} placeholder="@username" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label>Bio</Label>
                        <Textarea
                            value={profile.bio || ""}
                            onChange={e => setProfile({ ...profile, bio: e.target.value })}
                            className="h-32 resize-none"
                            placeholder="Tell us about yourself..."
                        />
                    </div>
                </div>
            </Card>

            <Card className="p-8 space-y-6">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900">Professional Details</h3>
                    <p className="text-sm text-slate-500">Help us tailor the experience for you.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Occupation</Label>
                        <Input value={profile.occupation || ""} onChange={e => setProfile({ ...profile, occupation: e.target.value })} placeholder="e.g. YouTuber" />
                    </div>
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input value={profile.location || ""} onChange={e => setProfile({ ...profile, location: e.target.value })} placeholder="City, Country" />
                    </div>
                    <div className="space-y-2">
                        <Label>Education</Label>
                        <Input value={profile.education || ""} onChange={e => setProfile({ ...profile, education: e.target.value })} placeholder="e.g. University" />
                    </div>
                    <div className="space-y-2">
                        <Label>Working Status</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={profile.workingStatus || ""}
                            onChange={e => setProfile({ ...profile, workingStatus: e.target.value })}
                        >
                            <option value="" disabled>Select status</option>
                            <option value="Full-time">Full-time Creator</option>
                            <option value="Part-time">Part-time / Side Hustle</option>
                            <option value="Student">Student</option>
                            <option value="Freelancer">Freelancer</option>
                        </select>
                    </div>
                </div>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={saving} className="w-full md:w-auto min-w-[200px]">
                    {saving ? <><Loader2 className="animate-spin mr-2" /> Saving...</> : "Save Changes"}
                </Button>
            </div>
        </form>
    );
};

const SettingsTab = () => (
    <div className="space-y-6">
        <Card className="p-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Account Preferences</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <Bell className="size-5 text-slate-500" />
                        <div>
                            <p className="font-bold text-slate-700">Email Notifications</p>
                            <p className="text-xs text-slate-500">Receive updates about new features.</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-white">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <Shield className="size-5 text-slate-500" />
                        <div>
                            <p className="font-bold text-slate-700">Privacy Mode</p>
                            <p className="text-xs text-slate-500">Hide your earning stats from public view.</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Active</Badge>
                </div>
            </div>
        </Card>
        <div className="flex justify-center">
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                <LogOut className="size-4 mr-2" /> Sign Out from All Devices
            </Button>
        </div>
    </div>
);

const BillingTab = ({ profile }: { profile: Partial<UserProfile> }) => (
    <div className="space-y-6">
        <Card className="p-8 border-l-4 border-l-primary">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Current Plan</h3>
                    <p className="text-slate-500">You are currently on the <span className="font-bold text-primary capitalize">{profile.plan || 'Free'}</span> plan.</p>
                </div>
                <Badge className="bg-primary text-white text-lg px-4 py-1">{profile.plan?.toUpperCase() || 'FREE'}</Badge>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 font-bold uppercase">Next Billing Date</p>
                    <p className="text-lg font-bold text-slate-900">--</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 font-bold uppercase">Payment Method</p>
                    <p className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <CreditCard className="size-4" /> **** 4242
                    </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 font-bold uppercase">Billing History</p>
                    <p className="text-lg font-bold text-slate-900 underline cursor-pointer text-primary">View Invoices</p>
                </div>
            </div>

            <div className="mt-8 flex gap-4">
                <Button className="flex-1">Upgrade Plan</Button>
                <Button variant="outline" className="flex-1">Cancel Subscription</Button>
            </div>
        </Card>
    </div>
);


export default function AdvancedProfilePage() {
    const { user, profile: authProfile, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<Partial<UserProfile>>({});
    const [stats, setStats] = useState({ savedCount: 0, ratedCount: 0 });
    const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'settings' | 'billing'>('overview');

    useEffect(() => {
        if (authProfile) {
            setProfile(authProfile);
            loadExtraData(authProfile.id || "");
            setLoading(false);
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [authProfile, authLoading]);

    const loadExtraData = async (userId: string) => {
        const savedItems = await dbService.getSavedItems(userId);
        setStats({
            savedCount: savedItems.filter(i => i.type !== 'rated_guide').length,
            ratedCount: savedItems.filter(i => i.type === 'rated_guide').length
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        const success = await dbService.saveUserProfile(user.uid, profile);
        setSaving(false);
        if (success) {
            toast.success("Profile updated successfully!");
        } else {
            toast.error("Failed to update profile.");
        }
    };

    if (loading) return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="size-10 text-primary animate-spin" /></div>;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-32">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">My Profile</h1>
                    <p className="text-slate-500">Manage your creator identity and preferences.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
                {[
                    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                    { id: 'edit', label: 'Edit Profile', icon: Edit3 },
                    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
                    { id: 'settings', label: 'Settings', icon: Settings2 },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold text-sm transition-all relative top-[1px]",
                            activeTab === tab.id
                                ? "bg-white text-primary border-t border-x border-slate-200 z-10"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        )}
                    >
                        <tab.icon className="size-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && <OverviewTab profile={profile} stats={stats} />}
                {activeTab === 'edit' && <EditProfileTab profile={profile} setProfile={setProfile} handleSave={handleSave} saving={saving} />}
                {activeTab === 'settings' && <SettingsTab />}
                {activeTab === 'billing' && <BillingTab profile={profile} />}
            </div>
        </div>
    );
}
