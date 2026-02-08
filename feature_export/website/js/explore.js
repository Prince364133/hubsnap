import dataService from './data-service.js';
import './analytics.js'; // Import to initialize page tracking

let allTools = [];
let lastDoc = null;
let hasMoreTools = false;
let isLoadMore = false;
const PAGE_SIZE = 20;
let isLoading = false;
let totalToolsCount = 0;

async function initExplore() {
    // Initialize UI
    const searchInput = document.getElementById('searchQuery');
    const resultsCount = document.getElementById('resultsCount');
    const grid = document.getElementById('toolsGrid');
    const categoryFilter = document.getElementById('categoryFilter');
    const pricingFilter = document.getElementById('pricingFilter');
    const companyFilter = document.getElementById('companyFilter');
    const yearFilter = document.getElementById('yearFilter');
    const platformFilter = document.getElementById('platformFilter');
    const yearFrom = document.getElementById('yearFrom');
    const yearTo = document.getElementById('yearTo');
    const advancedToggle = document.getElementById('advancedFilterToggle');
    const advancedPanel = document.getElementById('advancedFiltersPanel');
    const clearFilters = document.getElementById('clearFilters');
    const noResults = document.getElementById('noResults');

    // Feature: Popular Searches
    const popularSearchesContainer = document.getElementById('popularSearches');
    if (window.aiFeaturesManager && popularSearchesContainer) {
        const searches = window.aiFeaturesManager.getPopularSearches();
        popularSearchesContainer.innerHTML = searches.map(s =>
            `<button class="btn btn-glass btn-sm" onclick="document.getElementById('searchQuery').value='${s}'; document.getElementById('searchQuery').dispatchEvent(new Event('input'));">${s}</button>`
        ).join('');
    }

    // Feature: Theme Toggle
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn && window.aiFeaturesManager) {
        window.aiFeaturesManager.initTheme();
        themeBtn.addEventListener('click', () => {
            const newTheme = window.aiFeaturesManager.toggleTheme();
            themeBtn.innerHTML = newTheme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        });
    }

    // Feature: Surprise Me
    const surpriseBtn = document.getElementById('surpriseMeBtn');
    if (surpriseBtn && window.aiFeaturesManager) {
        surpriseBtn.addEventListener('click', async () => {
            const tool = await window.aiFeaturesManager.surpriseMe();
            if (tool) {
                // Determine base URL dynamically (handle localhost vs production)
                // const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                //     ? '' 
                //     : '/ai-discovery-platform'; 
                // Actually relative path is safer
                window.location.href = `tool.html?id=${tool.id}`;
            }
        });
    }

    // Show loading state
    showLoading();

    // Safety Timeout: Clear loading if it takes too long
    const safetyTimeout = setTimeout(() => {
        if (isLoading) {
            console.warn('Explore: Loading timed out, showing manual error');
            hideLoading();
            const grid = document.getElementById('toolsGrid');
            if (grid && grid.innerHTML.includes('spinner')) {
                grid.innerHTML = '<p style="color: var(--text-dim); text-align: center; grid-column: 1/-1;">Request timed out. Please refresh or check your connection.</p>';
            }
        }
    }, 5000);

    try {
        // Load tools from Firestore using data service
        // If Firestore is not set up yet, fall back to JSON
        try {
            // Try Firestore first
            if (dataService) {
                allTools = await dataService.getAllTools();
            } else {
                // Fallback to JSON if data service not available
                const response = await fetch('data/tools.json');
                allTools = await response.json();
            }
        } catch (firestoreError) {
            console.warn('Firestore not available, falling back to JSON:', firestoreError);
            const response = await fetch('data/tools.json');
            allTools = await response.json();
        }

        clearTimeout(safetyTimeout);
        // Fetch total count if using Firestore
        if (dataService && dataService.getToolsCount) {
            totalToolsCount = await dataService.getToolsCount();
        } else {
            totalToolsCount = allTools.length; // Fallback for JSON
        }

        hideLoading();

        // Populate Categories
        const categories = [...new Set(allTools.flatMap(t => t.categories || [t.category]))];
        categories.sort().forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });

        // Populate Companies
        const companies = [...new Set(allTools.map(t => t.company).filter(c => c))];
        companies.sort().forEach(company => {
            const option = document.createElement('option');
            option.value = company;
            option.textContent = company;
            companyFilter.appendChild(option);
        });

        // Populate Years
        const years = [...new Set(allTools.map(t => t.launch_year).filter(y => y))];
        years.sort((a, b) => b - a).forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
        // Initialize with pagination
        await loadTools();

        // Feature: View Toggle
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');

        // Sort logic
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter && window.aiFeaturesManager) {
            sortFilter.addEventListener('change', () => {
                if (sortFilter.value === 'rating') {
                    const sorted = window.aiFeaturesManager.sortToolsByRating(allTools);
                    renderTools(sorted);
                } else {
                    // Default or newest (re-render current)
                    renderTools(allTools);
                }
            });
        }

        if (window.aiFeaturesManager) {
            const currentView = window.aiFeaturesManager.getViewMode();
            if (currentView === 'list') {
                grid.classList.add('list-view');
                gridViewBtn.classList.remove('active');
                listViewBtn.classList.add('active');
            }

            gridViewBtn.addEventListener('click', () => {
                window.aiFeaturesManager.toggleView('grid');
                grid.classList.remove('list-view');
                gridViewBtn.classList.add('active');
                listViewBtn.classList.remove('active');
            });

            listViewBtn.addEventListener('click', () => {
                window.aiFeaturesManager.toggleView('list');
                grid.classList.add('list-view');
                gridViewBtn.classList.remove('active');
                listViewBtn.classList.add('active');
            });
        }

        // Infinite Scroll Sentinel
        const sentinel = document.createElement('div');
        sentinel.id = 'scrollSentinel';
        sentinel.style.margin = '2rem auto';
        sentinel.style.textAlign = 'center';
        sentinel.style.color = 'var(--text-dim)';
        sentinel.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Loading more tools...';
        sentinel.style.display = 'none';

        // Append sentinel after grid
        grid.parentNode.insertBefore(sentinel, grid.nextSibling);

        // Robust Infinite Scroll using Scroll Event
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) return;

            scrollTimeout = setTimeout(() => {
                scrollTimeout = null;

                // Check if near bottom (within 500px)
                const scrollPosition = window.innerHeight + window.scrollY;
                const bodyHeight = document.documentElement.offsetHeight;

                if (scrollPosition >= bodyHeight - 500) {
                    if (!isLoading && hasMoreTools) {
                        // console.log('Scroll trigger: Loading more tools...');
                        loadTools(true);
                    }
                }
            }, 100); // Throttle 100ms
        });

        // Keep sentinel as purely visual or fallback
        // const observer = new IntersectionObserver(...) // Removed in favor of scroll event

        // Filter events
        const updateFilters = () => {
            // If searching/filtering, we might need to rely on what's loaded OR
            // ideally search all.
            // For now, let's keep simple: Filter applies to LOADED tools.
            // If user wants to search unmatched tools, they use the search bar which
            // uses dataService.searchTools (which loads all).

            // Check if search query is present
            const query = searchInput.value.toLowerCase();
            if (query.length > 0) {
                // If searching, we skip pagination logic and filter allTools (or fetch if needed)
                // But wait, dataService.searchTools fetches ALL.
                // So if search is active, we might replace allTools with search results.

                handleSearch(query);
                return;
            }

            // Standard local filtering of loaded tools
            // const type = typeFilter.value; // Removed as it doesn't exist
            const cat = categoryFilter.value;
            const price = pricingFilter.value;

            const filtered = allTools.filter(tool => {
                // const matchesType = type === 'All' || (tool.access_type && tool.access_type === type); 
                const matchesCategory = cat === 'All' || (tool.categories && tool.categories.includes(cat));
                const matchesPrice = price === 'All' ||
                    (price === 'Free' && isFree(tool)) ||
                    (price === 'Paid' && !isFree(tool));

                return matchesCategory && matchesPrice;
            });

            renderTools(filtered);

            // Hide load more if filtering (since we only filter loaded)
            // Or show if we want to allow loading more into the filter?
            // Better to hide for MVP to avoid confusion.
            if (cat !== 'All' || price !== 'All') {
                sentinel.style.display = 'none';
            } else {
                sentinel.style.display = hasMoreTools ? 'block' : 'none';
            }
        };

        // Use debounce for search
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const query = searchInput.value.toLowerCase();
                if (query.length > 0) {
                    handleSearch(query);
                } else {
                    // Reset to paginated view
                    lastDoc = null;
                    allTools = [];
                    loadTools();
                }
            }, 300);
        });

        async function handleSearch(query) {
            showLoading();
            // Use data service search which loads all (or index)
            const results = await dataService.searchTools(query);
            renderTools(results);
            renderTools(results);
            const sentinel = document.getElementById('scrollSentinel');
            if (sentinel) sentinel.style.display = 'none';
            hideLoading();
        }

        // searchInput.addEventListener('input', updateFilters); // This might conflict with debounce above.
        // Let's remove the listener for 'input' -> updateFilters and use the specific one.
        // But the original code had multiple listeners.
        // Let's just hook up the filters to updateFilters, and search to its own logic.

        // typeFilter.addEventListener('change', updateFilters);
        categoryFilter.addEventListener('change', updateFilters);
        pricingFilter.addEventListener('change', updateFilters);
        // verifiedFilter.addEventListener('change', updateFilters);

        // Advanced filter toggle
        advancedToggle.addEventListener('click', () => {
            advancedPanel.style.display = advancedPanel.style.display === 'none' ? 'block' : 'none';
        });

        // Clear filters
        clearFilters.addEventListener('click', () => {
            searchInput.value = '';
            categoryFilter.value = 'All';
            pricingFilter.value = 'All';
            companyFilter.value = 'All';
            yearFilter.value = 'All';
            platformFilter.value = 'All';
            yearFrom.value = '';
            yearTo.value = '';
            // typeFilter.value = 'All'; // Clear new filters
            // verifiedFilter.checked = false; // Clear new filters
            // renderTools(allTools); // This will be handled by loadTools
            lastDoc = null;
            allTools = [];
            loadTools();
        });

        // Events - original ones removed/modified
        // const updateFilters = () => {
        //     const query = searchInput.value.toLowerCase();
        //     const cat = categoryFilter.value;
        //     const price = pricingFilter.value;
        //     const company = companyFilter.value;
        //     const year = yearFilter.value;
        //     const platform = platformFilter.value;
        //     const fromYear = yearFrom.value ? parseInt(yearFrom.value) : null;
        //     const toYear = yearTo.value ? parseInt(yearTo.value) : null;

        //     const filtered = allTools.filter(tool => {
        //         const matchesSearch = (tool.name && tool.name.toLowerCase().includes(query)) ||
        //             (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(query))) ||
        //             (tool.company && tool.company.toLowerCase().includes(query));
        //         const matchesCategory = cat === 'All' || (tool.categories && tool.categories.includes(cat));
        //         const matchesPricing = price === 'All' || tool.pricing_model === price;
        //         const matchesCompany = company === 'All' || tool.company === company;
        //         const matchesYear = year === 'All' || tool.launch_year == year;
        //         const matchesPlatform = platform === 'All' || (tool.platforms_supported && tool.platforms_supported.includes(platform));
        //         const matchesYearRange = (!fromYear || tool.launch_year >= fromYear) && (!toYear || tool.launch_year <= toYear);

        //         return matchesSearch && matchesCategory && matchesPricing && matchesCompany && matchesYear && matchesPlatform && matchesYearRange;
        //     });

        //     renderTools(filtered);
        // };

        // searchInput.addEventListener('input', updateFilters);
        // categoryFilter.addEventListener('change', updateFilters);
        // pricingFilter.addEventListener('change', updateFilters);
        // companyFilter.addEventListener('change', updateFilters);
        // yearFilter.addEventListener('change', updateFilters);
        // platformFilter.addEventListener('change', updateFilters);
        // yearFrom.addEventListener('input', updateFilters);
        // yearTo.addEventListener('input', updateFilters);

    } catch (error) {
        console.error('Error loading tools:', error);
        grid.innerHTML = '<p style="color: var(--accent-danger); text-align: center; grid-column: 1/-1;">Error loading tools. Please try again later.</p>';
    }
}

