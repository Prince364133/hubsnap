"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
    Linkedin,
    Instagram,
    Mail,
    MapPin,
    Briefcase,
    GraduationCap,
    Code,
    Rocket,
    ArrowLeft,
    ExternalLink
} from "lucide-react";

export default function FounderProfilePage() {
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <PublicHeader />

            {/* Back Button */}
            <section className="pt-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <Link href="/about" className="inline-flex items-center gap-2 text-slate-600 hover:text-primary transition-colors">
                        <ArrowLeft className="size-4" />
                        Back to About Us
                    </Link>
                </div>
            </section>

            {/* Hero Section */}
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <Card className="p-8 md:p-12 border-slate-200 relative overflow-hidden">
                        {/* Background Gradient */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary/10 to-purple-500/10" />

                        <div className="relative flex flex-col md:flex-row gap-8 items-start">
                            {/* Profile Image */}
                            <div className="relative size-32 md:size-40 rounded-2xl overflow-hidden shrink-0 shadow-xl border-4 border-white">
                                <Image
                                    src="/founder.png"
                                    alt="Prince Kumar"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1">
                                <h1 className="text-4xl md:text-5xl font-bold mb-2">Prince Kumar</h1>
                                <p className="text-xl text-primary font-medium mb-4">Founder & CEO at HubSnap</p>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    Developer, entrepreneur, and AI enthusiast building tools that empower the next generation of digital creators.
                                    Passionate about making AI accessible to everyone.
                                </p>

                                {/* Social Links */}
                                <div className="flex flex-wrap gap-3">
                                    <a
                                        href="https://www.linkedin.com/in/prince-kumar-055950398"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                                    >
                                        <Linkedin className="size-5" />
                                        Connect on LinkedIn
                                        <ExternalLink className="size-4" />
                                    </a>
                                    <a
                                        href="https://www.instagram.com/prince_gupta0836"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors font-medium"
                                    >
                                        <Instagram className="size-5" />
                                        Follow on Instagram
                                        <ExternalLink className="size-4" />
                                    </a>
                                    <a
                                        href="mailto:prince@hubsnap.com"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg transition-colors font-medium"
                                    >
                                        <Mail className="size-5" />
                                        Email Me
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>

            {/* About Section */}
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        {/* About */}
                        <Card className="p-8 border-slate-200">
                            <h2 className="text-2xl font-bold mb-4">About</h2>
                            <div className="space-y-4 text-slate-600 leading-relaxed">
                                <p>
                                    I'm Prince Kumar, the founder and CEO of HubSnap. I built HubSnap because I saw creators struggling
                                    with tool overload and the complexity of managing multiple AI platforms.
                                </p>
                                <p>
                                    My goal is to democratize access to AI tools and make them accessible to creators of all skill levels.
                                    With a background in computer science and AI, I recognized the need for a unified platform that brings
                                    together the best AI tools, provides data-driven insights, and automates repetitive workflows.
                                </p>
                                <p>
                                    Today, HubSnap powers thousands of creators worldwide, helping them create better content faster and
                                    build sustainable businesses in the digital creator economy.
                                </p>
                            </div>
                        </Card>

                        {/* Experience */}
                        <Card className="p-8 border-slate-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Briefcase className="size-6 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold">Experience</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="border-l-2 border-primary pl-6">
                                    <h3 className="font-bold text-lg">Founder & CEO</h3>
                                    <p className="text-primary font-medium">HubSnap</p>
                                    <p className="text-sm text-slate-500 mb-2">2026 - Present</p>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Building the operating system for digital creators. Leading product development,
                                        AI integration, and platform architecture for HubSnap and Creator OS.
                                    </p>
                                </div>

                                <div className="border-l-2 border-slate-200 pl-6">
                                    <h3 className="font-bold text-lg">Full-Stack Developer</h3>
                                    <p className="text-slate-600 font-medium">Independent</p>
                                    <p className="text-sm text-slate-500 mb-2">2024 - 2026</p>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Developed web applications using modern technologies including React, Next.js, Node.js,
                                        and AI/ML integrations. Specialized in building scalable SaaS platforms.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Education */}
                        <Card className="p-8 border-slate-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="size-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <GraduationCap className="size-6 text-purple-500" />
                                </div>
                                <h2 className="text-2xl font-bold">Education</h2>
                            </div>

                            <div className="border-l-2 border-purple-500 pl-6">
                                <h3 className="font-bold text-lg">Computer Science & Artificial Intelligence</h3>
                                <p className="text-slate-600 font-medium">University</p>
                                <p className="text-sm text-slate-500">Specialized in AI/ML, Software Engineering, and Web Development</p>
                            </div>
                        </Card>

                        {/* Skills */}
                        <Card className="p-8 border-slate-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="size-12 rounded-xl bg-green-50 flex items-center justify-center">
                                    <Code className="size-6 text-green-500" />
                                </div>
                                <h2 className="text-2xl font-bold">Skills & Expertise</h2>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {[
                                    "Full-Stack Development",
                                    "AI/ML Integration",
                                    "React & Next.js",
                                    "Node.js",
                                    "Product Design",
                                    "SaaS Architecture",
                                    "Firebase",
                                    "API Development",
                                    "UI/UX Design",
                                    "Python",
                                    "TypeScript",
                                    "Entrepreneurship"
                                ].map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Info */}
                        <Card className="p-6 border-slate-200">
                            <h3 className="font-bold text-lg mb-4">Contact Information</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Mail className="size-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Email</p>
                                        <a href="mailto:prince@hubsnap.com" className="text-sm text-primary hover:underline">
                                            prince@hubsnap.com
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="size-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Location</p>
                                        <p className="text-sm text-slate-600">India</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Instagram Feed */}
                        <Card className="p-6 border-slate-200">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Instagram className="size-5 text-pink-500" />
                                Instagram
                            </h3>
                            <div className="space-y-4">
                                <p className="text-sm text-slate-600">Follow my journey on Instagram</p>
                                <a
                                    href="https://www.instagram.com/prince_gupta0836"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <div className="aspect-square bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center text-white hover:scale-105 transition-transform">
                                        <div className="text-center">
                                            <Instagram className="size-12 mx-auto mb-2" />
                                            <p className="font-bold">@prince_gupta0836</p>
                                            <p className="text-sm opacity-90">View Profile</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </Card>

                        {/* Quick Links */}
                        <Card className="p-6 border-slate-200">
                            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                            <div className="space-y-2">
                                <Link href="/products/creator-os" className="block text-sm text-slate-600 hover:text-primary transition-colors">
                                    → Creator OS
                                </Link>
                                <Link href="/about" className="block text-sm text-slate-600 hover:text-primary transition-colors">
                                    → About HubSnap
                                </Link>
                                <Link href="/contact" className="block text-sm text-slate-600 hover:text-primary transition-colors">
                                    → Get in Touch
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-slate-50">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <Rocket className="size-16 mx-auto text-primary" />
                    <h2 className="text-3xl font-bold">Let's Build Something Amazing</h2>
                    <p className="text-slate-600 text-lg">
                        Interested in collaborating or have questions about HubSnap? I'd love to hear from you.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/contact">
                            <Button className="h-12 px-8 rounded-full font-bold">
                                Get in Touch
                            </Button>
                        </Link>
                        <a
                            href="https://www.linkedin.com/in/prince-kumar-055950398"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" className="h-12 px-8 rounded-full font-bold gap-2">
                                <Linkedin className="size-5" />
                                Connect on LinkedIn
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
