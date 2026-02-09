"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { dbService } from "@/lib/firestore";
import { nanoid } from 'nanoid';

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [referralInput, setReferralInput] = useState("");
    const [error, setError] = useState("");

    const handleGoogleSignup = async () => {
        setLoading(true);
        setError("");

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user already exists
            const existingProfile = await dbService.getUserProfile(user.uid);
            if (existingProfile) {
                router.push("/dashboard/home");
                return;
            }

            // Generate Referral Code
            const referralCode = (user.displayName?.slice(0, 4) || "USER").toUpperCase() + nanoid(4).toUpperCase();

            // Create Profile in Firestore
            const profileData: any = {
                name: user.displayName || "User",
                email: user.email || "",
                plan: 'free',
                role: 'user',
                walletBalance: 0,
                referralCode: referralCode,
                createdAt: new Date().toISOString()
            };

            await dbService.saveUserProfile(user.uid, profileData);
            router.push("/dashboard/home");
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError("Sign-in popup was closed.");
            } else {
                setError("Failed to sign in with Google. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Validate & Find Referrer if code provided
            let referredByUid = null;
            if (referralInput.trim()) {
                const referrer = await dbService.getUserByReferralCode(referralInput.trim());
                if (referrer) {
                    referredByUid = referrer.id;
                    // Credit Referrer Wallet (₹50)
                    await dbService.updateWallet(referrer.id, 50, "Referral Bonus");
                }
            }

            // 2. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 3. Update Display Name
            await updateProfile(user, {
                displayName: name
            });

            // 4. Generate Referral Code (e.g., ALEX1234)
            const referralCode = name.slice(0, 4).toUpperCase() + nanoid(4).toUpperCase();

            // 5. Create Profile in Firestore
            const profileData: any = {
                name: name,
                email: email,
                plan: 'free',
                role: 'user',
                walletBalance: 0,
                referralCode: referralCode,
                createdAt: new Date().toISOString()
            };

            // Only add referredBy if it exists
            if (referredByUid) {
                profileData.referredBy = referredByUid;
            }

            await dbService.saveUserProfile(user.uid, profileData);

            router.push("/creator_os_dashboard/home");
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError("Email is already in use.");
            } else if (err.code === 'auth/weak-password') {
                setError("Password is too weak.");
            } else {
                setError("Failed to create account. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
                <p className="text-gray-500 dark:text-gray-400">Join the top 1% of creators today.</p>
            </div>

            {/* Google Sign-In */}
            <Button
                type="button"
                variant="outline"
                className="w-full py-6 text-base gap-3 border-2"
                onClick={handleGoogleSignup}
                disabled={loading}
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {loading ? <Loader2 className="animate-spin" /> : "Continue with Google"}
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="Alex"
                    />
                </div>

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

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    </div>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="••••••••"
                    />
                    <p className="text-xs text-gray-400">Must be at least 8 characters.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Referral Code (Optional)</label>
                    <input
                        value={referralInput}
                        onChange={(e) => setReferralInput(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all uppercase"
                        placeholder="e.g. ALEX1234"
                    />
                </div>

                {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

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