async function loadTools(isMore = false) {
    if (!isMore) {
        allTools = [];
        lastDoc = null;
        showLoading();
    } else {
        // Show sentinel loader
        const sentinel = document.getElementById('scrollSentinel');
        if (sentinel) sentinel.style.display = 'block';
    }

    try {
        let result;
        if (dataService && dataService.getToolsPaginated) {
            result = await dataService.getToolsPaginated(PAGE_SIZE, lastDoc);
        } else {
            // Fallback to JSON or getAllTools if method missing
            const tools = await dataService.getAllTools();
            result = { tools, hasMore: false, lastDoc: null };
        }

        const newTools = result.tools;
        lastDoc = result.lastDoc;
        hasMoreTools = result.hasMore;

        if (isMore) {
            allTools = [...allTools, ...newTools];
        } else {
            allTools = newTools;
        }

        renderTools(allTools);
        hideLoading();

        const sentinel = document.getElementById('scrollSentinel');
        if (sentinel) {
            sentinel.style.display = hasMoreTools ? 'block' : 'none';
            // Update text if no more tools? optional.
        }

    } catch (err) {
        console.error("Pagination error", err);
        hideLoading();
    }
}

// Helper for pricing filter
function isFree(tool) {
    // Logic matching the badge logic roughly
    return !tool.pricing_model || tool.pricing_model === 'FREE' || tool.pricing_model === 'FREEMIUM';
    // Note: The previous logic inferred PAID from name too.
    // We should probably reuse the inference or just keep simple.
}


