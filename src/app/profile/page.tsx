"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { dbService, UserProfile } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "sonner";
import {
    Settings,
    LogOut,
    MapPin,
    Briefcase,
    GraduationCap,
    Globe,
    Wallet,
    Star,
    Bookmark,
    Calendar,
    User
} from "lucide-react";

export default function ProfilePage() {
    const { user, profile, loading, logout } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<UserProfile>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
        if (profile) {
            setFormData({
                name: profile.name,
                education: profile.education,
                occupation: profile.occupation,
                location: profile.location,
                pageName: profile.pageName,
                workingStatus: profile.workingStatus,
                bio: (profile as any).bio || "",
            });
        }
    }, [user, loading, profile, router]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        const success = await dbService.saveUserProfile(user.uid, formData);
        if (success) {
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } else {
            toast.error("Failed to save profile");
        }
        setSaving(false);
    };

    if (loading || !profile) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/')}
                            className="w-fit mb-2 pl-0 hover:bg-transparent text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
                        >
                            <User className="size-4" /> Back to Home
                        </Button>
                        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                    </div>
                    <Button variant="ghost" onClick={logout} className="text-red-500 hover:text-red-600 hover:bg-red-50 font-medium">
                        <LogOut className="size-4 mr-2" />
                        Log Out
                    </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Left Sidebar - Status Card */}
                    <div className="space-y-6">
                        <Card className="p-6 border-slate-200">
                            <div className="text-center mb-6">
                                <div className="size-20 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 mx-auto flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-lg">
                                    {profile.name?.[0]?.toUpperCase() || "U"}
                                </div>
                                <h2 className="font-bold text-xl">{profile.name}</h2>
                                <p className="text-slate-500 text-sm">{profile.email}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Current Plan</div>
                                    <div className="flex items-center justify-between">
                                        <span className={`font-bold text-lg capitalize ${profile.plan === 'free' ? 'text-slate-700' : 'text-primary'}`}>
                                            {profile.plan?.replace('_', ' ') || "Free"}
                                        </span>
                                        {profile.plan === 'free' ? (
                                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => router.push('/pricing')}>
                                                Upgrade
                                            </Button>
                                        ) : (
                                            <div className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                Active
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Wallet Balance</div>
                                    <div className="flex items-center gap-2">
                                        <Wallet className="size-4 text-slate-400" />
                                        <span className="font-bold text-lg">₹{profile.walletBalance || 0}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">From referrals & rewards</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 border-slate-200">
                            <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-slate-400">Account Activity</h4>
                            <div className="space-y-4 font-medium">
                                <button
                                    className="w-full flex items-center justify-between text-slate-600 hover:text-primary transition-colors"
                                    onClick={() => router.push('/creator_os_dashboard/saved?filter=rated')}
                                >
                                    <span className="flex items-center gap-2">
                                        <Star className="size-4" /> Rated Ideas
                                    </span>
                                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">View All</span>
                                </button>
                                <button
                                    className="w-full flex items-center justify-between text-slate-600 hover:text-primary transition-colors"
                                    onClick={() => router.push('/creator_os_dashboard/saved')}
                                >
                                    <span className="flex items-center gap-2">
                                        <Bookmark className="size-4" /> Saved Items
                                    </span>
                                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">View</span>
                                </button>
                            </div>
                        </Card>
                    </div>

                    {/* Right Content - Edit Form */}
                    <div className="md:col-span-2">
                        <Card className="p-6 border-slate-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Settings className="size-5 text-slate-400" />
                                    Personal Details
                                </h3>
                                {!isEditing ? (
                                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                                        <Button size="sm" onClick={handleSave} disabled={saving}>
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            disabled={!isEditing}
                                            value={formData.name || ""}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Page Name / Brand</Label>
                                        <Input
                                            disabled={!isEditing}
                                            value={formData.pageName || ""}
                                            onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
                                            placeholder="@johndoe"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Education</Label>
                                        <div className="relative">
                                            <GraduationCap className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                            <Input
                                                className="pl-9"
                                                disabled={!isEditing}
                                                value={formData.education || ""}
                                                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                                placeholder="University / Degree"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Occupation</Label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                            <Input
                                                className="pl-9"
                                                disabled={!isEditing}
                                                value={formData.occupation || ""}
                                                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                                                placeholder="Content Creator"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Location (City)</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                            <Input
                                                className="pl-9"
                                                disabled={!isEditing}
                                                value={formData.location || ""}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="Mumbai, India"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Working Status</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                disabled={!isEditing}
                                                value={formData.workingStatus || ""}
                                                onChange={(e) => setFormData({ ...formData, workingStatus: e.target.value })}
                                            >
                                                <option value="">Select Status</option>
                                                <option value="Full-time">Full-time</option>
                                                <option value="Student">Student</option>
                                                <option value="Freelancer">Freelancer</option>
                                                <option value="Part-time">Part-time</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Bio / About Me</Label>
                                    <Textarea
                                        disabled={!isEditing}
                                        value={formData.bio || ""}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Tell us a bit about your journey..."
                                        rows={4}
                                    />
                                </div>

                                {profile.referralCode && (
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mt-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-blue-900">Refer & Earn</h4>
                                                <p className="text-sm text-blue-700">Share your code to earn ₹50 per referral</p>
                                            </div>
                                            <div className="bg-white px-4 py-2 rounded-lg font-mono font-bold text-blue-600 border border-blue-200">
                                                {profile.referralCode}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
