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
        const payload = {
            model: MODEL,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 16384,
            temperature: 1.00,
            top_p: 1.00,
            stream: false,
            chat_template_kwargs: { thinking: true }
        };

        const response = await fetch(NVIDIA_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`NVIDIA Error Text: ${errorText}`);
            throw new Error(`NVIDIA API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const duration = Date.now() - startTime;
        console.log(`[NVIDIA] Response received in ${duration}ms.`);

        const content = data.choices?.[0]?.message?.content;

        if (!content) throw new Error("EMPTY_AI_RESPONSE");

        // Attempt to clean JSON if needed (sometimes LLMs add markdown fences)
        const jsonString = content.replace(/```json\n?|\n?```/g, "").trim();

        return JSON.parse(jsonString);
    } catch (e: any) {
        console.error("NVIDIA SDK Error details:", { message: e.message, cause: e.cause });
        throw e;
    }
}

export const ai = {
    generateNiches: async (interests: string[], language: string): Promise<NicheSuggestion[]> => {
        try {
            const prompt = `Task: User Interest Analysis
Context: User likes ${interests.join(", ")}. Language: ${language}.
Output: JSON array of 3 profitable YouTube niches.
Fields: id, title, description, whoWatches, whyTheyPay, monetizationPath (Affiliate/Lead Gen/Services), competition (Low/Medium/High).
No intro. No outro. Only JSON.`;

            const data = await fetchNVIDIA(prompt);
            return Array.isArray(data) ? data : data.niches || [];
        } catch (e) {
            console.error("Niche Gen Failed (Using Mock):", e);
            // Mock Fallback
            return [
                {
                    id: "mock_niche_1",
                    title: "AI Automation Agency (" + interests[0] + ")",
                    description: "Teaching businesses how to use AI tools for efficiency.",
                    whoWatches: "Entrepreneurs, small business owners",
                    whyTheyPay: "To save time and money",
                    monetizationPath: "Services",
                    competition: "Medium"
                },
                {
                    id: "mock_niche_2",
                    title: "Smart Home Tech Reviews",
                    description: "Reviewing the latest gadgets for home automation.",
                    whoWatches: "Homeowners, tech enthusiasts",
                    whyTheyPay: "Affiliate commissions from expensive gear",
                    monetizationPath: "Affiliate",
                    competition: "High"
                },
                {
                    id: "mock_niche_3",
                    title: "Digital Minimalism",
                    description: "How to focus in a distracted world.",
                    whoWatches: "Students, knowledge workers",
                    whyTheyPay: "Productivity courses and templates",
                    monetizationPath: "Lead Gen",
                    competition: "Low"
                }
            ];
        }
    },

    generateDailyContent: async (topic: string, platform: string = "YouTube"): Promise<DailyContent> => {
        try {
            const prompt = `Task: Write a 60s viral video script for platform: ${platform} on topic: "${topic}".
Context: Viral style, engaging, no emojis.
Output: JSON object with:
- id (string)
- topic (string)
- script { hook, body, cta }
- sop { shots (string[]), textOverlays (string[]) }
- seo { title, description (platform optimized), hashtags (string[]), keywords (string[]) }
- research { videoKeywords (string[]), stockTerms (string[]) }
- imagePrompts (string[]) -> List of 6 detailed AI image generation prompts (1 for every 10s).
- monetization { type, instruction, ethicalWarning }
No intro. No outro. Only JSON.`;

            const data = await fetchNVIDIA(prompt);
            // Append static tools
            return {
                ...data,
                tools: {
                    voiceover: "https://aistudio.google.com/generate-speech",
                    imageGen: "https://gemini.google.com/",
                    stockVideo: "https://www.pexels.com/",
                    music: ["https://www.bensound.com/free-music-for-videos", "https://www.chosic.com/free-music/all/", "https://pixabay.com/music/"]
                }
            };
        } catch (e) {
            console.error("Content Gen Failed (Using Mock):", e);
            // Mock Fallback
            return {
                id: "mock_" + Date.now(),
                topic: topic,
                script: {
                    hook: "Stop scrolling! You won't believe this...",
                    body: "Here is the secret to " + topic + " that no one is telling you. First...",
                    cta: "Subscribe for more " + topic + " tips!"
                },
                sop: {
                    shots: ["Close up of face", "Screen recording of tool", "Fast paced montage"],
                    textOverlays: ["The Secret 🤫", "Step 1", "Link in Bio"]
                },
                seo: {
                    title: "The Truth About " + topic,
                    description: "Discover the hidden secrets of " + topic + " today! #viral",
                    hashtags: ["#" + topic.replace(/\s/g, ''), "#viral", "#shorts"],
                    keywords: [topic, "guide", "tutorial"]
                },
                research: {
                    videoKeywords: [topic, topic + " tutorial", "how to " + topic, "best " + topic + " tips"],
                    stockTerms: ["technology background", "happy person", "office workspace", "futuristic ui"]
                },
                tools: {
                    voiceover: "https://aistudio.google.com/generate-speech",
                    imageGen: "https://gemini.google.com/",
                    stockVideo: "https://www.pexels.com/",
                    music: ["https://www.bensound.com/free-music-for-videos", "https://www.chosic.com/free-music/all/", "https://pixabay.com/music/"]
                },
                imagePrompts: [
                    "A futuristic workspace with glowing screens displaying " + topic,
                    "A surprised person looking at a smartphone screen, cinematic lighting",
                    "A checklist with green checkmarks, 3d render",
                    "Someone typing comfortably on a laptop, warm coffee shop amosphere",
                    "Graph going up, green arrow, profit",
                    "Happy person celebrating success"
                ],
                monetization: {
                    type: "Affiliate",
                    instruction: "Link the tool mentioned in the bio.",
                    ethicalWarning: "Disclose this is an ad."
                }
            };
        }
    },

    generateChannelNames: async (niche: string, platform: string): Promise<string[]> => {
        try {
            const prompt = `Task: Generate 10 creative, available-sounding ${platform} channel names for the niche: "${niche}".
Output: JSON array of strings only.`;

            const result = await fetchNVIDIA(prompt);
            return Array.isArray(result) ? result : result.names || [];
        } catch (e) {
            console.error("Name Gen Failed (Using Mock):", e);
            return Array.from({ length: 10 }, (_, i) => `${niche} Master ${i + 1}`);
        }
    },

    generateChannelBranding: async (name: string, niche: string, platform: string, context: { language: string; style: string }): Promise<any> => {
        try {
            // Context.style now passes "Fast-Paced", "Cinematic", etc.
            const prompt = `Task: Create a complete ${platform} Channel Branding Pack for channel name: "${name}".
Context: Niche: "${niche}". Language: "${context.language}". Style/Vibe: "${context.style}".
Output: JSON object with:
- branding:
    - description (string): Engaging bio/about section tailored to the name "${name}" and style "${context.style}".
    - keywords (string): comma-separated SEO keywords.
    - hashtags (string): space-separated.
    - colors (string[]): Suggested hex codes.
    - vibe (string): 1-word description.
- logoPrompts (string[]): 3 detailed prompts for AI image generator to create a logo for "${name}".
- first3Topics (string[]): 3 viral video ideas for this channel.
No intro. No outro. Only JSON.`;

            return await fetchNVIDIA(prompt);
        } catch (e) {
            console.error("Branding Gen Failed (Using Mock):", e);
            return {
                branding: {
                    description: `Welcome to ${name}! The ultimate destionation for ${context.style} ${niche} content. Join us for weekly deep dives!`,
                    keywords: `${name}, ${niche}, ${context.style}, viral, ${platform}`,
                    hashtags: `#${name.replace(/\s/g, '')} #${niche.replace(/\s/g, '')} #fyp`,
                    colors: ["#FF0000", "#121212", "#FFFFFF"],
                    vibe: context.style
                },
                logoPrompts: [
                    `Minimalist vector logo for ${name}, ${context.style} style`,
                    `Futuristic 3D icon for ${name}, glowing neon style`,
                    `Playful mascot character for ${name}, flat design`
                ],
                first3Topics: [
                    `The Truth About ${niche} in 2024`,
                    `5 ${niche} Hacks from ${name}`,
                    `Why Everyone is Talking About ${niche}`
                ]
            };
        }
    },
};
