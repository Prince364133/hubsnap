"use client";

import { Card } from "@/components/ui/Card";
import { Users, DollarSign, Activity, FileText } from "lucide-react";

import { dbService } from "@/lib/firestore";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeSubs: 0,
        revenue: 0,
        contentGen: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const data = await dbService.getAdminStats();
            setStats(data);
            setLoading(false);
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Users</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                {loading ? "..." : stats.totalUsers}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Users className="size-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Revenue (MRR)</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                {loading ? "..." : `₹${stats.revenue.toLocaleString()}`}
                            </h3>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <DollarSign className="size-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active Subs</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                {loading ? "..." : stats.activeSubs}
                            </h3>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Activity className="size-6 text-purple-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Content Gen</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                {loading ? "..." : stats.contentGen}
                            </h3>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <FileText className="size-6 text-orange-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Activity Placeholder */}
            <Card className="border-slate-200 p-6">
                <h3 className="font-bold text-lg mb-4">Recent Signups</h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-slate-200" />
                                <div>
                                    <p className="font-medium text-sm">User #{1000 + i}</p>
                                    <p className="text-xs text-slate-500">user{i}@example.com</p>
                                </div>
                            </div>
                            <span className="text-xs text-slate-400">2 mins ago</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
