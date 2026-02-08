"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate Auth - Replace with Real Firebase Auth later
        setTimeout(() => {
            setLoading(false);
            router.push("/dashboard/home");
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
                <p className="text-gray-500 dark:text-gray-400">Enter your credentials to access your dashboard.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
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
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                    </div>
                    <input
                        type="password"
                        required
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <Button className="w-full py-6 text-base" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" /> : "Sign In"}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-50 dark:bg-slate-900 px-2 text-gray-500">Or continue with</span>
                </div>
            </div>

            <Button variant="outline" className="w-full gap-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                <svg className="size-4" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                Google
            </Button>

            <div className="text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline font-semibold">
                    Sign up
                </Link>
            </div>
        </div>
    );
}
