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
    deleteDoc,
    increment,
    limit,
    arrayUnion
} from "firebase/firestore";

// --- Interfaces ---

export interface UserProfile {
    id: string;
    name?: string;
    email?: string;
    role?: 'user' | 'admin';
    createdAt?: any;

    // Profile Details
    education?: string;
    occupation?: string;
    location?: string;
    pageName?: string;
    workingStatus?: string; // 'Full-time', 'Student', 'Freelancer'

    // Onboarding Data
    onboarding?: {
        timePerDay: string;
        contentStyle: string; // 'Face', 'Faceless'
        language: string;
        primaryGoal: string; // 'Extra Income', etc.
        interests: string[]; // ['Tech', 'Finance'] - used for Niche
        isOnboardingComplete: boolean;
    };

    // Subscription & Billing (Indian Context)
    plan: 'free' | 'pro' | 'pro_plus'; // Updated plans
    subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
    billingCycle?: 'monthly' | 'yearly';
    razorpayCustomerId?: string;
    currentPeriodEnd?: any;

    // Referral System
    referralCode?: string;
    referredBy?: string;
    walletBalance: number; // in INR
    walletHistory?: {
        amount: number;
        type: 'credit' | 'debit';
        description: string;
        date: any;
    }[];

    // Earnings Data (User's content revenue)
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
    imageUrl?: string; // App Icon or Thumbnail
    views?: number; // For popularity
    locked: boolean;
    lockReason?: string;
    isPublic: boolean; // Visibility toggle
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
    isPublic: boolean; // Visibility toggle
    accessType: 'FREE' | 'SUBSCRIPTION' | 'ONE_TIME_PURCHASE';
    tags?: string[];
    createdAt: any;
    updatedAt: any;
}

export interface Coupon {
    id: string;
    code: string; // "FREEHUB36"
    discountType: 'percent' | 'flat';
    discountValue: number; // 100 or 50
    active: boolean;
    usageCount: number;
    createdAt: any;
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

    getAllUsers: async (): Promise<UserProfile[]> => {
        try {
            const q = query(collection(db, "users"), limit(50)); // Limit for safety
            const snap = await getDocs(q);
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        } catch (e) {
            console.error("Error fetching all users:", e);
            return [];
        }
    },

