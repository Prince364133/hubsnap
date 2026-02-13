"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';
import { Lock, Mail, Shield } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Sign in with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Verify admin role
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();

            if (userData?.role !== 'admin') {
                // Not an admin - sign out and show error
                await auth.signOut();
                toast.error('Access denied. Admin privileges required.');
                setLoading(false);
                return;
            }

            // Success - redirect to admin panel
            toast.success('Welcome back, Admin!');
            router.push('/website_admin_pannel');
        } catch (error: any) {
            console.error('Login error:', error);

            if (error.code === 'auth/invalid-credential') {
                toast.error('Invalid email or password');
            } else if (error.code === 'auth/user-not-found') {
                toast.error('No account found with this email');
            } else if (error.code === 'auth/wrong-password') {
                toast.error('Incorrect password');
            } else {
                toast.error('Login failed. Please try again.');
            }
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur border-slate-200">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center size-16 bg-sky-100 rounded-full mb-4">
                        <Shield className="size-8 text-sky-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
                    <p className="text-slate-600 mt-2">
                        Sign in to access the admin panel
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                            <Input
                                type="email"
                                placeholder="admin@hubsnap.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                        Admin access only. Unauthorized access is prohibited.
                    </p>
                </div>
            </Card>
        </div>
    );
}
