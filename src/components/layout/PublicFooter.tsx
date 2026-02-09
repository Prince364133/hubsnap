import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { BackToTop } from "@/components/ui/BackToTop";
import { Twitter, Instagram, Linkedin, Github } from "lucide-react";

export function PublicFooter() {
    return (
        <>
            <footer className="relative mt-24 border-t border-slate-200/60 overflow-hidden">
                <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-3xl -z-10" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] -z-10" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -z-10" />

                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                        {/* Brand Column - 4 Cols */}
                        <div className="md:col-span-4 space-y-6">
                            <Link href="/" className="inline-flex items-center gap-4 group">
                                <BrandLogo size="md" className="origin-left" />
                            </Link>
                            <p className="text-slate-500 text-base leading-relaxed max-w-sm">
                                The operating system for modern creators. From idea to income, we provide the AI tools and blueprints you need to scale.
                            </p>
                            <div className="flex items-center gap-3 pt-2">
                                {[
                                    { icon: Twitter, href: "#", color: "hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10" },
                                    { icon: Instagram, href: "#", color: "hover:text-[#E1306C] hover:bg-[#E1306C]/10" },
                                    { icon: Linkedin, href: "#", color: "hover:text-[#0077B5] hover:bg-[#0077B5]/10" },
                                    { icon: Github, href: "#", color: "hover:text-slate-900 hover:bg-slate-100" }
                                ].map((social, i) => (
                                    <Link
                                        key={i}
                                        href={social.href}
                                        className={`p-3 bg-white border border-slate-200 rounded-full text-slate-400 transition-all duration-300 ${social.color} hover:scale-110 shadow-sm`}
                                    >
                                        <social.icon className="size-5" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Links Columns - 8 Cols */}
                        <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                            <div>
                                <h3 className="font-bold text-slate-900 mb-6 text-lg">Product</h3>
                                <ul className="space-y-4 text-slate-500 font-medium">
                                    <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
                                    <li><Link href="/products/creator-os" className="hover:text-primary transition-colors">Creator OS</Link></li>
                                    <li><Link href="/digital-business-ideas" className="hover:text-primary transition-colors">Digital Business Ideas</Link></li>
                                    <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 mb-6 text-lg">Resources</h3>
                                <ul className="space-y-4 text-slate-500 font-medium">
                                    <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                                    <li><Link href="/explore" className="hover:text-primary transition-colors">Free Tools</Link></li>
                                    <li><Link href="/founder/prince-kumar" className="hover:text-primary transition-colors">Founder Story</Link></li>
                                    <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 mb-6 text-lg">Company</h3>
                                <ul className="space-y-4 text-slate-500 font-medium">
                                    <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                                    <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                                    <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                                    <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400 font-medium">
                        <p>© 2026 <span className="text-sky-500 font-bold">HUBSNAP</span> All rights reserved.</p>
                        <div className="flex items-center gap-6">
                            <span>Made with ❤️ for creators</span>
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                            <span>New Delhi, India 🇮🇳</span>
                        </div>
                    </div>
                </div>
            </footer>
            <BackToTop />
        </>
    );
}
