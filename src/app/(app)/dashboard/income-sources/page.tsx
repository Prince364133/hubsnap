"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { DollarSign, ExternalLink } from "lucide-react";
import Link from "next/link"; // Add import
import { cn } from "@/lib/utils"; // Assuming cn utility is available

const INCOME_STREAMS = [
    { id: "amazon-associates", name: "Amazon Associates", time: "1-2 Months", risk: "Low", difficulty: "Easy" },
    { id: "youtube-adsense", name: "YouTube AdSense", time: "6-12 Months", risk: "Medium", difficulty: "Hard" },
    { id: "brand-sponsorships", name: "Brand Sponsorships", time: "6+ Months", risk: "High", difficulty: "Hard" },
    // { name: "Digital Products", time: "3-6 Months", risk: "Medium", link: "#" }, // Placeholder for now
];

export default function IncomeSourcesPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-text-primary">Income Sources</h1>
                <p className="text-text-secondary">Track your wins and unlock new revenue streams.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Tracker Section */}
                <div className="space-y-6">


                    <Card className="p-6">
                        <h3 className="font-semibold mb-4">Earnings History</h3>
                        <div className="text-center py-8 text-text-secondary text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            No earnings logged yet. <br /> Start executing daily missions!
                        </div>
                    </Card>
                </div>

                {/* Opportunities Section */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Available Streams</h3>
                    {INCOME_STREAMS.map((stream) => (
                        <Link href={`/dashboard/income-sources/${stream.id}`} key={stream.id}>
                            <Card className="p-4 flex items-center justify-between hover:border-primary cursor-pointer transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                                        <DollarSign className="size-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium group-hover:text-primary transition-colors">{stream.name}</h4>
                                        <div className="flex gap-2 text-xs text-text-secondary mt-1">
                                            <span>⏱ {stream.time}</span>
                                            <span>•</span>
                                            <span className={cn(
                                                stream.risk === "Low" ? "text-green-600" :
                                                    stream.risk === "Medium" ? "text-yellow-600" : "text-amber-600"
                                            )}>Risk: {stream.risk}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ExternalLink className="size-4 text-gray-400" />
                                </Button>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
