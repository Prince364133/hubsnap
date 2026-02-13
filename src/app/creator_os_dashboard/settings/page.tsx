"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Settings, User, Bell, Shield, CreditCard, LogOut, Moon, Globe, Volume2 } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                    <Settings className="size-8 text-primary" />
                    Settings
                </h1>
                <p className="text-slate-500 font-medium">Manage your preferences and application settings.</p>
            </div>

            <div className="grid gap-6">
                {/* Account Section */}
                <Card className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <User className="size-5 text-slate-500" /> Account
                    </h2>
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
                                    <User className="size-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Profile Settings</p>
                                    <p className="text-sm text-slate-500">Update your name, bio, and personal details.</p>
                                </div>
                            </div>
                            <Link href="/creator_os_dashboard/profile">
                                <Button variant="outline">Edit Profile</Button>
                            </Link>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-200 transition-colors">
                                    <CreditCard className="size-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Billing & Subscription</p>
                                    <p className="text-sm text-slate-500">Manage your plan and payment methods.</p>
                                </div>
                            </div>
                            <Link href="/creator_os_dashboard/profile">
                                <Button variant="outline">Manage Billing</Button>
                            </Link>
                        </div>
                    </div>
                </Card>

                {/* Preferences Section */}
                <Card className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Settings className="size-5 text-slate-500" /> Preferences
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Bell className="size-5 text-slate-400" />
                                <div>
                                    <p className="font-medium text-slate-900">Push Notifications</p>
                                    <p className="text-xs text-slate-500">Receive alerts about new features and tips.</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Enabled</Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Moon className="size-5 text-slate-400" />
                                <div>
                                    <p className="font-medium text-slate-900">Dark Mode</p>
                                    <p className="text-xs text-slate-500">Switch between light and dark themes.</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-slate-100 text-slate-500">Coming Soon</Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Globe className="size-5 text-slate-400" />
                                <div>
                                    <p className="font-medium text-slate-900">Language</p>
                                    <p className="text-xs text-slate-500">Select your preferred language.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-700">English (US)</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Security Section */}
                <Card className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Shield className="size-5 text-slate-500" /> Security
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                            <div>
                                <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                                <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                            </div>
                            <Button variant="outline" disabled>Set Up 2FA</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                            <div>
                                <p className="font-bold text-red-600">Delete Account</p>
                                <p className="text-sm text-slate-500">Permanently remove your account and data.</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Delete</Button>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="flex justify-center pt-8">
                <Button variant="ghost" className="text-slate-500 hover:text-red-600 hover:bg-red-50">
                    <LogOut className="size-4 mr-2" /> Sign Out
                </Button>
            </div>
        </div>
    );
}
