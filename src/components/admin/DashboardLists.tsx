"use client";

import { Card } from "@/components/ui/Card";
import { UserProfile } from "@/lib/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from "next/navigation";

interface RecentSignupsProps {
    users: UserProfile[];
}

export function RecentSignupsList({ users }: RecentSignupsProps) {
    const router = useRouter();

    if (!users || users.length === 0) {
        return <div className="text-sm text-slate-500 p-4">No recent signups</div>;
    }

    return (
        <div className="space-y-4">
            {users.map((user) => (
                <div
                    key={user.id}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => router.push(`/website_admin_pannel/users?search=${user.email}`)}
                >
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium text-slate-900">{user.name || 'User'}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                            {user.plan || 'Free'}
                        </Badge>
                        <p className="text-[10px] text-slate-400 mt-1">
                            {user.createdAt ? formatDistanceToNow(
                                typeof user.createdAt.toDate === 'function'
                                    ? user.createdAt.toDate()
                                    : new Date(user.createdAt.seconds * 1000),
                                { addSuffix: true }
                            ) : 'Just now'}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

interface AtRiskUsersProps {
    users: UserProfile[];
}

export function AtRiskUsersList({ users }: AtRiskUsersProps) {
    const router = useRouter();

    if (!users || users.length === 0) {
        return <div className="text-sm text-slate-500 p-4">No users at risk! Great job.</div>;
    }

    return (
        <div className="space-y-4">
            {users.map((user) => (
                <div
                    key={user.id}
                    className="flex items-center justify-between p-2 hover:bg-red-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-red-100"
                    onClick={() => router.push(`/website_admin_pannel/users?status=at_risk`)}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <div>
                            <p className="text-sm font-medium text-slate-900">{user.name || user.email}</p>
                            <p className="text-xs text-slate-500">
                                Last seen: {user.activitySummary?.lastActive ? formatDistanceToNow(user.activitySummary.lastActive.toDate(), { addSuffix: true }) : 'Never'}
                            </p>
                        </div>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                        {user.plan === 'pro' ? 'Pro Risk' : 'Risk'}
                    </Badge>
                </div>
            ))}
        </div>
    );
}
