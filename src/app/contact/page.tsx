"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
    Zap,
    Mail,
    Send,
    MapPin,
    Linkedin,
    Twitter,
    Github,
    CheckCircle2
} from "lucide-react";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "General Inquiry",
        message: ""
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement actual form submission
        console.log("Form submitted:", formData);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <PublicHeader />

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                        Get in <span className="text-primary italic">Touch</span>
                    </h1>
                    <p className="text-xl text-slate-500 leading-relaxed">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </section>

            {/* Contact Form & Info */}
            <section className="py-16 px-6">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="p-8 border-slate-200">
                            <h2 className="text-2xl font-bold mb-6">Send us a message</h2>

                            {submitted && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                                    <CheckCircle2 className="size-5" />
                                    <span className="font-medium">Message sent successfully! We'll get back to you soon.</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Subject *
                                    </label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Product Support">Product Support</option>
                                        <option value="Partnership">Partnership</option>
                                        <option value="Press/Media">Press/Media</option>
                                        <option value="Bug Report">Bug Report</option>
                                        <option value="Feature Request">Feature Request</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                        placeholder="Tell us how we can help..."
                                    />
                                </div>

                                <Button type="submit" className="w-full h-12 gap-2">
                                    <Send className="size-4" />
                                    Send Message
                                </Button>
                            </form>
                        </Card>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <Card className="p-6 border-slate-200">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Mail className="size-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Email</h3>
                                    <a href="mailto:support@hubsnap.com" className="text-sm text-slate-600 hover:text-primary transition-colors">
                                        support@hubsnap.com
                                    </a>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 border-slate-200">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="size-10 rounded-lg bg-purple/10 flex items-center justify-center shrink-0">
                                    <MapPin className="size-5 text-purple-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Location</h3>
                                    <p className="text-sm text-slate-600">Remote-First Company</p>
                                    <p className="text-sm text-slate-600">Based in India</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 border-slate-200">
                            <h3 className="font-bold mb-4">Follow Us</h3>
                            <div className="flex gap-3">
                                <a
                                    href="https://www.linkedin.com/in/prince-kumar-055950398"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="size-10 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors"
                                >
                                    <Linkedin className="size-5 text-blue-600" />
                                </a>
                                <a
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="size-10 rounded-lg bg-sky-50 hover:bg-sky-100 flex items-center justify-center transition-colors"
                                >
                                    <Twitter className="size-5 text-sky-600" />
                                </a>
                                <a
                                    href="https://github.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="size-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                >
                                    <Github className="size-5 text-slate-600" />
                                </a>
                            </div>
                        </Card>

                        <Card className="p-6 border-slate-200 bg-slate-50">
                            <h3 className="font-bold mb-2">Support Hours</h3>
                            <p className="text-sm text-slate-600 mb-1">Monday - Friday</p>
                            <p className="text-sm text-slate-600">9:00 AM - 6:00 PM IST</p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-3">Frequently Asked Questions</h2>
                        <p className="text-slate-500 text-lg">Quick answers to common questions</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "How do I get started with Creator OS?",
                                a: "Simply sign up for a free account and you'll have immediate access to the dashboard. No credit card required!"
                            },
                            {
                                q: "What's included in the free plan?",
                                a: "The free plan includes 5 channel ideas per month, 10 content packs, basic analytics, and access to our AI tools directory."
                            },
                            {
                                q: "Can I upgrade or downgrade my plan?",
                                a: "Yes! You can upgrade or downgrade at any time from your account settings. Changes take effect immediately."
                            },
                            {
                                q: "Do you offer refunds?",
                                a: "We offer a 30-day money-back guarantee on all premium plans. No questions asked."
                            },
                            {
                                q: "How can I report a bug?",
                                a: "Use the contact form above and select 'Bug Report' as the subject. Include as much detail as possible."
                            }
                        ].map((faq, i) => (
                            <Card key={i} className="p-6 border-slate-200">
                                <h3 className="font-bold mb-2">{faq.q}</h3>
                                <p className="text-slate-600">{faq.a}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
