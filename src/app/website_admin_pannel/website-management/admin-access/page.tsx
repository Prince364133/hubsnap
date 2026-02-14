"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";
import { Loader2, UserPlus, Trash2, ShieldCheck, Mail } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from "firebase/firestore";

export default function AdminAccessPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
    const [newEmail, setNewEmail] = useState("");

    useEffect(() => {
        const adminSettingsRef = doc(db, "settings", "admin-auth");
        const unsubscribe = onSnapshot(adminSettingsRef, (doc) => {
            if (doc.exists()) {
                setAllowedEmails(doc.data().allowedEmails || []);
            } else {
                // Initialize if doesn't exist
                setDoc(adminSettingsRef, { allowedEmails: [] });
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
            toast.success("Admin email added");
        } catch (error) {
            console.error("Error adding admin:", error);
            toast.error("Failed to add admin");
        }
        setSaving(false);
    };

    const handleRemoveEmail = async (email: string) => {
        if (!confirm(`Are you sure you want to remove ${email} from admin access?`)) return;

        setSaving(true);
        try {
            const adminSettingsRef = doc(db, "settings", "admin-auth");
            await updateDoc(adminSettingsRef, {
                allowedEmails: allowedEmails.filter(e => e !== email)
            });
            toast.success("Admin email removed");
        } catch (error) {
            console.error("Error removing admin:", error);
            toast.error("Failed to remove admin");
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
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Admin Access Control</h1>
                <p className="text-slate-500">Manage who can access the website admin panel</p>
            </div>

            <Card className="p-6 border-slate-200">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                        <ShieldCheck className="size-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Allowed Admin Emails</h2>
                        <p className="text-sm text-slate-500">Only users with these emails will have admin privileges</p>
                    </div>
                </div>

                <form onSubmit={handleAddEmail} className="flex gap-4 mb-8">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="email">New Admin Email</Label>
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
                    <div className="self-end">
                        <Button type="submit" disabled={saving} className="gap-2">
                            {saving ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                            Add Admin
                        </Button>
                    </div>
                </form>

                <div className="space-y-3">
                    <Label>Active Admin List</Label>
                    {allowedEmails.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-sm text-slate-400">No admins allowed yet. Add your first admin email above.</p>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {allowedEmails.map((email) => (
                                <div
                                    key={email}
                                    className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold uppercase">
                                            {email[0]}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{email}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveEmail(email)}
                                        disabled={saving}
                                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                <p><strong>Note:</strong> Changes take effect immediately. Existing logged-in users may need to refresh their page to see updated permissions.</p>
            </div>
        </div>
    );
}
