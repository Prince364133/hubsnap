"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';
import { LogOut, Loader2 } from 'lucide-react';

export default function AdminLogoutPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);

        try {
            await signOut(auth);
            toast.success('Logged out successfully');
            router.push('/admin-login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to log out. Please try again.');
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur border-slate-200">
                {/* Icon */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center size-16 bg-red-100 rounded-full mb-4">
                        <LogOut className="size-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Confirm Logout</h1>
                    <p className="text-slate-600 mt-2">
                        Are you sure you want to log out of the admin panel?
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="flex-1"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleLogout}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="size-4 mr-2 animate-spin" />
                                Logging out...
                            </>
                        ) : (
                            'Logout'
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
