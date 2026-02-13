"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Shield, Settings, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

type Tab = 'profile' | 'security' | 'preferences' | 'account';

export default function AdminProfilePage() {
    const { user, profile } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('profile');

    // Profile form state
    const [displayName, setDisplayName] = useState(profile?.name || '');
    const [saving, setSaving] = useState(false);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    const tabs = [
        { id: 'profile' as Tab, label: 'Profile', icon: User },
        { id: 'security' as Tab, label: 'Security', icon: Shield },
        { id: 'preferences' as Tab, label: 'Preferences', icon: Settings },
        { id: 'account' as Tab, label: 'Account', icon: AlertTriangle }
    ];

    const handleSaveProfile = async () => {
        if (!user) return;

        setSaving(true);
        try {
            // Update Firebase Auth profile
            await updateProfile(user, { displayName });

            // Update Firestore user document
            await updateDoc(doc(db, 'users', user.uid), {
                name: displayName
            });

            toast.success('Profile updated successfully');
        } catch (error: any) {
            console.error('Profile update error:', error);
            toast.error('Failed to update profile');
        }
        setSaving(false);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !user.email) {
            toast.error('User not found');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setChangingPassword(true);
        try {
            // Re-authenticate user
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, newPassword);

            toast.success('Password changed successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Password change error:', error);
            if (error.code === 'auth/wrong-password') {
                toast.error('Current password is incorrect');
            } else {
                toast.error('Failed to change password');
            }
        }
        setChangingPassword(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Profile</h1>
                <p className="text-slate-600 mt-1">
                    Manage your account settings and preferences
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                                    ${isActive
                                        ? 'border-sky-500 text-sky-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }
                                `}
                            >
                                <Icon className={`size-5 ${isActive ? 'text-sky-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <Card className="p-6 border-slate-200">
                        <h2 className="text-lg font-bold mb-4">Profile Information</h2>
                        <div className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Display Name
                                </label>
                                <Input
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email Address
                                </label>
                                <Input
                                    value={user?.email || ''}
                                    disabled
                                    className="bg-slate-50"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Email cannot be changed
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Role
                                </label>
                                <Input
                                    value={profile?.role || 'admin'}
                                    disabled
                                    className="bg-slate-50"
                                />
                            </div>

                            <Button onClick={handleSaveProfile} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <Card className="p-6 border-slate-200">
                        <h2 className="text-lg font-bold mb-4">Change Password</h2>
                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Current Password
                                </label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    New Password
                                </label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Confirm New Password
                                </label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <Button type="submit" disabled={changingPassword}>
                                {changingPassword ? 'Changing Password...' : 'Change Password'}
                            </Button>
                        </form>
                    </Card>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                    <Card className="p-6 border-slate-200">
                        <h2 className="text-lg font-bold mb-4">Preferences</h2>
                        <div className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Theme
                                </label>
                                <select className="w-full px-3 py-2 border border-slate-300 rounded-md">
                                    <option>Light</option>
                                    <option>Dark</option>
                                    <option>System</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Language
                                </label>
                                <select className="w-full px-3 py-2 border border-slate-300 rounded-md">
                                    <option>English</option>
                                    <option>Hindi</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="font-medium text-slate-700">Email Notifications</p>
                                    <p className="text-sm text-slate-500">Receive email updates</p>
                                </div>
                                <input type="checkbox" className="size-5" defaultChecked />
                            </div>

                            <Button>Save Preferences</Button>
                        </div>
                    </Card>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                    <Card className="p-6 border-slate-200">
                        <h2 className="text-lg font-bold mb-4">Account Information</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-medium text-slate-700 mb-2">Account Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">User ID:</span>
                                        <span className="font-mono text-slate-700">{user?.uid.slice(0, 16)}...</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Account Created:</span>
                                        <span className="text-slate-700">
                                            {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Last Sign In:</span>
                                        <span className="text-slate-700">
                                            {user?.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-6">
                                <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
                                <p className="text-sm text-slate-600 mb-4">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                                <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
