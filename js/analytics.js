// Analytics Tracking Module
import { database, ref, get, set, runTransaction } from './firebase-config.js';

class AnalyticsManager {
    constructor() {
        this.today = new Date().toISOString().split('T')[0];
        this.init();
    }

    async init() {
        // Log page view globally on init
        try {
            await this.logPageView();
        } catch (error) {
            console.error('Analytics init failed:', error);
        }

        // Expose tool click logger globally for non-module usage if needed
        window.logToolClick = this.logToolClick.bind(this);
    }

    async logPageView() {
        // Simple session-based unique view check
        const sessionKey = `view_${this.today}`;
        if (sessionStorage.getItem(sessionKey)) {
            return; // Already logged this session
        }
        sessionStorage.setItem(sessionKey, 'true');

        const statsRef = ref(database, `analytics/daily_stats/${this.today}/views`);
        await runTransaction(statsRef, (currentViews) => {
            return (currentViews || 0) + 1;
        });
        console.log('Analytics: Page view recorded');
    }

    async logToolClick(toolId) {
        if (!toolId) return;

        // Track total clicks for the tool
        const toolRef = ref(database, `analytics/tools/${toolId}/clicks`);
        await runTransaction(toolRef, (clicks) => {
            return (clicks || 0) + 1;
        });

        // Track daily clicks for the tool (optional, for detailed charts)
        const dailyToolRef = ref(database, `analytics/daily_stats/${this.today}/tool_clicks/${toolId}`);
        await runTransaction(dailyToolRef, (clicks) => {
            return (clicks || 0) + 1;
        });

        console.log(`Analytics: Tool click recorded for ${toolId}`);
    }
}

// Initialize
const analyticsManager = new AnalyticsManager();
export default analyticsManager;
