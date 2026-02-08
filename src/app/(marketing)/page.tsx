"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Zap,
  TrendingUp,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Globe
} from "lucide-react";

export default function LandingPage() {
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
              AI-Powered Tools for <span className="text-primary italic">Modern</span> Creators
            </h1>
            <p className="text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              HubSnap brings together the best AI tools, data-driven insights, and proven frameworks to help creators build sustainable businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link href="/signup">
                <Button className="h-14 px-8 rounded-full text-lg font-bold gap-2 group shadow-xl shadow-primary/25">
                  Start For Free <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard/home">
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
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
                  alt="Dashboard Preview"
                  fill
                  className="object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                  priority
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />
            </Card>
          </div>
        </div>
      </section>

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
            <Card key={i} className="p-8 border-slate-200 hover:border-primary transition-all group">
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

      {/* Call to Action */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-8 bg-black text-white p-12 rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 blur-[100px]" />

          <h2 className="text-4xl font-bold relative z-10 leading-tight">
            Ready to join the top 1% of creators?
          </h2>
          <p className="text-slate-400 text-lg relative z-10 max-w-lg mx-auto">
            Stop burning hours on manual research. Let Creator OS handle the data so you can handle the art.
          </p>
          <div className="pt-4 relative z-10">
            <Link href="/signup">
              <Button className="h-14 px-10 rounded-full text-lg font-bold bg-white text-black hover:bg-slate-100 shadow-2xl">
                Join Now for Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
