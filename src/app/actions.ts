"use server";

import { generateDailyContent, generateNiches } from "@/lib/ai-logic";
import { processText } from "@/lib/python-tools";

export async function generateDailyContentAction(topic: string) {
    try {
        return await generateDailyContent(topic);
    } catch (e) {
        console.error("Server Action Error:", e);
        throw new Error("Failed to generate content");
    }
}

export async function generateNichesAction(interests: string[], language: string) {
    try {
        return await generateNiches(interests, language);
    } catch (e) {
        console.error("Server Action Error:", e);
        throw new Error("Failed to generate niches");
    }
}

export async function getHistoryAnalyticsAction(items: any[]) {
    try {
        // Text argument is required by the endpoint but ignored for this action
        return await processText("analyze_content_history", "batch_analysis", { items });
    } catch (e) {
        console.error("Analytics Action Error:", e);
        return null;
    }
}
