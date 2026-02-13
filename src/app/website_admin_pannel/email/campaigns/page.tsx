"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Plus, Search, Calendar, BarChart2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/Badge";

export default function CampaignsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const q = query(collection(db, 'email_campaigns'), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                setCampaigns(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (error) {
                console.error("Error fetching campaigns:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Email Campaigns</h1>
                    <p className="text-sm text-slate-500">Manage and send bulk emails.</p>
                </div>
                <Button onClick={() => router.push('/website_admin_pannel/email/campaigns/new')}>
                    <Plus className="size-4 mr-2" />
                    New Campaign
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200">
                <Search className="size-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search campaigns..."
                    className="flex-1 outline-none text-sm"
                />
            </div>

            {loading ? (
                <div className="text-center p-8 text-slate-500">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-xl">
                    <p className="text-slate-500 mb-4">No campaigns found</p>
                    <Button variant="outline" onClick={() => router.push('/website_admin_pannel/email/campaigns/new')}>
                        Create your first campaign
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {campaigns.map((campaign) => (
                        <Card key={campaign.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => router.push(`/website_admin_pannel/email/campaigns/${campaign.id}`)}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${campaign.status === 'completed' ? 'bg-green-100 text-green-600' :
                                    campaign.status === 'sending' ? 'bg-blue-100 text-blue-600' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                    <Mail className="size-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">{campaign.name}</h3>
                                    <p className="text-sm text-slate-500">{campaign.subject}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                        <Calendar className="size-3" />
                                        {campaign.scheduledAt ? new Date(campaign.scheduledAt.toDate()).toLocaleDateString() : 'Draft'}
                                    </div>
                                    <Badge variant={
                                        campaign.status === 'completed' ? 'default' :
                                            campaign.status === 'sending' ? 'secondary' : 'outline'
                                    }>
                                        {campaign.status}
                                    </Badge>
                                </div>
                                <div className="text-right w-24">
                                    <p className="text-xs text-slate-500">Sent</p>
                                    <p className="font-bold">{campaign.stats?.sent || 0}</p>
                                </div>
                                <div className="text-right w-24">
                                    <p className="text-xs text-slate-500">Opened</p>
                                    <p className="font-bold">{campaign.stats?.opened || 0}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
