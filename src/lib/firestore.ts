import { db } from "./firebase";
import {
    doc,
    getDoc,
    setDoc,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    Timestamp,
    updateDoc,
    increment
} from "firebase/firestore";

// --- Types ---
export interface UserProfile {
    id: string;
    name?: string;
    email?: string;
    // Onboarding Data
    onboarding?: {
        timePerDay: string;
        contentStyle: string; // 'Face', 'Faceless'
        language: string;
        primaryGoal: string; // 'Extra Income', etc.
        interests: string[]; // ['Tech', 'Finance'] - used for Niche
        isOnboardingComplete: boolean;
    };
    // Earnings Data
    earnings?: {
        total: number;
        history: { date: string; amount: number; source: string }[];
    }
}

export interface TrendItem {
    id: string;
    title: string;
    description: string;
    category: string;
    volume: string; // e.g., "High", "100k+"
    difficulty: "Easy" | "Medium" | "Hard";
    timestamp: any;
}

export interface YouTubeStats {
    subscribers: number;
    totalViews: number;
    recentVideos: {
        title: string;
        views: number;
    }[];
    monetized: boolean;
}

export interface Channel {
    id: string;
    userId: string;
    platform: 'youtube' | 'instagram';
    name: string;
    handle: string;
    avatarUrl?: string; // URL to image
    stats: {
        followers: number; // subscribers or followers
        posts: number;     // total video/post count
        engagement?: string; // "5.2%"
    };
    schedule: {
        frequency: number; // posts per week
        workingDays: string[]; // ["Mon", "Wed", "Fri"]
    };
    // Feature Expansion Fields
    details: {
        niche: string[];
        topics: string[];
        language: string;
        format: string; // 'Short', 'Long'
        editingStyle: string; // 'Fast-paced', etc.
        curation: string; // 'Fully AI', etc.
    };
    branding?: {
        description: string;
        keywords: string[];
        colors: string[];
        vibe: string;
    };
    createdAt: any;
    status: 'active' | 'paused';
    // Optional fields for connected channels
    connected?: boolean;
    ytStats?: YouTubeStats;
}

export interface ChannelStats {
    totalChannels: number;
    totalFollowers: number;
    totalPosts: number;
    // Add more global stats here
}

// Tool (Explore Feature) Interface
export interface Tool {
    id: string;
    name: string;
    company?: string;
    shortDesc?: string;
    fullDesc?: string;
    website: string;
    launchYear?: number;
    categories: string[];
    tags?: string[];
    useCases?: string[];
    platforms: string[];
    pricingModel: 'FREE' | 'PAID' | 'FREE_PAID';
    accessType: 'FREE' | 'SUBSCRIPTION' | 'ONE_TIME_PURCHASE';
    price: number;
    locked: boolean;
    lockReason?: string;
    createdAt: any;
    updatedAt: any;
}

// Guide (Knowledge Base) Interface
export interface Guide {
    id: string;
    title: string;
    type: 'Freelancing Kit' | 'Template' | 'Blueprint';
    category: string;
    content: string; // Markdown content
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    premium: boolean;
    accessType: 'FREE' | 'SUBSCRIPTION' | 'ONE_TIME_PURCHASE';
    tags?: string[];
    createdAt: any;
    updatedAt: any;
}

