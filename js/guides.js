let allGuides = [];
let isLoading = false;

async function initGuides() {
    const grid = document.getElementById('guidesGrid');
    const searchInput = document.getElementById('searchQuery');
    const typeFilter = document.getElementById('typeFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const accessFilter = document.getElementById('accessFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    const noResults = document.getElementById('noResults');

    // Show loading state
    showLoading();

    try {
        // Load guides from Firestore using data service
        try {
            if (window.dataService) {
                allGuides = await window.dataService.getAllGuides();
            } else {
                const response = await fetch('data/guides.json');
                allGuides = await response.json();
            }
        } catch (firestoreError) {
            console.warn('Firestore not available, falling back to JSON:', firestoreError);
            const response = await fetch('data/guides.json');
            allGuides = await response.json();
        }

        hideLoading();

        // Populate Categories
        const categories = [...new Set(allGuides.map(g => g.category))];
        categories.sort().forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });

        renderGuides(allGuides);

        // Advanced filter toggle
        const advancedToggle = document.getElementById('advancedFilterToggle');
        const advancedPanel = document.getElementById('advancedFiltersPanel');
        const clearFiltersBtn = document.getElementById('clearFilters');

        advancedToggle.addEventListener('click', () => {
            advancedPanel.style.display = advancedPanel.style.display === 'none' ? 'block' : 'none';
        });

        // Clear filters
        clearFiltersBtn.addEventListener('click', () => {
            searchInput.value = '';
            typeFilter.value = 'All';
            categoryFilter.value = 'All';
            accessFilter.value = 'All';
            difficultyFilter.value = 'All';
            renderGuides(allGuides);
        });

        // Events
        const updateFilters = () => {
            const query = searchInput.value.toLowerCase();
            const type = typeFilter.value;
            const cat = categoryFilter.value;
            const access = accessFilter.value;
            const difficulty = difficultyFilter.value;

            const filtered = allGuides.filter(guide => {
                const matchesSearch = guide.title.toLowerCase().includes(query) ||
                    guide.short_description.toLowerCase().includes(query) ||
                    guide.category.toLowerCase().includes(query);
                const matchesType = type === 'All' || guide.type === type;
                const matchesCategory = cat === 'All' || guide.category === cat;
                const matchesAccess = access === 'All' || guide.access_type === access;
                const matchesDifficulty = difficulty === 'All' || guide.difficulty === difficulty;

                return matchesSearch && matchesType && matchesCategory && matchesAccess && matchesDifficulty;
            });

            renderGuides(filtered);
        };

        searchInput.addEventListener('input', updateFilters);
        typeFilter.addEventListener('change', updateFilters);
        categoryFilter.addEventListener('change', updateFilters);
        accessFilter.addEventListener('change', updateFilters);
        difficultyFilter.addEventListener('change', updateFilters);

    } catch (error) {
        console.error('Error loading guides:', error);
        grid.innerHTML = '<p style="color: var(--accent-danger); text-align: center; grid-column: 1/-1;">Error loading guides. Please try again later.</p>';
    }
}

function renderGuides(guides) {
    const grid = document.getElementById('guidesGrid');
    const noResults = document.getElementById('noResults');
    grid.innerHTML = '';

    if (guides.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    guides.forEach(guide => {
        const card = document.createElement('div');
        card.className = 'glass tool-card';

        const accessBadge = guide.access_type === 'FREE' ?
            '<span class="badge badge-free">FREE</span>' :
            guide.access_type === 'SUBSCRIPTION' ?
                '<span class="badge badge-paid">SUBSCRIPTION</span>' :
                '<span class="badge badge-free-paid">ONE-TIME</span>';

        const priceDisplay = (guide.price !== undefined && guide.price !== null && guide.price > 0) ? `₹${guide.price}` : 'Free';
        const lockIcon = guide.locked ? '<i class="fas fa-lock" style="color: var(--accent-warning);"></i>' : '';

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                ${accessBadge}
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    ${lockIcon}
                    <span style="font-size: 0.9rem; color: var(--text-dim);">${priceDisplay}</span>
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <span style="font-size: 0.75rem; padding: 0.25rem 0.6rem; background: var(--accent-primary); border-radius: 4px; color: white;">
                    ${guide.type}
                </span>
            </div>

            <h3 style="margin-bottom: 0.5rem; font-size: 1.1rem;">${guide.title}</h3>
            
            <p style="color: var(--text-dim); font-size: 0.85rem; margin-bottom: 0.5rem;">
                <i class="fas fa-layer-group"></i> ${guide.category}
            </p>

            <p style="color: var(--text-dim); font-size: 0.9rem; margin-bottom: 1.5rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                ${guide.short_description || guide.description || 'No description available.'}
            </p>

            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                <span style="font-size: 0.7rem; padding: 0.2rem 0.6rem; background: var(--bg-main); border-radius: 4px; border: 1px solid var(--glass-border);">
                    <i class="fas fa-signal"></i> ${guide.difficulty}
                </span>
                <span style="font-size: 0.7rem; padding: 0.2rem 0.6rem; background: var(--bg-main); border-radius: 4px; border: 1px solid var(--glass-border);">
                    <i class="fas fa-clock"></i> ${guide.estimated_time}
                </span>
            </div>

            <a href="guide.html?slug=${guide.slug}" class="btn btn-glass" style="width: 100%; justify-content: center;">
                ${guide.locked ? '<i class="fas fa-lock"></i> ' : ''}View Details
            </a>
        `;
        grid.appendChild(card);
    });
}

// Loading state helpers
function showLoading() {
    isLoading = true;
    const grid = document.getElementById('guidesGrid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--accent-primary); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-dim);">Loading guides...</p>
            </div>
        `;
    }
}

function hideLoading() {
    isLoading = false;
}

document.addEventListener('DOMContentLoaded', initGuides);
