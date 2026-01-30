// Data Service Layer for Firestore
// Handles all CRUD operations and caching

import { firestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, getCountFromServer } from './firebase-config.js';

class DataService {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    // ===== TOOLS =====

    async getAllTools() {
        const cacheKey = 'all_tools';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const toolsRef = collection(firestore, 'tools');
            const snapshot = await getDocs(toolsRef);
            const tools = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.setCache(cacheKey, tools);
            return tools;
        } catch (error) {
            console.error('Error fetching tools:', error);
            return [];
        }
    }

    async getToolsCount() {
        const cacheKey = 'tools_count';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const toolsRef = collection(firestore, 'tools');
            const snapshot = await getCountFromServer(toolsRef);
            const count = snapshot.data().count;
            this.setCache(cacheKey, count);
            return count;
        } catch (error) {
            console.error('Error fetching tools count:', error);
            return 0;
        }
    }

    async getToolsPaginated(pageSize = 20, lastDoc = null) {
        try {
            const toolsRef = collection(firestore, 'tools');
            let q;

            if (lastDoc) {
                // Assuming default ordering by name or some field, or just arbitrary doc order
                // Ideally should order by something consistent like 'name' or 'createdAt'
                // For now, let's order by document ID implicitly or just use default collection order
                // Note: Pagination requires an orderBy clause if using startAfter with field values, 
                // but if passing the document snapshot, Firestore handles it.
                // However, basic queries without orderBy return documents in ID order? No, undefined order.
                // Best practice: orderBy('name')
                q = query(toolsRef, orderBy('name'), startAfter(lastDoc), limit(pageSize));
            } else {
                q = query(toolsRef, orderBy('name'), limit(pageSize));
            }

            const snapshot = await getDocs(q);
            const tools = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                tools,
                lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error('Error fetching paginated tools:', error);
            return { tools: [], lastDoc: null, hasMore: false };
        }
    }

    async getToolById(toolId) {
        const cacheKey = `tool_${toolId}`;
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const toolRef = doc(firestore, 'tools', toolId);
            const toolDoc = await getDoc(toolRef);

            if (toolDoc.exists()) {
                const tool = { id: toolDoc.id, ...toolDoc.data() };
                this.setCache(cacheKey, tool);
                return tool;
            }
            return null;
        } catch (error) {
            console.error('Error fetching tool:', error);
            return null;
        }
    }

    async getToolsByCategory(category) {
        const cacheKey = `tools_category_${category}`;
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const toolsRef = collection(firestore, 'tools');
            const q = query(toolsRef, where('category', '==', category));
            const snapshot = await getDocs(q);
            const tools = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.setCache(cacheKey, tools);
            return tools;
        } catch (error) {
            console.error('Error fetching tools by category:', error);
            return [];
        }
    }

    async searchTools(searchTerm) {
        try {
            const tools = await this.getAllTools();
            const lowerSearch = searchTerm.toLowerCase();

            return tools.filter(tool =>
                tool.name.toLowerCase().includes(lowerSearch) ||
                tool.company.toLowerCase().includes(lowerSearch) ||
                tool.description.toLowerCase().includes(lowerSearch) ||
                tool.category.toLowerCase().includes(lowerSearch)
            );
        } catch (error) {
            console.error('Error searching tools:', error);
            return [];
        }
    }

    async getTrendingTools(limitCount = 10) {
        const cacheKey = `trending_tools_${limitCount}`;
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const toolsRef = collection(firestore, 'tools');
            const q = query(toolsRef, orderBy('views', 'desc'), limit(limitCount));
            const snapshot = await getDocs(q);
            const tools = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.setCache(cacheKey, tools);
            return tools;
        } catch (error) {
            console.error('Error fetching trending tools:', error);
            return [];
        }
    }

    async incrementToolViews(toolId) {
        try {
            const toolRef = doc(firestore, 'tools', toolId);
            const toolDoc = await getDoc(toolRef);

            if (toolDoc.exists()) {
                const currentViews = toolDoc.data().views || 0;
                await updateDoc(toolRef, {
                    views: currentViews + 1,
                    lastViewed: new Date()
                });

                // Invalidate cache
                this.invalidateCache(`tool_${toolId}`);
                this.invalidateCache('all_tools');
            }
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    }

    // ===== GUIDES =====

    async getAllGuides() {
        const cacheKey = 'all_guides';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const guidesRef = collection(firestore, 'guides');
            const snapshot = await getDocs(guidesRef);
            const guides = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.setCache(cacheKey, guides);
            return guides;
        } catch (error) {
            console.error('Error fetching guides:', error);
            return [];
        }
    }

    async getGuideById(guideId) {
        const cacheKey = `guide_${guideId}`;
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const guideRef = doc(firestore, 'guides', guideId);
            const guideDoc = await getDoc(guideRef);

            if (guideDoc.exists()) {
                const guide = { id: guideDoc.id, ...guideDoc.data() };
                this.setCache(cacheKey, guide);
                return guide;
            }
            return null;
        } catch (error) {
            console.error('Error fetching guide:', error);
            return null;
        }
    }

    // ===== CATEGORIES =====

    async getAllCategories() {
        const cacheKey = 'all_categories';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const categoriesRef = collection(firestore, 'categories');
            const snapshot = await getDocs(categoriesRef);
            const categories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.setCache(cacheKey, categories);
            return categories;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    // ===== FEATURES =====

    async getAllFeatures() {
        const cacheKey = 'all_features';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const featuresRef = collection(firestore, 'features');
            const snapshot = await getDocs(featuresRef);
            const features = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.setCache(cacheKey, features);
            return features;
        } catch (error) {
            console.error('Error fetching features:', error);
            return [];
        }
    }

    async isFeatureEnabled(featureId) {
        try {
            const features = await this.getAllFeatures();
            const feature = features.find(f => f.id === featureId);
            return feature ? feature.enabled : false;
        } catch (error) {
            console.error('Error checking feature:', error);
            return false;
        }
    }

    // ===== ANALYTICS =====

    async trackSearch(searchTerm, resultsCount) {
        try {
            const analyticsRef = collection(firestore, 'search_analytics');
            await setDoc(doc(analyticsRef), {
                searchTerm,
                resultsCount,
                timestamp: new Date(),
                userId: 'anonymous' // TODO: Add user ID if logged in
            });
        } catch (error) {
            console.error('Error tracking search:', error);
        }
    }

    async trackToolClick(toolId, toolName) {
        try {
            const analyticsRef = collection(firestore, 'usage_analytics');
            await setDoc(doc(analyticsRef), {
                type: 'tool_click',
                toolId,
                toolName,
                timestamp: new Date(),
                userId: 'anonymous'
            });
        } catch (error) {
            console.error('Error tracking click:', error);
        }
    }

    // ===== CACHE MANAGEMENT =====

    isCacheValid(key) {
        if (!this.cache.has(key)) return false;

        const cached = this.cache.get(key);
        const now = Date.now();
        return (now - cached.timestamp) < this.cacheExpiry;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    invalidateCache(key) {
        this.cache.delete(key);
    }

    clearCache() {
        this.cache.clear();
    }
}

// Export singleton instance
const dataService = new DataService();
export default dataService;
