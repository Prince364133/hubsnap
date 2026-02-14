"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Home, Search, ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* Logo */}
                {/* Logo */}
                <Link href="/" className="inline-flex items-center gap-3 mb-8">
                    <Image
                        src="/logo.gif"
                        alt="HubSnap Logo"
                        width={48}
                        height={48}
                        className="rounded-lg"
                        unoptimized
                    />
                    <BrandLogo size="lg" />
                </Link>

                {/* 404 Illustration */}
                <div className="relative">
                    <div className="text-[150px] md:text-[200px] font-black text-slate-200 leading-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Compass className="size-24 md:size-32 text-primary animate-spin" style={{ animationDuration: "8s" }} />
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                        Page Not Found
                    </h1>
                    <p className="text-lg text-slate-600 max-w-md mx-auto">
                        Oops! The page you're looking for seems to have wandered off.
                        Let's get you back on track.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link href="/">
                        <Button className="h-12 px-8 rounded-full font-bold gap-2 shadow-lg shadow-primary/20">
                            <Home className="size-5" />
                            Go Home
                        </Button>
                    </Link>
                    <Link href="/explore">
                        <Button variant="outline" className="h-12 px-8 rounded-full font-bold gap-2">
                            <Search className="size-5" />
                            Explore Tools
                        </Button>
                    </Link>
                </div>

                {/* Quick Links */}
                <div className="pt-8 border-t border-slate-200">
                    <p className="text-sm text-slate-500 mb-4">Or try one of these pages:</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link href="/features" className="text-sm text-primary hover:underline">
                            Features
                        </Link>
                        <span className="text-slate-300">•</span>
                        <Link href="/products/creator-os" className="text-sm text-primary hover:underline">
                            Creator OS
                        </Link>
                        <span className="text-slate-300">•</span>
                        <Link href="/digital-business-ideas" className="text-sm text-primary hover:underline">
                            Digital Business Ideas
                        </Link>
                        <span className="text-slate-300">•</span>
                        <Link href="/about" className="text-sm text-primary hover:underline">
                            About Us
                        </Link>
                        <span className="text-slate-300">•</span>
                        <Link href="/contact" className="text-sm text-primary hover:underline">
                            Contact
                        </Link>
                    </div>
                </div>

                {/* Back Button */}
                <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-primary transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="size-4" />
                    Go Back
                </button>
            </div>
        </div>
    );
}
