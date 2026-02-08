"use client";

import { AddProfileWizard } from "@/components/dashboard/AddProfileWizard";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddProfilePage() {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
                <ArrowLeft className="size-4" /> Back to Dashboard
            </button>

            <AddProfileWizard />
        </div>
    );
}