    // --- Referral & Wallet ---
    getUserByReferralCode: async (code: string): Promise<UserProfile | null> => {
        try {
            const q = query(collection(db, "users"), where("referralCode", "==", code.toUpperCase()), limit(1));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const doc = snap.docs[0];
                return { id: doc.id, ...doc.data() } as UserProfile;
            }
            return null;
        } catch (e) {
            console.error("Error fetching referrer:", e);
            return null;
        }
    },

    updateWallet: async (userId: string, amount: number, description: string) => {
        try {
            const userRef = doc(db, "users", userId);

            // 1. Register Transaction
            const transactionRecord = {
                amount,
                type: amount > 0 ? 'credit' : 'debit',
                description,
                date: new Date().toISOString()
            };

            // 2. Atomic Update (Increment balance + Add to history)
            await updateDoc(userRef, {
                walletBalance: increment(amount),
                walletHistory: arrayUnion(transactionRecord)
            } as any);
            return true;
        } catch (e) {
            console.error("Error updating wallet:", e);
            return false;
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
                    onboarding: { interests: [niche.name] } as any
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
            return true;
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

    deleteSavedItem: async (userId: string, itemId: string) => {
        try {
            const docRef = doc(db, "users", userId, "savedItems", itemId);
            await deleteDoc(docRef);
            return true;
        } catch (e) {
            console.error("Error deleting saved item:", e);
            return false;
        }
    },

    updateUserSubscription: async (userId: string, plan: string, status: string = 'active') => {
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                plan: plan,
                subscriptionStatus: status,
                updatedAt: Timestamp.now()
            });
            return true;
        } catch (e) {
            console.error("Error updating subscription:", e);
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
    getTools: async (onlyPublic: boolean = false): Promise<Tool[]> => {
        try {
            let q;
            if (onlyPublic) {
                q = query(collection(db, "tools"), where("isPublic", "==", true));
            } else {
                q = query(collection(db, "tools"));
            }
            const toolsSnap = await getDocs(q);
            return toolsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tool));
        } catch (e) {
            console.error("Error getting tools:", e);
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
    getGuides: async (onlyPublic: boolean = false): Promise<Guide[]> => {
        try {
            let q;
            if (onlyPublic) {
                q = query(collection(db, "guides"), where("isPublic", "==", true));
            } else {
                q = query(collection(db, "guides"));
            }
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
    },

    // --- Coupons (Admin) ---
    getCoupons: async (): Promise<Coupon[]> => {
        try {
            const q = query(collection(db, "coupons"));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as Coupon));
        } catch (e) {
            console.error("Error fetching coupons:", e);
            return [];
        }
    },

    createCoupon: async (coupon: Omit<Coupon, 'id' | 'createdAt'>) => {
        try {
            await addDoc(collection(db, "coupons"), {
                ...coupon,
                createdAt: Timestamp.now(),
                usageCount: 0
            });
            return true;
        } catch (e) {
            console.error("Error creating coupon:", e);
            return false;
        }
    },

    deleteCoupon: async (id: string) => {
        try {
            await deleteDoc(doc(db, "coupons", id));
            return true;
        } catch (e) {
            console.error("Error deleting coupon:", e);
            return false;
        }
    },

    toggleCouponStatus: async (id: string, active: boolean) => {
        try {
            await updateDoc(doc(db, "coupons", id), { active });
            return true;
        } catch (e) {
            console.error("Error toggling coupon:", e);
            return false;
        }
    },

    incrementCouponUsage: async (code: string) => {
        try {
            const q = query(collection(db, "coupons"), where("code", "==", code));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const docRef = snap.docs[0].ref;
                await updateDoc(docRef, {
                    usageCount: increment(1)
                });
            }
        } catch (e) {
            console.error("Error incrementing coupon:", e);
        }
    },

    getCouponByCode: async (code: string): Promise<Coupon | null> => {
        try {
            const q = query(collection(db, "coupons"), where("code", "==", code), limit(1));
            const snap = await getDocs(q);
            if (!snap.empty) {
                return { id: snap.docs[0].id, ...snap.docs[0].data() } as Coupon;
            }
            return null;
        } catch (e) {
            console.error("Error fetching coupon by code:", e);
            return null;
        }
    },

    // --- Admin Stats ---
    getAdminStats: async () => {
        try {
            // In a real high-scale app, we'd use distributed counters or aggregation queries.
            // For now, fetching all users is acceptable for < 10k users, or use count()
            // We will do a simple fetch for now as we need Plan details.
            const usersSnap = await getDocs(collection(db, "users"));
            const users = usersSnap.docs.map(d => d.data() as UserProfile);

            const totalUsers = users.length;
            const proUsers = users.filter(u => u.plan === 'pro' || u.plan === 'pro_plus').length;

            // Calculate pseudo-revenue based on plan types (Mock calculation for display)
            const mrr = users.reduce((acc, user) => {
                if (user.plan === 'pro') return acc + 259;
                if (user.plan === 'pro_plus') return acc + 599;
                return acc;
            }, 0);

            return {
                totalUsers,
                activeSubs: proUsers,
                revenue: mrr,
                contentGen: 0 // We'd need a separate counter for this
            };
        } catch (e) {
            console.error("Error getting admin stats:", e);
            return { totalUsers: 0, activeSubs: 0, revenue: 0, contentGen: 0 };
        }
    },

    // --- Help Center Management ---
    getHelpArticles: async (): Promise<any[]> => {
        try {
            const articlesSnap = await getDocs(collection(db, "helpArticles"));
            return articlesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Error getting help articles:", e);
            return [];
        }
    },

    getHelpArticle: async (articleId: string): Promise<any | null> => {
        try {
            const articleRef = doc(db, "helpArticles", articleId);
            const articleSnap = await getDoc(articleRef);
            if (articleSnap.exists()) {
                return { id: articleSnap.id, ...articleSnap.data() };
            }
            return null;
        } catch (e) {
            console.error("Error getting help article:", e);
            return null;
        }
    },

    createHelpArticle: async (articleData: any): Promise<string | null> => {
        try {
            const docRef = await addDoc(collection(db, "helpArticles"), {
                ...articleData,
                views: 0,
                helpful: 0,
                notHelpful: 0,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            return docRef.id;
        } catch (e) {
            console.error("Error creating help article:", e);
            return null;
        }
    },

    updateHelpArticle: async (articleId: string, articleData: any): Promise<boolean> => {
        try {
            const articleRef = doc(db, "helpArticles", articleId);
            await updateDoc(articleRef, {
                ...articleData,
                updatedAt: Timestamp.now()
            });
            return true;
        } catch (e) {
            console.error("Error updating help article:", e);
            return false;
        }
    },

    deleteHelpArticle: async (articleId: string): Promise<boolean> => {
        try {
            const articleRef = doc(db, "helpArticles", articleId);
            await deleteDoc(articleRef);
            return true;
        } catch (e) {
            console.error("Error deleting help article:", e);
            return false;
        }
    },

    incrementHelpfulCount: async (articleId: string, type: 'helpful' | 'notHelpful'): Promise<boolean> => {
        try {
            const articleRef = doc(db, "helpArticles", articleId);
            await updateDoc(articleRef, {
                [type]: increment(1)
            });
            return true;
        } catch (e) {
            console.error("Error incrementing helpful count:", e);
            return false;
        }
    },

    // --- Blog Management ---
    getBlogs: async (filters?: { category?: string; published?: boolean }): Promise<any[]> => {
        try {
            let q = query(collection(db, "blogs"));

            if (filters?.category) {
                q = query(q, where("category", "==", filters.category));
            }
            if (filters?.published !== undefined) {
                q = query(q, where("published", "==", filters.published));
            }

            const blogsSnap = await getDocs(q);
            return blogsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Error getting blogs:", e);
            return [];
        }
    },

    getBlogBySlug: async (slug: string): Promise<any | null> => {
        try {
            const q = query(collection(db, "blogs"), where("slug", "==", slug), limit(1));
            const blogsSnap = await getDocs(q);
            if (!blogsSnap.empty) {
                const docSnap = blogsSnap.docs[0];
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (e) {
            console.error("Error getting blog by slug:", e);
            return null;
        }
    },

    getBlog: async (blogId: string): Promise<any | null> => {
        try {
            const blogRef = doc(db, "blogs", blogId);
            const blogSnap = await getDoc(blogRef);
            if (blogSnap.exists()) {
                return { id: blogSnap.id, ...blogSnap.data() };
            }
            return null;
        } catch (e) {
            console.error("Error getting blog:", e);
            return null;
        }
    },

    createBlog: async (blogData: any): Promise<string | null> => {
        try {
            const docRef = await addDoc(collection(db, "blogs"), {
                ...blogData,
                views: 0,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                publishedAt: blogData.published ? Timestamp.now() : null
            });
            return docRef.id;
        } catch (e) {
            console.error("Error creating blog:", e);
            return null;
        }
    },

    updateBlog: async (blogId: string, blogData: any): Promise<boolean> => {
        try {
            const blogRef = doc(db, "blogs", blogId);
            await updateDoc(blogRef, {
                ...blogData,
                updatedAt: Timestamp.now()
            });
            return true;
        } catch (e) {
            console.error("Error updating blog:", e);
            return false;
        }
    },

    deleteBlog: async (blogId: string): Promise<boolean> => {
        try {
            const blogRef = doc(db, "blogs", blogId);
            await deleteDoc(blogRef);
            return true;
        } catch (e) {
            console.error("Error deleting blog:", e);
            return false;
        }
    },

    incrementBlogViews: async (blogId: string): Promise<boolean> => {
        try {
            const blogRef = doc(db, "blogs", blogId);
            await updateDoc(blogRef, {
                views: increment(1)
            });
            return true;
        } catch (e) {
            console.error("Error incrementing blog views:", e);
            return false;
        }
    },

    bulkImportBlogs: async (blogs: any[]): Promise<{ success: number; failed: number }> => {
        let success = 0;
        let failed = 0;

        for (const blog of blogs) {
            try {
                await addDoc(collection(db, "blogs"), {
                    ...blog,
                    views: 0,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    publishedAt: blog.published ? Timestamp.now() : null
                });
                success++;
            } catch (e) {
                console.error("Error importing blog:", e);
                failed++;
            }
        }

        return { success, failed };
    }
};
