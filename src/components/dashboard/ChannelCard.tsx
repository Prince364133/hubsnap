import { Card } from "@/components/ui/Card";
import { Youtube, Instagram, ArrowRight, Activity, Calendar } from "lucide-react";
import { Channel } from "@/lib/firestore";
import Link from "next/link";

interface ChannelCardProps {
    channel: Channel;
}

export function ChannelCard({ channel }: ChannelCardProps) {
    const isYoutube = channel.platform === 'youtube';
    const Icon = isYoutube ? Youtube : Instagram;
    const iconColor = isYoutube ? "text-red-600" : "text-pink-600";
    const borderColor = isYoutube ? "border-l-red-500" : "border-l-pink-500";
    const metricLabel = isYoutube ? "Subscribers" : "Followers";

    return (
        <Card className={`group relative overflow-hidden p-6 transition-all hover:shadow-md border-l-4 ${borderColor}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className={`rounded-xl bg-surface-100 p-3 ${iconColor} bg-opacity-10`}>
                        <Icon className={`size-6 ${iconColor}`} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary text-lg">{channel.name}</h3>
                        <p className="text-sm text-text-secondary">{channel.handle}</p>
                    </div>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-medium ${isYoutube ? 'bg-red-50 text-red-600' : 'bg-pink-50 text-pink-600'}`}>
                    {channel.platform === 'youtube' ? 'YouTube' : 'Instagram'}
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-text-secondary">{metricLabel}</p>
                    <p className="text-xl font-bold text-text-primary">{channel.stats.followers.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm text-text-secondary">Posts/Ads</p>
                    <p className="text-xl font-bold text-text-primary">{channel.stats.posts.toLocaleString()}</p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Calendar className="size-3" />
                    <span>{channel.schedule.workingDays.length} days/week</span>
                </div>
                <Link href={`/dashboard/channel/${channel.id}`} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    Manage <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>
        </Card>
    );
}
