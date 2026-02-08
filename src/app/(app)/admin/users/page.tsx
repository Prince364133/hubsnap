"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { BadgeCheck, Loader2, MoreVertical, Search, Trash, Ban } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Mock Users for UI (Real User list requires Cloud Functions usually, or direct DB query)
const MOCK_USERS = [
    { id: "1", name: "Alex Hormozi", email: "alex@acquisition.com", role: "Pro", joined: "2 days ago", status: "Active" },
    { id: "2", name: "Marques Brownlee", email: "mkbhd@gmail.com", role: "Free", joined: "5 days ago", status: "Active" },
    { id: "3", name: "Spammer Bot", email: "bot@spam.com", role: "Free", joined: "1 hour ago", status: "Banned" },
];

export default function UserManagerPage() {
    const [users, setUsers] = useState(MOCK_USERS);
    const [search, setSearch] = useState("");

    const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        User Database
                    </h1>
                    <p className="text-slate-400">View and manage all registered content creators.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-red-500 outline-none w-64"
                    />
                </div>
            </div>

            <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-950 text-slate-200 uppercase font-bold text-xs">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filtered.map(user => (
                            <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="p-4 font-medium text-white flex items-center gap-2">
                                    <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">
                                        {user.name[0]}
                                    </div>
                                    {user.name}
                                </td>
                                <td className="p-4">{user.email}</td>
                                <td className="p-4">
                                    {user.role === "Pro" ? (
                                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold flex w-fit items-center gap-1">
                                            <BadgeCheck className="size-3" /> PRO
                                        </span>
                                    ) : "Free"}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${user.status === "Active" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                        }`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="size-8 text-slate-400 hover:text-white hover:bg-slate-700">
                                            <Ban className="size-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="size-8 text-red-400 hover:text-red-500 hover:bg-red-500/10">
                                            <Trash className="size-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
