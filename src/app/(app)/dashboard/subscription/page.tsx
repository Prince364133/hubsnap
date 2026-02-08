"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Zap, Crown, Shield, HelpCircle } from "lucide-react";

const TIERS = [
    {
        name: "Starter",
        price: "Free",
        description: "For creators just starting their journey.",
        features: [
            "Basic Trend Analysis (Top 3)",
            "Manual Content Planning",
            "Basic Earnings Tracker",
            "Community Support"
        ],
        cta: "Current Plan",
        popular: false,
        disabled: true
    },
    {
        name: "Pro",
        price: "₹499",
        period: "/month",
        description: "For growing channels needing data & AI.",
        features: [
            "Unlimited Trend Detector",
            "AI Script Generator (GPT-4)",
            "Advanced Income Analytics",
            "Priority Support",
            "Channel Name Locks"
        ],
        cta: "Upgrade to Pro",
        popular: true,
        disabled: false
    },
    {
        name: "Studio",
        price: "₹4,999",
        period: "/year",
        description: "For full-time media empires.",
        features: [
            "Everything in Pro",
            "Agentic Research Assistants",
            "Team Collaboration (3 seats)",
            "Sponsorship Contract Templates",
            "1-on-1 Strategy Call"
        ],
        cta: "Contact Sales",
        popular: false,
        disabled: false
    }
];

export default function SubscriptionPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-12 py-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">Invest in your Growth</h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                    Start for free. Scale with the same tools used by top 1% creators.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {TIERS.map((tier) => (
                    <Card
                        key={tier.name}
                        className={`relative p-8 flex flex-col ${tier.popular
                                ? "border-2 border-primary shadow-xl scale-105 z-10"
                                : "border border-gray-200"
                            }`}
                    >
                        {tier.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                <Crown className="size-3" /> MOST POPULAR
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-500">{tier.name}</h3>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                                {tier.period && <span className="text-gray-500">{tier.period}</span>}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">{tier.description}</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {tier.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
                                    <CheckCircle className={`size-5 shrink-0 ${tier.popular ? "text-primary" : "text-gray-400"}`} />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Button
                            className={`w-full py-6 font-bold text-lg ${tier.popular
                                    ? "bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20"
                                    : tier.disabled
                                        ? "bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-default"
                                        : "bg-white text-primary border-2 border-primary hover:bg-primary-light"
                                }`}
                            disabled={tier.disabled}
                        >
                            {tier.cta}
                        </Button>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center gap-8 py-8 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Shield className="size-4" /> Secure Payment (Stripe)
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Zap className="size-4" /> Cancel Anytime
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <HelpCircle className="size-4" /> 24/7 Support
                </div>
            </div>
        </div>
    );
}
