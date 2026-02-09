"use client";

import { useEffect, useState } from "react";
import { dbService, UserProfile } from "@/lib/firestore";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            const data = await dbService.getAllUsers();
            setUsers(data);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-500">Viewing latest 50 users.</p>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 font-medium text-slate-500">User</th>
                            <th className="px-6 py-3 font-medium text-slate-500">Plan</th>
                            <th className="px-6 py-3 font-medium text-slate-500">Wallet</th>
                            <th className="px-6 py-3 font-medium text-slate-500">Referral Code</th>
                            <th className="px-6 py-3 font-medium text-slate-500">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    Loading users...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold uppercase">
                                                {user.name?.[0] || user.email?.[0] || "?"}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">{user.name || "Unknown"}</div>
                                                <div className="text-xs text-slate-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.plan === 'pro_plus' ? 'bg-purple-100 text-purple-700' :
                                            user.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                            {user.plan === 'pro_plus' ? 'Pro+' : user.plan?.toUpperCase() || 'FREE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-600">
                                        ₹{user.walletBalance || 0}
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">
                                            {user.referralCode || "-"}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {user.createdAt ? (typeof user.createdAt === 'string' ? new Date(user.createdAt).toLocaleDateString() : 'N/A') : 'N/A'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
