import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";

// This script is meant to be run manually or via a hidden admin route to populate initial data
// For now, I'll create a simple function that can be called from the browser console or a temporary button if needed.
// Ideally, this should be a server-side script, but client-side is easier for this environment.

export const TOOLS_DATA = [
    {
        name: "ChatGPT",
        shortDesc: "AI conversational agent for writing, coding, and brainstorming.",
        fullDesc: "ChatGPT is an advanced language model developed by OpenAI. It can generate human-like text, answer questions, translate languages, and even write code. Perfect for creators needing script assistance, ideation, or drafting content.",
        website: "https://chat.openai.com",
        categories: ["Writing", "Productivity", "Coding"],
        useCases: ["Content Creation", "Code Generation", "Research"],
        pricingModel: "FREE_PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web", "App"],
        price: 0,
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1932&auto=format&fit=crop", // ChatGPT
        locked: false
    },
    {
        name: "Claude",
        shortDesc: "Safe and accurate AI assistant by Anthropic.",
        fullDesc: "Claude is a family of large language models developed by Anthropic, emphasizing AI safety and interpretability. It excels at drafting content, analyzing text and images, and coding tasks with a focus on being helpful, harmless, and honest.",
        website: "https://claude.ai",
        categories: ["Writing", "Productivity", "Coding"],
        useCases: ["Content Creation", "Code Generation", "Analysis"],
        pricingModel: "FREE_PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web"],
        price: 0,
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1932&auto=format&fit=crop", // Claude (reuse) - or similar AI generic
        locked: false
    },
    {
        name: "Google Gemini",
        shortDesc: "Google's multimodal AI for text, images, and more.",
        fullDesc: "Gemini is Google's most capable multimodal AI model, handling text, audio, images, and video. It integrates with Google products like Gmail and Calendar, helping with writing, coding, brainstorming, and learning complex concepts.",
        website: "https://gemini.google.com",
        categories: ["Writing", "Productivity", "Research"],
        useCases: ["Content Creation", "Research", "Productivity"],
        pricingModel: "FREE_PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web", "App"],
        price: 0,
        imageUrl: "https://images.unsplash.com/photo-1695653422715-991525afbb4b?q=80&w=1974&auto=format&fit=crop", // Gemini
        locked: false
    },
    {
        name: "Midjourney",
        shortDesc: "Generate photorealistic images from text prompts.",
        fullDesc: "Midjourney is a generative AI program that creates stunning, artistic images from natural language descriptions. Known for producing aesthetically pleasing visuals, it's perfect for creators needing unique artwork, thumbnails, or visual content.",
        website: "https://midjourney.com",
        categories: ["Image", "Art", "Design"],
        useCases: ["Image Generation", "Art Creation", "Design"],
        pricingModel: "PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web", "Discord"],
        price: 10,
        imageUrl: "https://images.unsplash.com/photo-1684469279532-6ba96333423f?q=80&w=2070&auto=format&fit=crop", // Midjourney
        locked: false
    },
    {
        name: "DALL-E 3",
        shortDesc: "OpenAI's advanced image generation model.",
        fullDesc: "DALL-E 3 is OpenAI's latest image generation model, creating highly detailed and accurate images from text descriptions. Integrated with ChatGPT Plus, it offers superior prompt understanding and creative control.",
        website: "https://openai.com/dall-e-3",
        categories: ["Image", "Art"],
        useCases: ["Image Generation", "Art Creation"],
        pricingModel: "PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web"],
        price: 20,
        locked: false
    },
    {
        name: "ElevenLabs",
        shortDesc: "Realistic AI voice generator and text-to-speech.",
        fullDesc: "ElevenLabs provides diverse, realistic AI voices for creators and developers. Generate lifelike speech in any language and voice. Perfect for faceless YouTube channels, podcasts, audiobooks, and voiceovers.",
        website: "https://elevenlabs.io",
        categories: ["Audio", "Voice"],
        useCases: ["Voice Generation", "Text-to-Speech", "Content Creation"],
        pricingModel: "FREE_PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web", "API"],
        price: 0,
        locked: false
    },
    {
        name: "Runway ML",
        shortDesc: "AI-powered video editing and generation.",
        fullDesc: "Runway is an applied AI research company shaping the next era of art, entertainment and human creativity. Create videos, images, and more with AI-powered tools for editing, generation, and effects.",
        website: "https://runwayml.com",
        categories: ["Video", "Image"],
        useCases: ["Video Editing", "Video Generation", "Content Creation"],
        pricingModel: "FREE_PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web", "App"],
        price: 0,
        locked: false
    },
    {
        name: "Notion AI",
        shortDesc: "Connected workspace with AI powers.",
        fullDesc: "Access the limitless power of AI, right inside Notion. Work faster. Write better. Think bigger. Summarize notes, generate action items, draft content, and organize your workspace with AI assistance.",
        website: "https://notion.so",
        categories: ["Productivity", "Writing"],
        useCases: ["Note Taking", "Project Management", "Content Creation"],
        pricingModel: "PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web", "App"],
        price: 10,
        locked: false
    },
    {
        name: "Canva",
        shortDesc: "Design tool with AI Magic Studio.",
        fullDesc: "Canva is a free-to-use online graphic design tool. Use it to create social media posts, presentations, posters, videos, logos and more. Now features Magic Studio for AI-powered design, background removal, and text-to-image generation.",
        website: "https://canva.com",
        categories: ["Image", "Design"],
        useCases: ["Graphic Design", "Social Media", "Presentations"],
        pricingModel: "FREE_PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web", "App"],
        price: 0,
        locked: false
    },
    {
        name: "Descript",
        shortDesc: "Video editing as easy as a doc.",
        fullDesc: "There's a new way to make video and podcasts. A good way. Descript is the simple, powerful, and fun way to edit. Transcribe, edit, and collaborate with AI-powered tools for overdub, studio sound, and more.",
        website: "https://descript.com",
        categories: ["Video", "Audio"],
        useCases: ["Video Editing", "Podcast Editing", "Transcription"],
        pricingModel: "FREE_PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["App", "Web"],
        price: 0,
        locked: false
    },
    {
        name: "Copy.ai",
        shortDesc: "AI-powered copywriting and content generation.",
        fullDesc: "Copy.ai helps you write better marketing copy and content with AI. Generate blog posts, social media content, ad copy, and more in seconds. Perfect for marketers and content creators.",
        website: "https://copy.ai",
        categories: ["Writing", "Marketing"],
        useCases: ["Copywriting", "Content Creation", "Marketing"],
        pricingModel: "FREE_PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web"],
        price: 0,
        locked: false
    },
    {
        name: "Jasper AI",
        shortDesc: "AI content platform for enterprise marketing.",
        fullDesc: "Jasper is an AI content platform that helps your team create content tailored for your brand 10X faster. Generate blog posts, marketing copy, social media content, and more with brand voice consistency.",
        website: "https://jasper.ai",
        categories: ["Writing", "Marketing"],
        useCases: ["Content Creation", "Marketing", "Copywriting"],
        pricingModel: "PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web"],
        price: 39,
        locked: false
    },
    {
        name: "Perplexity AI",
        shortDesc: "AI-powered answer engine and research tool.",
        fullDesc: "Perplexity AI is a conversational search engine that uses large language models to answer queries with cited sources. Perfect for research, fact-checking, and getting accurate information quickly.",
        website: "https://perplexity.ai",
        categories: ["Research", "Productivity"],
        useCases: ["Research", "Information Retrieval", "Fact Checking"],
        pricingModel: "FREE_PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web", "App"],
        price: 0,
        locked: false
    },
    {
        name: "Synthesia",
        shortDesc: "AI video generation with virtual avatars.",
        fullDesc: "Create professional videos with AI avatars and voiceovers in minutes. Synthesia is the #1 AI video creation platform. Turn text into videos with AI presenters in 120+ languages.",
        website: "https://synthesia.io",
        categories: ["Video"],
        useCases: ["Video Creation", "Training Videos", "Marketing"],
        pricingModel: "PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web"],
        price: 22,
        locked: false
    },
    {
        name: "Grammarly",
        shortDesc: "AI writing assistant for grammar and style.",
        fullDesc: "Grammarly's AI-powered writing assistant helps you write clearly and effectively. Get real-time suggestions for grammar, spelling, punctuation, clarity, and tone across all your writing.",
        website: "https://grammarly.com",
        categories: ["Writing", "Productivity"],
        useCases: ["Writing Assistance", "Grammar Checking", "Content Editing"],
        pricingModel: "FREE_PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web", "App", "Extension"],
        price: 0,
        locked: false
    },
    {
        name: "Stable Diffusion",
        shortDesc: "Open-source AI image generation model.",
        fullDesc: "Stable Diffusion is a deep learning, text-to-image model that generates detailed images from text descriptions. It's open-source and can run locally, giving creators full control over image generation.",
        website: "https://stability.ai",
        categories: ["Image", "Art"],
        useCases: ["Image Generation", "Art Creation"],
        pricingModel: "FREE",
        accessType: "FREE",
        platforms: ["Web", "Local"],
        price: 0,
        locked: false
    },
    {
        name: "Pictory",
        shortDesc: "AI video creation from text and scripts.",
        fullDesc: "Pictory automatically creates short, highly-sharable branded videos from your long form content. Perfect for creating social media videos, YouTube shorts, and video highlights from blog posts or scripts.",
        website: "https://pictory.ai",
        categories: ["Video"],
        useCases: ["Video Creation", "Content Repurposing", "Social Media"],
        pricingModel: "PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web"],
        price: 19,
        locked: false
    },
    {
        name: "Murf AI",
        shortDesc: "AI voice generator for professional voiceovers.",
        fullDesc: "Murf AI enables anyone to convert text to speech, voice-overs, and dictations. It offers 120+ realistic text-to-speech voices in 20 languages for professional voiceover creation.",
        website: "https://murf.ai",
        categories: ["Audio", "Voice"],
        useCases: ["Voice Generation", "Voiceovers", "Text-to-Speech"],
        pricingModel: "FREE_PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web"],
        price: 0,
        locked: false
    },
    {
        name: "Lumen5",
        shortDesc: "AI-powered video creation for social media.",
        fullDesc: "Lumen5 is a video creation platform designed for brands and businesses to produce engaging video content for social posts, stories, and ads. Turn blog posts into videos automatically.",
        website: "https://lumen5.com",
        categories: ["Video", "Marketing"],
        useCases: ["Video Creation", "Social Media", "Content Repurposing"],
        pricingModel: "FREE_PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web"],
        price: 0,
        locked: false
    },
    {
        name: "Writesonic",
        shortDesc: "AI writer for articles, blogs, and ads.",
        fullDesc: "Writesonic is an AI writer that creates SEO-optimized content for blogs, Facebook ads, Google ads, and Shopify. Generate high-quality content in seconds with AI-powered writing assistance.",
        website: "https://writesonic.com",
        categories: ["Writing", "Marketing"],
        useCases: ["Content Creation", "SEO Writing", "Copywriting"],
        pricingModel: "FREE_PAID",
        accessType: "SUBSCRIPTION",
        platforms: ["Web"],
        price: 0,
        locked: false
    }
];

