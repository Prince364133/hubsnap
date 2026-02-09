"use server";

const NVIDIA_API_URL = process.env.NVIDIA_BASE_URL ? `${process.env.NVIDIA_BASE_URL}/chat/completions` : "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = process.env.NVIDIA_MODEL || "moonshotai/kimi-k2.5";

export interface NicheSuggestion {
    id: string;
    title: string;
    description: string;
    whoWatches: string;
    whyTheyPay: string;
    monetizationPath: "Affiliate" | "Lead Gen" | "Services";
    competition: "Low" | "Medium" | "High";
}

export interface DailyContent {
    id: string;
    topic: string;
    script: {
        hook: string;
        body: string;
        cta: string;
    };
    sop: {
        shots: string[];
        textOverlays: string[];
    };
    seo: {
        title: string;
        description: string;
        hashtags: string[];
        keywords: string[];
    };
    tools: {
        voiceover: string;
        imageGen: string;
        stockVideo: string;
        music: string[];
    };
    research?: {
        videoKeywords: string[];
        stockTerms: string[];
    };
    imagePrompts: string[];
    monetization: {
        type: string;
        instruction: string;
        ethicalWarning: string;
    };
}

/**
 * Common helper to fetch from NVIDIA API
 */
async function fetchNVIDIA(prompt: string) {
    console.log("[NVIDIA] Sending Prompt:", prompt.substring(0, 100) + "...");
    const startTime = Date.now();
    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey) {
        throw new Error("Missing NVIDIA_API_KEY in environment variables");
    }

    try {
        const response = await fetch(NVIDIA_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[NVIDIA] API Error:", response.status, errorText);
            throw new Error(`NVIDIA API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const elapsed = Date.now() - startTime;
        console.log(`[NVIDIA] Response received in ${elapsed}ms`);

        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error("No content in NVIDIA API response");
        }

        return content;
    } catch (error) {
        console.error("[NVIDIA] Fetch error:", error);
        throw error;
    }
}

/**
 * Server action to generate channel names
 */
export async function generateChannelNames(niche: string): Promise<string[]> {
    const prompt = `Generate 10 creative YouTube channel name ideas for a channel about "${niche}". 
Return ONLY a JSON array of strings, nothing else. Example format: ["Name 1", "Name 2", ...]`;

    try {
        const response = await fetchNVIDIA(prompt);
        const parsed = JSON.parse(response.trim());
        return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
    } catch (error) {
        console.error("Error generating channel names:", error);
        throw error;
    }
}

/**
 * Server action to generate channel branding
 */
export async function generateChannelBranding(channelName: string, niche: string) {
    const prompt = `For a YouTube channel named "${channelName}" in the "${niche}" niche, generate:
1. A tagline (10-15 words)
2. A channel description (50-100 words)
3. 5 content pillar ideas

Return as JSON with keys: tagline, description, contentPillars (array of strings)`;

    try {
        const response = await fetchNVIDIA(prompt);
        const parsed = JSON.parse(response.trim());
        return {
            tagline: parsed.tagline || "",
            description: parsed.description || "",
            contentPillars: Array.isArray(parsed.contentPillars) ? parsed.contentPillars : []
        };
    } catch (error) {
        console.error("Error generating branding:", error);
        throw error;
    }
}

/**
 * Server action to generate content ideas
 */
export async function generateContentIdeas(niche: string, count: number = 30): Promise<DailyContent[]> {
    const prompt = `Generate ${count} video content ideas for a "${niche}" YouTube channel.
For each idea, provide:
- topic: Video title
- script: {hook, body, cta}
- seo: {title, description, hashtags, keywords}
- imagePrompts: Array of 6 image generation prompts
- research: {videoKeywords (array of 5), stockTerms (array of 5)}

Return as JSON array.`;

    try {
        const response = await fetchNVIDIA(prompt);
        const parsed = JSON.parse(response.trim());

        if (!Array.isArray(parsed)) {
            throw new Error("Response is not an array");
        }

        return parsed.map((item: any, index: number) => ({
            id: `content-${Date.now()}-${index}`,
            topic: item.topic || "Untitled",
            script: {
                hook: item.script?.hook || "",
                body: item.script?.body || "",
                cta: item.script?.cta || ""
            },
            sop: {
                shots: item.sop?.shots || [],
                textOverlays: item.sop?.textOverlays || []
            },
            seo: {
                title: item.seo?.title || item.topic || "",
                description: item.seo?.description || "",
                hashtags: item.seo?.hashtags || [],
                keywords: item.seo?.keywords || []
            },
            tools: {
                voiceover: "Google AI Studio",
                imageGen: "Pexels",
                stockVideo: "Pexels",
                music: ["YouTube Audio Library"]
            },
            research: {
                videoKeywords: item.research?.videoKeywords || [],
                stockTerms: item.research?.stockTerms || []
            },
            imagePrompts: Array.isArray(item.imagePrompts) ? item.imagePrompts.slice(0, 6) : [],
            monetization: {
                type: "Affiliate",
                instruction: "Add affiliate links in description",
                ethicalWarning: "Always disclose affiliate relationships"
            }
        }));
    } catch (error) {
        console.error("Error generating content ideas:", error);
        throw error;
    }
}

/**
 * Server action to generate niche suggestions
 */
export async function generateNicheSuggestions(interests: string): Promise<NicheSuggestion[]> {
    const prompt = `Based on these interests: "${interests}", suggest 5 profitable YouTube niches.
For each niche provide:
- title: Niche name
- description: What it's about
- whoWatches: Target audience
- whyTheyPay: Monetization potential
- monetizationPath: "Affiliate" | "Lead Gen" | "Services"
- competition: "Low" | "Medium" | "High"

Return as JSON array.`;

    try {
        const response = await fetchNVIDIA(prompt);
        const parsed = JSON.parse(response.trim());

        if (!Array.isArray(parsed)) {
            throw new Error("Response is not an array");
        }

        return parsed.map((item: any, index: number) => ({
            id: `niche-${Date.now()}-${index}`,
            title: item.title || "Untitled Niche",
            description: item.description || "",
            whoWatches: item.whoWatches || "",
            whyTheyPay: item.whyTheyPay || "",
            monetizationPath: item.monetizationPath || "Affiliate",
            competition: item.competition || "Medium"
        }));
    } catch (error) {
        console.error("Error generating niche suggestions:", error);
        throw error;
    }
}
