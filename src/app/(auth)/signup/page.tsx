"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate Auth
        setTimeout(() => {
            setLoading(false);
            router.push("/dashboard/home"); // Go to dashboard home after signup
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
                <p className="text-gray-500 dark:text-gray-400">Join the top 1% of creators today.</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input
                            required
                            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="Alex"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Channel</label>
                        <input
                            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="@handle"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input
                        type="email"
                        required
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="you@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <input
                        type="password"
                        required
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="••••••••"
                    />
                    <p className="text-xs text-gray-400">Must be at least 8 characters.</p>
                </div>

                <Button className="w-full py-6 text-base" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" /> : "Get Started Free"}
                </Button>
            </form>

            <div className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-semibold">
                    Sign in
                </Link>
            </div>
        </div>
    );
}
