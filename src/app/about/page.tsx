"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
    Zap,
    Target,
    Heart,
    Rocket,
    Users,
    Linkedin,
    Mail,
    Github,
    Instagram,
    ArrowRight
} from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <PublicHeader />

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                        About <span className="text-primary italic">HubSnap</span>
                    </h1>
                    <p className="text-xl text-slate-500 leading-relaxed">
                        We're on a mission to democratize AI tools and empower the next generation of digital creators.
                    </p>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <Card className="p-6 border-slate-200 text-center">
                            <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                                <Target className="size-6 text-blue-500" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Mission</h3>
                            <p className="text-sm text-slate-600">Democratize AI tools for creators worldwide</p>
                        </Card>
                        <Card className="p-6 border-slate-200 text-center">
                            <div className="size-12 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
                                <Rocket className="size-6 text-purple-500" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Vision</h3>
                            <p className="text-sm text-slate-600">Empower creators to build sustainable businesses</p>
                        </Card>
                        <Card className="p-6 border-slate-200 text-center">
                            <div className="size-12 rounded-xl bg-pink-50 flex items-center justify-center mx-auto mb-4">
                                <Heart className="size-6 text-pink-500" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Values</h3>
                            <p className="text-sm text-slate-600">Innovation, Accessibility, Creator-First</p>
                        </Card>
                    </div>

                    <div className="prose prose-lg max-w-none">
                        <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            HubSnap was born from a simple observation: creators were spending more time managing tools than creating content.
                            The explosion of AI tools created opportunity, but also overwhelming complexity.
                        </p>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            We built HubSnap to solve this problem. A unified platform that brings together the best AI tools,
                            provides data-driven insights, and automates repetitive workflows - so creators can focus on what they do best: creating.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            Today, HubSnap powers thousands of creators worldwide, from solo YouTubers to full-scale media companies.
                            Our flagship product, Creator OS, has become the go-to platform for data-driven content creation.
                        </p>
                    </div>
                </div>
            </section>

            {/* Founder Section */}
            <section className="py-20 px-6 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-3">Meet Our Founder</h2>
                        <p className="text-slate-500 text-lg">Building the future of creator tools</p>
                    </div>

                    <div className="block max-w-3xl mx-auto">
                        <Card className="p-8 md:p-12 border-slate-200 hover:border-primary hover:shadow-xl transition-all group relative">
                            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                                {/* Profile Image */}
                                <Link href="/founder/prince-kumar" className="relative size-32 rounded-2xl overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-lg cursor-pointer">
                                    <Image
                                        src="/founder.png"
                                        alt="Prince Kumar"
                                        fill
                                        className="object-cover"
                                    />
                                </Link>

                                <div className="flex-1 text-center md:text-left">
                                    <Link href="/founder/prince-kumar" className="block hover:opacity-80 transition-opacity">
                                        <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">Prince Kumar</h3>
                                        <p className="text-primary font-medium mb-4">Founder & CEO</p>
                                    </Link>

                                    <p className="text-slate-600 leading-relaxed mb-6">
                                        Prince is a developer and entrepreneur passionate about building tools that empower creators.
                                        With a background in AI and software development, he recognized the need for a unified platform
                                        that makes AI accessible to creators of all skill levels.
                                    </p>

                                    <Link href="/founder/prince-kumar" className="inline-flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                                        <span>View Full Profile</span>
                                        <ArrowRight className="size-5" />
                                    </Link>

                                    <div className="space-y-3 mb-6 mt-6">
                                        <p className="text-sm text-slate-600">
                                            <strong>Education:</strong> Computer Science & AI
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            <strong>Experience:</strong> Full-stack development, AI/ML, Product Design
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            <strong>Why HubSnap:</strong> "I built HubSnap because I saw creators struggling with tool overload.
                                            My goal is to simplify the creator workflow and democratize access to AI."
                                        </p>
                                    </div>

                                    <div className="flex gap-3 justify-center md:justify-start">
                                        <a
                                            href="https://www.linkedin.com/in/prince-kumar-055950398"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="size-10 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors relative z-10"
                                        >
                                            <Linkedin className="size-5 text-blue-600" />
                                        </a>
                                        <a
                                            href="mailto:prince@hubsnap.com"
                                            onClick={(e) => e.stopPropagation()}
                                            className="size-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors relative z-10"
                                        >
                                            <Mail className="size-5 text-slate-600" />
                                        </a>
                                        <a
                                            href="https://www.instagram.com/prince_gupta0836"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="size-10 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 flex items-center justify-center transition-colors relative z-10"
                                        >
                                            <Instagram className="size-5 text-purple-600" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Milestones */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-3">Our Journey</h2>
                        <p className="text-slate-500 text-lg">Key milestones in building HubSnap</p>
                    </div>

                    <div className="space-y-8">
                        {[
                            { year: "2026", title: "HubSnap Launched", desc: "Platform goes live with Creator OS as flagship product" },
                            { year: "2026", title: "Creator OS Beta", desc: "Released beta version with AI-powered content generation" },
                            { year: "2026", title: "AI Tools Directory", desc: "Catalogued 650+ AI tools for creators" },
                            { year: "2026", title: "Growing Community", desc: "Thousands of creators using HubSnap daily" }
                        ].map((milestone, i) => (
                            <div key={i} className="flex gap-6">
                                <div className="text-primary font-bold text-xl w-16 shrink-0">{milestone.year}</div>
                                <div className="flex-1 pb-8 border-l-2 border-slate-200 pl-6">
                                    <h3 className="font-bold text-lg mb-1">{milestone.title}</h3>
                                    <p className="text-slate-600">{milestone.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Company Instagram */}
            <section className="py-20 px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 mb-4">
                            <Instagram className="size-5 text-purple-600" />
                            <span className="text-purple-600 font-bold text-sm">Follow Us on Instagram</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-3">Join Our Community</h2>
                        <p className="text-slate-500 text-lg">Stay updated with the latest from HubSnap</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Instagram Profile Card */}
                        <a
                            href="https://www.instagram.com/hubsnap_os"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <Card className="p-8 border-slate-200 hover:border-primary hover:shadow-xl transition-all cursor-pointer group">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="size-24 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                                        <Instagram className="size-12" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">@hubsnap_os</h3>
                                        <p className="text-slate-600 text-sm">Official HubSnap Account</p>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Behind-the-scenes, product updates, creator tips, and community highlights
                                    </p>
                                    <Button className="w-full gap-2 group-hover:gap-3 transition-all">
                                        <Instagram className="size-5" />
                                        Follow on Instagram
                                        <ArrowRight className="size-4" />
                                    </Button>
                                </div>
                            </Card>
                        </a>

                        {/* Instagram Feed Preview */}
                        <Card className="p-8 border-slate-200">
                            <h3 className="font-bold text-lg mb-4 text-center">Recent Posts</h3>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div
                                        key={i}
                                        className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center"
                                    >
                                        <Instagram className="size-6 text-slate-400" />
                                    </div>
                                ))}
                            </div>
                            <a
                                href="https://www.instagram.com/hubsnap_os"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-center text-sm text-primary hover:underline font-medium"
                            >
                                View all posts on Instagram →
                            </a>
                        </Card>
                    </div>

                    {/* Instagram Stats */}
                    <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary mb-1">1K+</div>
                            <div className="text-sm text-slate-600">Followers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary mb-1">50+</div>
                            <div className="text-sm text-slate-600">Posts</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary mb-1">Daily</div>
                            <div className="text-sm text-slate-600">Updates</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Join Us CTA */}
            <section className="py-20 px-6 bg-white text-slate-900 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
                    {/* Frosted glass container */}
                    <div className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-12 shadow-[0_10px_40px_rgba(0,0,0,0.15)] animate-fade-in">
                        <Users className="size-16 mx-auto text-primary mb-6 animate-bounce-slow" />
                        <h2 className="text-4xl font-bold mb-4 text-slate-900 animate-slide-up">Join Our Team</h2>
                        <p className="text-slate-600 text-lg mb-8 animate-slide-up animation-delay-200">
                            We're always looking for talented people who share our passion for empowering creators.
                        </p>
                        <Link href="/contact">
                            <Button className="h-14 px-10 rounded-full text-lg font-bold gap-2 shadow-xl shadow-primary/25 bg-primary hover:bg-primary-dark text-white transition-all duration-300 animate-slide-up animation-delay-400">
                                Join Our Team <ArrowRight className="size-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