export const GUIDES_DATA = [
    {
        title: "Faceless YouTube Automation",
        type: "Blueprint",
        category: "Content Creation",
        content: `
# Faceless YouTube Automation Blueprint

## Overview
Build a profitable YouTube empire without ever showing your face. This blueprint breaks down the exact steps to identify high-CPM niches, automate scriptwriting with AI, and hire cost-effective editors.

## Step 1: Niche Selection
Focus on high CMP (Cost Per Mille) niches:
- Finance / Making Money Online
- Tech Reviews
- Health & Fitness
- Luxury / Travel
- Psychology / Self-Improvement

## Step 2: Content Strategy
Use the "Hub & Spoke" model. Create a central "Hub" video (long-form, high value) and repurpose it into 5-10 Shorts (Spokes) to drive traffic.

## Step 3: Automation Stack
- **Script**: ChatGPT / Claude
- **Voiceover**: ElevenLabs
- **Visuals**: Stock footage (Pexels) + Midjourney
- **Editing**: CapCut / Premiere (or hire via Upwork)

## Step 4: Monetization
- AdSense (Primary)
- Affiliate Marketing (Amazon Associates, Software)
- Digital Products (Courses, Templates)
        `,
        difficulty: "Intermediate",
        premium: true
    },
    {
        title: "Digital Product Launch Kit",
        type: "Freelancing Kit",
        category: "E-commerce",
        content: "Everything you need to launch a digital product in 7 days. Includes checklist, email templates, and landing page copy.",
        difficulty: "Beginner",
        premium: false
    },
    {
        title: "SaaS Marketing Template",
        type: "Template",
        category: "Marketing",
        content: "A Notion template to organize your SaaS marketing efforts. Tracker for content calendar, influencer outreach, and ad spend.",
        difficulty: "Advanced",
        premium: true
    }
];


