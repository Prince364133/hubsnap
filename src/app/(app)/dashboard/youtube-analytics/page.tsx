"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Youtube, AlertCircle } from "lucide-react";

export default function YouTubeAnalyticsPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="size-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                <Youtube className="size-10" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-text-primary">YouTube Analytics</h1>
                <p className="text-text-secondary max-w-md mx-auto mt-2">
                    YouTube integration is currently disabled. This feature will be available in a future update.
                </p>
            </div>

            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm border border-blue-200 flex items-center gap-2">
                <AlertCircle className="size-4" /> Feature coming soon
            </div>

            <Button size="lg" disabled className="bg-gray-300 text-gray-500 cursor-not-allowed">
                YouTube Integration Disabled
            </Button>
        </div>
    );
}
