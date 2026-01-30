// AI-Powered Features Manager
// Handles all Phase 3 AI features with toggle support

class AIFeaturesManager {
    constructor() {
        this.features = new Map();
        this.initialized = false;
    }

    async initialize() {
        // Default enabled features
        const defaultFeatures = [
            'ai-search', 'smart-filters', 'similar-tools', 'trending-tools',
            'personalized-feed', 'tool-comparison', 'favorites-system',
            'tool-reviews', 'share-tools', 'email-alerts',
            // New features
            'text-to-speech', 'quick-copy', 'dark-mode', 'quick-preview',
            'recently-viewed', 'surprise-me', 'popular-searches',
            'related-categories', 'sort-rating', 'view-toggle'
        ];

        // Initialize with defaults enabled
        defaultFeatures.forEach(id => {
            this.features.set(id, { id, enabled: true });
        });

        // Load feature states from Realtime Database (Admin Config)
        if (window.firebaseDb && window.firebaseRef && window.firebaseGet) {
            try {
                const featuresRef = window.firebaseRef(window.firebaseDb, 'system/features');
                const snapshot = await window.firebaseGet(featuresRef);
                if (snapshot.exists()) {
                    const remoteConfig = snapshot.val();
                    // Merge remote config
                    Object.keys(remoteConfig).forEach(key => {
                        const enabled = remoteConfig[key].enabled;
                        if (this.features.has(key)) {
                            this.features.get(key).enabled = enabled;
                        }
                    });
                }
            } catch (error) {
                console.warn('Could not load system features config:', error);
            }
        }

        // Load legacy feature configurations if needed (optional)
        if (window.dataService) {
            // ... legacy loading if different from system/features ...
        }

        this.initialized = true;
    }

    isEnabled(featureId) {
        const feature = this.features.get(featureId);
        return feature ? feature.enabled : false;
    }

