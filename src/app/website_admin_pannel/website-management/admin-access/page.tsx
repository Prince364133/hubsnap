"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";
import { Loader2, UserPlus, Trash2, ShieldCheck, Mail, Lock, Eye, EyeOff, Key } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, setDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function AdminAccessPage() {
    const { updateAdminPassword } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newEmail, setNewEmail] = useState("");

    // Password Change State
    const [oldPasswordInput, setOldPasswordInput] = useState("");
    const [newPasswordInput, setNewPasswordInput] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const adminSettingsRef = doc(db, "settings", "admin-auth");
        const unsubscribe = onSnapshot(adminSettingsRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setAllowedEmails(data.allowedEmails || []);
                setCurrentPassword(data.adminPassword || "Prince364133");
            } else {
                // Initialize if doesn't exist
                setDoc(adminSettingsRef, {
                    allowedEmails: [],
                    adminPassword: "Prince364133"
                });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAddEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || !newEmail.includes("@")) {
            toast.error("Please enter a valid email");
            return;
        }

        if (allowedEmails.includes(newEmail.toLowerCase())) {
            toast.error("Email already in list");
            return;
        }

        setSaving(true);
        try {
            const adminSettingsRef = doc(db, "settings", "admin-auth");
            await updateDoc(adminSettingsRef, {
                allowedEmails: [...allowedEmails, newEmail.toLowerCase()]
            });
            setNewEmail("");
            toast.success("Recovery email added");
        } catch (error) {
            console.error("Error adding admin:", error);
            toast.error("Failed to add recovery email");
        }
        setSaving(false);
    };

    const handleRemoveEmail = async (email: string) => {
        if (!confirm(`Are you sure you want to remove ${email} from recovery access?`)) return;

        setSaving(true);
        try {
            const adminSettingsRef = doc(db, "settings", "admin-auth");
            await updateDoc(adminSettingsRef, {
                allowedEmails: allowedEmails.filter(e => e !== email)
            });
            toast.success("Recovery email removed");
        } catch (error) {
            console.error("Error removing admin:", error);
            toast.error("Failed to remove recovery email");
        }
        setSaving(false);
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPasswordInput.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }

        setSaving(true);
        try {
            await updateAdminPassword(oldPasswordInput, newPasswordInput);
            toast.success("Admin password updated successfully");
            setOldPasswordInput("");
            setNewPasswordInput("");
        } catch (error: any) {
            toast.error(error.message || "Failed to update password");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin size-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Admin Security Settings</h1>
                <p className="text-slate-500">Manage admin panel password and recovery options</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Password Management */}
                <div className="space-y-6">
                    <Card className="p-6 border-slate-200">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="p-2 bg-sky-50 rounded-lg text-sky-600">
                                <Lock className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Admin Password</h2>
                                <p className="text-xs text-slate-500">View and update the panel access password</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Current Password Display */}
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                                <Label className="text-xs uppercase text-slate-500 font-bold">Current Live Password</Label>
                                <div className="flex items-center justify-between">
                                    <code className="text-lg font-mono text-slate-700 font-bold tracking-widest">
                                        {showPassword ? currentPassword : "••••••••••••"}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="h-8 w-8 text-slate-400"
                                    >
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </Button>
                                </div>
                            </div>

                            <form onSubmit={handleUpdatePassword} className="space-y-4 pt-4 border-t border-slate-100">
                                <Label className="font-bold text-slate-900">Change Password</Label>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="oldPass" className="text-xs text-slate-500">Verify Old Password</Label>
                                        <Input
                                            id="oldPass"
                                            type="password"
                                            value={oldPasswordInput}
                                            onChange={(e) => setOldPasswordInput(e.target.value)}
                                            placeholder="Enter current password"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="newPass" className="text-xs text-slate-500">New Password</Label>
                                        <Input
                                            id="newPass"
                                            type="password"
                                            value={newPasswordInput}
                                            onChange={(e) => setNewPasswordInput(e.target.value)}
                                            placeholder="Min 6 characters"
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full gap-2 mt-2" disabled={saving}>
                                        {saving ? <Loader2 className="size-4 animate-spin" /> : <Key className="size-4" />}
                                        Update Admin Password
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>

                {/* Recovery Emails */}
                <div className="space-y-6">
                    <Card className="p-6 border-slate-200">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                <ShieldCheck className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Recovery Emails</h2>
                                <p className="text-xs text-slate-500">Authorized emails for password reset verification</p>
                            </div>
                        </div>

                        <form onSubmit={handleAddEmail} className="space-y-4 mb-8">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs text-slate-500">New Recovery Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="pl-10"
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={saving} className="w-full gap-2">
                                {saving ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                                Add Recovery Email
                            </Button>
                        </form>

                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-slate-900 uppercase">Authorized Recovery List</Label>
                            {allowedEmails.length === 0 ? (
                                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                                    No recovery emails added yet.
                                </div>
                            ) : (
                                <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-1">
                                    {allowedEmails.map((email) => (
                                        <div
                                            key={email}
                                            className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="shrink-0 size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold uppercase">
                                                    {email[0]}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 truncate">{email}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveEmail(email)}
                                                disabled={saving}
                                                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-amber-800">
                <ShieldCheck className="size-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="font-bold mb-1">Security Notice</p>
                    <p>Removing all recovery emails will make password recovery impossible if you lose access. Always keep at least one active recovery email.</p>
                </div>
            </div>
        </div>
    );
}
