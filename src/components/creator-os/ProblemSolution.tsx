import { X, Check } from "lucide-react";

const problems = [
    "Too many fake gurus",
    "No clarity on niche selection",
    "AI tools are confusing",
    "Content with no income path"
];

const solutions = [
    "Curated, proven channel ideas",
    "Daily execution system",
    "AI used practically, not blindly",
    "Income-first guidance"
];

export function ProblemSolution() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        We Understand Your Pain
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        The creator economy is full of noise. We cut through it.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Problems */}
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
                        <h3 className="text-2xl font-bold text-red-900 mb-6 flex items-center gap-2">
                            <X className="size-6" />
                            Common Problems
                        </h3>
                        <ul className="space-y-4">
                            {problems.map((problem, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <X className="size-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-700">{problem}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Solutions */}
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
                        <h3 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
                            <Check className="size-6" />
                            Creator OS Solution
                        </h3>
                        <ul className="space-y-4">
                            {solutions.map((solution, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <Check className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-700">{solution}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
