import { Card } from "@/components/ui/Card";
import { TrendingUp, Users, Youtube, Instagram, Calendar } from "lucide-react";
import { ChannelStats } from "@/lib/firestore";

interface DashboardStatsProps {
    stats: ChannelStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 flex items-center gap-4 border-l-4 border-l-red-500">
                <div className="rounded-full bg-red-100 p-3 text-red-600">
                    <Youtube className="size-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-text-secondary">Youtube Channels</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.totalChannels}</p>
                </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 border-l-4 border-l-pink-500">
                <div className="rounded-full bg-pink-100 p-3 text-pink-600">
                    <Instagram className="size-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-text-secondary">Instagram Pages</p>
                    <p className="text-2xl font-bold text-text-primary">0</p>
                    {/* Note: In real logic, split totalChannels by platform if needed, or pass separate props */}
                </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 border-l-4 border-l-blue-500">
                <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                    <TrendingUp className="size-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-text-secondary">Content Generated</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.totalPosts.toLocaleString()}</p>
                </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 border-l-4 border-l-green-500">
                <div className="rounded-full bg-green-100 p-3 text-green-600">
                    <Calendar className="size-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-text-secondary">Working Days</p>
                    <p className="text-2xl font-bold text-text-primary">5 <span className="text-sm font-normal text-text-secondary">/wk</span></p>
                </div>
            </Card>
        </div>
    );
}
