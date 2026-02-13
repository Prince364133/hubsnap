"use client";

import { useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function SetAdminPage() {
    const setAdminRole = async () => {
        const user = auth.currentUser;

        if (!user) {
            toast.error('No user is currently logged in. Please log in first.');
            return;
        }

        toast.info(`Setting admin role for: ${user.email}`);

        try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                // Update existing user document
                await setDoc(userRef, { role: 'admin' }, { merge: true });
                toast.success('✅ Admin role updated successfully!');
            } else {
                // Create new user document with admin role
                await setDoc(userRef, {
                    id: user.uid,
                    email: user.email,
                    name: user.displayName || user.email,
                    role: 'admin',
                    plan: 'pro_plus',
                    walletBalance: 0,
                    createdAt: new Date()
                });
                toast.success('✅ User document created with admin role!');
            }

            toast.success('You can now use the URL shortener and other admin features. Refresh the page.');
        } catch (error: any) {
            console.error('Error setting admin role:', error);
            toast.error(`Error: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
                <h1 className="text-2xl font-bold mb-4">Set Admin Role</h1>
                <p className="text-slate-600 mb-6">
                    Click the button below to grant yourself admin access. This will allow you to use the URL shortener and other admin features.
                </p>
                <Button onClick={setAdminRole} className="w-full">
                    Grant Admin Access
                </Button>
                <p className="text-sm text-slate-500 mt-4">
                    Current user: {auth.currentUser?.email || 'Not logged in'}
                </p>
            </div>
        </div>
    );
}
