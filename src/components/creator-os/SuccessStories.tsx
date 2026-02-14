import { Card } from "@/components/ui/Card";
import Image from "next/image";
import { Star, TrendingUp, Quote } from "lucide-react";

const stories = [
    {
        name: "Sarah Jenkins",
        role: "Tech Reviewer",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
        result: "+145k Subs in 3 Months",
        quote: "Content Pack Generator saved me 15 hours a week. I went from posting once a week to 3 times a week without burning out.",
        highlight: "Used: Channel Ideas & Scriptwriter"
    },
    {
        name: "Marcus Chen",
        role: "Finance Educator",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
        result: "$8k/mo Passive Income",
        quote: "The Affiliate Consolidator found missed revenue opportunities I didn't even know existed. It paid for itself in day one.",
        highlight: "Used: Income Tracker & Analytics"
    },
    {
        name: "Elara V.",
        role: "Lifestyle Vlogger",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
        result: "Viral on 3 Platforms",
        quote: "Trend Detector told me to make a 'Slow Living' video 2 days before the trend exploded. My view counts have never been higher.",
        highlight: "Used: Trend Detector & Repurposing"
    }
];

export function SuccessStories() {
    return (
        <section className="py-20 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100/50 border border-yellow-200 text-yellow-700 text-sm font-bold">
                        <Star className="size-4 fill-yellow-500 text-yellow-500" />
                        Proven Results
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900">
                        Creators Winning with OS
                    </h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        Real creators, real growth. See what happens when you treat content like a business.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {stories.map((story, i) => (
                        <Card key={i} className="p-8 border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden group">
                            {/* Decorative Quote Icon */}
                            <Quote className="absolute top-6 right-6 size-12 text-slate-100 group-hover:text-primary/10 transition-colors" />

                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative size-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                                    <Image
                                        src={story.image}
                                        alt={story.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{story.name}</h3>
                                    <p className="text-sm text-slate-500">{story.role}</p>
                                </div>
                            </div>

                            <div className="mb-6 relative z-10">
                                <div className="flex gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="size-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-slate-600 italic leading-relaxed">
                                    "{story.quote}"
                                </p>
                            </div>

                            <div className="pt-6 border-t border-slate-100 space-y-3">
                                <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-lg w-fit">
                                    <TrendingUp className="size-4" />
                                    {story.result}
                                </div>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                                    {story.highlight}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
