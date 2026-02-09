import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function SampleOutput() {
    return (
        <section className="py-20 bg-slate-50">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Sample Output Preview
                    </h2>
                    <p className="text-xl text-slate-600 mb-2">
                        This is exactly what you'll get inside
                    </p>
                    <Badge variant="default" className="bg-green-600 text-white">
                        Real Output, Not Mockups
                    </Badge>
                </div>

                <div className="space-y-6">
                    {/* Sample Script */}
                    <Card className="p-6 border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Badge variant="secondary">Sample Script</Badge>
                            <span className="text-sm text-slate-600">Generated in 30 seconds</span>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm text-slate-700 space-y-2">
                            <p><span className="text-slate-500">[HOOK]</span> Did you know 90% of people fail at content creation because they skip this one step?</p>
                            <p><span className="text-slate-500">[INTRO]</span> Hey everyone, today I'm revealing the exact system I use to generate content ideas that actually get views...</p>
                            <p><span className="text-slate-500">[MAIN POINT 1]</span> First, you need to understand your audience's pain points. Here's how...</p>
                            <p className="text-slate-400 italic">... and 7 more sections with full script</p>
                        </div>
                    </Card>

                    {/* Sample Channel Setup */}
                    <Card className="p-6 border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Badge variant="secondary">Sample Channel Setup</Badge>
                            <span className="text-sm text-slate-600">Complete blueprint</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 mb-2">Channel Name Ideas</h4>
                                <ul className="space-y-1 text-sm text-slate-700">
                                    <li>• AI Mastery Hub</li>
                                    <li>• The Creator's Toolkit</li>
                                    <li>• Digital Income Secrets</li>
                                    <li>... 7 more options</li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 mb-2">Monetization Plan</h4>
                                <ul className="space-y-1 text-sm text-slate-700">
                                    <li>• Month 1-2: Affiliate links</li>
                                    <li>• Month 3-4: Sponsorships</li>
                                    <li>• Month 5+: Digital products</li>
                                    <li>... detailed timeline</li>
                                </ul>
                            </div>
                        </div>
                    </Card>

                    {/* Sample Video Idea Pack */}
                    <Card className="p-6 border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Badge variant="secondary">Sample Video Idea Pack</Badge>
                            <span className="text-sm text-slate-600">30 days of content</span>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <span className="font-bold text-primary">Day 1:</span>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900">5 AI Tools That Will Replace Your Job (And How to Use Them)</p>
                                        <p className="text-sm text-slate-600 mt-1">Hook: "Your job might be gone in 2 years. Here's how to stay ahead..."</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="font-bold text-primary">Day 2:</span>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900">I Made $500 Using ChatGPT in One Week (Step-by-Step)</p>
                                        <p className="text-sm text-slate-600 mt-1">Hook: "This AI tool made me more money than my day job..."</p>
                                    </div>
                                </div>
                                <p className="text-slate-400 italic text-sm">... 28 more video ideas with hooks, scripts, and research</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
}
