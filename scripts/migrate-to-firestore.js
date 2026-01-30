// Firestore Data Migration Script
// Uploads all tools and guides data from JSON files to Firestore

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDqPgZCR-8qlIGvjEjQWKOdWtLCkSPGGJo",
    authDomain: "yt-tool-1c8fe.firebaseapp.com",
    databaseURL: "https://yt-tool-1c8fe-default-rtdb.firebaseio.com",
    projectId: "yt-tool-1c8fe",
    storageBucket: "yt-tool-1c8fe.firebasestorage.app",
    messagingSenderId: "1078575056869",
    appId: "1:1078575056869:web:1c3e0e5a7b7b7b7b7b7b7b",
    measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class FirestoreMigration {
    constructor() {
        this.batchSize = 500; // Firestore batch limit
        this.uploadedTools = 0;
        this.uploadedGuides = 0;
        this.errors = [];
    }

    // Upload tools data
    async uploadTools() {
        console.log('🔄 Starting tools migration...');

        try {
            const response = await fetch('data/tools.json');
            const tools = await response.json();

            console.log(`📊 Found ${tools.length} tools to upload`);

            // Upload in batches
            for (let i = 0; i < tools.length; i += this.batchSize) {
                const batch = writeBatch(db);
                const toolsBatch = tools.slice(i, i + this.batchSize);

                toolsBatch.forEach(tool => {
                    const toolRef = doc(db, 'tools', tool.id || tool.slug);

                    // Prepare tool data
                    const toolData = {
                        id: tool.id || tool.slug,
                        name: tool.name,
                        slug: tool.slug,
                        description: tool.short_description || tool.full_description || '',
                        fullDescription: tool.full_description || tool.short_description || '',
                        category: tool.categories?.[0] || 'Uncategorized',
                        categories: tool.categories || [],
                        useCases: tool.use_cases || [],
                        pricing: tool.pricing_model || 'UNKNOWN',
                        pricingModel: tool.pricing_model || 'UNKNOWN',
                        badgeColor: tool.badge_color || 'gray',
                        websiteUrl: tool.website_url || '',
                        url: tool.website_url || '',
                        platforms: tool.platforms_supported || [],
                        tags: tool.tags || [],
                        company: tool.company || '',
                        launchYear: tool.launch_year || null,
                        views: 0,
                        favorites: 0,
                        rating: 0,
                        reviewCount: 0,
                        features: tool.features || [],
                        createdAt: tool.created_at || new Date().toISOString(),
                        updatedAt: tool.updated_at || new Date().toISOString()
                    };

                    batch.set(toolRef, toolData);
                });

                await batch.commit();
                this.uploadedTools += toolsBatch.length;

                console.log(`✅ Uploaded ${this.uploadedTools}/${tools.length} tools`);

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            console.log(`🎉 Successfully uploaded ${this.uploadedTools} tools!`);
            return true;
        } catch (error) {
            console.error('❌ Error uploading tools:', error);
            this.errors.push({ type: 'tools', error: error.message });
            return false;
        }
    }

    // Upload guides data
    async uploadGuides() {
        console.log('🔄 Starting guides migration...');

        try {
            const response = await fetch('data/guides.json');
            const guides = await response.json();

            console.log(`📊 Found ${guides.length} guides to upload`);

            // Upload in batches
            for (let i = 0; i < guides.length; i += this.batchSize) {
                const batch = writeBatch(db);
                const guidesBatch = guides.slice(i, i + this.batchSize);

                guidesBatch.forEach(guide => {
                    const guideRef = doc(db, 'guides', guide.id || guide.slug);

                    // Prepare guide data
                    const guideData = {
                        id: guide.id || guide.slug,
                        title: guide.title || guide.name,
                        slug: guide.slug,
                        description: guide.short_description || guide.description || '',
                        fullDescription: guide.full_description || guide.description || '',
                        category: guide.category || 'General',
                        type: guide.type || 'guide',
                        difficulty: guide.difficulty || 'Intermediate',
                        estimatedTime: guide.estimated_time || '10 min',
                        access: guide.access || 'free',
                        locked: guide.locked || false,
                        content: guide.content || '',
                        steps: guide.steps || [],
                        tools: guide.tools || [],
                        tags: guide.tags || [],
                        views: 0,
                        likes: 0,
                        createdAt: guide.created_at || new Date().toISOString(),
                        updatedAt: guide.updated_at || new Date().toISOString()
                    };

                    batch.set(guideRef, guideData);
                });

                await batch.commit();
                this.uploadedGuides += guidesBatch.length;

                console.log(`✅ Uploaded ${this.uploadedGuides}/${guides.length} guides`);

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            console.log(`🎉 Successfully uploaded ${this.uploadedGuides} guides!`);
            return true;
        } catch (error) {
            console.error('❌ Error uploading guides:', error);
            this.errors.push({ type: 'guides', error: error.message });
            return false;
        }
    }

    // Upload categories
    async uploadCategories() {
        console.log('🔄 Uploading categories...');

        try {
            const response = await fetch('data/tools.json');
            const tools = await response.json();

            // Extract unique categories
            const categoriesSet = new Set();
            tools.forEach(tool => {
                if (tool.categories) {
                    tool.categories.forEach(cat => categoriesSet.add(cat));
                }
            });

            const categories = Array.from(categoriesSet);
            const batch = writeBatch(db);

            categories.forEach(category => {
                const categoryRef = doc(db, 'categories', category.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                batch.set(categoryRef, {
                    id: category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    name: category,
                    toolCount: tools.filter(t => t.categories?.includes(category)).length,
                    createdAt: new Date().toISOString()
                });
            });

            await batch.commit();
            console.log(`✅ Uploaded ${categories.length} categories`);
            return true;
        } catch (error) {
            console.error('❌ Error uploading categories:', error);
            this.errors.push({ type: 'categories', error: error.message });
            return false;
        }
    }

    // Upload feature flags
    async uploadFeatures() {
        console.log('🔄 Uploading feature flags...');

        const features = [
            { id: 'ai-search', name: 'AI-Powered Search', enabled: true },
            { id: 'smart-filters', name: 'Smart Filter Suggestions', enabled: true },
            { id: 'similar-tools', name: 'Similar Tools', enabled: true },
            { id: 'trending-tools', name: 'Trending Tools', enabled: true },
            { id: 'personalized-feed', name: 'Personalized Feed', enabled: true },
            { id: 'tool-comparison', name: 'Tool Comparison', enabled: true },
            { id: 'favorites-system', name: 'Favorites System', enabled: true },
            { id: 'tool-reviews', name: 'Tool Reviews', enabled: true },
            { id: 'share-tools', name: 'Share Tools', enabled: true },
            { id: 'email-alerts', name: 'Email Alerts', enabled: true }
        ];

        try {
            const batch = writeBatch(db);

            features.forEach(feature => {
                const featureRef = doc(db, 'features', feature.id);
                batch.set(featureRef, {
                    ...feature,
                    config: {},
                    usage: { totalUses: 0, lastUsed: null },
                    createdAt: new Date().toISOString()
                });
            });

            await batch.commit();
            console.log(`✅ Uploaded ${features.length} feature flags`);
            return true;
        } catch (error) {
            console.error('❌ Error uploading features:', error);
            this.errors.push({ type: 'features', error: error.message });
            return false;
        }
    }

    // Run full migration
    async runMigration() {
        console.log('🚀 Starting Firestore migration...\n');

        const startTime = Date.now();

        // Upload all data
        await this.uploadTools();
        await this.uploadGuides();
        await this.uploadCategories();
        await this.uploadFeatures();

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        // Summary
        console.log('\n📊 Migration Summary:');
        console.log(`✅ Tools uploaded: ${this.uploadedTools}`);
        console.log(`✅ Guides uploaded: ${this.uploadedGuides}`);
        console.log(`⏱️  Duration: ${duration}s`);

        if (this.errors.length > 0) {
            console.log(`\n⚠️  Errors encountered: ${this.errors.length}`);
            this.errors.forEach(err => {
                console.log(`  - ${err.type}: ${err.error}`);
            });
        } else {
            console.log('\n🎉 Migration completed successfully!');
        }

        return {
            success: this.errors.length === 0,
            toolsUploaded: this.uploadedTools,
            guidesUploaded: this.uploadedGuides,
            duration,
            errors: this.errors
        };
    }
}

// Export for use
window.FirestoreMigration = FirestoreMigration;

// Auto-run if loaded directly
if (typeof window !== 'undefined') {
    console.log('📦 Firestore Migration Script Loaded');
    console.log('Run: const migration = new FirestoreMigration(); await migration.runMigration();');
}
