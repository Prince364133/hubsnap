import { Target, Users, TrendingUp, Rocket } from "lucide-react";
import { Card } from "@/components/ui/Card";

const personas = [
    {
        icon: Target,
        title: "Beginners",
        pain: "Don't know what content to create?",
        solution: "We guide you step by step from idea to execution."
    },
    {
        icon: Users,
        title: "Students",
        pain: "Exploring digital career options?",
        solution: "Learn practical skills that lead to real income."
    },
    {
        icon: TrendingUp,
        title: "Stuck Creators",
        pain: "Stuck at 0–100 subscribers?",
        solution: "Get daily content plans that actually work."
    },
    {
        icon: Rocket,
        title: "Faceless Creators",
        pain: "Want to create without showing your face?",
        solution: "Perfect for voiceover and AI-generated content."
    }
];

export function WhoIsThisFor() {
    return (
        <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Who Is This For?
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Creator OS is built for anyone serious about building a digital career
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {personas.map((persona, index) => (
                        <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-slate-200">
                            <div className="mb-4">
                                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                    <persona.icon className="size-6 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 mb-2">{persona.title}</h3>
                            </div>
                            <p className="text-sm text-slate-600 mb-3 font-medium">{persona.pain}</p>
                            <p className="text-sm text-primary font-semibold">{persona.solution}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
