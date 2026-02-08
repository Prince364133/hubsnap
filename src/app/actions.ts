"use server";

import { ai } from "@/lib/ai-logic";

export async function generateDailyContentAction(topic: string) {
    try {
        return await ai.generateDailyContent(topic);
    } catch (e) {
        console.error("Server Action Error:", e);
        throw new Error("Failed to generate content");
    }
}

export async function generateNichesAction(interests: string[], language: string) {
    try {
        return await ai.generateNiches(interests, language);
    } catch (e) {
        console.error("Server Action Error:", e);
        throw new Error("Failed to generate niches");
    }
}