    // Feature 1: AI-Powered Search
    async aiSearch(query) {
        if (!this.isEnabled('ai-search')) {
            return this.basicSearch(query);
        }

        try {
            // Use Gemini AI for enhanced search
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${window.aiChatbot.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Given this search query: "${query}", extract the key intent and relevant keywords for searching AI tools. Return only a JSON object with: {"intent": "brief intent", "keywords": ["keyword1", "keyword2"], "category": "suggested category or null"}`
                        }]
                    }]
                })
            });

            const data = await response.json();
            const aiResult = JSON.parse(data.candidates[0].content.parts[0].text);

            // Use AI-extracted keywords for better search
            return await window.dataService.searchTools(aiResult.keywords.join(' '));
        } catch (error) {
            console.error('AI search failed, falling back to basic search:', error);
            return this.basicSearch(query);
        }
    }

    basicSearch(query) {
        return window.dataService.searchTools(query);
    }

    // Feature 2: Smart Filters
    async suggestFilters(query, currentResults) {
        if (!this.isEnabled('smart-filters')) {
            return null;
        }

        // Analyze current results to suggest relevant filters
        const categories = [...new Set(currentResults.map(t => t.category))];
        const pricingModels = [...new Set(currentResults.map(t => t.pricing))];

        return {
            suggestedCategory: categories[0],
            suggestedPricing: pricingModels.includes('FREE') ? 'FREE' : pricingModels[0],
            message: `Try filtering by ${categories[0]} or ${pricingModels[0]} tools`
        };
    }

    // Feature 3: Similar Tools
    async getSimilarTools(toolId) {
        if (!this.isEnabled('similar-tools')) {
            return [];
        }

        const tool = await window.dataService.getToolById(toolId);
        if (!tool) return [];

        // Find tools in same category with similar features
        const allTools = await window.dataService.getAllTools();
        return allTools
            .filter(t => t.id !== toolId && t.category === tool.category)
            .slice(0, 5);
    }

    // Feature 4: Trending Tools (already in dataService)
    async getTrendingTools(limit = 10) {
        if (!this.isEnabled('trending-tools')) {
            return [];
        }
        return await window.dataService.getTrendingTools(limit);
    }

    // Feature 5: Personalized Feed
    async getPersonalizedFeed(userId) {
        if (!this.isEnabled('personalized-feed')) {
            return await this.getTrendingTools();
        }

        // Get user preferences and favorites
        // For now, return trending tools
        // TODO: Implement user preference tracking
        return await this.getTrendingTools(20);
    }

    // Feature 6: Tool Comparison
    compareTools(tool1, tool2) {
        if (!this.isEnabled('tool-comparison')) {
            return null;
        }

        return {
            tool1: {
                name: tool1.name,
                pricing: tool1.pricing,
                features: tool1.features || [],
                rating: tool1.rating || 0
            },
            tool2: {
                name: tool2.name,
                pricing: tool2.pricing,
                features: tool2.features || [],
                rating: tool2.rating || 0
            },
            differences: this.findDifferences(tool1, tool2)
        };
    }

    findDifferences(tool1, tool2) {
        const diffs = [];

        if (tool1.pricing !== tool2.pricing) {
            diffs.push(`Pricing: ${tool1.pricing} vs ${tool2.pricing}`);
        }

        if (tool1.category !== tool2.category) {
            diffs.push(`Category: ${tool1.category} vs ${tool2.category}`);
        }

        return diffs;
    }

    // Feature 7: Favorites System
    async addToFavorites(userId, toolId) {
        if (!this.isEnabled('favorites-system')) {
            return false;
        }

        try {
            const favorites = this.getFavorites(userId) || [];
            if (!favorites.includes(toolId)) {
                favorites.push(toolId);
                localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding to favorites:', error);
            return false;
        }
    }

    async removeFromFavorites(userId, toolId) {
        try {
            const favorites = this.getFavorites(userId) || [];
            const updated = favorites.filter(id => id !== toolId);
            localStorage.setItem(`favorites_${userId}`, JSON.stringify(updated));
            return true;
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return false;
        }
    }

    getFavorites(userId) {
        const stored = localStorage.getItem(`favorites_${userId}`);
        return stored ? JSON.parse(stored) : [];
    }

    isFavorite(userId, toolId) {
        const favorites = this.getFavorites(userId);
        return favorites.includes(toolId);
    }

    // Feature 8: Tool Reviews
    async addReview(toolId, userId, rating, comment) {
        if (!this.isEnabled('tool-reviews')) {
            return false;
        }

        const review = {
            userId,
            rating,
            comment,
            timestamp: new Date(),
            helpful: 0
        };

        // Store in localStorage for now
        // TODO: Store in Firestore
        const reviews = this.getReviews(toolId);
        reviews.push(review);
        localStorage.setItem(`reviews_${toolId}`, JSON.stringify(reviews));

        return true;
    }

    getReviews(toolId) {
        const stored = localStorage.getItem(`reviews_${toolId}`);
        return stored ? JSON.parse(stored) : [];
    }

    getAverageRating(toolId) {
        const reviews = this.getReviews(toolId);
        if (reviews.length === 0) return 0;

        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / reviews.length).toFixed(1);
    }

    // Feature 9: Share Tools
    async shareTool(toolId, platform) {
        if (!this.isEnabled('share-tools')) {
            return null;
        }

        const tool = await window.dataService.getToolById(toolId);
        if (!tool) return null;

        const url = `${window.location.origin}/tool.html?id=${toolId}`;
        const text = `Check out ${tool.name} - ${tool.description}`;

        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            email: `mailto:?subject=${encodeURIComponent(tool.name)}&body=${encodeURIComponent(text + ' ' + url)}`
        };

        return shareUrls[platform] || null;
    }

    // Feature 10: Email Alerts
    async subscribeToAlerts(email, preferences) {
        if (!this.isEnabled('email-alerts')) {
            return false;
        }

        const subscription = {
            email,
            preferences: preferences || {
                newTools: true,
                priceChanges: false,
                weeklyDigest: true
            },
            subscribedAt: new Date()
        };

        // Store in localStorage for now
        // TODO: Store in Firestore and set up email service
        localStorage.setItem(`email_subscription_${email}`, JSON.stringify(subscription));

        return true;
    }

    getSubscription(email) {
        const stored = localStorage.getItem(`email_subscription_${email}`);
        return stored ? JSON.parse(stored) : null;
    }

    // Feature 11: Text-to-Speech
    speak(text) {
        if (!this.isEnabled('text-to-speech')) return;

        window.speechSynthesis.cancel(); // Stop any current speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    }

    stopSpeaking() {
        window.speechSynthesis.cancel();
    }

    // Feature 12: Quick Copy
    async copyToClipboard(text) {
        if (!this.isEnabled('quick-copy')) return false;
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy keys: ', err);
            return false;
        }
    }

    // Feature 13: Dark/Light Theme
    toggleTheme() {
        if (!this.isEnabled('dark-mode')) return;

        const body = document.body;
        const currentTheme = body.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        return newTheme;
    }

    initTheme() {
        if (!this.isEnabled('dark-mode')) return;
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
    }

    // Feature 14: Quick Preview
    async getToolPreview(toolId) {
        if (!this.isEnabled('quick-preview')) return null;
        return await window.dataService.getToolById(toolId);
    }

    // Feature 15: Recently Viewed
    addToRecentlyViewed(tool) {
        if (!this.isEnabled('recently-viewed')) return;

        let recent = this.getRecentlyViewed();
        // Remove if exists
        recent = recent.filter(t => t.id !== tool.id);
        // Add to front
        recent.unshift({
            id: tool.id,
            name: tool.name,
            icon: tool.name.charAt(0),
            timestamp: new Date().toISOString()
        });
        // Limit to 10
        recent = recent.slice(0, 10);

        localStorage.setItem('recently_viewed', JSON.stringify(recent));
    }

    getRecentlyViewed() {
        if (!this.isEnabled('recently-viewed')) return [];
        const stored = localStorage.getItem('recently_viewed');
        return stored ? JSON.parse(stored) : [];
    }

    // Feature 16: Surprise Me
    async surpriseMe() {
        if (!this.isEnabled('surprise-me')) return null;
        const tools = await window.dataService.getAllTools();
        if (!tools || tools.length === 0) return null;
        const randomTool = tools[Math.floor(Math.random() * tools.length)];
        return randomTool;
    }

    // Feature 17: Popular Searches
    getPopularSearches() {
        if (!this.isEnabled('popular-searches')) return [];
        return [
            'Video Editing', 'Copywriting', 'Logo Design',
            'SEO', 'Coding Assistant', 'Voice Cloning', 'Avatar'
        ];
    }

    // Feature 18: Related Categories
    getRelatedCategories(currentCategory) {
        if (!this.isEnabled('related-categories')) return [];

        const map = {
            'Text & Writing': ['Marketing', 'SEO', 'Email Assistant'],
            'Image & Design': ['Video Editing', 'Logo Design', '3D Modeling'],
            'Video': ['Audio & Speech', 'Animation', 'Avatars'],
            'Marketing': ['Social Media', 'Copywriting', 'Analytics'],
            'Coding': ['Productivity', 'Startup Tools', 'No-Code']
        };

        return map[currentCategory] || [];
    }

    // Feature 19: Sort by Rating
    sortToolsByRating(tools) {
        if (!this.isEnabled('sort-rating')) return tools;
        // Since we simulate ratings for now, we'll randomize slightly to simulate "best rated"
        // In real app, this would use actual ratings
        return [...tools].sort((a, b) => b.name.length - a.name.length); // Dummy sort for visual change
    }

    // Feature 20: View Toggle
    toggleView(viewType) {
        if (!this.isEnabled('view-toggle')) return;
        localStorage.setItem('view_mode', viewType);
        return viewType;
    }

    getViewMode() {
        if (!this.isEnabled('view-toggle')) return 'grid';
        return localStorage.getItem('view_mode') || 'grid';
    }
}

// Initialize features manager
window.aiFeaturesManager = new AIFeaturesManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.aiFeaturesManager.initialize();
});
