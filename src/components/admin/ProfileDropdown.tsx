"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ProfileDropdownProps {
    userName?: string;
    userEmail?: string;
}

export default function ProfileDropdown({ userName, userEmail }: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = (name?: string) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 hover:bg-slate-50 rounded-lg p-2 transition-colors"
            >
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-700">{userName || 'Admin'}</p>
                    <p className="text-xs text-slate-500">{userEmail || ''}</p>
                </div>
                <div className="size-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {getInitials(userName)}
                </div>
                <ChevronDown className={`size-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-medium text-slate-900">{userName || 'Admin User'}</p>
                        <p className="text-sm text-slate-500">{userEmail || 'admin@hubsnap.com'}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <Link
                            href="/website_admin_pannel/profile"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <User className="size-4" />
                            View Profile
                        </Link>

                        <Link
                            href="/website_admin_pannel/profile?tab=preferences"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <Settings className="size-4" />
                            Settings
                        </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-100 pt-2">
                        <Link
                            href="/admin-logout"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <LogOut className="size-4" />
                            Logout
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
