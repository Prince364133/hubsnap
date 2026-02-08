// Mock Trend Service
// Should fallback to AI estimation if external API fails (simulated here)

export interface Trend {
    id: string;
    keyword: string;
    relevance: string;
    platform: "YouTube" | "Shorts" | "Instagram";
    freshness: "New" | "Rising" | "Stable";
    volume: string;
}

export const trendsInfo = {
    fetchTrends: async (niche: string): Promise<Trend[]> => {
        // Simulate AI/API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Deterministic mock based on niche keyword matching
        // In real app, we would query Google Trends via Cloud Function

        if (niche.toLowerCase().includes("tech") || niche.toLowerCase().includes("ai")) {
            return [
                { id: "t1", keyword: "GPT-5 Rumors", relevance: "High interest in AI future", platform: "YouTube", freshness: "Rising", volume: "High" },
                { id: "t2", keyword: "Rabbit R1 Fail", relevance: "Gadget reviews trending", platform: "Shorts", freshness: "New", volume: "Medium" },
                { id: "t3", keyword: "Best Coding Setup 2026", relevance: "Evergreen aesthetic content", platform: "Instagram", freshness: "Stable", volume: "Low" },
            ];
        }

        // Default / Generic
        return [
            { id: "t1", keyword: "Morning Routine 2026", relevance: "Lifestyle productivity is up", platform: "YouTube", freshness: "Stable", volume: "High" },
            { id: "t2", keyword: "POV: You started X", relevance: "Relatable storytelling format", platform: "Shorts", freshness: "Rising", volume: "Medium" },
            { id: "t3", keyword: "Passive Income Truth", relevance: "Finance/Education interest", platform: "Instagram", freshness: "New", volume: "High" },
        ];
    }
};
