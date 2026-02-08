/**
 * Dashboard Router (Modular)
 * Handles #hash navigation and dynamic view loading.
 */
import { auth, onAuthStateChanged, signOut } from '../firebase-config.js';

class DashboardRouter {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.routes = {
            'home': () => import('./views/home.js'),
            'trends': () => import('./views/trends.js'),
            'content': () => import('./views/content-lab.js'),
            'saved': () => import('./views/saved.js'),
            'tools': () => import('./views/tools.js'),
            'income': () => import('./views/income.js'),
            'analytics': () => import('./views/analytics.js'),
            'channel-ideas': () => import('./views/channel-ideas.js')
        };
        this.currentView = null;
        this.init();
    }

    init() {
        // Safety Timeout: Force fallback if auth hangs
        const authTimeout = setTimeout(() => {
            console.warn("Dashboard: Auth check timed out, forcing fallback");
            if (!this.currentUser) {
                if (window.location.hostname === 'localhost') {
                    this.currentUser = { uid: 'dev', displayName: 'Dev Creator', email: 'dev@local' };
                    this.handleRoute();
                } else {
                    window.location.href = 'index.html';
                }
            }
        }, 3000);

        // Auth Guard
        onAuthStateChanged(auth, (user) => {
            clearTimeout(authTimeout);
            if (user) {
                this.currentUser = user;
                this.updateCreateProfile(user);
                this.handleRoute(); // Load initial route
            } else {
                // Allow dev bypass on localhost
                if (window.location.hostname === 'localhost') {
                    console.warn("Dev Mode: Bypassing Auth");
                    this.currentUser = { uid: 'dev', displayName: 'Dev Creator', email: 'dev@local' };
                    this.handleRoute();
                } else {
                    window.location.href = 'index.html';
                }
            }
        });

        window.addEventListener('hashchange', () => this.handleRoute());

        // Setup SignOut
        document.getElementById('logoutBtn')?.addEventListener('click', () => signOut(auth));
    }

    updateCreateProfile(user) {
        document.getElementById('userName').textContent = user.displayName || 'Creator';
        document.getElementById('userAvatar').src = user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`;
    }

    async handleRoute() {
        let hash = window.location.hash.replace('#/', '');
        if (!hash) hash = 'home';

        // Split params (e.g. content/scripts)
        const parts = hash.split('/');
        const mainRoute = parts[0];
        const subRoute = parts[1] || null;

        if (this.routes[mainRoute]) {
            await this.loadView(mainRoute, subRoute);
            this.updateSidebar(mainRoute);
        } else {
            console.error("Route not found:", mainRoute);
            // Default to home
            window.location.hash = '#/home';
        }
    }

    async loadView(route, subId) {
        const container = document.getElementById('workspace');

        // Show Loading
        container.innerHTML = '<div class="flex items-center justify-center p-4"><div class="loading-spinner" style="font-size: 2rem;"><i class="fas fa-circle-notch"></i></div></div>';

        try {
            const module = await this.routes[route]();
            // Each view module must export a `render(container, user, subId)` function
            if (module && module.render) {
                await module.render(container, this.currentUser, subId);
                this.currentView = route;
            } else {
                throw new Error(`View ${route} missing render function`);
            }
        } catch (error) {
            console.error(`Error loading view ${route}:`, error);
            container.innerHTML = `
                <div class="p-4" style="color: var(--danger);">
                    <h3>Error Loading View</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    updateSidebar(activeRoute) {
        document.querySelectorAll('.nav-item').forEach(el => {
            const path = el.getAttribute('href').replace('#/', '').split('/')[0]; // simple match
            if (path === activeRoute) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        // Update Page Title
        const titleMap = {
            'home': 'Mission Control',
            'trends': 'Trend Discovery',
            'content': 'Content Lab',
            'saved': 'Idea Vault',
            'tools': 'AI Tools',
            'income': 'Income Sources',
            'analytics': 'Channel Analytics'
        };
        document.getElementById('pageTitle').textContent = titleMap[activeRoute] || 'Dashboard';
    }
}

// Initialize
new DashboardRouter();
