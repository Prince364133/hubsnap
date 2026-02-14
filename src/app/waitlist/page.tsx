"use client";

import { useState } from 'react';
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { toast } from 'sonner';
import {
    Sparkles, MessageSquare, Mic, Type, Scissors,
    RefreshCw, TestTube, Calendar, CheckCircle2, Loader2, ArrowRight, TrendingUp
} from 'lucide-react';

export default function WaitlistPage() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        currentRole: '',
        contentType: [] as string[],
        platforms: [] as string[],
        monthlyContentVolume: '',
        currentTools: '',
        painPoints: [] as string[],
        interestedFeatures: [] as string[],
        expectedUsage: '',
        budget: ''
    });

    const features = [
        {
            icon: MessageSquare,
            name: "Audience Insight Engine",
            description: "Analyze real audience comments from Instagram, YouTube, and competitor channels to discover what your audience actually wants",
            benefit: "Stop guessing - create content based on evidence",
            earning: "$800-3000/month"
        },
        {
            icon: Mic,
            name: "AI Audiobook Studio",
            description: "Convert written content into professional audiobook videos automatically with preset editing styles",
            benefit: "One-click to professional audiobooks",
            earning: "$500-2000/month"
        },
        {
            icon: Type,
            name: "Textography Reels Generator",
            description: "Create engaging text-based Instagram Reels without face or voice in under 2 minutes",
            benefit: "Viral content without showing your face",
            earning: "$1000-5000/month"
        },
        {
            icon: Scissors,
            name: "Snap Clipper",
            description: "Extract best moments from long videos into viral short clips automatically",
            benefit: "Turn 1 video into 10+ viral clips",
            earning: "$800-3000/month"
        },
        {
            icon: RefreshCw,
            name: "Content Lifespan Optimizer",
            description: "Transform one content idea into multiple platform-specific formats",
            benefit: "Post once, repurpose everywhere",
            earning: "$1500-4000/month"
        },
        {
            icon: TestTube,
            name: "Hook Effectiveness Tester",
            description: "Score your content hooks before posting to predict performance",
            benefit: "Never post weak content again",
            earning: "$600-2500/month"
        },
        {
            icon: Calendar,
            name: "Creator Consistency Tracker",
            description: "Track your creative momentum and prevent burnout with intelligent insights",
            benefit: "Build sustainable creator habits",
            earning: "5x follower growth"
        }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitted(true);
                toast.success('Successfully joined the waitlist!');
            } else {
                toast.error(data.error || 'Failed to join waitlist');
            }
        } catch (error) {
            console.error('Waitlist submission error:', error);
            toast.error('Failed to join waitlist. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (field: 'contentType' | 'platforms' | 'painPoints' | 'interestedFeatures', value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value]
        }));
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white relative overflow-hidden font-sans">
                {/* Ambient Background */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-100/40 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

                <PublicHeader />
                <div className="flex items-center justify-center min-h-[80vh] px-6 relative z-10">
                    <div className="max-w-2xl w-full p-12 text-center bg-white/60 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl ring-1 ring-white/50">
                        <div className="size-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-100 shadow-sm">
                            <CheckCircle2 className="size-12 text-green-500" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">You're on the list!</h1>
                        <p className="text-slate-600 text-xl mb-8 leading-relaxed">
                            We'll notify you via email when Creator OS launches on <br />
                            <span className="text-sky-600 font-bold">April 2, 2026 at 12:00 AM</span>.
                        </p>
                        <p className="text-slate-500 mb-10 font-medium">
                            Get ready to transform your content creation workflow!
                        </p>
                        <Button
                            onClick={() => window.location.href = '/'}
                            className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-6 rounded-full text-lg font-bold"
                        >
                            Back to Home
                        </Button>
                    </div>
                </div>
                <PublicFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white selection:bg-sky-100 text-slate-900 font-sans">
            <PublicHeader />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-sky-50/50 to-transparent -z-20 rounded-b-[100px]" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-200/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 -z-10" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-200/30 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 -z-10" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-sky-100 text-sky-700 text-sm font-bold mb-8 shadow-sm">
                        <Sparkles className="size-4 text-sky-500 fill-sky-500" /> Launching April 2, 2026
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight text-slate-900">
                        Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">Creator OS</span> Waitlist
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
                        Be among the first to access the complete AI-powered creator studio with multiple revolutionary tools.
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-slate-500">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                            <CheckCircle2 className="size-5 text-sky-500" />
                            <span>Early Access</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                            <CheckCircle2 className="size-5 text-sky-500" />
                            <span>Special Pricing</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                            <CheckCircle2 className="size-5 text-sky-500" />
                            <span>Priority Support</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Showcase */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Multiple Powerful Tools in One Platform</h2>
                        <p className="text-xl text-slate-500">Everything you need to create, analyze, and monetize content</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <Card key={i} className="p-8 hover:shadow-2xl hover:shadow-sky-100/50 transition-all duration-300 border border-slate-100 hover:border-sky-200 group bg-white hover:-translate-y-1">
                                <div className="size-14 bg-sky-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sky-500 transition-colors duration-300">
                                    <feature.icon className="size-7 text-sky-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.name}</h3>
                                <p className="text-slate-500 text-sm mb-6 leading-relaxed">{feature.description}</p>
                                <div className="space-y-3 pt-6 border-t border-slate-50">
                                    <div className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                                        <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                                        {feature.benefit}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg w-fit">
                                        <TrendingUp className="size-4" /> {feature.earning}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Waitlist Form - Glassmorphism */}
            <section className="py-20 px-6 relative">
                {/* Background Bubbles for form section */}
                <div className="absolute top-1/2 left-10 w-64 h-64 bg-purple-200/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-sky-200/20 rounded-full blur-[80px]" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-12 space-y-4">
                        <h2 className="text-4xl font-bold text-slate-900">Secure Your Spot</h2>
                        <p className="text-xl text-slate-500">Help us understand your needs to serve you better</p>
                    </div>

                    <div className="relative group">
                        {/* Glow underneath */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-cyan-300 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>

                        <Card className="p-8 md:p-12 bg-white/60 backdrop-blur-xl border border-white/60 shadow-2xl rounded-[2rem] ring-1 ring-white/50">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="size-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold">1</div>
                                        <h3 className="font-bold text-xl text-slate-900">Basic Information</h3>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-slate-700">Full Name *</label>
                                            <Input
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Enter your full name"
                                                className="h-12 bg-white/50 border-slate-200 focus:border-sky-500 focus:ring-sky-500/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-slate-700">Email Address *</label>
                                            <Input
                                                required
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="you@company.com"
                                                className="h-12 bg-white/50 border-slate-200 focus:border-sky-500 focus:ring-sky-500/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700">Phone Number (Optional)</label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+1 (555) 000-0000"
                                            className="h-12 bg-white/50 border-slate-200 focus:border-sky-500 focus:ring-sky-500/20"
                                        />
                                    </div>
                                </div>

                                {/* Professional Info */}
                                <div className="space-y-6 pt-8 border-t border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="size-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold">2</div>
                                        <h3 className="font-bold text-xl text-slate-900">Professional Profile</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700">Current Role *</label>
                                        <select
                                            required
                                            className="w-full h-12 px-4 border border-slate-200 rounded-lg bg-white/50 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                                            value={formData.currentRole}
                                            onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                                        >
                                            <option value="">Select your role</option>
                                            <option value="Content Creator">Content Creator</option>
                                            <option value="Business Owner">Business Owner</option>
                                            <option value="Marketer">Marketer</option>
                                            <option value="Agency">Agency</option>
                                            <option value="Student">Student</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-slate-700">Content Types (Select all that apply)</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {['Video', 'Blog', 'Podcast', 'Social Media', 'Newsletter', 'Courses'].map(type => (
                                                <label key={type} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${formData.contentType.includes(type)
                                                    ? 'bg-sky-50 border-sky-200 shadow-sm'
                                                    : 'bg-white/50 border-slate-200 hover:border-sky-200 hover:bg-sky-50/50'
                                                    }`}>
                                                    <div className={`size-5 rounded border flex items-center justify-center transition-colors ${formData.contentType.includes(type) ? 'bg-sky-500 border-sky-500' : 'border-slate-300 bg-white'
                                                        }`}>
                                                        {formData.contentType.includes(type) && <CheckCircle2 className="size-3.5 text-white" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={formData.contentType.includes(type)}
                                                        onChange={() => handleCheckboxChange('contentType', type)}
                                                    />
                                                    <span className={`text-sm font-medium ${formData.contentType.includes(type) ? 'text-sky-700' : 'text-slate-600'}`}>
                                                        {type}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-slate-700">Platforms (Select all that apply)</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {['YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'Twitter', 'Facebook'].map(platform => (
                                                <label key={platform} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${formData.platforms.includes(platform)
                                                    ? 'bg-sky-50 border-sky-200 shadow-sm'
                                                    : 'bg-white/50 border-slate-200 hover:border-sky-200 hover:bg-sky-50/50'
                                                    }`}>
                                                    <div className={`size-5 rounded border flex items-center justify-center transition-colors ${formData.platforms.includes(platform) ? 'bg-sky-500 border-sky-500' : 'border-slate-300 bg-white'
                                                        }`}>
                                                        {formData.platforms.includes(platform) && <CheckCircle2 className="size-3.5 text-white" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={formData.platforms.includes(platform)}
                                                        onChange={() => handleCheckboxChange('platforms', platform)}
                                                    />
                                                    <span className={`text-sm font-medium ${formData.platforms.includes(platform) ? 'text-sky-700' : 'text-slate-600'}`}>
                                                        {platform}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Content Journey */}
                                <div className="space-y-6 pt-8 border-t border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="size-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold">3</div>
                                        <h3 className="font-bold text-xl text-slate-900">Content Needs</h3>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-slate-700">Monthly Content Volume *</label>
                                            <select
                                                required
                                                className="w-full h-12 px-4 border border-slate-200 rounded-lg bg-white/50 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                                                value={formData.monthlyContentVolume}
                                                onChange={(e) => setFormData({ ...formData, monthlyContentVolume: e.target.value })}
                                            >
                                                <option value="">Select volume</option>
                                                <option value="1-5">1-5 pieces</option>
                                                <option value="6-10">6-10 pieces</option>
                                                <option value="11-20">11-20 pieces</option>
                                                <option value="20+">20+ pieces</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-slate-700">Current Tools</label>
                                            <Input
                                                value={formData.currentTools}
                                                onChange={(e) => setFormData({ ...formData, currentTools: e.target.value })}
                                                placeholder="e.g., Canva, Adobe Premiere"
                                                className="h-12 bg-white/50 border-slate-200 focus:border-sky-500 focus:ring-sky-500/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-slate-700">Biggest Pain Points</label>
                                        <div className="grid md:grid-cols-2 gap-3">
                                            {[
                                                'Finding content ideas',
                                                'Time-consuming editing',
                                                'Inconsistent posting',
                                                'Low engagement',
                                                'Monetization challenges',
                                                'Analytics tracking'
                                            ].map(pain => (
                                                <label key={pain} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${formData.painPoints.includes(pain)
                                                    ? 'bg-red-50 border-red-200 shadow-sm'
                                                    : 'bg-white/50 border-slate-200 hover:border-red-200 hover:bg-red-50/50'
                                                    }`}>
                                                    <div className={`size-5 rounded border flex items-center justify-center transition-colors ${formData.painPoints.includes(pain) ? 'bg-red-500 border-red-500' : 'border-slate-300 bg-white'
                                                        }`}>
                                                        {formData.painPoints.includes(pain) && <CheckCircle2 className="size-3.5 text-white" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={formData.painPoints.includes(pain)}
                                                        onChange={() => handleCheckboxChange('painPoints', pain)}
                                                    />
                                                    <span className={`text-sm font-medium ${formData.painPoints.includes(pain) ? 'text-red-700' : 'text-slate-600'}`}>
                                                        {pain}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Interests */}
                                <div className="space-y-6 pt-8 border-t border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="size-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold">4</div>
                                        <h3 className="font-bold text-xl text-slate-900">Your Interests</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-slate-700">Most Interested Features (Select top 3)</label>
                                        <div className="grid md:grid-cols-2 gap-3">
                                            {features.map(feature => (
                                                <label key={feature.name} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${formData.interestedFeatures.includes(feature.name)
                                                    ? 'bg-sky-50 border-sky-200 shadow-sm'
                                                    : 'bg-white/50 border-slate-200 hover:border-sky-200 hover:bg-sky-50/50'
                                                    } ${!formData.interestedFeatures.includes(feature.name) && formData.interestedFeatures.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <div className={`size-5 rounded border flex items-center justify-center transition-colors ${formData.interestedFeatures.includes(feature.name) ? 'bg-sky-500 border-sky-500' : 'border-slate-300 bg-white'
                                                        }`}>
                                                        {formData.interestedFeatures.includes(feature.name) && <CheckCircle2 className="size-3.5 text-white" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={formData.interestedFeatures.includes(feature.name)}
                                                        onChange={() => handleCheckboxChange('interestedFeatures', feature.name)}
                                                        disabled={!formData.interestedFeatures.includes(feature.name) && formData.interestedFeatures.length >= 3}
                                                    />
                                                    <span className={`text-sm font-medium ${formData.interestedFeatures.includes(feature.name) ? 'text-sky-700' : 'text-slate-600'}`}>
                                                        {feature.name}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-slate-700">Expected Usage *</label>
                                            <select
                                                required
                                                className="w-full h-12 px-4 border border-slate-200 rounded-lg bg-white/50 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                                                value={formData.expectedUsage}
                                                onChange={(e) => setFormData({ ...formData, expectedUsage: e.target.value })}
                                            >
                                                <option value="">Select frequency</option>
                                                <option value="Daily">Daily</option>
                                                <option value="Weekly">Weekly</option>
                                                <option value="Monthly">Monthly</option>
                                                <option value="Occasionally">Occasionally</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-slate-700">Budget Range *</label>
                                            <select
                                                required
                                                className="w-full h-12 px-4 border border-slate-200 rounded-lg bg-white/50 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                                                value={formData.budget}
                                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                            >
                                                <option value="">Select budget</option>
                                                <option value="Free">Free tier only</option>
                                                <option value="$10-50">$10-50/month</option>
                                                <option value="$50-100">$50-100/month</option>
                                                <option value="$100+">$100+/month</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-16 text-xl font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20 hover:scale-[1.01] transition-all"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="size-6 animate-spin mr-2" />
                                            Joining Waitlist...
                                        </>
                                    ) : (
                                        <>
                                            Join Waitlist <ArrowRight className="ml-2 size-6" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
