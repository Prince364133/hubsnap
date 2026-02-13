import { db } from "./firebase";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    setDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    serverTimestamp,
    increment,
    arrayUnion,
    writeBatch,
    collectionGroup
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
    bio?: string;

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
    };

    // ============================================
    // USER INTELLIGENCE & ACTIVITY TRACKING
    // ============================================

    // Activity Summary (Aggregated from analytics)
    activitySummary?: {
        lastActive: any; // Timestamp
        totalSessions: number;
        avgSessionDuration: number; // seconds
        totalPageViews: number;
        mostVisitedPage: string;
        deviceType: 'mobile' | 'desktop' | 'tablet' | 'mixed';
        location?: { country: string; state?: string };
        engagementScore: number; // 0-100
    };

    // Status Classification
    status?: 'highly_active' | 'active' | 'at_risk' | 'inactive';
    statusUpdatedAt?: any; // Timestamp

    // Growth Metrics
    metrics?: {
        firstSessionAt: any; // Timestamp
        lastSessionAt: any; // Timestamp
        sessionCount7d: number;
        sessionCount30d: number;
        activityTrend: 'growing' | 'stable' | 'declining';
    };
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

// ============================================
// USER ACTIVITY & INTELLIGENCE INTERFACES
// ============================================

export interface UserActivityAggregate {
    userId: string;
    lastUpdated: any; // Timestamp

    // Session metrics
    totalSessions: number;
    avgSessionDuration: number;
    longestSession: number;

    // Page view metrics
    totalPageViews: number;
    pagesVisited: { [page: string]: number };
    mostVisitedPage: string;

    // Device & location
    deviceBreakdown: { mobile: number; desktop: number; tablet: number };
    primaryDevice: 'mobile' | 'desktop' | 'tablet';
    locations: { country: string; count: number }[];

    // Time-based metrics
    sessionCount7d: number;
    sessionCount30d: number;
    sessionCount90d: number;

    // Engagement
    engagementScore: number; // 0-100
    activityTrend: 'growing' | 'stable' | 'declining';
}

export interface AdminDashboardStats {
    // User growth
    usersJoinedToday: number;
    usersJoinedThisWeek: number;
    usersJoinedThisMonth: number;
    totalUsers: number;

    // Activity
    activeUsersToday: number;
    activeUsersThisWeek: number;
    activeUsersThisMonth: number;

    // Status distribution
    statusDistribution: {
        highly_active: number;
        active: number;
        at_risk: number;
        inactive: number;
    };

    // Retention & churn
    retentionRate7d: number; // percentage
    retentionRate30d: number;
    churnWarnings: number; // users at risk

    // Last updated
    lastUpdated: any; // Timestamp
}

export interface SavedItem {
    id: string;
    userId: string;
    type: 'tool' | 'guide' | 'rated_guide' | 'blog'; // Added 'blog'
    data: any; // Tool, Guide, or Blog data
    rating?: number; // Only for rated_guide
    savedAt: any;
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
    youtubeChannels: number;
    instagramPages: number;
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
    whatYouWillLearn?: string[];
    includes?: string[];
    createdAt: any;
    updatedAt: any;
    deleted?: boolean;
    externalUrl?: string; // Link to the actual resource/tool
    ratingSum?: number;
    ratingCount?: number;
    averageRating?: number;
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

export interface ContentHistoryItem {
    id: string;
    userId: string;
    title: string;
    type: 'script' | 'idea' | 'outline' | 'image_prompt' | 'mixed' | 'trend';
    content: any;
    platform: 'youtube' | 'instagram' | 'linkedin' | 'twitter' | 'blog' | 'other';
    metadata?: {
        mode?: string;
        lang?: string;
        tone?: string;
    };
    createdAt: any;
}

export interface Blog {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string; // HTML/Rich Text
    coverImage?: string;
    category: string;
    tags: string[];
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
    published: boolean;
    featured?: boolean;
    views: number;
    readTime: number; // in minutes
    resources?: { label: string; url: string }[];

    // SEO
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];

    // Engagement
    likes: number;
    commentsCount: number;

    createdAt: any;
    updatedAt: any;
    publishedAt?: any;
}

export interface Comment {
    id: string;
    blogId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: any;
}

export interface BlogComment {
    id: string;
    blogId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: any;
    likes: number; // Likes on comment
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

