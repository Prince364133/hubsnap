export type ChannelIdea = {
    id: string;
    name: string;
    contentType: "Faceless" | "Face" | "Mixed";
    skillLevel: "Low" | "Medium" | "High";
    growthPattern: "Slow" | "Medium" | "Fast";
    description: string;
};

export const CHANNEL_IDEAS: ChannelIdea[] = [
    {
        id: "motivation_shorts",
        name: "Motivation Shorts",
        contentType: "Faceless",
        skillLevel: "Low",
        growthPattern: "Fast",
        description: "Daily motivational quotes with cinematic background visuals.",
    },
    {
        id: "tech_explainers",
        name: "Tech Explainers",
        contentType: "Mixed",
        skillLevel: "Medium",
        growthPattern: "Medium",
        description: "Short breakdowns of complex tech topics for beginners.",
    },
    {
        id: "lofi_study",
        name: "Lofi Study Beats",
        contentType: "Faceless",
        skillLevel: "Low",
        growthPattern: "Slow",
        description: "Relaxing music channels for studying and work focus.",
    },
    {
        id: "ai_news",
        name: "AI News Roundup",
        contentType: "Mixed",
        skillLevel: "Medium",
        growthPattern: "Fast",
        description: "Daily updates on the latest artificial intelligence tools.",
    },
    {
        id: "meditation_guide",
        name: "Meditation Guide",
        contentType: "Faceless",
        skillLevel: "Low",
        growthPattern: "Medium",
        description: "Voiceover-guided meditations with peaceful visuals.",
    },
    {
        id: "finance_tips",
        name: "Personal Finance Tips",
        contentType: "Face",
        skillLevel: "Medium",
        growthPattern: "Medium",
        description: "Quick money-saving and investing tips for Gen Z.",
    },
];

export interface NicheCategory {
    id: string;
    name: string;
    niches: string[];
}

export const NICHE_CATEGORIES: NicheCategory[] = [
    {
        id: "tech",
        name: "Technology & AI",
        niches: ["AI Tools & News", "Software Tutorials", "Coding/Programming", "Tech Reviews", "SaaS Growth", "Cybersecurity", "PC Builds", "Smart Home", "Future Tech", "Crypto/Web3"]
    },
    {
        id: "finance",
        name: "Finance & Business",
        niches: ["Personal Finance", "Investing/Stocks", "Side Hustles", "Real Estate", "Crypto Trading", "Business Strategy", "Marketing Tips", "Ecommerce/Dropshipping", "Sales Psychology", "Frugal Living"]
    },
    {
        id: "health",
        name: "Health & Fitness",
        niches: ["Weight Loss", "Muscle Building", "Yoga/Meditation", "Mental Health", "Nutrition/Biohacking", "Home Workouts", "Running/Marathon", "Sleep Optimization", "Sports Analysis", "Healthy Recipies"]
    },
    {
        id: "lifestyle",
        name: "Lifestyle & Self-Improvement",
        niches: ["Productivity Hacks", "Minimalism", "Travel Vlogging", "Day in the Life", "Fashion/Style", "Grooming", "Dating Advice", "Book Reviews", "Journaling", "Digital Nomad info"]
    },
    {
        id: "creative",
        name: "Creative & Arts",
        niches: ["Photography/Videography", "Graphic Design", "Digital Art", "Music Production", "Writing Tips", "DIY/Crafts", "Interior Design", "Photo Editing", "Filmmaking", "Drawing Tutorials"]
    },
    {
        id: "entertainment",
        name: "Entertainment & Gaming",
        niches: ["Gaming Highlights", "Movie Reviews", "Pop Culture Video Essays", "Celebrity News", "True Crime", "History Facts", "Science Explainers", "Comedy Skits", "Reaction Videos", "ASMR"]
    }
];

// Helper to get all niches flat for search
export const ALL_NICHES = NICHE_CATEGORIES.flatMap(c => c.niches.map(n => ({ category: c.name, name: n })));

