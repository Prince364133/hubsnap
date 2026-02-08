import { ChannelIdea } from "./data";

export function generateChannelNames(idea: ChannelIdea, language: string): string[] {
    // In a real app, this would call an AI API.
    // We will mock this with deterministic logic based on the inputs to ensure "uniqueness" locally.

    const baseNames = [
        "Daily", "Hub", "Central", "Pulse", "Vibes", "Focus", "Zone", "Sphere", "Wave", "Flow"
    ];

    const prefixes = [
        "The", "My", "Pure", "True", "Real", "Pro", "Smart", "Quick", "Easy", "Best"
    ];

    const topic = idea.name.split(" ")[0]; // e.g. "Motivation" from "Motivation Shorts"

    // Simple generator: Prefix + Topic + Suffix
    // In real implementation this must be robust.

    const generated: string[] = [];

    for (let i = 0; i < 10; i++) {
        const prefix = prefixes[i % prefixes.length];
        const suffix = baseNames[i % baseNames.length];
        // Mix it up
        if (i % 3 === 0) {
            generated.push(`${prefix} ${topic}`);
        } else if (i % 3 === 1) {
            generated.push(`${topic} ${suffix}`);
        } else {
            generated.push(`${prefix} ${topic} ${suffix}`);
        }
    }

    // Filter for constraints: Short, Brand-safe, No numbers
    // Our list is safe by default.

    return generated;
}

export function generateLogos(idea: ChannelIdea): string[] {
    // Mock 5 logo IDs (could be SVG strings or classes in real app)
    return ["logo-1", "logo-2", "logo-3", "logo-4", "logo-5"];
}