export const BLOGS_DATA = [
    {
        title: "How to Start a Faceless YouTube Channel in 2026",
        slug: "how-to-start-faceless-youtube-channel-2026",
        excerpt: "Discover the step-by-step guide to building a profitable YouTube empire without ever showing your face. Learn the tools, niches, and strategies that work.",
        content: `
# How to Start a Faceless YouTube Channel in 2026

Faceless YouTube channels are one of the most lucrative online business models today. You don't need a camera, a studio, or even to use your own voice.

## Why Faceless?
- **Privacy**: Keep your personal life separate.
- **Scalability**: Run multiple channels simultaneously.
- **Automation**: Easier to outsource scripts, voiceovers, and editing.

## The Tech Stack
1. **Scripting**: Use **Claude 3.5 Sonnet** for human-like scripts.
2. **Voiceover**: **ElevenLabs** offers the best AI voices.
3. **Visuals**: **Midjourney** for thumbnails and **Pexels** for stock footage.
4. **Editing**: **CapCut** or **Premiere Pro**.

## Top Niches for 2026
- **AI News & Tutorials**: The industry is booming.
- **True Crime**: Always high engagement.
- **Relaxation & Meditation**: High retention, low effort.
- **Financial Education**: High CPM (earnings per view).

## Conclusion
Consistency is key. Start with one video a week, master the workflow, and then scale.
        `,
        coverImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop",
        category: "Content Creation",
        author: {
            name: "HubSnap Team",
            avatar: "https://github.com/shadcn.png"
        },
        readTime: 5,
        featured: true,
        published: true,
        tags: ["YouTube", "Automation", "AI"]
    },
    {
        title: "best AI Tools for Content Creators (Ranked)",
        slug: "best-ai-tools-for-content-creators-ranked",
        excerpt: "We tested over 50 AI tools so you don't have to. Here are the top 5 tools that will save you 20+ hours per week.",
        content: `
# Best AI Tools for Content Creators (Ranked)

The right tools can double your output while halving your effort. Here is our curated list for 2026.

## 1. HubSnap (Creator OS)
The all-in-one workspace for research, scripting, and planning.
**Best for**: Managing your entire creator business.

## 2. Midjourney v6
Still the king of AI image generation. Unmatched photorealism.
**Best for**: Thumbnails and B-roll.

## 3. ElevenLabs
Indistinguishable from human speech.
**Best for**: Voiceovers.

## 4. Opus Clip
Turns long-form videos into viral shorts instantly.
**Best for**: Repurposing content.

## 5. Perplexity
Better than Google for research.
**Best for**: Script research and fact-checking.
        `,
        coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1932&auto=format&fit=crop",
        category: "Productivity",
        author: {
            name: "Sarah Jenkins",
            avatar: "https://github.com/shadcn.png"
        },
        readTime: 4,
        featured: false,
        published: true,
        tags: ["AI", "Tools", "Productivity"]
    },
    {
        title: "Monetizing Your tiny Audience: A Guide",
        slug: "monetizing-your-tiny-audience-guide",
        excerpt: "You don't need 100k subscribers to make a living. Here is how to generate $1k/month with less than 1,000 followers.",
        content: `
# Monetizing Your Tiny Audience

The "1,000 True Fans" theory is outdated. You only need 100 true fans if you have the right offer.

## The Strategy
1. **Solve a Specific Problem**: Don't be a generalist.
2. **High-Ticket Offer**: Consulting or Done-For-You services.
3. **Digital Products**: Templates, E-books, or Mini-courses.

## Example
If you sell a $50 notion template, you only need 20 sales to make $1,000. That is less than 1 sale a day.

## Action Plan
- Survey your audience to find their biggest pain point.
- Build a Minimum Viable Product (MVP) in a weekend.
- Soft launch to your email list or DMs.
        `,
        coverImage: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop",
        category: "Monetization",
        author: {
            name: "Alex Rivera",
            avatar: "https://github.com/shadcn.png"
        },
        readTime: 6,
        featured: false,
        published: true,
        tags: ["Business", "Money", "Guide"]
    },
    {
        title: "The Future of Creator Economy in 2027",
        slug: "future-of-creator-economy-2027",
        excerpt: "Predictions for the next wave of the creator economy. Why community is becoming more valuable than reach.",
        content: `
# The Future of Creator Economy

Algorithms are changing. Reach is dropping. But community value is at an all-time high.

## Key Trends
- **De-platforming Risks**: Creators are moving to owned platforms (newsletters, communities).
- **AI Saturation**: Generic content is flooding the web; authentic, human connection is the premium.
- **Micro-Communities**: Paid communities (Skool, Discord) are replacing open social media for engagement.

## What You Should Do
Build an email list *today*. It is the only asset you truly own.
        `,
        coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
        category: "Trends",
        author: {
            name: "HubSnap Team",
            avatar: "https://github.com/shadcn.png"
        },
        readTime: 3,
        featured: false,
        published: true,
        tags: ["Trends", "Future", "Community"]
    },
    {
        title: "The Ultimate Guide to YouTube Thumbnails",
        slug: "ultimate-guide-youtube-thumbnails",
        excerpt: "CTR is the most important metric on YouTube. Learn the psychology of colors, faces, and text to double your clicks.",
        content: `
# YouTube Thumbnails 101

Your video is useless if no one clicks.

## Key Principles
1. **Contrast**: Use complementary colors.
2. **Emotion**: Faces with strong expressions (fear, joy, shock) work best.
3. **Simplicity**: Less is more. 3 elements max.

## Tools
- Photoshop (Pro)
- Canva (Beginner)
- Midjourney (AI)
        `,
        coverImage: "https://images.unsplash.com/photo-1626785774573-4b799314346d?q=80&w=2070&auto=format&fit=crop",
        category: "Content Creation",
        author: {
            name: "HubSnap Team",
            avatar: "https://github.com/shadcn.png"
        },
        readTime: 4,
        featured: false,
        published: true,
        tags: ["YouTube", "Design", "CTR"]
    },
    {
        title: "Top 5 AI Coding Assistants for 2026",
        slug: "top-ai-coding-assistants-2026",
        excerpt: "Stop writing boilerplate code. These AI assistants will make you a 10x engineer.",
        content: `
# Best AI Coding Tools

Coding is changing. If you aren't using AI, you're falling behind.

## The List
1. **GitHub Copilot**: The industry standard.
2. **Cursor**: A fork of VS Code with AI built-in.
3. **Replit Ghostwriter**: Great for cloud development.
        `,
        coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
        category: "Productivity",
        author: {
            name: "Prince Kumar",
            avatar: "https://github.com/shadcn.png"
        },
        readTime: 3,
        featured: false,
        published: true,
        tags: ["Coding", "AI", "Productivity"]
    }
];


