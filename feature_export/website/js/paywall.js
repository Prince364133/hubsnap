// Paywall and Access Control Logic
import { auth, database, ref, get } from './firebase-config.js';

const ACCESS_TYPES = {
    FREE: 'FREE',
    SUBSCRIPTION: 'SUBSCRIPTION',
    ONE_TIME_PURCHASE: 'ONE_TIME_PURCHASE'
};

const DEFAULT_SUBSCRIPTION_PRICE = 99; // ₹99/month

class PaywallManager {
    constructor() {
        this.currentUser = null;
        this.userSubscriptions = new Set();
        this.userPurchases = new Set();
    }

    async init() {
        // Listen for auth state changes
        auth.onAuthStateChanged(user => {
            this.currentUser = user;
            if (user) {
                this.loadUserAccess(user.uid);
            }
        });
    }

    async loadUserAccess(uid) {
        try {
            const subscriptionsRef = ref(database, `users/${uid}/subscriptions`);
            const purchasesRef = ref(database, `users/${uid}/purchases`);

            const [subsSnapshot, purchSnapshot] = await Promise.all([
                get(subscriptionsRef),
                get(purchasesRef)
            ]);

            if (subsSnapshot.exists()) {
                this.userSubscriptions = new Set(Object.keys(subsSnapshot.val()));
            }
            if (purchSnapshot.exists()) {
                this.userPurchases = new Set(Object.keys(purchSnapshot.val()));
            }
        } catch (error) {
            console.error('Error loading user access:', error);
        }
    }

    async checkAccess(itemId, itemType = 'tool') {
        // Fetch metadata from Firebase
        const metadataRef = ref(database, `metadata/${itemType}s/${itemId}`);
        const snapshot = await get(metadataRef);

        if (!snapshot.exists()) {
            return { hasAccess: true, reason: null }; // Default to free if no metadata
        }

        const metadata = snapshot.val();
        const { access_type, locked, lock_reason, price } = metadata;

        // If not locked, grant access
        if (!locked) {
            return { hasAccess: true, reason: null };
        }

        // If FREE, grant access
        if (access_type === ACCESS_TYPES.FREE) {
            return { hasAccess: true, reason: null };
        }

        // Check if user is authenticated
        if (!this.currentUser) {
            return {
                hasAccess: false,
                reason: lock_reason || 'Please sign in to access this content',
                access_type,
                price: price || DEFAULT_SUBSCRIPTION_PRICE
            };
        }

        // Check subscription access
        if (access_type === ACCESS_TYPES.SUBSCRIPTION) {
            if (this.userSubscriptions.has('premium')) {
                return { hasAccess: true, reason: null };
            }
            return {
                hasAccess: false,
                reason: lock_reason || 'Subscribe to unlock this content',
                access_type,
                price: price || DEFAULT_SUBSCRIPTION_PRICE
            };
        }

        // Check one-time purchase access
        if (access_type === ACCESS_TYPES.ONE_TIME_PURCHASE) {
            if (this.userPurchases.has(itemId)) {
                return { hasAccess: true, reason: null };
            }
            return {
                hasAccess: false,
                reason: lock_reason || 'Purchase to unlock this content',
                access_type,
                price: price || 0
            };
        }

        return { hasAccess: true, reason: null };
    }

    showPaywallPopup(accessInfo) {
        const popup = document.createElement('div');
        popup.className = 'paywall-popup';
        popup.innerHTML = `
            <div class="paywall-overlay"></div>
            <div class="paywall-content glass">
                <button class="paywall-close">&times;</button>
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-lock" style="font-size: 3rem; color: var(--accent-warning); margin-bottom: 1.5rem;"></i>
                    <h2 style="margin-bottom: 1rem;">Premium Content</h2>
                    <p style="color: var(--text-dim); margin-bottom: 2rem;">${accessInfo.reason}</p>
                    
                    ${accessInfo.access_type === ACCESS_TYPES.SUBSCRIPTION ? `
                        <div class="pricing-box glass" style="padding: 2rem; margin-bottom: 1.5rem;">
                            <h3 style="color: var(--accent-primary);">₹${accessInfo.price}/month</h3>
                            <p style="font-size: 0.9rem; color: var(--text-dim);">Unlimited access to all premium content</p>
                        </div>
                        <button class="btn btn-primary" onclick="window.paywallManager.initiateSubscription()">
                            Subscribe Now
                        </button>
                    ` : `
                        <div class="pricing-box glass" style="padding: 2rem; margin-bottom: 1.5rem;">
                            <h3 style="color: var(--accent-primary);">₹${accessInfo.price}</h3>
                            <p style="font-size: 0.9rem; color: var(--text-dim);">One-time purchase</p>
                        </div>
                        <button class="btn btn-primary" onclick="window.paywallManager.initiatePurchase()">
                            Buy Now
                        </button>
                    `}
                    
                    <p style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-dim);">
                        Already have access? <a href="#" onclick="window.paywallManager.showLogin(); return false;" style="color: var(--accent-primary);">Sign In</a>
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // Close button handler
        popup.querySelector('.paywall-close').addEventListener('click', () => {
            popup.remove();
        });

        // Overlay click to close
        popup.querySelector('.paywall-overlay').addEventListener('click', () => {
            popup.remove();
        });
    }

    initiateSubscription() {
        alert('Subscription flow will be integrated with payment gateway (Razorpay/Stripe)');
        // TODO: Integrate with Razorpay/Stripe
    }

    initiatePurchase() {
        alert('Purchase flow will be integrated with payment gateway (Razorpay/Stripe)');
        // TODO: Integrate with Razorpay/Stripe
    }

    showLogin() {
        window.location.href = '/admin/index.html';
    }
}

// Global instance
window.paywallManager = new PaywallManager();
window.paywallManager.init();

export default PaywallManager;
