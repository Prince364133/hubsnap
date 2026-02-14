"use client";

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from 'sonner';
import {
    Users, TrendingUp, Award, Download, Search, Filter,
    Calendar, Mail, Phone, Briefcase, Target, DollarSign
} from 'lucide-react';

interface WaitlistEntry {
    id: string;
    name: string;
    email: string;
    phone?: string;
    currentRole: string;
    contentType: string[];
    platforms: string[];
    monthlyContentVolume: string;
    currentTools: string;
    painPoints: string[];
    interestedFeatures: string[];
    expectedUsage: string;
    budget: string;
    qualificationScore: number;
    status: 'pending' | 'approved' | 'rejected' | 'contacted';
    source: string;
    createdAt: string;
    notes?: string;
}

interface Analytics {
    total: number;
    byStatus: {
        pending: number;
        approved: number;
        rejected: number;
        contacted: number;
    };
    avgQualificationScore: number;
    topPainPoints: Record<string, number>;
    platformDistribution: Record<string, number>;
    budgetDistribution: Record<string, number>;
}

export default function WaitlistAdminPage() {
    const [entries, setEntries] = useState<WaitlistEntry[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchWaitlist();
    }, [statusFilter]);

    const fetchWaitlist = async () => {
        try {
            const url = statusFilter === 'all'
                ? '/api/waitlist'
                : `/api/waitlist?status=${statusFilter}`;

            const response = await fetch(url);
            const data = await response.json();

            setEntries(data.entries || []);
            setAnalytics(data.analytics || null);
        } catch (error) {
            console.error('Failed to fetch waitlist:', error);
            toast.error('Failed to load waitlist data');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const headers = [
            'Name', 'Email', 'Phone', 'Role', 'Content Types', 'Platforms',
            'Monthly Volume', 'Current Tools', 'Pain Points', 'Interested Features',
            'Expected Usage', 'Budget', 'Score', 'Status', 'Source', 'Created At'
        ];

        const rows = filteredEntries.map(entry => [
            entry.name,
            entry.email,
            entry.phone || '',
            entry.currentRole,
            entry.contentType.join('; '),
            entry.platforms.join('; '),
            entry.monthlyContentVolume,
            entry.currentTools,
            entry.painPoints.join('; '),
            entry.interestedFeatures.join('; '),
            entry.expectedUsage,
            entry.budget,
            entry.qualificationScore,
            entry.status,
            entry.source,
            entry.createdAt
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success('Waitlist exported successfully');
    };

    const filteredEntries = entries.filter(entry =>
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-green-600 bg-green-50';
        if (score >= 50) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
            contacted: 'bg-blue-100 text-blue-700'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading waitlist data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Creator OS Waitlist</h1>
                    <p className="text-slate-600 mt-1">Manage and analyze waitlist submissions</p>
                </div>
                <Button onClick={exportToCSV} className="gap-2">
                    <Download className="size-4" />
                    Export CSV
                </Button>
            </div>

            {/* Analytics Cards */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-600">Total Submissions</span>
                            <Users className="size-5 text-purple-500" />
                        </div>
                        <div className="text-3xl font-bold">{analytics.total}</div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-600">Avg Qualification Score</span>
                            <Award className="size-5 text-yellow-500" />
                        </div>
                        <div className="text-3xl font-bold">{analytics.avgQualificationScore}</div>
                        <div className="text-xs text-slate-500 mt-1">out of 100</div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-600">Pending Review</span>
                            <TrendingUp className="size-5 text-blue-500" />
                        </div>
                        <div className="text-3xl font-bold">{analytics.byStatus.pending}</div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-600">Approved</span>
                            <TrendingUp className="size-5 text-green-500" />
                        </div>
                        <div className="text-3xl font-bold">{analytics.byStatus.approved}</div>
                    </Card>
                </div>
            )}

            {/* Analytics Charts */}
            {analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Pain Points */}
                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4">Top Pain Points</h3>
                        <div className="space-y-3">
                            {Object.entries(analytics.topPainPoints)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 5)
                                .map(([pain, count]) => (
                                    <div key={pain} className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600 flex-1">{pain}</span>
                                        <span className="text-sm font-bold text-purple-600">{count}</span>
                                    </div>
                                ))}
                        </div>
                    </Card>

                    {/* Platform Distribution */}
                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4">Platform Distribution</h3>
                        <div className="space-y-3">
                            {Object.entries(analytics.platformDistribution)
                                .sort(([, a], [, b]) => b - a)
                                .map(([platform, count]) => (
                                    <div key={platform} className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">{platform}</span>
                                        <span className="text-sm font-bold text-blue-600">{count}</span>
                                    </div>
                                ))}
                        </div>
                    </Card>

                    {/* Budget Distribution */}
                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4">Budget Distribution</h3>
                        <div className="space-y-3">
                            {Object.entries(analytics.budgetDistribution)
                                .map(([budget, count]) => (
                                    <div key={budget} className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">{budget}</span>
                                        <span className="text-sm font-bold text-green-600">{count}</span>
                                    </div>
                                ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="contacted">Contacted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </Card>

            {/* Entries Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredEntries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{entry.name}</div>
                                        {entry.phone && (
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <Phone className="size-3" />
                                                {entry.phone}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600 flex items-center gap-1">
                                            <Mail className="size-3" />
                                            {entry.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600 flex items-center gap-1">
                                            <Briefcase className="size-3" />
                                            {entry.currentRole}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {entry.monthlyContentVolume} pieces/month
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(entry.qualificationScore)}`}>
                                            {entry.qualificationScore}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                                            {entry.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600 flex items-center gap-1">
                                            <Calendar className="size-3" />
                                            {new Date(entry.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            via {entry.source}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                // View details modal would go here
                                                toast.info('Details view coming soon');
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredEntries.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        No waitlist entries found
                    </div>
                )}
            </Card>
        </div>
    );
}