export const populateDB = async () => {
    try {
        // Populate Tools
        // Populate/Update Tools
        console.log("Seeding/Updating Tools...");
        const toolsQuery = query(collection(db, "tools"));
        const toolsSnap = await getDocs(toolsQuery);

        // precise mapping of existing tools by name
        const existingToolsMap = new Map();
        toolsSnap.docs.forEach(doc => {
            const data = doc.data();
            existingToolsMap.set(data.name, doc.ref);
        });

        for (const tool of TOOLS_DATA) {
            if (existingToolsMap.has(tool.name)) {
                // Update existing tool if needed (e.g. adding imageUrl)
                const docRef = existingToolsMap.get(tool.name);
                // We can force update specific fields like imageUrl
                await import("firebase/firestore").then(({ updateDoc }) => {
                    updateDoc(docRef, {
                        imageUrl: tool.imageUrl || "", // Ensure we sync the image
                        updatedAt: Timestamp.now()
                    });
                });
            } else {
                // Add new tool
                await addDoc(collection(db, "tools"), {
                    ...tool,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    locked: false
                });
            }
        }

        // Populate Guides
        const guidesQuery = query(collection(db, "guides"));
        const guidesSnap = await getDocs(guidesQuery);
        if (guidesSnap.empty) {
            console.log("Seeding Guides...");
            for (const guide of GUIDES_DATA) {
                await addDoc(collection(db, "guides"), {
                    ...guide,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    deleted: false
                });
            }
        }

        // Populate Blogs
        const blogsQuery = query(collection(db, "blogs"));
        const blogsSnap = await getDocs(blogsQuery);
        if (blogsSnap.empty) {
            console.log("Seeding Blogs...");
            for (const blog of BLOGS_DATA) {
                await addDoc(collection(db, "blogs"), {
                    ...blog,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    publishedAt: Timestamp.now(),
                    views: Math.floor(Math.random() * 1000) + 100
                });
            }
        }
        console.log("Database seeded successfully!");
        return true;
    } catch (e) {
        console.error("Error seeding DB:", e);
        return false;
    }
};
