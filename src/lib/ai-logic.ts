"use server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.AI_MODEL || "gpt-4o-mini";

import { processText } from "./python-tools";
import { NicheSuggestion, DailyContent } from "./ai-types";

/**
 * Common helper to fetch from OpenAI API
 */
async function fetchOpenAI(prompt: string) {
    console.log("[OpenAI] Sending Prompt:", prompt.substring(0, 100) + "...");
    const startTime = Date.now();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error("Missing OPENAI_API_KEY in environment variables");
    }

    try {
        const payload = {
            model: MODEL,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 4096, // Reduced for 4o-mini
            temperature: 0.7,
            response_format: { type: "json_object" } // Enforce JSON
        };

        const response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`OpenAI Error Text: ${errorText}`);
            throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const duration = Date.now() - startTime;
        console.log(`[OpenAI] Response received in ${duration}ms.`);

        const content = data.choices?.[0]?.message?.content;

        if (!content) throw new Error("EMPTY_AI_RESPONSE");

        // Attempt to clean JSON if needed (sometimes LLMs add markdown fences despite json_object mode)
        const jsonString = content.replace(/```json\n?|\n?```/g, "").trim();

        return JSON.parse(jsonString);
    } catch (e: any) {
        console.error("OpenAI Error details:", { message: e.message, cause: e.cause });
        throw e;
    }
}


export async function generateNiches(interests: string[], language: string): Promise<NicheSuggestion[]> {
    try {
        // Enhance inputs with Library Intelligence
        const combinedInterests = interests.join(". ");
        const keywords = await processText("extract_keywords", combinedInterests, { top_n: 5 });

        // Use refined keywords if available, otherwise fall back to raw inputs
        const contextTerms = Array.isArray(keywords) && keywords.length > 0 ? keywords.join(", ") : interests.join(", ");

        const prompt = `Task: User Interest Analysis
Context: User likes ${contextTerms}. Language: ${language}.
Output: JSON object with a "niches" key containing an array of 3 profitable YouTube niches.
Fields: id, title, description, whoWatches, whyTheyPay, monetizationPath (Affiliate/Lead Gen/Services), competition (Low/Medium/High).
No intro. No outro. Only JSON.`;

        const data = await fetchOpenAI(prompt);
        return Array.isArray(data) ? data : (data.niches || data.suggestions || []);
    } catch (e) {
        console.error("Niche Gen Failed:", e);
        throw new Error("Failed to generate niches. Please try again.");
    }
}

export async function generateDailyContent(topic: string, platform: string = "YouTube"): Promise<DailyContent> {
    try {
        // 1. Generate core content (Script & Visuals) via LLM
        // We remove SEO and Research from the prompt to save tokens and avoid hallucinations
        const prompt = `Task: Write a 60s viral video script for platform: ${platform} on topic: "${topic}".
Context: Viral style, engaging, no emojis.
Output: JSON object with:
- id (string)
- topic (string)
- script { hook, body, cta }
- sop { shots (string[]), textOverlays (string[]) }
- monetization { type, instruction, ethicalWarning }
- imagePrompts (string[]) -> List of 6 detailed AI image generation prompts.
No intro. No outro. Only JSON.`;

        const data = await fetchOpenAI(prompt);

        // 2. Enhance with Library Intelligence (Python Layer)
        // Extract keywords from the generated script body
        const scriptText = `${data.script.hook} ${data.script.body}`;

        // Parallelize Python calls for speed
        const [keywords, readabilityScore] = await Promise.all([
            processText("extract_keywords", scriptText, { top_n: 10 }),
            processText("readability", scriptText)
        ]);

        // 3. Construct derived data
        // Use real extracted keywords for SEO and Research
        const derivedKeywords = Array.isArray(keywords) && keywords.length > 0 ? keywords : [topic, "viral", "shorts"];
        const hashtags = derivedKeywords.map((k: string) => `#${k.replace(/\s+/g, '')}`).slice(0, 5);

        // 4. Assemble final object
        return {
            ...data,
            seo: {
                title: `${topic} - Essential Guide`, // Fallback, usually user edits this
                description: `${data.script.hook} Watch to learn more about ${topic}.`,
                hashtags: hashtags,
                keywords: derivedKeywords
            },
            research: {
                videoKeywords: derivedKeywords,
                stockTerms: derivedKeywords.slice(0, 5) // Map keywords to stock terms
            },
            tools: {
                voiceover: "https://aistudio.google.com/generate-speech",
                imageGen: "https://gemini.google.com/",
                stockVideo: "https://www.pexels.com/",
                music: ["https://www.bensound.com/free-music-for-videos", "https://www.chosic.com/free-music/all/", "https://pixabay.com/music/"]
            },
            // Add quality score metadata (optional extension)
            qualityScore: readabilityScore
        };
    } catch (e) {
        console.error("Content Gen Failed:", e);
        throw new Error("Failed to generate content. Please try again.");
    }
}

