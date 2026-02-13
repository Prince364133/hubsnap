import { Card } from "@/components/ui/Card";
import { ArrowUp, ArrowDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    description?: string;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
    onClick?: () => void;
    loading?: boolean;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    description,
    color = 'blue',
    onClick,
    loading = false
}: StatCardProps) {

    const colorStyles = {
        blue: "text-blue-600 bg-blue-50",
        green: "text-green-600 bg-green-50",
        purple: "text-purple-600 bg-purple-50",
        orange: "text-orange-600 bg-orange-50",
        red: "text-red-600 bg-red-50",
    };

    return (
        <Card
            className={cn(
                "p-6 border-slate-200 shadow-sm transition-all duration-200",
                onClick && "cursor-pointer hover:shadow-md hover:border-blue-200"
            )}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">
                        {loading ? (
                            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
                        ) : value}
                    </h3>

                    {description && (
                        <p className="text-xs text-slate-500 mt-1">{description}</p>
                    )}

                    {(trend && trendValue) && !loading && (
                        <div className={cn(
                            "flex items-center gap-1 mt-2 text-xs font-medium",
                            trend === 'up' ? "text-green-600" :
                                trend === 'down' ? "text-red-600" : "text-slate-500"
                        )}>
                            {trend === 'up' && <ArrowUp className="size-3" />}
                            {trend === 'down' && <ArrowDown className="size-3" />}
                            {trend === 'neutral' && <Minus className="size-3" />}
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>

                <div className={cn("p-3 rounded-xl", colorStyles[color])}>
                    <Icon className="size-5" />
                </div>
            </div>
        </Card>
    );
}
