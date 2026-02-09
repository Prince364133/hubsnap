import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/Card";

const faqs = [
    {
        question: "Is this free to start?",
        answer: "Yes! We offer a free plan with access to basic features. You can explore channel ideas, get content suggestions, and use our tools without paying anything. Upgrade to Pro when you're ready for advanced features."
    },
    {
        question: "Do I need to show my face?",
        answer: "Absolutely not! Creator OS is perfect for faceless content creators. We provide voiceover scripts, stock footage suggestions, and AI-generated visuals. Many successful creators never show their face."
    },
    {
        question: "Is this for beginners?",
        answer: "Yes! Creator OS is specifically designed for beginners. We guide you from zero to your first video with step-by-step instructions, templates, and daily action plans. No prior experience needed."
    },
    {
        question: "Will this work in India?",
        answer: "Absolutely! Creator OS works globally. We support Indian creators with INR pricing (₹259/month for Pro), local payment methods via Razorpay, and content ideas relevant to Indian audiences."
    },
    {
        question: "Do I need expensive tools?",
        answer: "No! We recommend free or affordable tools like Canva, CapCut, and Pexels. You can start with just a smartphone and free software. We show you how to create professional content on a budget."
    },
    {
        question: "How is this different from YouTube courses?",
        answer: "Courses teach theory. Creator OS gives you daily execution. Instead of watching hours of videos, you get actionable content plans, scripts, and assets every single day. It's a system, not a course."
    },
    {
        question: "Can I cancel anytime?",
        answer: "Yes! No long-term contracts. Cancel your subscription anytime from your account settings. Your data and saved ideas remain accessible even on the free plan."
    },
    {
        question: "Do you guarantee results?",
        answer: "No. We don't make income promises. Your success depends on your effort, consistency, niche selection, and content quality. We provide the tools and guidance—you provide the work."
    }
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-20 bg-slate-50">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-xl text-slate-600">
                        Everything you need to know before getting started
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <Card key={index} className="overflow-hidden border-slate-200">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                            >
                                <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp className="size-5 text-slate-600 flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="size-5 text-slate-600 flex-shrink-0" />
                                )}
                            </button>
                            {openIndex === index && (
                                <div className="px-6 pb-4 text-slate-600">
                                    {faq.answer}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