function renderTools(tools) {
    const grid = document.getElementById('toolsGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');

    grid.innerHTML = '';

    // Update results count
    if (resultsCount) {
        if (totalToolsCount > 0) {
            // If filtered, show subset count
            if (tools.length !== allTools.length) {
                resultsCount.textContent = `Showing ${tools.length} results`;
            } else {
                resultsCount.textContent = `Showing 1-${tools.length} of ${totalToolsCount} tool${totalToolsCount !== 1 ? 's' : ''}`;
            }
        } else {
            resultsCount.textContent = `Showing ${tools.length} tool${tools.length !== 1 ? 's' : ''}`;
        }
    }

    if (tools.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    tools.forEach(tool => {
        const card = document.createElement('div');
        card.className = 'glass tool-card';
        // Make whole card clickable except buttons
        card.style.cursor = 'pointer';
        card.onclick = (e) => {
            if (!e.target.closest('button')) {
                // Feature: Recently Viewed
                if (window.aiFeaturesManager) {
                    window.aiFeaturesManager.addToRecentlyViewed(tool);
                }

                // Analytics: Log Click
                if (window.logToolClick) {
                    window.logToolClick(tool.id || tool.slug);
                }

                const url = tool.website_url || tool.websiteUrl || tool.url || '#';
                window.open(url, '_blank');
            }
        };

        const isNew = tool.launch_year == 2024;
        const isFree = isFreeTool(tool); // Helper function

        card.innerHTML = `
            <div class="tool-icon">${tool.name.charAt(0)}</div>
            
            <div class="tool-content">
                <div class="tool-header">
                    <h3>${tool.name}</h3>
                    <div class="tool-actions">
                         <button class="btn-icon-sm" title="Listen" onclick="event.stopPropagation(); window.aiFeaturesManager.speak('${(tool.short_description || tool.description || '').replace(/'/g, "\\'")}')"><i class="fas fa-volume-up"></i></button>
                         <button class="btn-icon-sm" title="Copy Link" onclick="event.stopPropagation(); window.aiFeaturesManager.copyToClipboard('${window.location.origin}/tool.html?id=${tool.id}')"><i class="fas fa-link"></i></button>
                    </div>
                </div>
                <p class="tool-description">${tool.short_description || tool.description || 'No description available.'}</p>
                <div class="tool-meta">
                     <span class="badge ${isFree ? 'badge-free' : 'badge-paid'}">${isFree ? 'Free' : 'Paid'}</span>
                     <span class="tool-company"><i class="far fa-building"></i> ${tool.company || 'Unknown'}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function isFreeTool(tool) {
    return !tool.pricing_model || tool.pricing_model === 'FREE' || tool.pricing_model === 'FREEMIUM';
}

// Loading state helpers
function showLoading() {
    isLoading = true;
    const grid = document.getElementById('toolsGrid');
    const resultsCount = document.getElementById('resultsCount');

    if (resultsCount) {
        resultsCount.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading tools...';
    }

    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--accent-primary); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-dim);">Loading AI tools...</p>
            </div>
        `;
    }
}

function hideLoading() {
    isLoading = false;
}

document.addEventListener('DOMContentLoaded', initExplore);
