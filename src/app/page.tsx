
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CreatorOSHighlight } from "@/components/home/CreatorOSHighlight";
import { AdvancedRevenueCalculator } from "@/components/home/AdvancedRevenueCalculator";

import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Zap,
  TrendingUp,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { Metadata } from "next";
import { websiteConfigService } from "@/lib/website-config";

export const metadata: Metadata = {
  title: "HubSnap - AI Tools & Analytics for Modern Creators",
  description: "Scale your creative business with HubSnap. AI-powered trend detection, script generation, and advanced analytics for YouTube, Instagram, and TikTok creators.",
  keywords: ["creator tools", "AI for creators", "YouTube analytics", "trend detector", "content generation", "influencer marketing"],
  openGraph: {
    title: "HubSnap - AI Tools for Creators",
    description: "Everything you need to scale your content business. Stop guessing, start growing.",
    images: ["/og-home.png"],
  }
};

export default async function LandingPage() {
  const config = await websiteConfigService.getConfig();

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 font-sans">
      <PublicHeader />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 relative z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="size-3" /> Now with AI Script Generation
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              {config.hero.headline}
            </h1>
            <p className="text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {config.hero.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link href="/signup">
                <Button className="h-14 px-8 rounded-full text-lg font-bold gap-2 group shadow-xl shadow-primary/25">
                  {config.hero.ctaText} <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/creator_os_dashboard/home">
                <Button variant="outline" className="h-14 px-8 rounded-full text-lg font-bold border-2">
                  Live Demo
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500" /> No Card Required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500" /> Start in 60s
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-purple-500/10 blur-3xl rounded-full" />
            <Card className="relative border-slate-200 shadow-2xl overflow-hidden rounded-2xl">
              <div className="relative aspect-video w-full">
                <Image
                  src={config.hero.imageUrl || "/hero.png"}
                  alt={config.hero.headline}
                  fill
                  className="object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                  priority
                  unoptimized // Fix for broken images on Firebase Hosting
                />
                <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2">
                  <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                  Live System
                </div>
                <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-lg text-xs font-medium shadow-lg">
                  AI Trend Analysis Active
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />
            </Card>
          </div>
        </div>
      </section>

      {/* Creator OS Highlight */}
      <CreatorOSHighlight />

      {/* Advanced Revenue Calculator */}
      <AdvancedRevenueCalculator />

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold">Everything you need to scale</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg italic">
            "If you aren't using data, you're just gambling with your time."
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Trend Detector",
              desc: "Spot viral topics 48 hours before the curve hits. Maximize your CTR instantly.",
              icon: TrendingUp,
              color: "text-blue-500",
              bg: "bg-blue-50"
            },
            {
              title: "AI Script Engine",
              desc: "Generate high-retention scripts in seconds using LLMs trained on 1M+ viral videos.",
              icon: Zap,
              color: "text-amber-500",
              bg: "bg-amber-50"
            },
            {
              title: "Advanced Analytics",
              desc: "Connect your YouTube API for deep insights on audience cohorts and retention.",
              icon: BarChart3,
              color: "text-purple-500",
              bg: "bg-purple-50"
            }
          ].map((f, i) => (
            <Card key={i} className="p-8 border-slate-200 glow-card group">
              <div className={`size-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${f.bg}`}>
                <f.icon className={`size-6 ${f.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="text-xl font-black italic tracking-tighter">YouTube</div>
          <div className="text-xl font-black italic tracking-tighter">Vimeo</div>
          <div className="text-xl font-black italic tracking-tighter">Twitch</div>
          <div className="text-xl font-black italic tracking-tighter">Tiktok</div>
          <div className="text-xl font-black italic tracking-tighter">Instagram</div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">From Idea to Published in Minutes</h2>
            <p className="text-xl text-slate-500">
              Stop juggling 10 different tools. HubSnap streamlines your entire creative workflow into one powerful system.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200" />

            {[
              {
                step: "01",
                title: "Discover Trends",
                desc: "Our AI scans millions of data points to find rising topics in your niche before they go viral.",
                color: "bg-blue-600"
              },
              {
                step: "02",
                title: "Generate Content",
                desc: "Create scripts, thumbnails, and descriptions instantly with fine-tuned AI models.",
                color: "bg-purple-600"
              },
              {
                step: "03",
                title: "Optimize & Grow",
                desc: "Track performance and get actionable insights to double your improved reach.",
                color: "bg-pink-600"
              }
            ].map((s, i) => (
              <div key={i} className="relative text-center space-y-6 group">
                <div className={`size-24 rounded-3xl ${s.color} text-white text-3xl font-black flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform relative z-10`}>
                  {s.step}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">{s.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Trusted by 10,000+ Creators</h2>
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg key={i} className="size-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-slate-600">Rated 4.9/5 stars by the community</p>
        </div>

        {/* Scrolling Marquee */}
        <div className="relative flex overflow-x-hidden group">
          <div className="animate-marquee whitespace-nowrap flex gap-8 py-4">
            {[
              {
                quote: "I've tried every tool out there. HubSnap is the only one that actually saves me time.",
                author: "Sarah J.",
                role: "Tech YouTuber (500K Subs)"
              },
              {
                quote: "The script generation is scary good. It understands my tone perfectly.",
                author: "Mike R.",
                role: "Fitness Coach"
              },
              {
                quote: "Finally, a dashboard that makes sense. Trend detection paid for itself 10x.",
                author: "Jessica L.",
                role: "Digital Marketer"
              },
              {
                quote: "I doubled my upload consistency in two weeks. The daily prompts are a game changer.",
                author: "David K.",
                role: "Lifestyle Vlogger"
              },
              {
                quote: "The best investment I've made for my channel this year. Highly recommended.",
                author: "Amanda B.",
                role: "DIY Creator"
              },
              {
                quote: "From idea to script in minutes. I can finally focus on filming.",
                author: "James T.",
                role: "Edu-Tuber"
              },
              {
                quote: "The analytics are way easier to understand than YouTube Studio.",
                author: "Emily C.",
                role: "Beauty Influencer"
              },
              {
                quote: "HubSnap helped me find a niche that I actually enjoy and makes money.",
                author: "Chris P.",
                role: "Gaming Streamer"
              },
              // Duplicate for infinite scroll
              {
                quote: "I've tried every tool out there. HubSnap is the only one that actually saves me time.",
                author: "Sarah J.",
                role: "Tech YouTuber (500K Subs)"
              },
              {
                quote: "The script generation is scary good. It understands my tone perfectly.",
                author: "Mike R.",
                role: "Fitness Coach"
              },
              {
                quote: "Finally, a dashboard that makes sense. Trend detection paid for itself 10x.",
                author: "Jessica L.",
                role: "Digital Marketer"
              },
              {
                quote: "I doubled my upload consistency in two weeks. The daily prompts are a game changer.",
                author: "David K.",
                role: "Lifestyle Vlogger"
              },
              {
                quote: "The best investment I've made for my channel this year. Highly recommended.",
                author: "Amanda B.",
                role: "DIY Creator"
              },
              {
                quote: "From idea to script in minutes. I can finally focus on filming.",
                author: "James T.",
                role: "Edu-Tuber"
              },
              {
                quote: "The analytics are way easier to understand than YouTube Studio.",
                author: "Emily C.",
                role: "Beauty Influencer"
              },
              {
                quote: "HubSnap helped me find a niche that I actually enjoy and makes money.",
                author: "Chris P.",
                role: "Gaming Streamer"
              }
            ].map((t, i) => (
              <Card key={i} className="inline-block w-[350px] p-8 border-slate-200 bg-white hover:shadow-lg transition-shadow whitespace-normal">
                <div className="mb-6 text-primary">
                  <svg className="size-10 opacity-20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21L14.017 18C14.017 16.0547 14.456 14.5916 15.334 13.6108C16.909 11.8492 18.257 11.4883 18.257 9.5C18.257 8.11929 17.1377 7 15.757 7C14.3763 7 13.257 8.11929 13.257 9.5H10.257C10.257 6.46243 12.7194 4 15.757 4C18.7946 4 21.257 6.46243 21.257 9.5C21.257 13.5 18.257 15 18.257 18V21H14.017ZM6.76697 21L6.76697 18C6.76697 16.0547 7.20597 14.5916 8.08397 13.6108C9.65897 11.8492 11.007 11.4883 11.007 9.5C11.007 8.11929 9.88767 7 8.50697 7C7.12627 7 6.00697 8.11929 6.00697 9.5H3.00697C3.00697 6.46243 5.4694 4 8.50697 4C11.5445 4 14.007 6.46243 14.007 9.5C14.007 13.5 11.007 15 11.007 18V21H6.76697Z" />
                  </svg>
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed italic">"{t.quote}"</p>
                <div>
                  <div className="font-bold text-slate-900">{t.author}</div>
                  <div className="text-sm text-slate-500">{t.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