export const dbService = {
    // --- User Profile ---
    saveUserProfile: async (userId: string, data: Partial<UserProfile>) => {
        try {
            if (!userId) {
                console.error("saveUserProfile: Missing userId");
                return false;
            }
            const userRef = doc(db, "users", userId);
            await setDoc(userRef, { ...data, updatedAt: Timestamp.now() }, { merge: true });
            return true;
        } catch (e) {
            console.error("Error saving profile:", e);
            return false;
        }
    },

    getUserProfile: async (userId: string): Promise<UserProfile | null> => {
        try {
            const userRef = doc(db, "users", userId);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                return { id: snap.id, ...snap.data() } as UserProfile;
            }
            return null;
        } catch (e) {
            console.error("Error fetching profile:", e);
            return null;
        }
    },

    // --- Niche & Setup ---
    saveNiche: async (userId: string, niche: any) => {
        try {
            await addDoc(collection(db, "users", userId, "niches"), {
                ...niche,
                createdAt: Timestamp.now()
            });
            // Also update main profile interests for quick access
            if (niche.name) {
                await dbService.saveUserProfile(userId, {
                    onboarding: { interests: [niche.name] } as any // Type assertion for partial update nesting simplicity
                });
            }
            return true;
        } catch (e) {
            console.error("Error saving niche:", e);
            return false;
        }
    },

    // --- Channel Launch ---
    checkNameUnique: async (name: string): Promise<boolean> => {
        try {
            const q = query(
                collection(db, "globalUsedChannelNames"),
                where("name", "==", name.toLowerCase())
            );
            const snap = await getDocs(q);
            return snap.empty;
        } catch (e) {
            console.error("Error checking name:", e);
            return true; // Fail open for mock/dev speed, but log error
        }
    },

    lockChannelName: async (userId: string, name: string) => {
        try {
            await addDoc(collection(db, "globalUsedChannelNames"), {
                name: name.toLowerCase(),
                usedBy: userId,
                createdAt: Timestamp.now()
            });
            return true;
        } catch (e) {
            console.error("Error locking name:", e);
            return false;
        }
    },

    // --- Earnings ---
    logEarnings: async (userId: string, amount: number, source: string) => {
        try {
            // 1. Add to earnings history
            await addDoc(collection(db, "users", userId, "earningsHistory"), {
                amount,
                source,
                date: new Date().toISOString()
            });

            // 2. Atomic increment of total
            const userRef = doc(db, "users", userId);
            // We need to ensure the document exists first or setDoc with merge
            // But updateDoc is cleaner for fields.
            // Let's safe-guard with setDoc merge for the counter
            await setDoc(userRef, {
                earnings: {
                    total: increment(amount)
                }
            }, { merge: true });

            return true;
        } catch (e) {
            console.error("Error logging earnings:", e);
            return false;
        }
    },

    // --- Saved Items (Idea Vault) ---
    saveSavedItem: async (userId: string, item: any) => {
        try {
            await addDoc(collection(db, "users", userId, "savedItems"), {
                ...item,
                savedAt: Timestamp.now()
            });
            return true;
        } catch (e) {
            console.error("Error saving item:", e);
            return false;
        }
    },

    getSavedItems: async (userId: string) => {
        try {
            const q = query(collection(db, "users", userId, "savedItems"));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {
            console.error("Error fetching saved items:", e);
            return [];
        }
    },

    // --- Trends (Global) ---
    getTrends: async () => {
        // In real app, "trends" would be a root collection
        const q = query(collection(db, "trends"));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as TrendItem));
    },

    addTrend: async (trend: Omit<TrendItem, "id" | "timestamp">) => {
        const ref = collection(db, "trends");
        await addDoc(ref, {
            ...trend,
            timestamp: Timestamp.now()
        });
    },

    // --- Channels ---
    getChannels: async (userId: string): Promise<Channel[]> => {
        try {
            const q = query(collection(db, "users", userId, "channels"));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as Channel));
        } catch (e) {
            console.error("Error fetching channels:", e);
            return [];
        }
    },

    addChannel: async (userId: string, channel: Omit<Channel, "id" | "createdAt">) => {
        try {
            await addDoc(collection(db, "users", userId, "channels"), {
                ...channel,
                createdAt: Timestamp.now()
            });
            return true;
        } catch (e) {
            console.error("Error adding channel:", e);
            return false;
        }
    },

    getChannel: async (userId: string, channelId: string): Promise<Channel | null> => {
        try {
            const docRef = doc(db, "users", userId, "channels", channelId);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                return { id: snap.id, ...snap.data() } as Channel;
            }
            return null;
        } catch (e) {
            console.error("Error fetching channel:", e);
            return null;
        }
    },

    updateChannel: async (userId: string, channelId: string, updates: Partial<Channel>): Promise<boolean> => {
        try {
            const docRef = doc(db, "users", userId, "channels", channelId);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: Timestamp.now()
            });
            return true;
        } catch (e) {
            console.error("Error updating channel:", e);
            return false;
        }
    },

    deleteChannel: async (userId: string, channelId: string): Promise<boolean> => {
        try {
            const docRef = doc(db, "users", userId, "channels", channelId);
            await updateDoc(docRef, {
                status: 'deleted',
                deletedAt: Timestamp.now()
            });
            return true;
        } catch (e) {
            console.error("Error deleting channel:", e);
            return false;
        }
    },

    // --- Tools (Explore Feature) ---
    getTools: async (): Promise<Tool[]> => {
        try {
            const q = query(collection(db, "tools"));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as Tool));
        } catch (e) {
            console.error("Error fetching tools:", e);
            return [];
        }
    },

    getTool: async (id: string): Promise<Tool | null> => {
        try {
            const docRef = doc(db, "tools", id);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                return { id: snap.id, ...snap.data() } as Tool;
            }
            return null;
        } catch (e) {
            console.error("Error fetching tool:", e);
            return null;
        }
    },

    createTool: async (tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, "tools"), {
                ...tool,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            return docRef.id;
        } catch (e) {
            console.error("Error creating tool:", e);
            throw e;
        }
    },

    updateTool: async (id: string, updates: Partial<Tool>): Promise<boolean> => {
        try {
            const docRef = doc(db, "tools", id);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: Timestamp.now()
            });
            return true;
        } catch (e) {
            console.error("Error updating tool:", e);
            return false;
        }
    },

    deleteTool: async (id: string): Promise<boolean> => {
        try {
            const docRef = doc(db, "tools", id);
            await updateDoc(docRef, {
                deleted: true,
                deletedAt: Timestamp.now()
            });
            return true;
        } catch (e) {
            console.error("Error deleting tool:", e);
            return false;
        }
    },

    toggleToolLock: async (id: string, locked: boolean, lockReason?: string): Promise<boolean> => {
        try {
            const docRef = doc(db, "tools", id);
            await updateDoc(docRef, {
                locked,
                lockReason: lockReason || '',
                updatedAt: Timestamp.now()
            });
            return true;
        } catch (e) {
            console.error("Error toggling tool lock:", e);
            return false;
        }
    },

    // --- Guides (Knowledge Base) ---
    getGuides: async (): Promise<Guide[]> => {
        try {
            const q = query(collection(db, "guides"));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as Guide));
        } catch (e) {
            console.error("Error fetching guides:", e);
            return [];
        }
    },

    getGuide: async (id: string): Promise<Guide | null> => {
        try {
            const docRef = doc(db, "guides", id);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                return { id: snap.id, ...snap.data() } as Guide;
            }
            return null;
        } catch (e) {
            console.error("Error fetching guide:", e);
            return null;
        }
    },

    createGuide: async (guide: Omit<Guide, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, "guides"), {
                ...guide,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            return docRef.id;
        } catch (e) {
            console.error("Error creating guide:", e);
            throw e;
        }
    },

    updateGuide: async (id: string, updates: Partial<Guide>): Promise<boolean> => {
        try {
            const docRef = doc(db, "guides", id);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: Timestamp.now()
            });
            return true;
        } catch (e) {
            console.error("Error updating guide:", e);
            return false;
        }
    },

    deleteGuide: async (id: string): Promise<boolean> => {
        try {
            const docRef = doc(db, "guides", id);
            await updateDoc(docRef, {
                deleted: true,
                deletedAt: Timestamp.now()
            });
            return true;
        } catch (e) {
            console.error("Error deleting guide:", e);
            return false;
        }
    },

    toggleGuidePremium: async (id: string, premium: boolean): Promise<boolean> => {
        try {
            const docRef = doc(db, "guides", id);
            await updateDoc(docRef, {
                premium,
                updatedAt: Timestamp.now()
            });
            return true;
        } catch (e) {
            console.error("Error toggling guide premium:", e);
            return false;
        }
    }
};
