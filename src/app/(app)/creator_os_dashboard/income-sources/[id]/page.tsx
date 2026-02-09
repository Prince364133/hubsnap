import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, CheckCircle, AlertTriangle, FileText, BadgeDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Mock Data for Guides
const GUIDE_DATA: Record<string, any> = {
    "amazon-associates": {
        title: "Amazon Associates",
        description: "Earn commissions by recommending products you use.",
        time: "1-2 Months",
        risk: "Low",
        steps: [
            "Sign up at affiliate-program.amazon.com",
            "Create a 'Kit' or list of gear you actually use",
            "Add the disclaimer 'As an Amazon Associate I earn from qualifying purchases' to your descriptions",
            "Paste links in your pinned comment and description"
        ],
        mistakes: [
            "Posting links without a disclaimer (Illegal)",
            "Asking friends to click your links (Ban risk)",
            "Linking to products you haven't mentioned in the video"
        ]
    },
    "youtube-adsense": {
        title: "YouTube AdSense",
        description: "Get paid automatically for views on your videos.",
        time: "6-12 Months",
        risk: "Medium (Policy Checks)",
        steps: [
            "Reach 1,000 Subscribers",
            "Reach 4,000 Watch Hours (or 10M Short views)",
            "Apply in YouTube Studio > Earn tab",
            "Verify your address with the PIN mailed to you"
        ],
        mistakes: [
            "Reusing TikTok content (Copyright issues)",
            "Buying subscribers (Destroys channel growth)",
            "Clicking your own ads"
        ]
    },
    "brand-sponsorships": {
        title: "Brand Sponsorships",
        description: "Get paid by companies to talk about their products.",
        time: "6+ Months",
        risk: "High (Reputation)",
        steps: [
            "Create a 'Media Kit' (PDF with your stats)",
            "Put your business email in your channel 'About' section",
            "Reach out to brands you already use",
            "Negotiate a flat fee + potential affiliate bonus"
        ],
        mistakes: [
            "Promoting scams or low-quality products",
            "Not disclosing it's an #ad",
            "Reading the script monotonously"
        ]
    }
};

export function generateStaticParams() {
    return Object.keys(GUIDE_DATA).map((id) => ({ id }));
}

export default async function IncomeDetail(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const guide = GUIDE_DATA[id];

    if (!guide) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold">Guide Not Found</h2>
                <Link href="/creator_os_dashboard/income-sources">
                    <Button className="mt-4">Go Back</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/creator_os_dashboard/income-sources" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                <ArrowLeft className="size-4" /> Back to Income Sources
            </Link>

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">{guide.title}</h1>
                    <p className="text-lg text-text-secondary mt-1">{guide.description}</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100">
                        ⏱ {guide.time}
                    </span>
                    <span className={cn("px-3 py-1 rounded-full text-sm font-semibold border",
                        guide.risk.includes("Low") ? "bg-green-50 text-green-700 border-green-100" :
                            guide.risk.includes("Medium") ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                                "bg-red-50 text-red-700 border-red-100"
                    )}>
                        ⚠️ Risk: {guide.risk}
                    </span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle className="size-5 text-green-600" /> Action Plan
                        </h3>
                        <ul className="space-y-4">
                            {guide.steps.map((step: string, i: number) => (
                                <li key={i} className="flex gap-3 text-sm text-text-primary">
                                    <span className="font-bold text-gray-400">{i + 1}.</span>
                                    {step}
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card className="p-6 border-red-100 bg-red-50/30">
                        <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="size-5 text-red-600" /> Common Mistakes
                        </h3>
                        <ul className="space-y-2">
                            {guide.mistakes.map((mistake: string, i: number) => (
                                <li key={i} className="flex gap-2 text-sm text-red-800">
                                    <span>•</span>
                                    {mistake}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="p-6 bg-gray-900 text-white">
                        <h3 className="font-bold mb-2 flex items-center gap-2">
                            <FileText className="size-5" /> Example Content
                        </h3>
                        <p className="text-sm text-gray-300 italic mb-4">
                            "Top 5 Gadgets I Actually Use"
                        </p>
                        <p className="text-sm text-gray-300">
                            Create a video solving a problem using the product. Don't just sell it, show how it helps.
                        </p>
                        <div className="mt-6 p-4 bg-gray-800 rounded border border-gray-700">
                            <span className="text-xs uppercase text-gray-500 font-bold block mb-2">Compliance Note</span>
                            <p className="text-xs text-gray-400">
                                Always verbally say "This video contains affiliate links" or use the YouTube "Paid Promotion" checkbox.
                            </p>
                        </div>
                    </Card>

                    <Card className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                        <BadgeDollarSign className="size-12 text-primary opacity-20" />
                        <div>
                            <h3 className="font-bold text-text-primary">Ready to apply?</h3>
                            <p className="text-sm text-text-secondary">If you meet the requirements, start today.</p>
                        </div>
                        <Button className="w-full">Open External Portal</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
