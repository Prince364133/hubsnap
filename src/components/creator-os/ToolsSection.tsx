import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { ExternalLink } from "lucide-react";

const tools = [
    {
        name: "Google AI Studio",
        description: "Free AI models for content generation",
        logo: "https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg"
    },
    {
        name: "Pexels",
        description: "Free stock photos and videos",
        logo: "https://images.pexels.com/lib/api/pexels-white.png"
    },
    {
        name: "Canva",
        description: "Design thumbnails and graphics",
        logo: "https://static.canva.com/web/images/12487a1e0770d29351bd4ce4f87ec8fe.svg"
    },
    {
        name: "CapCut",
        description: "Free video editing software",
        logo: "https://lf16-web-buz.capcut.com/obj/capcut-web-buz-us/ies/lvweb_os_monorepo/platformSSR/capcut_share_icon.png"
    }
];

export function ToolsSection() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Tools You'll Learn to Use
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Use the right tools, not 100 useless ones
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tools.map((tool, index) => (
                        <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-slate-200 text-center">
                            <div className="size-16 mx-auto mb-4 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                                <div className="text-2xl font-bold text-slate-600">{tool.name[0]}</div>
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 mb-2">{tool.name}</h3>
                            <p className="text-sm text-slate-600">{tool.description}</p>
                        </Card>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-600">
                        All tools are <span className="font-semibold text-green-600">free or affordable</span> — no expensive subscriptions required
                    </p>
                </div>
            </div>
        </section>
    );
}
