"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Check your email for a password reset link.");
        } catch (err: any) {
            console.error(err);
            if (err.code === "auth/user-not-found") {
                setError("No user found with this email.");
            } else {
                setError("Failed to send reset email. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
                <p className="text-gray-500 dark:text-gray-400">Enter your email to receive recovery instructions.</p>
            </div>

            <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="you@example.com"
                    />
                </div>

                {message && <p className="text-sm text-green-600 font-medium">{message}</p>}
                {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

                <Button className="w-full py-6 text-base" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" /> : "Send Reset Link"}
                </Button>
            </form>

            <div className="text-center text-sm text-gray-500">
                <Link href="/login" className="text-primary hover:underline font-semibold flex items-center justify-center gap-2">
                    <ArrowLeft className="size-3" /> Back to Login
                </Link>
            </div>
        </div>
    );
}
