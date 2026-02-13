"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader2, Youtube, Instagram, Check, ArrowRight, ArrowLeft, Search, ChevronDown, ChevronUp, Calendar, Zap, Video, Film, Edit, Brain } from "lucide-react";
import { generateChannelNames, generateChannelBranding } from "@/lib/ai-logic";
import { toast } from "sonner";
import { dbService } from "@/lib/firestore";
import { NICHE_CATEGORIES } from "@/lib/data";
import { useAuth } from "@/context/AuthContext";

type Step = "platform" | "categories" | "topics" | "language" | "format" | "frequency" | "working-days" | "editing-style" | "curation" | "generating-names" | "name-selection" | "generating-branding" | "review";

const EDITING_STYLES = [
    { id: "fast-paced", name: "Fast-Paced", icon: Zap, desc: "High energy, quick cuts, retention focused." },
    { id: "cinematic", name: "Cinematic", icon: Film, desc: "High quality, B-roll heavy, storytelling." },
    { id: "documentary", name: "Documentary", icon: Video, desc: "Informative, deep dives, investigative." },
    { id: "meme", name: "Meme / Funny", icon: Brain, desc: "Humorous, trendy, quick engagement." },
    { id: "educational", name: "Educational", icon: Edit, desc: "Clean, clear visuals, text overlays." },
    { id: "minimal", name: "Minimalist", icon: Check, desc: "Simple, focused, aesthetic." },
];

const CURATION_STYLES = [
    { id: "fully-ai", name: "Fully AI Generated", desc: "AI writes, visualizes, and edits content." },
    { id: "ai-assisted", name: "AI + Manual Edit", desc: "AI provides the base, you polish the final cut." },
];

