"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { dbService, UserProfile } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";
import { Loader2, User, MapPin, Briefcase, GraduationCap, Globe } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Partial<UserProfile>>({});

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const data = await dbService.getUserProfile(currentUser.uid);
                if (data) {
                    setProfile(data);
                } else {
                    setProfile({ name: currentUser.displayName || "", email: currentUser.email || "" });
                }
            } else {
                // Redirect to login if needed, or handled by middleware/layout
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        const success = await dbService.saveUserProfile(user.uid, profile);
        setSaving(false);
        if (success) {
            // Show toast or alert
            alert("Profile updated successfully!");
        } else {
            alert("Failed to update profile.");
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin size-8 text-primary" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold">Your Profile</h1>
                <p className="text-slate-500">Manage your personal information and preferences.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <Card className="p-6 border-slate-200 space-y-6">
                    <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                        <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center text-4xl">
                            {profile.name ? profile.name[0].toUpperCase() : <User className="size-8 text-slate-400" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">{profile.name || "User"}</h3>
                            <p className="text-sm text-slate-500">{profile.email}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <Input
                                    value={profile.name || ""}
                                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                                    className="pl-10"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Page Name / Handle</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <Input
                                    value={profile.pageName || ""}
                                    onChange={e => setProfile({ ...profile, pageName: e.target.value })}
                                    className="pl-10"
                                    placeholder="@username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Occupation</Label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <Input
                                    value={profile.occupation || ""}
                                    onChange={e => setProfile({ ...profile, occupation: e.target.value })}
                                    className="pl-10"
                                    placeholder="Content Creator"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Education</Label>
                            <div className="relative">
                                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <Input
                                    value={profile.education || ""}
                                    onChange={e => setProfile({ ...profile, education: e.target.value })}
                                    className="pl-10"
                                    placeholder="University / Self-taught"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <Input
                                    value={profile.location || ""}
                                    onChange={e => setProfile({ ...profile, location: e.target.value })}
                                    className="pl-10"
                                    placeholder="New York, USA"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Working Status</Label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={profile.workingStatus || ""}
                                onChange={e => setProfile({ ...profile, workingStatus: e.target.value })}
                            >
                                <option value="" disabled>Select status</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Student">Student</option>
                                <option value="Freelancer">Freelancer</option>
                            </select>
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end">
                    <Button size="lg" disabled={saving}>
                        {saving ? <Loader2 className="animate-spin mr-2" /> : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
