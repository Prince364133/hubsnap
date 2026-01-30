// AI Features UI Components
// Renders UI elements for all Phase 3 features

class AIFeaturesUI {
    constructor() {
        this.featuresManager = window.aiFeaturesManager;
        this.currentUser = 'anonymous'; // TODO: Implement user auth
    }

    // Render Trending Tools Section
    async renderTrendingTools(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const trending = await this.featuresManager.getTrendingTools(6);

        container.innerHTML = `
            <div class="trending-section">
                <div class="trending-header">
                    <h2><i class="fas fa-fire"></i> Trending AI Tools</h2>
                    <span class="trending-badge">
                        <i class="fas fa-chart-line"></i>
                        Hot Right Now
                    </span>
                </div>
                <div class="similar-tools-grid">
                    ${trending.map(tool => this.createToolCard(tool)).join('')}
                </div>
            </div>
        `;
    }

    // Render Favorites Button
    renderFavoriteButton(toolId, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const isFav = this.featuresManager.isFavorite(this.currentUser, toolId);

        container.innerHTML = `
            <button class="favorite-btn ${isFav ? 'active' : ''}" 
                    onclick="window.aiFeaturesUI.toggleFavorite('${toolId}', this)">
                <i class="fas fa-heart"></i>
            </button>
        `;
    }

    async toggleFavorite(toolId, button) {
        const isFav = this.featuresManager.isFavorite(this.currentUser, toolId);

        if (isFav) {
            await this.featuresManager.removeFromFavorites(this.currentUser, toolId);
            button.classList.remove('active');
        } else {
            await this.featuresManager.addToFavorites(this.currentUser, toolId);
            button.classList.add('active');
        }
    }

