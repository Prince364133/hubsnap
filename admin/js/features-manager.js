// AI Features Management Logic
import { auth, database, ref, get, set, remove, onAuthStateChanged } from '../../js/firebase-config.js';

let allFeatures = [];

// Auth guard
// Auth guard
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    await loadFeatures();
});

const FEATURES_LIST = [
    { id: 'ai-search', name: 'AI Search', description: 'Semantic search capability' },
    { id: 'smart-filters', name: 'Smart Filters', description: 'Context-aware recommendations' },
    { id: 'similar-tools', name: 'Similar Tools', description: 'Related tool suggestions' },
    { id: 'trending-tools', name: 'Trending Tools', description: 'Data-driven sorting' },
    { id: 'personalized-feed', name: 'Personalized Feed', description: 'Content monitoring' },
    { id: 'tool-comparison', name: 'Tool Comparison', description: 'Feature comparison logic' },
    { id: 'favorites-system', name: 'Favorites System', description: 'Local bookmarking' },
    { id: 'tool-reviews', name: 'User Reviews', description: 'Rating system' },
    { id: 'share-tools', name: 'Social Sharing', description: 'Sharing capabilities' },
    { id: 'email-alerts', name: 'Email Alerts', description: 'Subscription logic' },
    { id: 'text-to-speech', name: 'Text-to-Speech', description: 'Listen to descriptions' },
    { id: 'quick-copy', name: 'Quick Copy Link', description: 'Copy URL button' },
    { id: 'dark-mode', name: 'Dark/Light Theme', description: 'Theme toggle' },
    { id: 'quick-preview', name: 'Quick Preview', description: 'Fast tool details' },
    { id: 'recently-viewed', name: 'Recently Viewed', description: 'History tracking' },
    { id: 'surprise-me', name: 'Surprise Me', description: 'Random tool discovery' },
    { id: 'popular-searches', name: 'Popular Searches', description: 'Trending chips' },
    { id: 'related-categories', name: 'Related Categories', description: 'Category mapping' },
    { id: 'sort-rating', name: 'Sort by Rating', description: 'Rating sort filter' },
    { id: 'view-toggle', name: 'View Toggle', description: 'Grid/List switcher' }
];

async function loadFeatures() {
    try {
        // Load configurations from Realtime Database (mimicking Firestore access pattern from ai-features.js but simpler for admin)
        // Wait, ai-features.js uses dataService which uses Firestore. But here in admin we have direct access to Firebase primitives.
        // Let's check how ai-features.js loads data. It calls window.dataService.getAllFeatures().
        // In data-service.js, it likely reads from a 'features' collection in Firestore.
        // To be simpler and since we are using firebase-config.js which exports everything, let's use Realtime Database for config as it's faster for simple key-value pairs?
        // NO, we must align with ai-features.js.
        // Let's assume ai-features.js checks a consistent place.
        // Actually, looking at previous retrieval, ai-features.js had: 
        // "const features = await window.dataService.getAllFeatures();"
        // I need to make sure I write to where that reads.

        // Use the same 'metadata/features' path in Realtime Database for simplicity if dataService isn't available here?
        // Or better, let's use the Realtime Database 'system/features' node.

        // Let's stick to Realtime Database for config sync as it's easiest for toggle switches.
        // Path: `system/features/${featureId}` -> { enabled: boolean }

        const featuresRef = ref(database, 'system/features');
        const snapshot = await get(featuresRef);

        let remoteConfig = {};
        if (snapshot.exists()) {
            remoteConfig = snapshot.val();
        }

        allFeatures = FEATURES_LIST.map(f => ({
            ...f,
            enabled: remoteConfig[f.id] ? remoteConfig[f.id].enabled : true // Default to true
        }));

        renderFeaturesTable();
    } catch (error) {
        console.error('Error loading features:', error);
        document.getElementById('featuresTableBody').innerHTML = `
            <tr><td colspan="5" style="text-align: center; color: var(--accent-danger);">Error loading features</td></tr>
        `;
    }
}

function renderFeaturesTable() {
    const tbody = document.getElementById('featuresTableBody');

    tbody.innerHTML = allFeatures.map(feature => `
        <tr>
            <td><strong>${feature.name}</strong></td>
            <td><code style="font-size: 0.8rem; color: var(--text-dim);">${feature.id}</code></td>
            <td>${feature.description}</td>
            <td>
                <span class="badge ${feature.enabled ? 'badge-free' : 'badge-paid'}">
                    ${feature.enabled ? 'ACTIVE' : 'INACTIVE'}
                </span>
            </td>
            <td>
                <label class="toggle-switch">
                    <input type="checkbox" ${feature.enabled ? 'checked' : ''} onchange="toggleFeature('${feature.id}', this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </td>
        </tr>
    `).join('');
}

window.toggleFeature = async function (featureId, enabled) {
    try {
        const featureRef = ref(database, `system/features/${featureId}`);
        await set(featureRef, {
            id: featureId,
            enabled: enabled,
            updatedAt: new Date().toISOString()
        });

        // Update local state
        const feature = allFeatures.find(f => f.id === featureId);
        if (feature) feature.enabled = enabled;

        renderFeaturesTable();

        // Optional: Show toast or small feedback
    } catch (error) {
        console.error('Error updating feature:', error);
        alert('Failed to update feature');
        // Revert toggle visually
        loadFeatures();
    }
};