export function AddProfileWizard() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState<Step>("platform");
    const [loading, setLoading] = useState(false);

    // Form Data
    const [platform, setPlatform] = useState<"youtube" | "instagram">("youtube");

    // Step 2 & 3: Niches & Topics
    const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
    const [generatedTopics, setGeneratedTopics] = useState<string[]>([]); // Dynamic topics based on niche
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [displayLimit, setDisplayLimit] = useState(10);

    // Step 4-9: Config
    const [language, setLanguage] = useState("English");
    const [contentFormat, setContentFormat] = useState("Shorts / Reels (Vertical)");
    const [frequency, setFrequency] = useState("Daily");
    const [workingDays, setWorkingDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    const [editingStyle, setEditingStyle] = useState("fast-paced");
    const [curation, setCuration] = useState("fully-ai");

    // Generated Data
    const [generatedNames, setGeneratedNames] = useState<string[]>([]);
    const [selectedName, setSelectedName] = useState<string>("");
    const [brandingPack, setBrandingPack] = useState<any>(null);

    // --- Handlers ---

    const toggleNiche = (niche: string) => {
        if (selectedNiches.includes(niche)) {
            setSelectedNiches(selectedNiches.filter(n => n !== niche));
        } else {
            if (selectedNiches.length >= 3) return;
            setSelectedNiches([...selectedNiches, niche]);
        }
    };

    const toggleDay = (day: string) => {
        if (workingDays.includes(day)) {
            setWorkingDays(workingDays.filter(d => d !== day));
        } else {
            setWorkingDays([...workingDays, day]);
        }
    };

    // Transition Logic
    const nextStep = async () => {
        switch (step) {
            case "platform": setStep("categories"); break;
            case "categories":
                // Generate dynamic topics for Step 3
                const newTopics = selectedNiches.flatMap(n => [n + " for Beginners", "Advanced " + n, n + " News", n + " Hacks"]);
                setGeneratedTopics(newTopics);
                setStep("topics");
                break;
            case "topics": setStep("language"); break;
            case "language": setStep("format"); break;
            case "format": setStep("frequency"); break;
            case "frequency": setStep("working-days"); break;
            case "working-days": setStep("editing-style"); break;
            case "editing-style": setStep("curation"); break;
            case "curation": await handleNamesGenerate(); break; // Trigger AI Name Gen
        }
    };

    const handleNamesGenerate = async () => {
        setStep("generating-names");
        try {
            const contextStr = selectedNiches.join(", ") + " focusing on " + selectedTopics.join(", ");
            const names = await generateChannelNames(contextStr, platform);
            setGeneratedNames(names);
            setStep("name-selection");
        } catch (e) {
            console.error(e);
            toast.error("Failed to generate names.");
        } finally {
            setLoading(false);
        }
    };

    const handleBrandingGenerate = async (name: string) => {
        setSelectedName(name);
        setStep("generating-branding");
        try {
            const contextStr = selectedNiches.join(", ");
            const pack = await generateChannelBranding(name, contextStr, platform, {
                language,
                style: editingStyle // Pass editing style to AI for SOP generation context
            });
            setBrandingPack(pack);
            setStep("review");
        } catch (e) {
            console.error(e);
            toast.error("Failed to create branding pack.");
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSave = async () => {
        if (!brandingPack || !selectedName || !user) return;
        setLoading(true);
        try {
            await dbService.addChannel(user.uid, {
                userId: user.uid,
                platform: platform,
                name: selectedName,
                handle: "@" + selectedName.replace(/\\s/g, "").toLowerCase(),
                stats: { followers: 0, posts: 0 },
                schedule: {
                    frequency: frequency === "Daily" ? 7 : 3,
                    workingDays
                },
                details: {
                    niche: selectedNiches,
                    topics: selectedTopics,
                    language,
                    format: contentFormat,
                    editingStyle,
                    curation
                },
                branding: brandingPack.branding,
                createdAt: new Date().toISOString(),
                status: 'active'
            } as any);

            router.push("/creator_os_dashboard/home");
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    // --- Steps Render ---

    const PlatformStep = () => (
        <div className="space-y-6 text-center animate-in fade-in">
            <h2 className="text-2xl font-bold">1. Select Platform</h2>
            <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
                <button onClick={() => { setPlatform("youtube"); nextStep(); }} className="group p-8 border-2 border-border hover:border-red-500 rounded-2xl transition-all bg-surface-50 hover:bg-red-50">
                    <Youtube className="size-12 mx-auto text-red-600 mb-4 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-lg">YouTube</span>
                </button>
                <button onClick={() => { setPlatform("instagram"); nextStep(); }} className="group p-8 border-2 border-border hover:border-pink-500 rounded-2xl transition-all bg-surface-50 hover:bg-pink-50">
                    <Instagram className="size-12 mx-auto text-pink-600 mb-4 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-lg">Instagram</span>
                </button>
            </div>
        </div>
    );

    const CategoriesStep = () => {
        const filteredCategories = searchQuery
            ? NICHE_CATEGORIES.map(cat => ({
                ...cat,
                niches: cat.niches.filter(n => n.toLowerCase().includes(searchQuery.toLowerCase()))
            })).filter(cat => cat.niches.length > 0)
            : NICHE_CATEGORIES;

        return (
            <div className="space-y-4 h-full flex flex-col">
                <h2 className="text-2xl font-bold text-center">2. Select Niches (Max 3)</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-3.5 size-5 text-gray-400" />
                    <input type="text" placeholder="Search..." className="w-full pl-10 p-3 rounded-lg border" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {filteredCategories.map(category => (
                        <div key={category.id} className="border rounded-xl bg-white">
                            <button onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)} className="w-full flex justify-between p-4 hover:bg-surface-50">
                                <span className="font-semibold">{category.name}</span>
                                {expandedCategory === category.id ? <ChevronUp className="size-5 text-gray-400" /> : <ChevronDown className="size-5 text-gray-400" />}
                            </button>
                            {(expandedCategory === category.id || searchQuery) && (
                                <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                                    {category.niches.slice(0, searchQuery ? undefined : displayLimit).map((niche) => (
                                        <button key={niche} onClick={() => toggleNiche(niche)} disabled={!selectedNiches.includes(niche) && selectedNiches.length >= 3} className={`text-sm p-3 rounded-lg border text-left transition-all ${selectedNiches.includes(niche) ? 'bg-primary/10 border-primary text-primary font-medium' : 'bg-surface-50 hover:bg-surface-100'}`}>
                                            {niche}
                                        </button>
                                    ))}
                                    {!searchQuery && category.niches.length > displayLimit && (
                                        <button className="text-sm text-primary hover:underline p-2 text-left col-span-2" onClick={() => setDisplayLimit(displayLimit + 10)}>Show more...</button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <Button onClick={nextStep} disabled={selectedNiches.length === 0} className="w-full py-6">Next Step <ArrowRight className="ml-2" /></Button>
            </div>
        );
    };

    const ConfigStep = ({ title, children, onNext }: any) => (
        <div className="space-y-6 max-w-md mx-auto animate-in slide-in-from-right">
            <h2 className="text-2xl font-bold text-center">{title}</h2>
            <div className="space-y-4">{children}</div>
            <Button onClick={onNext} className="w-full py-4 mt-6">Next <ArrowRight className="ml-2" /></Button>
        </div>
    );

    // --- Render Logic ---

    if (step === "platform") return <PlatformStep />;
    if (step === "categories") return <CategoriesStep />;

    if (step === "topics") return (
        <ConfigStep title="3. Topic Focus" onNext={nextStep}>
            <p className="text-center text-text-secondary mb-4">Select sub-topics to focus on.</p>
            <div className="grid gap-2">
                {generatedTopics.map(topic => (
                    <button key={topic} onClick={() => {
                        if (selectedTopics.includes(topic)) setSelectedTopics(selectedTopics.filter(t => t !== topic));
                        else setSelectedTopics([...selectedTopics, topic]);
                    }} className={`p-3 border rounded-lg text-left ${selectedTopics.includes(topic) ? 'border-primary bg-primary/5' : 'hover:bg-surface-50'}`}>
                        {topic}
                    </button>
                ))}
            </div>
        </ConfigStep>
    );

    if (step === "language") return (
        <ConfigStep title="4. Language" onNext={nextStep}>
            <select className="w-full p-4 rounded-lg border" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>English</option><option>Spanish</option><option>Hindi</option><option>French</option><option>German</option><option>Portuguese</option>
            </select>
        </ConfigStep>
    );

    if (step === "format") return (
        <ConfigStep title="5. Content Format" onNext={nextStep}>
            <div className="grid gap-4">
                {["Shorts / Reels (Vertical)", "Long Form (Horizontal)", "Mixed"].map(fmt => (
                    <button key={fmt} onClick={() => setContentFormat(fmt)} className={`p-4 border rounded-xl text-left font-medium ${contentFormat === fmt ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-surface-50'}`}>
                        {fmt}
                    </button>
                ))}
            </div>
        </ConfigStep>
    );

    if (step === "frequency") return (
        <ConfigStep title="6. Video Frequency" onNext={nextStep}>
            <div className="grid gap-4">
                {["Daily", "3x Weekly", "Weekly", "Custom"].map(freq => (
                    <button key={freq} onClick={() => setFrequency(freq)} className={`p-4 border rounded-xl text-left font-medium ${frequency === freq ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-surface-50'}`}>
                        {freq} {freq === "Daily" && "🔥"}
                    </button>
                ))}
            </div>
        </ConfigStep>
    );

    if (step === "working-days") return (
        <ConfigStep title="7. Working Days" onNext={nextStep}>
            <p className="text-center text-text-secondary mb-4">When will you work on content?</p>
            <div className="flex flex-wrap gap-2 justify-center">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                    <button key={day} onClick={() => toggleDay(day)} className={`size-14 rounded-full border font-bold transition-all ${workingDays.includes(day) ? 'bg-primary text-white border-primary' : 'bg-white hover:border-primary'}`}>
                        {day}
                    </button>
                ))}
            </div>
        </ConfigStep>
    );

    if (step === "editing-style") return (
        <ConfigStep title="8. Editing Style" onNext={nextStep}>
            <div className="grid grid-cols-2 gap-4">
                {EDITING_STYLES.map(style => (
                    <button key={style.id} onClick={() => setEditingStyle(style.id)} className={`p-4 border rounded-xl text-left flex flex-col gap-2 ${editingStyle === style.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-surface-50'}`}>
                        <style.icon className={`size-6 ${editingStyle === style.id ? 'text-primary' : 'text-gray-400'}`} />
                        <div>
                            <span className="font-bold block">{style.name}</span>
                            <span className="text-xs text-text-secondary">{style.desc}</span>
                        </div>
                    </button>
                ))}
            </div>
        </ConfigStep>
    );

    if (step === "curation") return (
        <ConfigStep title="9. Content Curation" onNext={nextStep}>
            <div className="space-y-4">
                {CURATION_STYLES.map(style => (
                    <button key={style.id} onClick={() => setCuration(style.id)} className={`w-full p-6 border rounded-xl text-left ${curation === style.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-surface-50'}`}>
                        <span className="font-bold text-lg block mb-1">{style.name}</span>
                        <span className="text-sm text-text-secondary">{style.desc}</span>
                    </button>
                ))}
            </div>
        </ConfigStep>
    );

    // AI Generation Screens (Same as before but linked to new flow)
    if (step === "generating-names") {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center animate-in fade-in space-y-4">
                <Loader2 className="size-12 animate-spin text-primary" />
                <h3 className="text-xl font-bold">Brainstorming Names...</h3>
                <p className="text-text-secondary">Analyzing {selectedNiches.join(", ")} trends.</p>
            </div>
        );
    }

    if (step === "name-selection") {
        return (
            <div className="space-y-8 animate-in slide-in-from-right max-w-2xl mx-auto">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Choose your Channel Name</h2>
                    <p className="text-text-secondary">We'll create a custom brand based on your choice.</p>
                </div>
                <div className="grid gap-4">
                    {generatedNames.map((name, i) => (
                        <button
                            key={i}
                            onClick={() => handleBrandingGenerate(name)}
                            className="w-full p-6 text-left border rounded-xl hover:border-primary hover:bg-surface-50 flex justify-between items-center group transition-all"
                        >
                            <span className="font-bold text-lg">{name}</span>
                            <ArrowRight className="size-5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (step === "generating-branding") {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center animate-in fade-in space-y-4">
                <Loader2 className="size-12 animate-spin text-primary" />
                <h3 className="text-xl font-bold">Designing "{selectedName}"...</h3>
                <p className="text-text-secondary">Generating logo ideas, bios, and viral strategies.</p>
            </div>
        );
    }

    if (step === "review" && brandingPack) {
        // Reuse the Review UI from before, just ensure it uses handleFinalSave
        return (
            <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-text-primary">Your Brand: {selectedName}</h2>
                    <p className="text-text-secondary">Review your personalized setup pack.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="p-6 md:col-span-2 bg-gradient-to-r from-surface-100 to-white">
                        <h3 className="font-bold mb-2">Bio / Description</h3>
                        <p className="text-lg text-text-primary">{brandingPack.branding.description}</p>
                    </Card>
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="font-bold mb-2">Keywords & SEO</h3>
                            <div className="flex flex-wrap gap-2">
                                {brandingPack.branding.keywords.split(',').map((k: string, i: number) => (
                                    <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{k.trim()}</span>
                                ))}
                            </div>
                        </Card>
                        <Card className="p-6">
                            <h3 className="font-bold mb-2">Aesthetic Vibe</h3>
                            <div className="flex items-center gap-4">
                                <span className="font-medium text-lg">{brandingPack.branding.vibe}</span>
                                <div className="flex gap-2">
                                    {brandingPack.branding.colors.map((c: string, i: number) => (
                                        <div key={i} className="size-6 rounded-full border border-border shadow-sm" style={{ backgroundColor: c }}></div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                    <Card className="p-6">
                        <h3 className="font-bold mb-4">Logo Concepts</h3>
                        <div className="space-y-3">
                            {brandingPack.logoPrompts.map((prompt: string, i: number) => (
                                <div key={i} className="bg-surface-50 p-3 rounded border text-sm text-text-secondary italic">"{prompt}"</div>
                            ))}
                        </div>
                    </Card>
                </div>
                <Button onClick={handleFinalSave} disabled={loading} className="w-full py-8 text-xl shadow-xl hover:shadow-2xl transition-all">
                    {loading ? <Loader2 className="animate-spin" /> : `Create "${selectedName}" Channel`}
                </Button>
            </div>
        );
    }

    return <div>Error: Unknown Step</div>;
}
