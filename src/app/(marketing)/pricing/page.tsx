"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, Tag, X, HelpCircle, ArrowRight, TrendingUp, Coffee, Zap, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { dbService } from "@/lib/firestore";
import { loadRazorpay } from "@/lib/razorpay";
import { Badge } from "@/components/ui/Badge"; // Assuming this exists, if not I'll use a div

export default function PricingPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [coupon, setCoupon] = useState("");
    const [discountApplied, setDiscountApplied] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsubscribe();
    }, []);

    const plans = [
        {
            name: "Free",
            subtitle: "The Explorer",
            price: "₹0",
            priceNumeric: 0,
            period: "/month",
            desc: "Perfect for testing the waters and exploring possibilities.",
            problemSolved: "Stop wondering 'what if' and start exploring real opportunities.",
            features: [
                "Access to basic AI Tools",
                "Limited Trend Analysis",
                "3 Digital Business Ideas/mo",
                "Community Support",
            ],
            cta: "Start Exploring",
            href: "/signup",
            popular: false,
            color: "slate"
        },
        {
            name: "Pro",
            subtitle: "The Builder",
            price: "₹259",
            priceNumeric: 259,
            period: "/month",
            desc: "For serious creators ready to launch and grow daily.",
            problemSolved: "Eliminate writer's block and execution paralysis forever.",
            features: [
                "Unlimited AI Tools",
                "Advanced Viral Trends",
                "Unlimited Business Ideas",
                "Script & Thumbnail Generators",
                "Priority Support",
            ],
            cta: "Start Building",
            popular: true,
            color: "sky"
        },
        {
            name: "Pro Plus",
            subtitle: "The Scaler",
            price: "₹599",
            priceNumeric: 599,
            period: "/month",
            desc: "Maximum power for scaling your digital empire.",
            problemSolved: "Get personal guidance and insider blueprints to scale faster.",
            features: [
                "Everything in Pro",
                "1-on-1 Strategy Calls",
                "Exclusive Blueprints",
                "API Access (Beta)",
                "Early Access to New Tools",
            ],
            cta: "Start Scaling",
            popular: false,
            color: "purple"
        },
    ];

    const faqs = [
        {
            q: "Is this suitable for beginners?",
            a: "Absolutely. We designed Creator OS specifically to take you from 'zero idea' to 'launched channel'. You don't need technical skills, just the willingness to follow the daily steps."
        },
        {
            q: "Do I need to show my face?",
            a: "No. Many of our most successful users run 'Faceless' channels using our AI voiceover and stock footage tools. We have specific blueprints for this."
        },
        {
            q: "Will this work in India?",
            a: "Yes. Our trend data and payment systems are fully optimized for the Indian market, but the strategies work globally (US/UK audiences included)."
        },
        {
            q: "Is this just another AI wrapper?",
            a: "No. AI is just a tool we use. The real value is the 'Operating System'—the daily workflows, the niche research, and the step-by-step execution plans that AI alone can't give you."
        },
        {
            q: "What if I have no experience?",
            a: "That's actually an advantage. You don't have bad habits to unlearn. innovative system guides you through the modern way of content creation."
        }
    ];

    const applyCoupon = () => {
        const code = coupon.toUpperCase();
        if (code === "SAVE50") {
            setDiscountApplied(true);
            alert("Coupon Applied! 50% Off.");
        } else if (code === "FREEHUB36") {
            setDiscountApplied(true); // Logic in handlePayment will treat this as 100% off
            alert("Coupon Applied! 100% Off (Free Access).");
        } else {
            alert("Invalid Coupon");
            setDiscountApplied(false);
        }
    };

    const handlePayment = async (plan: any) => {
        if (!user) {
            router.push("/login?redirect=/pricing");
            return;
        }

        setLoading(true);
        try {
            // 1. Create Order
            const res = await fetch("/api/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: plan.priceNumeric,
                    coupon: discountApplied ? coupon : ""
                }),
            });
            const order = await res.json();

            if (res.status !== 200) {
                alert(order.error || "Failed to create order");
                setLoading(false);
                return;
            }

            // 2. Handle Free/100% off Coupon directly
            if (order.amount === 0) {
                const success = await dbService.updateUserSubscription(user.uid, plan.name);
                if (success) {
                    alert(`Success! You have activated ${plan.name} plan.`);
                    router.push("/creator_os_dashboard/home");
                }
                setLoading(false);
                return;
            }

            // 3. Razorpay Flow
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                const confirmDemo = confirm("[DEMO MODE] Razorpay script failed. Simulate successful payment?");
                if (confirmDemo) {
                    const success = await dbService.updateUserSubscription(user.uid, plan.name);
                    if (success) {
                        router.push("/creator_os_dashboard/home");
                    }
                }
                setLoading(false);
                return;
            }

            const options = {
                key: "rzp_test_DEMO_KEY",
                amount: order.amount,
                currency: order.currency,
                name: "HubSnap",
                description: `${plan.name} Subscription`,
                order_id: order.id,
                handler: async function (response: any) {
                    const success = await dbService.updateUserSubscription(user.uid, plan.name);
                    if (success) {
                        alert("Payment Successful! Plan Activated.");
                        router.push("/creator_os_dashboard/home");
                    }
                },
                prefill: {
                    name: user.displayName || "",
                    email: user.email || "",
                },
                theme: {
                    color: "#0ea5e9",
                },
            };

            const rzp1 = new (window as any).Razorpay(options);
            try {
                rzp1.open();
            } catch (e) {
                console.error("Razorpay Error:", e);
                alert("Payment Gateway Error (Demo Mode)");
            }

        } catch (error) {
            console.error(error);
            alert("Payment failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
            <PublicHeader />

            <main className="pt-32 pb-24 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-sky-500/5 blur-[120px] -z-10" />

                {/* SECTION 1: HERO - Reframe Investment */}
                <section className="max-w-7xl mx-auto px-6 text-center space-y-6 mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-100 text-sky-600 font-medium text-sm mb-4 animate-fade-in">
                        <TrendingUp className="size-4" />
                        <span>Investment in your future, not a cost.</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] animate-slide-up">
                        Stop Guessing. <span className="text-primary italic">Start Growing.</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed animate-slide-up animation-delay-200">
                        Join 10,000+ creators who swapped confusion for clarity. Choose the operating system that builds your digital business for you.
                    </p>

                    <div className="flex justify-center items-center gap-2 max-w-sm mx-auto mt-8 animate-slide-up animation-delay-400">
                        <Input
                            placeholder="Coupon Code (e.g. USER2026)"
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value)}
                            className="text-center uppercase"
                        />
                        <Button variant="outline" onClick={applyCoupon} disabled={discountApplied}>
                            {discountApplied ? <Check className="size-4 text-green-600" /> : <Tag className="size-4" />}
                        </Button>
                    </div>
                    {discountApplied && <p className="text-green-600 font-bold text-sm animate-in fade-in">Discount Applied!</p>}
                </section>

                {/* SECTION 2: DAILY SPEND ANCHORING */}
                <section className="bg-slate-50 py-16 mb-24 border-y border-slate-200/60">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h2 className="text-2xl font-bold mb-12">Is your career worth less than a snack?</h2>
                        <div className="grid md:grid-cols-3 gap-8 items-center">
                            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm opacity-60 grayscale hover:grayscale-0 transition-all">
                                <Coffee className="size-10 text-amber-700 mx-auto mb-4" />
                                <h3 className="font-bold text-lg">Daily Coffee</h3>
                                <p className="text-slate-500">₹200 - ₹300</p>
                                <p className="text-xs text-slate-400 mt-2">Gone in 20 mins</p>
                            </div>
                            <div className="p-8 bg-white rounded-3xl border-2 border-primary shadow-xl scale-110 z-10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-600" />
                                <Zap className="size-12 text-primary mx-auto mb-4" />
                                <h3 className="font-bold text-xl">Pro Creator OS</h3>
                                <p className="text-slate-500"><span className="line-through text-xs">₹499</span> ₹259</p>
                                <p className="text-sky-600 font-bold text-sm mt-2">Builds your future forever</p>
                            </div>
                            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm opacity-60 grayscale hover:grayscale-0 transition-all">
                                <div className="size-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 font-bold">OTT</div>
                                <h3 className="font-bold text-lg">OTT Subscription</h3>
                                <p className="text-slate-500">₹499+</p>
                                <p className="text-xs text-slate-400 mt-2">Passive consumption</p>
                            </div>
                        </div>
                        <p className="mt-8 text-slate-500 text-sm">You spend this amount without thinking. Invest it where it grows.</p>
                    </div>
                </section>

                {/* SECTION 3: VALUE STACK */}
                <section className="max-w-7xl mx-auto px-6 mb-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">What You Actually Get</h2>
                        <p className="text-slate-500">It's not just features. It's a complete ecosystem.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Zap, title: "Execution System", desc: "Step-by-step daily tasks so you never feel lost." },
                            { icon: Users, title: "Trend Intelligence", desc: "Know exactly what to post before it goes viral." },
                            { icon: Shield, title: "Income Blueprints", desc: "Proven paths to monetization, not just theory." },
                            { icon: Check, title: "AI Copilot", desc: "Write scripts, descriptions & ideas in seconds." }
                        ].map((item, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-sky-100 hover:shadow-lg transition-all group">
                                <div className="size-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <item.icon className="size-6" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 4: PLANS */}
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 items-start mb-24">
                    {plans.map((plan, i) => (
                        <Card
                            key={i}
                            className={`relative p-8 rounded-3xl border-slate-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full ${plan.popular
                                ? "border-sky-500 shadow-xl shadow-sky-500/10 scale-105 z-10"
                                : "hover:border-slate-300"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                                    <SparklesIcon className="size-3" /> Most Popular
                                </div>
                            )}

                            <div className="space-y-2 mb-6">
                                <h3 className={`text-2xl font-black ${plan.popular ? 'text-primary' : 'text-slate-900'}`}>{plan.name}</h3>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{plan.subtitle}</p>
                                <p className="text-slate-500 text-sm mt-2">{plan.desc}</p>
                            </div>

                            <div className="flex items-baseline gap-1 mb-6">
                                <span className={discountApplied && plan.priceNumeric > 0 ? "text-2xl line-through text-slate-400 mr-2" : "text-4xl font-black"}>
                                    {plan.price}
                                </span>
                                {discountApplied && plan.priceNumeric > 0 && (
                                    <span className="text-4xl font-black text-green-600">
                                        ₹{Math.floor(plan.priceNumeric / 2)}
                                    </span>
                                )}
                                <span className="text-slate-400 font-medium text-sm">{plan.period}</span>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl mb-6 border border-slate-100">
                                <p className="text-xs font-semibold text-slate-400 mb-1">SOLVES:</p>
                                <p className="text-sm font-medium text-slate-700 italic">"{plan.problemSolved}"</p>
                            </div>

                            <div className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3 text-slate-600">
                                        <div className={`mt-0.5 rounded-full p-0.5 ${plan.popular ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'}`}>
                                            <Check className="size-3" />
                                        </div>
                                        <span className="text-sm font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {plan.priceNumeric === 0 ? (
                                <Link href="/signup" className="block w-full">
                                    <Button className="w-full h-12 rounded-xl font-bold text-base bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                        {plan.cta}
                                    </Button>
                                </Link>
                            ) : (
                                <Button
                                    onClick={() => handlePayment(plan)}
                                    disabled={loading}
                                    className={`w-full h-12 rounded-xl font-bold text-base transition-all ${plan.popular
                                        ? "bg-sky-500 hover:bg-sky-600 text-white shadow-lg hover:shadow-sky-500/25"
                                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-md"
                                        }`}
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : plan.cta}
                                </Button>
                            )}
                        </Card>
                    ))}
                </div>

                {/* SECTION 5: COMPARISON (Alternatives) */}
                <section className="bg-slate-50 py-24 mb-24 border-y border-slate-200/60">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Why users switch to Creator OS</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="font-bold text-xl text-red-500 flex items-center gap-2">
                                    <X className="size-5" /> The Old Way
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex gap-3 text-slate-500 opacity-70">
                                        <X className="size-5 shrink-0" /> Buying expensive ₹5000+ courses
                                    </li>
                                    <li className="flex gap-3 text-slate-500 opacity-70">
                                        <X className="size-5 shrink-0" /> Guessing what content will work
                                    </li>
                                    <li className="flex gap-3 text-slate-500 opacity-70">
                                        <X className="size-5 shrink-0" /> Using 10 different disconnected tools
                                    </li>
                                    <li className="flex gap-3 text-slate-500 opacity-70">
                                        <X className="size-5 shrink-0" /> Giving up after 2 weeks of no views
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h3 className="font-bold text-xl text-green-600 flex items-center gap-2">
                                    <Check className="size-5" /> The Creator OS Way
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex gap-3 text-slate-700 font-medium">
                                        <Check className="size-5 text-green-500 shrink-0" /> One affordable monthly subscription
                                    </li>
                                    <li className="flex gap-3 text-slate-700 font-medium">
                                        <Check className="size-5 text-green-500 shrink-0" /> Data-backed viral trend predictions
                                    </li>
                                    <li className="flex gap-3 text-slate-700 font-medium">
                                        <Check className="size-5 text-green-500 shrink-0" /> All-in-one ecosystem for growth
                                    </li>
                                    <li className="flex gap-3 text-slate-700 font-medium">
                                        <Check className="size-5 text-green-500 shrink-0" /> Daily motivation & Gamified progress
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 6: FAQ */}
                <section className="max-w-3xl mx-auto px-6 mb-24">
                    <h2 className="text-3xl font-bold text-center mb-12">Common Questions</h2>
                    <div className="space-y-6">
                        {faqs.map((faq, i) => (
                            <div key={i} className="p-6 rounded-2xl border border-slate-200 hover:border-sky-200 transition-colors bg-white">
                                <h3 className="font-bold text-lg mb-2 flex items-start gap-3">
                                    <HelpCircle className="size-5 text-sky-500 shrink-0 mt-1" />
                                    {faq.q}
                                </h3>
                                <p className="text-slate-600 leading-relaxed pl-8">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 7: FINAL CTA */}
                <section className="max-w-4xl mx-auto px-6 text-center">
                    <div className="p-12 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/20 rounded-full blur-[80px]" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]" />

                        <div className="relative z-10 space-y-8">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                                One year from now,<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-400">you could be full-time.</span>
                            </h2>
                            <p className="text-slate-400 text-lg max-w-xl mx-auto">
                                Or you could be in the exact same place. The difference is the system you choose today.
                            </p>
                            <Link href="/signup">
                                <Button className="h-14 px-8 rounded-full bg-white text-slate-900 font-bold text-lg hover:bg-sky-50 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                                    Take the First Step <ArrowRight className="ml-2 size-5" />
                                </Button>
                            </Link>
                            <p className="text-xs text-slate-500 mt-4">No commitment. Cancel anytime.</p>
                        </div>
                    </div>
                </section>

            </main>

            <PublicFooter />
        </div>
    );
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}
