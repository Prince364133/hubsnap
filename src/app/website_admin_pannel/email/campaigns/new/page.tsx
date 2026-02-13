"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

export default function NewCampaignPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        subject: "",
        segment: "all_users",
        content: "<h1>Hello {{name}},</h1><p>Write your content here...</p>"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/campaigns/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create campaign');
            }

            toast.success(`Campaign created! ${result.usersQueued} emails queued.`);
            router.push('/website_admin_pannel/email/campaigns');
        } catch (error: any) {
            console.error("Failed to create campaign:", error);
            toast.error(error.message || "Failed to create campaign");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">New Campaign</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Campaign Name (Internal)</Label>
                            <Input
                                placeholder="e.g. February Newsletter"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Target Segment</Label>
                            <Select
                                value={formData.segment}
                                onValueChange={(v) => setFormData({ ...formData, segment: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select segment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all_users">All Users</SelectItem>
                                    <SelectItem value="pro_users">Pro Users Only</SelectItem>
                                    <SelectItem value="free_users">Free Users Only</SelectItem>
                                    <SelectItem value="inactive_30d">Inactive (30 days)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Email Subject</Label>
                        <Input
                            placeholder="Enter a catchy subject line"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Email Content (HTML)</Label>
                        <p className="text-xs text-slate-500 mb-2">Supported variables: {'{{name}}'}, {'{{email}}'}</p>
                        <textarea
                            className="w-full h-64 p-4 rounded-md border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            required
                        />
                    </div>
                </Card>

                <div className="flex items-center justify-end gap-4">
                    <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <><Loader2 className="animate-spin size-4 mr-2" /> Creating...</>
                        ) : (
                            <><Send className="size-4 mr-2" /> Create & Queue</>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
