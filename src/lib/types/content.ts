import { Timestamp } from "firebase/firestore";

export interface HelpArticle {
    id: string;
    title: string;
    content: string; // Markdown or HTML
    category: string; // "Getting Started" | "Features" | "Billing" | "Technical"
    tags: string[];
    views: number;
    helpful: number;
    notHelpful: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    published: boolean;
    author: string;
    order: number; // For sorting
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string; // URL-friendly
    excerpt: string; // Short description
    content: string; // Full markdown content
    coverImage: string; // URL to image
    author: {
        name: string;
        avatar?: string;
    };
    category: string;
    tags: string[];
    seo: {
        metaTitle: string;
        metaDescription: string;
        keywords: string[];
        ogImage?: string;
    };
    readTime: number; // minutes
    views: number;
    published: boolean;
    featured: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    publishedAt?: Timestamp;
}
