import { generateTrends } from "./ai-logic";

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
        try {
            return await generateTrends(niche);
        } catch (error) {
            console.error("Error fetching AI trends:", error);
            // Fallback to a generic fail-safe if AI fails completely (though ai-logic throws now)
            return [];
        }
    }
};
