"use client";

import { CheckCircle } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side: Brand & Social Proof */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-black text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 z-0" />

                {/* Brand */}
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold tracking-tighter">CREATOR OS</h1>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 space-y-6 max-w-lg">
                    <h2 className="text-4xl font-bold leading-tight">
                        Stop guessing. <br /> Start growing.
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Join 12,000+ creators using data-driven tools to build their media empire.
                    </p>

                    <div className="space-y-3 pt-4">
                        {[
                            "Viral Trend Detector",
                            "AI Script Generator",
                            "Sponsorship Income Tracker"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-300">
                                <CheckCircle className="size-5 text-green-400" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Testimonial Footer */}
                <div className="relative z-10 pt-12">
                    <blockquote className="space-y-2">
                        <p className="text-lg italic text-slate-300">
                            "This tool saved me 20 hours a week on research. It's basically a cheat code for YouTube."
                        </p>
                        <footer className="text-sm font-semibold text-white">
                            — Alex H. (1.2M Subs)
                        </footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-slate-900">
                <div className="w-full max-w-sm space-y-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
