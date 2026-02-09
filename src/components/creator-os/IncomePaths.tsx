import { DollarSign, Users, TrendingUp, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/Card";

const incomePaths = [
    {
        icon: DollarSign,
        title: "Affiliate Content",
        description: "Promote products you believe in and earn commissions",
        example: "Tech reviews, software tutorials, product comparisons"
    },
    {
        icon: Briefcase,
        title: "Service-Based Creators",
        description: "Build authority and attract high-paying clients",
        example: "Consulting, coaching, freelance services"
    },
    {
        icon: Users,
        title: "Personal Brand Growth",
        description: "Grow your audience and monetize through multiple streams",
        example: "Courses, memberships, sponsorships"
    },
    {
        icon: TrendingUp,
        title: "Freelance Opportunities",
        description: "Use your content skills to land freelance gigs",
        example: "Video editing, scriptwriting, content strategy"
    }
];

export function IncomePaths() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Income Paths (Ethical & Real)
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-6">
                        We don't promise income. We show you the paths.
                    </p>
                    <div className="inline-block bg-amber-50 border border-amber-200 rounded-lg px-6 py-3">
                        <p className="text-sm text-amber-900 font-medium">
                            ⚠️ Results depend on your effort, consistency, and market conditions
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {incomePaths.map((path, index) => (
                        <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-slate-200">
                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <path.icon className="size-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-slate-900 mb-2">{path.title}</h3>
                                    <p className="text-slate-600 mb-3">{path.description}</p>
                                    <p className="text-sm text-slate-500 italic">
                                        Examples: {path.example}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
