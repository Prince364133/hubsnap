import { X, Check, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function WhatMakesUsDifferent() {
    return (
        <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        What Makes Us Different?
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        We're not another course or automation tool. We're a daily execution system.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                    {/* What We're NOT */}
                    <Card className="p-8 border-red-200 bg-red-50">
                        <h3 className="text-2xl font-bold text-red-900 mb-6 flex items-center gap-2">
                            <X className="size-6" />
                            We're NOT
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-2">
                                <X className="size-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-700">A course</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <X className="size-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-700">YouTube automation</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <X className="size-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-700">Fake income promises</span>
                            </div>
                        </div>
                    </Card>

                    {/* What We ARE */}
                    <Card className="p-8 border-green-200 bg-green-50">
                        <h3 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
                            <Check className="size-6" />
                            We ARE
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Check className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-slate-900">A system that helps you take action daily</p>
                                    <p className="text-sm text-slate-600 mt-1">Get daily content plans, scripts, and assets</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-slate-900">Focused on execution, not theory</p>
                                    <p className="text-sm text-slate-600 mt-1">No fluff, just practical tools you use every day</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-slate-900">Built for beginners, not influencers</p>
                                    <p className="text-sm text-slate-600 mt-1">Start from zero with clear guidance</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
}
