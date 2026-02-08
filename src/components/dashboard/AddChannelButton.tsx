"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddChannelButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = () => {
        setIsLoading(true);
        router.push("/dashboard/add-profile");
        // setIsLoading(false); // Navigation unmounts it anyway
    };

    return (
        <button
            onClick={handleAdd}
            disabled={isLoading}
            className="group flex h-full min-h-[200px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-50 p-6 transition-colors hover:border-primary hover:bg-surface-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
            <div className="mb-4 rounded-full bg-surface-200 p-4 transition-transform group-hover:scale-110">
                <Plus className="size-8 text-text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">Add New Profile</h3>
            <p className="text-sm text-text-secondary">Connect YouTube or Instagram</p>
        </button>
    );
}
