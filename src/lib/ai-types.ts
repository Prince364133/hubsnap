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
    qualityScore?: number;
}
