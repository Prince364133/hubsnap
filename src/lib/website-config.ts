
import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export interface WebsiteConfig {
    hero: {
        headline: string;
        subheadline: string;
        ctaText: string;
        imageUrl: string;
    };
    branding: {
        headerLogoUrl: string;
        footerLogoUrl: string;
        faviconUrl: string;
    };
    seo: {
        title: string;
        description: string;
        ogImage: string;
    };
    // Add more sections as needed
}

export const DEFAULT_WEBSITE_CONFIG: WebsiteConfig = {
    hero: {
        headline: "AI-Powered Tools for Modern Creators",
        subheadline: "HubSnap brings together the best AI tools, data-driven insights, and proven frameworks to help creators build sustainable businesses.",
        ctaText: "Start For Free",
        imageUrl: "/hero.png"
    },
    branding: {
        headerLogoUrl: "/logo.gif",
        footerLogoUrl: "/logo.jpeg",
        faviconUrl: "/hubsnap_logo.jpeg"
    },
    seo: {
        title: "HubSnap | AI-Powered Operating System for Creators",
        description: "Scale your creative business with AI-powered tools and data-driven insights.",
        ogImage: "/hero.png"
    }
};

export const websiteConfigService = {
    async getConfig(): Promise<WebsiteConfig> {
        try {
            const docRef = doc(db, "settings", "website");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as Partial<WebsiteConfig>;
                return {
                    hero: { ...DEFAULT_WEBSITE_CONFIG.hero, ...data.hero },
                    branding: { ...DEFAULT_WEBSITE_CONFIG.branding, ...data.branding },
                    seo: { ...DEFAULT_WEBSITE_CONFIG.seo, ...data.seo }
                };
            }
            return DEFAULT_WEBSITE_CONFIG;
        } catch (error) {
            console.error("Error fetching website config:", error);
            return DEFAULT_WEBSITE_CONFIG;
        }
    },

    async updateConfig(config: Partial<WebsiteConfig>): Promise<boolean> {
        try {
            const docRef = doc(db, "settings", "website");
            await setDoc(docRef, config, { merge: true });
            return true;
        } catch (error) {
            console.error("Error updating website config:", error);
            return false;
        }
    }
};
