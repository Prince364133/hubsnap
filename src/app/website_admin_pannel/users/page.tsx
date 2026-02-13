"use client";

import { useEffect, useState } from "react";
import { db, functions } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, startAfter, getDocs, QueryConstraint, DocumentSnapshot, writeBatch, doc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { UserProfile } from "@/lib/firestore";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
import UserDetailPanel from "@/components/admin/UserDetailPanel";
import BulkEditModal from "@/components/admin/BulkEditModal";
import EmailComposerModal from "@/components/admin/EmailComposerModal";
import { EmailHistoryModal } from "@/components/admin/EmailHistoryModal";
import ExportScheduleManager from "@/components/admin/ExportScheduleManager";
import { exportUsersToCSV } from "@/lib/csv-utils";
import { Search, Download, Upload, Trash2, Mail, CreditCard, ChevronDown, Calendar, DollarSign, Edit, Clock } from "lucide-react";

type UserStatus = 'all' | 'highly_active' | 'active' | 'at_risk' | 'inactive';
type SortOption = 'newest' | 'last_active' | 'most_active' | 'highest_value';

export default function AdminUsersPage() {
    const formatDate = (date: any) => {
        if (!date) return '-';
        if (typeof date?.toDate === 'function') {
            return date.toDate().toLocaleDateString();
        }
        try {
            return new Date(date).toLocaleDateString();
        } catch (e) {
            return '-';
        }
    };
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    // Bulk selection
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState<UserStatus>('all');
    const [planFilter, setPlanFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    // Advanced filters
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
    const [walletRange, setWalletRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Modals
    const [showBulkEditModal, setShowBulkEditModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showScheduleManager, setShowScheduleManager] = useState(false);
    const [showEmailHistory, setShowEmailHistory] = useState(false);

    // Pagination
    const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 25;

    useEffect(() => {
        fetchUsers();
    }, [statusFilter, planFilter, sortBy]);

    const fetchUsers = async (loadMore = false) => {
        setLoading(true);
        try {
            const constraints: QueryConstraint[] = [];

            if (statusFilter !== 'all') {
                constraints.push(where('status', '==', statusFilter));
            }

            if (planFilter !== 'all') {
                constraints.push(where('plan', '==', planFilter));
            }

            switch (sortBy) {
                case 'last_active':
                    constraints.push(orderBy('activitySummary.lastActive', 'desc'));
                    break;
                case 'most_active':
                    constraints.push(orderBy('activitySummary.engagementScore', 'desc'));
                    break;
                case 'highest_value':
                    constraints.push(orderBy('walletBalance', 'desc'));
                    break;
                case 'newest':
                default:
                    constraints.push(orderBy('createdAt', 'desc'));
                    break;
            }

            if (loadMore && lastDoc) {
                constraints.push(startAfter(lastDoc));
            }

            constraints.push(limit(pageSize));

            const usersQuery = query(collection(db, 'users'), ...constraints);
            const snapshot = await getDocs(usersQuery);

            const fetchedUsers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as UserProfile));

            if (loadMore) {
                setUsers(prev => [...prev, ...fetchedUsers]);
            } else {
                setUsers(fetchedUsers);
            }

            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === pageSize);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
        setLoading(false);
    };

    const filteredUsers = users.filter(user => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                user.name?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query) ||
                user.referralCode?.toLowerCase().includes(query);
            if (!matchesSearch) return false;
        }

        // Date range filter
        if (dateRange.start && user.createdAt) {
            const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
            if (userDate < new Date(dateRange.start)) return false;
        }
        if (dateRange.end && user.createdAt) {
            const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
            if (userDate > new Date(dateRange.end)) return false;
        }

        // Wallet range filter
        const wallet = user.walletBalance || 0;
        if (wallet < walletRange.min || wallet > walletRange.max) return false;

        return true;
    });

    // Bulk selection handlers
    const toggleUserSelection = (userId: string) => {
        const newSelection = new Set(selectedUsers);
        if (newSelection.has(userId)) {
            newSelection.delete(userId);
        } else {
            newSelection.add(userId);
        }
        setSelectedUsers(newSelection);
    };

    const toggleSelectAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredUsers.map(u => u.id!)));
        }
    };

    // Bulk actions
    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedUsers.size} users? This action cannot be undone.`)) return;

        setBulkActionLoading(true);
        try {
            const batch = writeBatch(db);
            selectedUsers.forEach(userId => {
                batch.delete(doc(db, 'users', userId));
            });
            await batch.commit();

            setUsers(prev => prev.filter(u => !selectedUsers.has(u.id!)));
            setSelectedUsers(new Set());
            alert('Users deleted successfully');
        } catch (error) {
            console.error('Error deleting users:', error);
            alert('Failed to delete users');
        }
        setBulkActionLoading(false);
    };

    const handleBulkExport = () => {
        const selectedUserData = users.filter(u => selectedUsers.has(u.id!));
        exportUsersToCSV(selectedUserData, `users-export-${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleExportAll = () => {
        exportUsersToCSV(filteredUsers, `all-users-${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleSendBulkEmail = async (subject: string, body: string) => {
        setBulkActionLoading(true);
        try {
            const selectedUserData = users.filter(u => selectedUsers.has(u.id!));
            const userIds = selectedUserData.map(u => u.id!);

            const sendBulkEmailFn = httpsCallable(functions, 'sendBulkEmail');
            await sendBulkEmailFn({ userIds, subject, body });

            alert('Emails queued successfully!');
            setShowEmailModal(false);
            setSelectedUsers(new Set());
        } catch (error) {
            console.error('Error sending emails:', error);
            alert('Failed to send emails');
        } finally {
            setBulkActionLoading(false);
        }
    };

    const getStatusBadge = (status?: string) => {
        const statusConfig = {
            highly_active: { label: 'Highly Active', color: 'bg-green-100 text-green-700' },
            active: { label: 'Active', color: 'bg-blue-100 text-blue-700' },
            at_risk: { label: 'At Risk', color: 'bg-orange-100 text-orange-700' },
            inactive: { label: 'Inactive', color: 'bg-slate-100 text-slate-600' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getPlanBadge = (plan?: string) => {
        const planConfig: Record<string, { label: string; color: string }> = {
            pro_plus: { label: 'Pro+', color: 'bg-indigo-100 text-indigo-700' },
            pro: { label: 'Pro', color: 'bg-violet-100 text-violet-700' },
            free: { label: 'Free', color: 'bg-slate-100 text-slate-600' }
        };

        const config = planConfig[plan || 'free'] || planConfig.free;
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">User Management & Intelligence</h1>
                <p className="text-slate-600 mt-1">
                    Advanced user analytics and behavioral insights
                </p>
            </div>

            <AdminStatsCards />

            {/* Filters and Actions */}
            <Card className="p-4 border-slate-200">
                <div className="space-y-4">
                    {/* Main filters row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <Input
                                    placeholder="Search by name, email, or referral code..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as UserStatus)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="highly_active">Highly Active</option>
                                <option value="active">Active</option>
                                <option value="at_risk">At Risk</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Plan Filter */}
                        <div>
                            <select
                                value={planFilter}
                                onChange={(e) => setPlanFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                            >
                                <option value="all">All Plans</option>
                                <option value="free">Free</option>
                                <option value="pro">Pro</option>
                                <option value="pro_plus">Pro+</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                            >
                                <option value="newest">Newest First</option>
                                <option value="last_active">Last Active</option>
                                <option value="most_active">Most Active</option>
                                <option value="highest_value">Highest Value</option>
                            </select>
                        </div>

                        {/* Advanced Filters Toggle */}
                        <div>
                            <Button
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                variant="outline"
                                className="w-full"
                            >
                                Advanced
                                <ChevronDown className={`size-4 ml-2 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                            {/* Date Range */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <Calendar className="size-4" />
                                    Joined Date Range
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="flex-1"
                                    />
                                    <span className="self-center text-slate-500">to</span>
                                    <Input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            {/* Wallet Balance Range */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <DollarSign className="size-4" />
                                    Wallet Balance: ₹{walletRange.min} - ₹{walletRange.max}
                                </label>
                                <div className="flex gap-4">
                                    <Input
                                        type="number"
                                        value={walletRange.min}
                                        onChange={(e) => setWalletRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                                        className="flex-1"
                                        placeholder="Min"
                                    />
                                    <Input
                                        type="number"
                                        value={walletRange.max}
                                        onChange={(e) => setWalletRange(prev => ({ ...prev, max: parseInt(e.target.value) || 10000 }))}
                                        className="flex-1"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bulk Actions */}
                    {selectedUsers.size > 0 && (
                        <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                            <span className="text-sm font-medium text-slate-700">
                                {selectedUsers.size} selected
                            </span>
                            <Button
                                onClick={handleBulkExport}
                                variant="outline"
                                size="sm"
                                disabled={bulkActionLoading}
                            >
                                <Download className="size-4 mr-2" />
                                Export Selected
                            </Button>
                            <Button
                                onClick={() => setShowBulkEditModal(true)}
                                variant="outline"
                                size="sm"
                                disabled={bulkActionLoading}
                            >
                                <Edit className="size-4 mr-2" />
                                Bulk Edit
                            </Button>
                            <Button
                                onClick={() => setShowEmailModal(true)}
                                variant="outline"
                                size="sm"
                                disabled={bulkActionLoading}
                            >
                                <Mail className="size-4 mr-2" />
                                Send Email
                            </Button>
                            <Button
                                onClick={handleBulkDelete}
                                variant="outline"
                                size="sm"
                                disabled={bulkActionLoading}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="size-4 mr-2" />
                                Delete Selected
                            </Button>
                            <Button
                                onClick={() => setSelectedUsers(new Set())}
                                variant="outline"
                                size="sm"
                            >
                                Clear Selection
                            </Button>
                        </div>
                    )}

                    {/* Export Actions */}
                    <div className="flex justify-between pt-2">
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setShowScheduleManager(true)}
                                variant="outline"
                                size="sm"
                            >
                                <Clock className="size-4 mr-2" />
                                Scheduled Exports
                            </Button>
                            <Button
                                onClick={() => setShowEmailHistory(true)}
                                variant="outline"
                                size="sm"
                            >
                                <Mail className="size-4 mr-2" />
                                Email History
                            </Button>
                        </div>
                        <Button
                            onClick={handleExportAll}
                            variant="outline"
                            size="sm"
                        >
                            <Download className="size-4 mr-2" />
                            Export All ({filteredUsers.length})
                        </Button>
                    </div>
                </div>

            </Card>

            {/* User Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded border-slate-300"
                                />
                            </th>
                            <th className="px-4 py-3 font-medium text-slate-600">User</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Plan</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Last Active</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Sessions (7d)</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Engagement</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Wallet</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Referral Code</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading && users.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                                    Loading users...
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-slate-50 cursor-pointer"
                                >
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.has(user.id!)}
                                            onChange={() => toggleUserSelection(user.id!)}
                                            className="rounded border-slate-300"
                                        />
                                    </td>
                                    <td className="px-4 py-3" onClick={() => setSelectedUser(user)}>
                                        <div>
                                            <div className="font-medium text-slate-900">{user.name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3" onClick={() => setSelectedUser(user)}>
                                        {getStatusBadge(user.status)}
                                    </td>
                                    <td className="px-4 py-3" onClick={() => setSelectedUser(user)}>
                                        {getPlanBadge(user.plan)}
                                    </td>


                                    <td className="px-4 py-3 text-slate-600" onClick={() => setSelectedUser(user)}>
                                        {formatDate(user.activitySummary?.lastActive) === '-' ? 'Never' : formatDate(user.activitySummary?.lastActive)}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600" onClick={() => setSelectedUser(user)}>
                                        {user.metrics?.sessionCount7d || 0}
                                    </td>
                                    <td className="px-4 py-3" onClick={() => setSelectedUser(user)}>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                                                <div
                                                    className="bg-indigo-600 h-2 rounded-full"
                                                    style={{ width: `${Math.min(100, (user.activitySummary?.engagementScore || 0) * 10)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-600">{user.activitySummary?.engagementScore || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600" onClick={() => setSelectedUser(user)}>
                                        ₹{user.walletBalance || 0}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600" onClick={() => setSelectedUser(user)}>
                                        {user.referralCode || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600" onClick={() => setSelectedUser(user)}>
                                        {formatDate(user.createdAt)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {hasMore && filteredUsers.length > 0 && (
                    <div className="flex items-center justify-center gap-4 p-4 border-t border-slate-200">
                        <p className="text-sm text-slate-600">
                            Showing {filteredUsers.length} users
                        </p>
                        <Button
                            onClick={() => fetchUsers(true)}
                            disabled={loading}
                            variant="outline"
                            size="sm"
                        >
                            {loading ? 'Loading...' : 'Load More'}
                            <ChevronDown className="size-4 ml-2" />
                        </Button>
                    </div>
                )}
            </div>

            {/* User Detail Panel */}
            {selectedUser && (
                <UserDetailPanel
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}

            {/* Bulk Edit Modal */}
            {showBulkEditModal && (
                <BulkEditModal
                    selectedUsers={users.filter(u => selectedUsers.has(u.id!))}
                    onClose={() => setShowBulkEditModal(false)}
                    onComplete={() => {
                        setShowBulkEditModal(false);
                        fetchUsers();
                    }}
                />
            )}

            {/* Email Composer Modal */}
            {showEmailModal && (
                <EmailComposerModal
                    selectedUsers={users.filter(u => selectedUsers.has(u.id!))}
                    onClose={() => setShowEmailModal(false)}
                    onSend={handleSendBulkEmail}
                />
            )}

            {/* Email History Modal */}
            {showEmailHistory && (
                <EmailHistoryModal
                    open={showEmailHistory}
                    onOpenChange={setShowEmailHistory}
                />
            )}

            {/* Export Schedule Manager */}
            {showScheduleManager && (
                <ExportScheduleManager
                    onClose={() => setShowScheduleManager(false)}
                />
            )}
        </div>
    );
}
