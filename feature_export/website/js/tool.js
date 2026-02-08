async function initToolDetail() {
    const container = document.getElementById('toolDetailContent');
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        window.location.href = 'explore.html';
        return;
    }

    try {
        const response = await fetch('data/tools.json');
        const tools = await response.json();
        const tool = tools.find(t => t.slug === slug);

        if (!tool) {
            container.innerHTML = `
                <div style="text-align: center; padding: 8rem 2rem;">
                    <h2>Tool Not Found</h2>
                    <p style="color: var(--text-dim); margin-bottom: 2rem;">The tool you are looking for does not exist in our database.</p>
                    <a href="explore.html" class="btn btn-primary">Back to Explore</a>
                </div>
            `;
            return;
        }

        renderToolDetail(tool);

    } catch (error) {
        console.error('Error loading tool:', error);
        container.innerHTML = '<p style="color: var(--accent-danger); text-align: center;">Error loading tool details. Please try again later.</p>';
    }
}

function renderToolDetail(tool) {
    const container = document.getElementById('toolDetailContent');

    const badgeClass = tool.badge_color === 'green' ? 'badge-free' :
        tool.badge_color === 'red' ? 'badge-paid' : 'badge-free-paid';
    const pricingLabel = tool.pricing_model.replace('_', ' + ');

    container.innerHTML = `
        <a href="explore.html" class="nav-link" style="margin-bottom: 2rem;"><i class="fas fa-arrow-left"></i> Back to Explore</a>
        
        <div style="display: grid; grid-template-columns: 1fr 350px; gap: 4rem; align-items: start;">
            <!-- Main Info -->
            <section>
                <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem;">
                    <h1 style="margin: 0;">${tool.name}</h1>
                    <span class="badge ${badgeClass}">${pricingLabel}</span>
                </div>

                <p style="font-size: 1.25rem; line-height: 1.6; color: var(--text-dim); margin-bottom: 3rem;">
                    ${tool.full_description}
                </p>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
                    <div class="glass" style="padding: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--accent-primary); margin-bottom: 1rem;">
                            <i class="fas fa-globe"></i> <h3 style="margin: 0; font-size: 1rem;">Platforms</h3>
                        </div>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            ${tool.platforms_supported.map(p => `<span class="chip">${p}</span>`).join('')}
                        </div>
                    </div>

                    <div class="glass" style="padding: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--accent-secondary); margin-bottom: 1rem;">
                            <i class="fas fa-hashtag"></i> <h3 style="margin: 0; font-size: 1rem;">Tags</h3>
                        </div>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            ${tool.tags.slice(0, 5).map(t => `<span class="chip">${t}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </section>

            <!-- Action Sidebar -->
            <aside class="glass" style="padding: 2rem; position: sticky; top: 6rem;">
                <h3 style="margin-bottom: 1.5rem;">Get Started</h3>
                <a href="${tool.website_url}" target="_blank" class="btn btn-primary" style="width: 100%; justify-content: center; margin-bottom: 1rem;">
                    Use This AI <i class="fas fa-external-link-alt"></i>
                </a>
                <button class="btn btn-glass" style="width: 100%; justify-content: center;">
                    Watch Tutorial <i class="fas fa-play-circle"></i>
                </button>
                
                <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--glass-border);">
                    <p style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 1rem;">Categories</p>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${tool.categories.map(cat => `<span style="font-size: 0.75rem; padding: 0.2rem 0.6rem; background: var(--bg-main); border-radius: 4px;">${cat}</span>`).join('')}
                    </div>
                </div>
            </aside>
        </div>

        <style>
            .chip {
                font-size: 0.8rem;
                padding: 0.3rem 0.8rem;
                background: var(--bg-surface);
                border-radius: 100px;
                border: 1px solid var(--glass-border);
            }
        </style>
    `;
}

document.addEventListener('DOMContentLoaded', initToolDetail);