export async function generateChannelNames(niche: string, platform: string): Promise<string[]> {
    try {
        const prompt = `Task: Generate 10 creative, available-sounding ${platform} channel names for the niche: "${niche}".
Output: JSON object with a "names" key containing an array of 10 strings.
Example: {"names": ["Name 1", "Name 2", ...]}
Only JSON.`;

        const result = await fetchOpenAI(prompt);
        return Array.isArray(result) ? result : (result.names || result.channelNames || result.suggestions || []);
    } catch (e) {
        console.error("Name Gen Failed:", e);
        throw new Error("Failed to generate channel names.");
    }
}

export async function generateTrends(niche: string): Promise<any[]> {
    try {
        const prompt = `Task: Identify 3 rising trends for the niche "${niche}" on YouTube/Social Media.
Context: 2024-2025 Market.
Output: JSON object with a "trends" key containing an array of objects with fields:
- id (string)
- keyword (string): The trend name.
- relevance (string): Why it matters.
- platform (YouTube/Shorts/Instagram).
- freshness (New/Rising/Stable).
- volume (High/Medium/Low).
No intro. Only JSON.`;

        const data = await fetchOpenAI(prompt);
        const trends = Array.isArray(data) ? data : (data.trends || data.results || []);

        // Enhance with Python (Extract keywords for validation or extra metadata if needed)
        // For now, just return raw AI data to unblock the feature
        return trends;
    } catch (e) {
        console.error("Trend Gen Failed:", e);
        throw new Error("Failed to fetch trends.");
    }
}

export async function generateChannelBranding(name: string, niche: string, platform: string, context: { language: string; style: string }): Promise<any> {
    try {
        // Context.style now passes "Fast-Paced", "Cinematic", etc.
        // Simplified prompt: remove keywords/hashtags request
        const prompt = `Task: Create a complete ${platform} Channel Branding Pack for channel name: "${name}".
Context: Niche: "${niche}". Language: "${context.language}". Style/Vibe: "${context.style}".
Output: JSON object with:
- branding:
    - description (string): Engaging bio/about section tailored to the name "${name}" and style "${context.style}".
    - colors (string[]): Suggested hex codes.
    - vibe (string): 1-word description.
- logoPrompts (string[]): 3 detailed prompts for AI image generation to create a logo for "${name}".
- first3Topics (string[]): 3 viral video ideas for this channel.
No intro. No outro. Only JSON.`;

        const data = await fetchOpenAI(prompt);

        // Enhance with Python Library
        // Extract keywords from the generated description
        const description = data.branding?.description || `${name} - ${niche} channel`;
        const keywords = await processText("extract_keywords", description, { top_n: 8 });

        // Construct hashtags from keywords
        const validKeywords = Array.isArray(keywords) && keywords.length > 0 ? keywords : [niche, platform, context.style, "viral"];
        const hashtags = validKeywords.map((k: string) => `#${k.replace(/\s+/g, '')}`).slice(0, 8).join(" ");
        const keywordString = validKeywords.join(", ");

        return {
            ...data,
            branding: {
                ...data.branding,
                keywords: keywordString,
                hashtags: hashtags
            }
        };

    } catch (e) {
        console.error("Branding Gen Failed:", e);
        throw new Error("Failed to generate branding.");
    }
}