    // Render Share Buttons
    renderShareButtons(toolId, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="share-container">
                <button class="share-btn twitter" onclick="window.aiFeaturesUI.share('${toolId}', 'twitter')">
                    <i class="fab fa-twitter"></i> Twitter
                </button>
                <button class="share-btn linkedin" onclick="window.aiFeaturesUI.share('${toolId}', 'linkedin')">
                    <i class="fab fa-linkedin"></i> LinkedIn
                </button>
                <button class="share-btn facebook" onclick="window.aiFeaturesUI.share('${toolId}', 'facebook')">
                    <i class="fab fa-facebook"></i> Facebook
                </button>
                <button class="share-btn" onclick="window.aiFeaturesUI.share('${toolId}', 'email')">
                    <i class="fas fa-envelope"></i> Email
                </button>
            </div>
        `;
    }

    async share(toolId, platform) {
        const url = await this.featuresManager.shareTool(toolId, platform);
        if (url) {
            window.open(url, '_blank', 'width=600,height=400');
        }
    }

    // Render Reviews Section
    async renderReviews(toolId, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const reviews = this.featuresManager.getReviews(toolId);
        const avgRating = this.featuresManager.getAverageRating(toolId);

        container.innerHTML = `
            <div class="reviews-container">
                <h3>Reviews (${reviews.length})</h3>
                <p>Average Rating: ${this.renderStars(avgRating)} ${avgRating}/5.0</p>
                
                <div class="add-review-form">
                    <h4>Write a Review</h4>
                    <div class="rating-input" id="rating-input-${toolId}">
                        ${[1, 2, 3, 4, 5].map(i => `<i class="far fa-star" data-rating="${i}" onclick="window.aiFeaturesUI.setRating('${toolId}', ${i})"></i>`).join('')}
                    </div>
                    <textarea class="review-textarea" id="review-text-${toolId}" placeholder="Share your experience..."></textarea>
                    <button class="btn btn-primary" onclick="window.aiFeaturesUI.submitReview('${toolId}')">
                        Submit Review
                    </button>
                </div>

                <div id="reviews-list-${toolId}">
                    ${reviews.map(review => this.createReviewCard(review)).join('')}
                </div>
            </div>
        `;
    }

    setRating(toolId, rating) {
        const container = document.getElementById(`rating-input-${toolId}`);
        const stars = container.querySelectorAll('i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas', 'active');
            } else {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            }
        });
        container.dataset.rating = rating;
    }

    async submitReview(toolId) {
        const ratingContainer = document.getElementById(`rating-input-${toolId}`);
        const rating = parseInt(ratingContainer.dataset.rating || 0);
        const comment = document.getElementById(`review-text-${toolId}`).value;

        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        if (!comment.trim()) {
            alert('Please write a comment');
            return;
        }

        await this.featuresManager.addReview(toolId, this.currentUser, rating, comment);
        this.renderReviews(toolId, `reviews-${toolId}`);
    }

    createReviewCard(review) {
        return `
            <div class="review-card">
                <div class="review-header">
                    <div>
                        <div class="review-rating">${this.renderStars(review.rating)}</div>
                        <div class="review-date">${new Date(review.timestamp).toLocaleDateString()}</div>
                    </div>
                </div>
                <p class="review-comment">${review.comment}</p>
                <div class="review-helpful">
                    <button><i class="fas fa-thumbs-up"></i> Helpful (${review.helpful})</button>
                </div>
            </div>
        `;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalf) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }

        return stars;
    }

    // Render Similar Tools
    async renderSimilarTools(toolId, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const similar = await this.featuresManager.getSimilarTools(toolId);

        container.innerHTML = `
            <div>
                <h3>Similar Tools</h3>
                <div class="similar-tools-grid">
                    ${similar.map(tool => this.createToolCard(tool)).join('')}
                </div>
            </div>
        `;
    }

    createToolCard(tool) {
        const rawUrl = tool.website_url || tool.websiteUrl || tool.url || '#';
        const url = rawUrl.replace(/'/g, "\\'");
        return `
            <div class="similar-tool-card" onclick="window.open('${url}', '_blank')" style="cursor: pointer;">
                <h4>${tool.name}</h4>
                <p style="color: var(--text-dim); font-size: 0.85rem; margin: 0.5rem 0;">
                    ${tool.company || ''}
                </p>
                <span class="badge badge-${tool.pricing === 'FREE' ? 'free' : 'paid'}">
                    ${tool.pricing}
                </span>
            </div>
        `;
    }

    // Render Email Subscription
    renderEmailSubscription(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="email-subscription">
                <h3><i class="fas fa-bell"></i> Stay Updated</h3>
                <p>Get notified about new AI tools, price changes, and weekly digests</p>
                <div class="email-input-group">
                    <input type="email" id="subscribe-email" placeholder="Enter your email" />
                    <button onclick="window.aiFeaturesUI.subscribe()">Subscribe</button>
                </div>
            </div>
        `;
    }

    async subscribe() {
        const email = document.getElementById('subscribe-email').value;
        if (!email || !email.includes('@')) {
            alert('Please enter a valid email');
            return;
        }

        const success = await this.featuresManager.subscribeToAlerts(email);
        if (success) {
            alert('Successfully subscribed! Check your email for confirmation.');
            document.getElementById('subscribe-email').value = '';
        }
    }

    // Render Smart Filter Suggestions
    renderFilterSuggestions(suggestions, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !suggestions) return;

        container.innerHTML = `
            <div class="filter-suggestions">
                <i class="fas fa-lightbulb"></i>
                <div class="filter-suggestions-content">
                    <div class="filter-suggestions-title">Smart Filter Suggestion</div>
                    <div class="filter-suggestions-text">${suggestions.message}</div>
                </div>
                <div class="filter-suggestions-actions">
                    <button onclick="window.aiFeaturesUI.applyFilter('category', '${suggestions.suggestedCategory}')">
                        Apply
                    </button>
                </div>
            </div>
        `;
    }

    applyFilter(type, value) {
        // Apply filter to current page
        const filterElement = document.getElementById(`${type}Filter`);
        if (filterElement) {
            filterElement.value = value;
            filterElement.dispatchEvent(new Event('change'));
        }
    }
}

// Initialize UI manager
window.aiFeaturesUI = new AIFeaturesUI();
