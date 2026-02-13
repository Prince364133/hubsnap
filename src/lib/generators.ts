import { ChannelIdea } from "./data";
import { generateChannelNames as generateAIChannelNames, generateChannelBranding } from "./ai-logic";

export async function generateChannelNames(idea: ChannelIdea, language: string): Promise<string[]> {
    try {
        // Use the AI logic we hardened earlier
        return await generateAIChannelNames(idea.name, "YouTube");
    } catch (error) {
        console.error("Error generating names via AI:", error);
        // Fallback only if absolutely necessary, but we want to avoid mocks.
        return [];
    }
}

export async function generateLogos(idea: ChannelIdea): Promise<string[]> {
    try {
        // Use AI Branding to get Logo Concepts
        // ideally we pass more context, but for now we use the idea name/niche
        const branding = await generateChannelBranding(
            idea.name,
            idea.niche || "General",
            "YouTube",
            { language: "English", style: "Modern" }
        );

        return branding.logoPrompts || ["Concept 1", "Concept 2", "Concept 3"];
    } catch (error) {
        console.error("Error generating logos via AI:", error);
        return [];
    }
}