    getSavedItems: async (userId: string): Promise<SavedItem[]> => {
        try {
            const q = query(collection(db, "users", userId, "savedItems"));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as SavedItem));
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
            // Filter out deleted in JS to handle documents missing the field
            return toolsSnap.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Tool))
                .filter(tool => (tool as any).deleted !== true);
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
                deleted: false,
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

    batchDeleteTools: async (ids: string[]): Promise<boolean> => {
        try {
            const batch = writeBatch(db);
            ids.forEach(id => {
                const docRef = doc(db, "tools", id);
                batch.update(docRef, {
                    deleted: true,
                    deletedAt: Timestamp.now()
                });
            });
            await batch.commit();
            return true;
        } catch (e) {
            console.error("Error batch deleting tools:", e);
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
            // Filter out deleted in JS to handle documents missing the field
            return snap.docs
                .map(d => ({ id: d.id, ...d.data() } as Guide))
                .filter(guide => (guide as any).deleted !== true);
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
                deleted: false,
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

    rateGuide: async (guideId: string, rating: number, userId?: string, guideData?: any): Promise<boolean> => {
        try {
            const guideRef = doc(db, "guides", guideId);
            const guideSnap = await getDoc(guideRef);
            if (!guideSnap.exists()) return false;

            const data = guideSnap.data();
            const newSum = (data.ratingSum || 0) + rating;
            const newCount = (data.ratingCount || 0) + 1;

            await updateDoc(guideRef, {
                ratingSum: newSum,
                ratingCount: newCount,
                averageRating: Number((newSum / newCount).toFixed(1)),
                updatedAt: Timestamp.now()
            });

            // If userId is provided, also save this as an interaction
            if (userId && guideData) {
                await addDoc(collection(db, "users", userId, "savedItems"), {
                    type: 'rated_guide',
                    rating,
                    data: guideData,
                    savedAt: Timestamp.now()
                });
            }

            return true;
        } catch (e) {
            console.error("Error rating guide:", e);
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

    batchDeleteGuides: async (ids: string[]): Promise<boolean> => {
        try {
            const batch = writeBatch(db);
            ids.forEach(id => {
                const docRef = doc(db, "guides", id);
                batch.update(docRef, {
                    deleted: true,
                    deletedAt: Timestamp.now()
                });
            });
            await batch.commit();
            return true;
        } catch (e) {
            console.error("Error batch deleting guides:", e);
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

    batchDeleteBlogs: async (ids: string[]): Promise<boolean> => {
        try {
            const batch = writeBatch(db);
            ids.forEach(id => {
                batch.delete(doc(db, "blogs", id));
            });
            await batch.commit();
            return true;
        } catch (e) {
            console.error("Error batch deleting blogs:", e);
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
    },

    // --- Content History & Analytics ---
    saveContentHistory: async (userId: string, item: Omit<ContentHistoryItem, 'id' | 'createdAt'>): Promise<string | null> => {
        try {
            const docRef = await addDoc(collection(db, "users", userId, "content_history"), {
                ...item,
                createdAt: Timestamp.now()
            });
            return docRef.id;
        } catch (e) {
            console.error("Error saving content history:", e);
            return null;
        }
    },

    getContentHistory: async (userId: string, filters?: { type?: string; platform?: string; startDate?: Date; endDate?: Date }): Promise<ContentHistoryItem[]> => {
        try {
            const q = query(collection(db, "users", userId, "content_history"));
            const snap = await getDocs(q);
            let items = snap.docs.map(d => ({ id: d.id, ...d.data() } as ContentHistoryItem));

            // Sort by date desc (newest first)
            items.sort((a, b) => {
                // Handle both Firestore Timestamp and JS Date if needed, though usually Timestamp in DB
                const tA = (a.createdAt && typeof a.createdAt.toMillis === 'function') ? a.createdAt.toMillis() : 0;
                const tB = (b.createdAt && typeof b.createdAt.toMillis === 'function') ? b.createdAt.toMillis() : 0;
                return tB - tA;
            });

            if (filters) {
                if (filters.type && filters.type !== 'all') {
                    items = items.filter(i => i.type === filters.type);
                }
                if (filters.platform && filters.platform !== 'all') {
                    items = items.filter(i => i.platform === filters.platform);
                }
                if (filters.startDate) {
                    items = items.filter(i => {
                        const d = (i.createdAt && typeof i.createdAt.toDate === 'function') ? i.createdAt.toDate() : new Date();
                        return d >= filters.startDate!;
                    });
                }
                if (filters.endDate) {
                    items = items.filter(i => {
                        const d = (i.createdAt && typeof i.createdAt.toDate === 'function') ? i.createdAt.toDate() : new Date();
                        return d <= filters.endDate!;
                    });
                }
            }

            return items;
        } catch (e) {
            console.error("Error fetching content history:", e);
            return [];
        }
    },

    // --- Blog Interactions ---
    trackBlogView: async (blogId: string) => {
        try {
            const blogRef = doc(db, "blogs", blogId);
            await updateDoc(blogRef, { views: increment(1) });
        } catch (e) {
            console.error("Error tracking view:", e);
        }
    },

    toggleBlogLike: async (blogId: string, userId: string) => {
        try {
            const blogRef = doc(db, "blogs", blogId);
            const userLikeRef = doc(db, "users", userId, "liked_blogs", blogId);

            const userLikeSnap = await getDoc(userLikeRef);

            if (userLikeSnap.exists()) {
                // Unlike
                await deleteDoc(userLikeRef);
                await updateDoc(blogRef, { likes: increment(-1) });
                return false; // Not liked
            } else {
                // Like
                await setDoc(userLikeRef, { likedAt: serverTimestamp() });
                await updateDoc(blogRef, { likes: increment(1) });
                return true; // Liked
            }
        } catch (e) {
            console.error("Error toggling like:", e);
            return false;
        }
    },

    toggleSaveBlog: async (blogId: string, userId: string) => {
        try {
            // Check if already saved
            const q = query(
                collection(db, "users", userId, "savedItems"),
                where("type", "==", "blog"),
                where("data.id", "==", blogId)
            );
            const snap = await getDocs(q);

            if (!snap.empty) {
                // Unsave
                await deleteDoc(doc(db, "users", userId, "savedItems", snap.docs[0].id));
                return false;
            } else {
                // Save
                // First get blog data to store a snapshot
                const blogRef = doc(db, "blogs", blogId);
                const blogSnap = await getDoc(blogRef);
                if (!blogSnap.exists()) return false;

                await addDoc(collection(db, "users", userId, "savedItems"), {
                    userId,
                    type: 'blog',
                    data: { id: blogSnap.id, ...blogSnap.data() },
                    savedAt: serverTimestamp()
                });
                return true;
            }
        } catch (e) {
            console.error("Error toggling save:", e);
            return false;
        }
    },

    getUsedBlogs: async (userId: string): Promise<{ liked: Blog[], commented: Blog[] }> => {
        try {
            const likedBlogs: Blog[] = [];
            const commentedBlogs: Blog[] = [];

            // Fetch Liked Blogs
            const likedSnap = await getDocs(collection(db, "users", userId, "liked_blogs"));
            const likedIds = likedSnap.docs.map(d => d.id);

            for (const id of likedIds) {
                const docSnap = await getDoc(doc(db, "blogs", id));
                if (docSnap.exists()) {
                    likedBlogs.push({ id: docSnap.id, ...docSnap.data() } as Blog);
                }
            }

            // Fetch Commented Blogs (This is expensive without a separate index, but functional for now)
            // Ideally, we store "commented_blogs" in user profile similar to liked_blogs to avoid query scans
            // For now, we will skip implementation or do a client-side filter if needed, 
            // BUT a better way is to query all comments by userId if we had a collection group query.
            // Since we structure comments as subcollections, collection group query is needed.

            const commentsQ = query(collectionGroup(db, 'comments'), where('userId', '==', userId));
            const commentsSnap = await getDocs(commentsQ);
            const commentedBlogIds = new Set<string>();
            commentsSnap.forEach(d => commentedBlogIds.add((d.data() as any).blogId));

            for (const id of Array.from(commentedBlogIds)) {
                const docSnap = await getDoc(doc(db, "blogs", id));
                if (docSnap.exists()) {
                    commentedBlogs.push({ id: docSnap.id, ...docSnap.data() } as Blog);
                }
            }

            return { liked: likedBlogs, commented: commentedBlogs };
        } catch (e) {
            console.error("Error fetching used blogs:", e);
            return { liked: [], commented: [] };
        }
    },

    isBlogLiked: async (blogId: string, userId: string) => {
        try {
            const userLikeRef = doc(db, "users", userId, "liked_blogs", blogId);
            const snap = await getDoc(userLikeRef);
            return snap.exists();
        } catch (e) {
            return false;
        }
    },

    isBlogSaved: async (blogId: string, userId: string) => {
        try {
            const q = query(
                collection(db, "users", userId, "savedItems"),
                where("type", "==", "blog"),
                where("data.id", "==", blogId)
            );
            const snap = await getDocs(q);
            return !snap.empty;
        } catch (e) {
            return false;
        }
    },

    // --- Comments ---
    addComment: async (blogId: string, userId: string, content: string, userInfo: { name: string; avatar?: string }) => {
        try {
            const commentData = {
                blogId,
                userId,
                userName: userInfo.name,
                userAvatar: userInfo.avatar || null,
                content,
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, "blogs", blogId, "comments"), commentData);

            // Update local comment count
            const blogRef = doc(db, "blogs", blogId);
            await updateDoc(blogRef, { commentsCount: increment(1) });

            return true;
        } catch (e) {
            console.error("Error adding comment:", e);
            return false;
        }
    },

    getComments: async (blogId: string): Promise<Comment[]> => {
        try {
            const q = query(collection(db, "blogs", blogId, "comments"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
        } catch (e) {
            console.error("Error getting comments:", e);
            return [];
        }
    },

    deleteComment: async (blogId: string, commentId: string) => {
        try {
            await deleteDoc(doc(db, "blogs", blogId, "comments", commentId));
            // Update local comment count
            const blogRef = doc(db, "blogs", blogId);
            await updateDoc(blogRef, { commentsCount: increment(-1) });
            return true;
        } catch (e) {
            console.error("Error deleting comment:", e);
            return false;
        }
    }
};
