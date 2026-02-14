"use client";

import { useEffect, useState } from 'react';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function CountdownTimer() {
    // Launch date: April 2, 2026 at 12:00 AM (midnight)
    const launchDate = new Date('2026-04-02T00:00:00').getTime();

    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    const [isLaunched, setIsLaunched] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = launchDate - now;

            if (difference <= 0) {
                setIsLaunched(true);
                return {
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0
                };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000)
            };
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        // Update every second
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [launchDate]);

    if (isLaunched) {
        return (
            <div className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 py-8 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        🎉 Now Available!
                    </h2>
                    <p className="text-white/90 text-lg mb-4">
                        Creator OS is officially launched!
                    </p>
                    <button className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-emerald-50 transition-colors">
                        Get Started Now →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <section className="py-16 px-6 relative overflow-hidden">
            {/* Ambient Background Blobs for Glass Effect */}
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-sky-400/20 rounded-full blur-[100px] -translate-y-1/2" />
            <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px] -translate-y-1/2" />

            {/* Glass Card */}
            <div className="max-w-5xl mx-auto relative z-10">
                <div className="backdrop-blur-xl bg-white/40 border border-white/60 shadow-2xl rounded-3xl p-8 md:p-12 text-center relative overflow-hidden overflow-hidden ring-1 ring-white/50">

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-50 pointer-events-none" />

                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                        🚀 Launching Soon
                    </h2>
                    <p className="text-slate-600 text-lg md:text-xl mb-8 font-medium">
                        Creator OS goes live on <span className="text-sky-600 font-bold">April 2, 2026</span>
                    </p>

                    <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
                        {/* Days */}
                        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-sm">
                            <div className="text-4xl md:text-6xl font-black text-sky-600 mb-1">
                                {String(timeLeft.days).padStart(2, '0')}
                            </div>
                            <div className="text-slate-500 text-xs md:text-sm uppercase tracking-widest font-bold">
                                Days
                            </div>
                        </div>

                        {/* Hours */}
                        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-sm">
                            <div className="text-4xl md:text-6xl font-black text-sky-600 mb-1">
                                {String(timeLeft.hours).padStart(2, '0')}
                            </div>
                            <div className="text-slate-500 text-xs md:text-sm uppercase tracking-widest font-bold">
                                Hours
                            </div>
                        </div>

                        {/* Minutes */}
                        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-sm">
                            <div className="text-4xl md:text-6xl font-black text-sky-600 mb-1">
                                {String(timeLeft.minutes).padStart(2, '0')}
                            </div>
                            <div className="text-slate-500 text-xs md:text-sm uppercase tracking-widest font-bold">
                                Minutes
                            </div>
                        </div>

                        {/* Seconds */}
                        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-sm">
                            <div className="text-4xl md:text-6xl font-black text-sky-600 mb-1">
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </div>
                            <div className="text-slate-500 text-xs md:text-sm uppercase tracking-widest font-bold">
                                Seconds
                            </div>
                        </div>
                    </div>

                    <a
                        href="/waitlist"
                        className="inline-flex items-center gap-2 bg-sky-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-sky-600 transition-all shadow-lg hover:shadow-sky-500/30 transform hover:-translate-y-1"
                    >
                        Join Waitlist to Get Notified <span className="text-xl">→</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
