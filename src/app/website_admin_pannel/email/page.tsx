"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import {
    Mail,
    Send,
    AlertCircle,
    Inbox,
    Plus,
    RefreshCcw,
    CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, orderBy, limit, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function EmailDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        queued: 0,
        sentToday: 0,
        failedToday: 0,
        unreadReplies: 0
    });
    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // 1. Queue Count
            const queueSnap = await getCountFromServer(
                query(collection(db, 'email_queue'), where('status', '==', 'pending'))
            );

            // 2. Sent Today
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const sentSnap = await getCountFromServer(
                query(
                    collection(db, 'email_logs'),
                    where('status', '==', 'sent'),
                    where('timestamp', '>=', today)
                )
            );

            const failedSnap = await getCountFromServer(
                query(
                    collection(db, 'email_logs'),
                    where('status', '==', 'failed'),
                    where('timestamp', '>=', today)
                )
            );

            // 3. Unread Replies
            const inboxSnap = await getCountFromServer(
                query(collection(db, 'email_replies'), where('status', '==', 'unread'))
            );

            setStats({
                queued: queueSnap.data().count,
                sentToday: sentSnap.data().count,
                failedToday: failedSnap.data().count,
                unreadReplies: inboxSnap.data().count
            });

            // 4. Recent Logs
            const logsQuery = query(
                collection(db, 'email_logs'),
                orderBy('timestamp', 'desc'),
                limit(10)
            );
            const logsDocs = await getDocs(logsQuery);
            setRecentLogs(logsDocs.docs.map(d => ({ id: d.id, ...d.data() })));

        } catch (error) {
            console.error("Failed to fetch email stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="space-y-8 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Email System</h1>
                    <p className="text-sm text-slate-500">Manage campaigns, automations, and inbox.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchStats}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <RefreshCcw className={`size-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => router.push('/website_admin_pannel/email/campaigns/new')}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="size-4" />
                        New Campaign
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card
                    className="p-6 cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => router.push('/website_admin_pannel/email/queue')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Queued</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.queued}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <ClockIcon className="size-6" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Sent Today</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.sentToday}</h3>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg text-green-600">
                            <Send className="size-6" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Failed (24h)</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.failedToday}</h3>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg text-red-600">
                            <AlertCircle className="size-6" />
                        </div>
                    </div>
                </Card>

                <Card
                    className="p-6 cursor-pointer hover:border-purple-400 transition-colors"
                    onClick={() => router.push('/website_admin_pannel/email/inbox')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Inbox</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.unreadReplies}</h3>
                            <p className="text-xs text-slate-400">Unread replies</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                            <Inbox className="size-6" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-slate-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg">Recent Activity</h3>
                    <button className="text-sm text-blue-600 hover:underline">View Logs</button>
                </div>
                <div className="divide-y divide-slate-100">
                    {recentLogs.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No recent email activity</div>
                    ) : (
                        recentLogs.map((log) => (
                            <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${log.status === 'sent' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {log.status === 'sent' ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-slate-900">{log.subject}</p>
                                        <p className="text-xs text-slate-500">To: {log.to}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400">
                                    {log.timestamp?.toDate().toLocaleTimeString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}

function ClockIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
